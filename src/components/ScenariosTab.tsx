import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Ship,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Supplier, Shipment, InventoryItem } from '../types';
import { runWhatIfSimulation } from '../ml/riskEngine';

interface ScenariosTabProps {
  suppliers: Supplier[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  onCommitDecision: (data: any) => void;
}

export const ScenariosTab: React.FC<ScenariosTabProps> = ({
  suppliers,
  shipments,
  inventory,
  onCommitDecision
}) => {
  const [chokepointBlockage, setChokepointBlockage] = useState(true);
  const [eastAsiaTyphoon, setEastAsiaTyphoon] = useState(false);
  const [portStrikeLA, setPortStrikeLA] = useState(false);
  const [demandSurgePercent, setDemandSurgePercent] = useState(25);

  const [hasSimulated, setHasSimulated] = useState(true);
  const [simulationResult, setSimulationResult] = useState<any>(() => {
    return runWhatIfSimulation(suppliers, shipments, inventory, {
      chokepointBlockage: true,
      eastAsiaTyphoon: false,
      portStrikeLA: false,
      demandSurgePercent: 25
    });
  });

  const handleRunSimulation = () => {
    const res = runWhatIfSimulation(suppliers, shipments, inventory, {
      chokepointBlockage,
      eastAsiaTyphoon,
      portStrikeLA,
      demandSurgePercent
    });
    setSimulationResult(res);
    setHasSimulated(true);
  };

  const handleReset = () => {
    setChokepointBlockage(false);
    setEastAsiaTyphoon(false);
    setPortStrikeLA(false);
    setDemandSurgePercent(0);
    const res = runWhatIfSimulation(suppliers, shipments, inventory, {
      chokepointBlockage: false,
      eastAsiaTyphoon: false,
      portStrikeLA: false,
      demandSurgePercent: 0
    });
    setSimulationResult(res);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            What-If Scenario Stress-Testing Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Model catastrophic disruptions, labor walkouts, canal chokepoints, and demand surges before they occur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={handleRunSimulation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-950 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Compute Scenario Stress Test</span>
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Scenario Configuration */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <span>Disruption Parameters</span>
          </h3>

          {/* Scenario 1: Chokepoint Blockage */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">
                Red Sea & Suez Maritime Divert
              </span>
              <input
                type="checkbox"
                checked={chokepointBlockage}
                onChange={(e) => setChokepointBlockage(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Forces all Asia-Europe ocean cargo via Cape of Good Hope, adding +8.5 days and fuel surcharges.
            </p>
          </div>

          {/* Scenario 2: Super Typhoon */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">
                Western Pacific Super Typhoon
              </span>
              <input
                type="checkbox"
                checked={eastAsiaTyphoon}
                onChange={(e) => setEastAsiaTyphoon(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Shuts down Taiwanese wafer fabs and Shenzhen port terminals for 5 consecutive operating days.
            </p>
          </div>

          {/* Scenario 3: Port Strike */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">
                US West Coast Berth Strike
              </span>
              <input
                type="checkbox"
                checked={portStrikeLA}
                onChange={(e) => setPortStrikeLA(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Freezes unloading at San Pedro Bay / Long Beach terminals, cascading container dwell delays.
            </p>
          </div>

          {/* Scenario 4: Demand Surge Slider */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">
                Demand Surge Multiplier
              </span>
              <span className="font-mono text-purple-400 font-bold text-xs">
                +{demandSurgePercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={demandSurgePercent}
              onChange={(e) => setDemandSurgePercent(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Tests factory BOM safety stock depletion under sudden downstream demand spikes.
            </p>
          </div>
        </div>

        {/* Right 2 Cols: Stress Test Impact Analysis */}
        <div className="lg:col-span-2 space-y-5">
          {simulationResult && (
            <>
              {/* Impact Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Score Shift */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Network Risk Shift
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-400">
                      {simulationResult.baselineNetworkRisk}
                    </span>
                    <span className="text-slate-500 text-sm">→</span>
                    <span className="text-3xl font-bold font-mono text-rose-400">
                      {simulationResult.simulatedNetworkRisk}
                    </span>
                    <span className="text-xs text-rose-400 font-bold">
                      (+{simulationResult.simulatedNetworkRisk - simulationResult.baselineNetworkRisk})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Severe operational friction across tiers
                  </span>
                </div>

                {/* Additional Delays */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Delayed Shipments Added
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-amber-400">
                      +{simulationResult.additionalDelayedShipments}
                    </span>
                    <span className="text-xs text-slate-400">Shipments</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Container dwell time escalation
                  </span>
                </div>

                {/* Projected Financial Loss */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Projected Financial Exposure
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-rose-400">
                      ${(simulationResult.projectedCostImpactUSD / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Expedited freight + downtime cost
                  </span>
                </div>
              </div>

              {/* Severely Impacted Entities */}
              {simulationResult.severelyImpactedSuppliers.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                  <span className="text-xs font-semibold uppercase text-slate-300 block mb-2">
                    Critical Suppliers Breaching Failure Thresholds:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {simulationResult.severelyImpactedSuppliers.map((name: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Strategic Directive for Scenario */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-800/60 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-sm text-white">
                      AI Stress-Test Contingency Playbook
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700">
                    Pre-Emptive Protocol
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Under this simulated disruption profile, network latency surges by{' '}
                  <strong className="text-white">+{simulationResult.simulatedNetworkRisk - simulationResult.baselineNetworkRisk} risk points</strong>.
                  Without intervention, 30-day stockouts will strike Tier-1 automotive assembly lines in 12 days.
                </p>

                <div className="space-y-2 pt-2 border-t border-purple-900/60 text-xs text-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">1.</span>
                    <span>Pre-book 45 tons of dedicated charter air cargo on Frankfurt-ORD corridor to bypass San Pedro Bay congestion.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">2.</span>
                    <span>Issue binding allocation drawdowns to secondary supplier Monterrey Mechatronics (+35% volume).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">3.</span>
                    <span>Authorize $380,000 contingency spend to insulate downstream delivery SLAs.</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => {
                      onCommitDecision({
                        entityName: 'What-If Simulated Network Playbook',
                        actionTaken: 'Authorized pre-emptive air freight charter & Monterrey dual-sourcing activation',
                        decisionMaker: 'VP Supply Chain Operations',
                        predictedRiskBefore: simulationResult.simulatedNetworkRisk,
                        predictedRiskAfter: Math.max(30, simulationResult.simulatedNetworkRisk - 22)
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Scenario Mitigation in Audit Trail</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
