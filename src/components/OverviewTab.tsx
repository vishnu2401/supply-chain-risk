import React from 'react';
import {
  ShieldAlert,
  Ship,
  Building2,
  Boxes,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Layers,
  Radio
} from 'lucide-react';
import { Supplier, Shipment, InventoryItem, DisruptionAlert } from '../types';
import { ChokepointMap } from './ChokepointMap';

interface OverviewTabProps {
  suppliers: Supplier[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  alerts: DisruptionAlert[];
  overallScore: number;
  isLiveFeed: boolean;
  onNavigateTab: (tab: any) => void;
  onSelectSupplierForMitigation: (supplier: Supplier) => void;
  onAcknowledgeAlert: (id: string) => void;
  onRequestBriefing: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  suppliers,
  shipments,
  inventory,
  alerts,
  overallScore,
  isLiveFeed,
  onNavigateTab,
  onSelectSupplierForMitigation,
  onAcknowledgeAlert,
  onRequestBriefing
}) => {
  // Compute Key Stats
  const criticalSuppliers = suppliers.filter(s => s.riskLevel === 'Critical' || s.riskLevel === 'High');
  const singleSourceAtRisk = suppliers.filter(s => s.isSingleSource && (s.riskLevel === 'Critical' || s.riskLevel === 'High'));
  const delayedShipments = shipments.filter(s => s.predictedDelayDays > 2);
  const totalInTransitValue = shipments.reduce((sum, s) => sum + s.cargoValue, 0);
  const atRiskCargoValue = delayedShipments.reduce((sum, s) => sum + s.cargoValue, 0);
  const criticalInventory = inventory.filter(i => i.stockoutProbability30d > 0.6);
  const atRiskInventoryValue = criticalInventory.reduce((sum, i) => sum + (i.currentStock * i.unitCost), 0);
  const avgDelayDays = (shipments.reduce((sum, s) => sum + s.predictedDelayDays, 0) / (shipments.length || 1)).toFixed(1);

  // Risk distribution matrix
  const riskCounts = {
    Critical: suppliers.filter(s => s.riskLevel === 'Critical').length + shipments.filter(s => s.riskLevel === 'Critical').length,
    High: suppliers.filter(s => s.riskLevel === 'High').length + shipments.filter(s => s.riskLevel === 'High').length,
    Medium: suppliers.filter(s => s.riskLevel === 'Medium').length + shipments.filter(s => s.riskLevel === 'Medium').length,
    Low: suppliers.filter(s => s.riskLevel === 'Low').length + shipments.filter(s => s.riskLevel === 'Low').length,
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Feed Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${isLiveFeed ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800' : 'bg-cyan-950/70 text-cyan-400 border-cyan-800'}`}>
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">
                {isLiveFeed ? 'Live Intelligence Stream Connected' : 'Simulated Historical Stress Feed Active'}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${isLiveFeed ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-cyan-950 text-cyan-300 border-cyan-800'}`}>
                {isLiveFeed ? 'Live Telemetry' : 'Scenario Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregating AIS maritime vessel feeds, NOAA severe weather paths, customs delays, and ERP tier-1 lead times.
            </p>
          </div>
        </div>

        <button
          onClick={onRequestBriefing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate C-Suite Briefing</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Network Risk */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Network Risk Index</span>
            <span className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{overallScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Elevated Friction
            </span>
            <span className="text-slate-400">{criticalSuppliers.length} suppliers vulnerable</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${overallScore >= 75 ? 'bg-rose-500' : overallScore >= 55 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* KPI 2: In-Transit Cargo at Risk */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">At-Risk Cargo Value</span>
            <span className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <Ship className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-white">
              ${(atRiskCargoValue / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs text-slate-400">of ${(totalInTransitValue / 1000000).toFixed(1)}M</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-medium">
              {delayedShipments.length} Delayed Shipments
            </span>
            <button
              onClick={() => onNavigateTab('shipments')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              View <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (atRiskCargoValue / (totalInTransitValue || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Single-Source Vulnerability */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Single-Source Threat</span>
            <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{singleSourceAtRisk.length}</span>
            <span className="text-xs text-slate-400">of {suppliers.length} Key Suppliers</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-rose-400 font-medium">No Qualified Alternate</span>
            <button
              onClick={() => onNavigateTab('suppliers')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              Audits <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${(singleSourceAtRisk.length / (suppliers.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Average Predicted Delay */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mean Predicted Delay</span>
            <span className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">+{avgDelayDays}</span>
            <span className="text-xs text-slate-400">Days Lead Delta</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-purple-400 font-medium">Cape & Panama Dwell</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              Inventory <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (Number(avgDelayDays) / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Global Logistics & Chokepoint Map */}
      <ChokepointMap onSelectChokepoint={(name) => console.log('Selected chokepoint:', name)} />

      {/* Split Section: Real-time Disruption Feed & Risk Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Real-time Disruption Feed (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm text-slate-100">
                Active Supply Chain Disruptions & Alerts
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {alerts.length} Alerts Monitored
            </span>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  alert.severity === 'Critical'
                    ? 'bg-rose-950/30 border-rose-900/60'
                    : 'bg-amber-950/30 border-amber-900/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-900/80 text-rose-300'
                          : 'bg-amber-900/80 text-amber-300'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-100">{alert.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      [{alert.region}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{alert.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Impacted: <strong className="text-white">{alert.affectedShipmentsCount} Shipments</strong></span>
                    <span>Est. Loss: <strong className="text-rose-400">${(alert.estimatedFinancialImpact / 1000000).toFixed(2)}M</strong></span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-medium transition cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium px-2 py-1 bg-emerald-950/50 rounded border border-emerald-800">
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Risk Matrix & High-Priority Actions */}
        <div className="space-y-4">
          {/* Risk Severity Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="font-semibold text-sm text-slate-100 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Risk Classification Matrix
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-rose-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Critical Disruption Risk
                </span>
                <span className="font-mono font-bold text-slate-100">{riskCounts.Critical} entities</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-amber-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  High Risk (Watchlist)
                </span>
                <span className="font-mono font-bold text-slate-100">{riskCounts.High} entities</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-yellow-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  Medium Risk
                </span>
                <span className="font-mono font-bold text-slate-100">{riskCounts.Medium} entities</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Low Risk (Nominal SLA)
                </span>
                <span className="font-mono font-bold text-slate-100">{riskCounts.Low} entities</span>
              </div>
            </div>
          </div>

          {/* Urgent AI Action Recommended */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/60 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              Immediate Mitigation Prompt
            </div>
            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              Supplier <strong className="text-white">Taiwan Semiconductor Micro</strong> is under stress from Pacific swells and single-source dependency. Trigger automated contingency protocols.
            </p>
            <button
              onClick={() => {
                const sup = suppliers.find(s => s.id === 'SUP-101') || suppliers[0];
                onSelectSupplierForMitigation(sup);
              }}
              className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950 cursor-pointer"
            >
              <span>Launch AI Mitigation for TSM</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
