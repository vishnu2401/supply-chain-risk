import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  BarChart2,
  Sliders,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { ML_MODELS_DATA, DATA_LEAKAGE_PREVENTION_SPECS } from '../ml/modelMetrics';
import { calculateSupplierRiskScore, calculateShipmentRiskScore } from '../ml/riskEngine';

export const PredictionsTab: React.FC = () => {
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);

  // Playground State for Supplier Model
  const [pgOnTime, setPgOnTime] = useState(82);
  const [pgDefect, setPgDefect] = useState(240);
  const [pgLeadVar, setPgLeadVar] = useState(11);
  const [pgGeoRisk, setPgGeoRisk] = useState(75);
  const [pgSingleSource, setPgSingleSource] = useState(true);

  const activeModel = ML_MODELS_DATA[selectedModelIdx];

  // Live inference in playground
  const liveSupplierPrediction = calculateSupplierRiskScore({
    onTimeDeliveryRate: pgOnTime,
    defectRatePPM: pgDefect,
    leadTimeVariance: pgLeadVar,
    geopoliticalRiskScore: pgGeoRisk,
    financialStabilityScore: 75,
    isSingleSource: pgSingleSource
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Machine Learning Models, Validation & SHAP Explainability
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent train-test evaluations, confusion matrices, ROC-AUC benchmarks, and feature attribution weights.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300 font-medium">Validation Split: 80% Train / 20% Test (Temporal Guardrail)</span>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {ML_MODELS_DATA.map((model, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedModelIdx(idx)}
            className={`p-3 rounded-xl border text-left transition ${
              selectedModelIdx === idx
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/40 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Model {idx + 1}
            </span>
            <div className="font-semibold text-xs text-slate-100 truncate">{model.modelName}</div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{model.targetTask}</p>
          </button>
        ))}
      </div>

      {/* Selected Model Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Performance Metrics & Feature Importance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metrics Cards */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-100">{activeModel.modelName}</h3>
                <span className="text-xs text-slate-400">{activeModel.algorithm}</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
                {activeModel.trainSamples.toLocaleString()} Train / {activeModel.testSamples.toLocaleString()} Test
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeModel.accuracy !== undefined && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Accuracy</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    {(activeModel.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Precision</span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                  {(activeModel.precision * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Recall</span>
                <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">
                  {(activeModel.recall * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold">F1-Score</span>
                <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">
                  {activeModel.f1Score.toFixed(3)}
                </div>
              </div>
              {activeModel.rocAuc !== undefined && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">ROC-AUC</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                    {activeModel.rocAuc.toFixed(3)}
                  </div>
                </div>
              )}
              {activeModel.mae !== undefined && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">MAE Error</span>
                  <div className="text-xl font-bold font-mono text-teal-400 mt-0.5">
                    {activeModel.mae}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Importance Bar Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                SHAP Global Feature Importance Weights
              </h4>
              <span className="text-xs text-slate-400">Sum of Absolute Shapley Values</span>
            </div>

            <div className="space-y-3 mt-4">
              {activeModel.featureImportance.map((feat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{feat.feature}</span>
                    <span className="font-mono font-bold text-cyan-400">{(feat.weight * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${feat.weight * 100 * 2.5}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confusion Matrix if available */}
          {activeModel.confusionMatrix && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h4 className="font-bold text-sm text-slate-100 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Test Set Confusion Matrix ({activeModel.testSamples} instances)
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Rows indicate True Actual class; Columns indicate Model Predicted class. Diagonal represents accurate classifications.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-slate-400">Actual \ Predicted</th>
                      {activeModel.confusionMatrix.labels.map((lbl, idx) => (
                        <th key={idx} className="p-2 font-semibold text-cyan-300 bg-slate-950/60 rounded">
                          {lbl}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeModel.confusionMatrix.matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 text-left font-semibold text-slate-300">
                          {activeModel.confusionMatrix?.labels[rIdx]}
                        </td>
                        {row.map((val, cIdx) => {
                          const isDiagonal = rIdx === cIdx;
                          return (
                            <td
                              key={cIdx}
                              className={`p-2.5 font-mono font-bold ${
                                isDiagonal
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                                  : val > 20
                                  ? 'bg-rose-950/40 text-rose-300'
                                  : 'bg-slate-950/40 text-slate-400'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Inference Playground & Leakage Safeguards */}
        <div className="space-y-6">
          {/* Live Playground */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-900/60 rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h4 className="font-bold text-sm text-white">Live Model Inference Playground</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Simulate raw feature inputs to observe real-time classification changes and SHAP attribution.
            </p>

            <div className="space-y-4">
              {/* On-Time Adherence */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">On-Time Delivery Rate</span>
                  <span className="font-mono text-cyan-400 font-bold">{pgOnTime}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={pgOnTime}
                  onChange={(e) => setPgOnTime(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Lead Time Variance */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Lead Time Variance (±days)</span>
                  <span className="font-mono text-cyan-400 font-bold">{pgLeadVar} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={pgLeadVar}
                  onChange={(e) => setPgLeadVar(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Geopolitical Risk */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Geopolitical Risk Score</span>
                  <span className="font-mono text-cyan-400 font-bold">{pgGeoRisk}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pgGeoRisk}
                  onChange={(e) => setPgGeoRisk(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Single Source Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-300 font-medium">Single-Source Dependency</span>
                <input
                  type="checkbox"
                  checked={pgSingleSource}
                  onChange={(e) => setPgSingleSource(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Real-time Result Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Predicted Risk Score:</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {liveSupplierPrediction.score}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Classified Tier:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      liveSupplierPrediction.level === 'Critical'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : liveSupplierPrediction.level === 'High'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : liveSupplierPrediction.level === 'Medium'
                        ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {liveSupplierPrediction.level} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">P(Failure Event):</span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {(liveSupplierPrediction.failureProbability * 100).toFixed(0)}%
                  </span>
                </div>

                {/* SHAP Impact Drivers */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Top SHAP Attributions:
                  </span>
                  {liveSupplierPrediction.drivers.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="text-slate-300">{d.factor}</span>
                      <span className={`font-mono font-bold ${d.isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {d.impact > 0 ? `+${d.impact}` : d.impact} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Leakage Prevention Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h4 className="font-bold text-sm text-slate-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Data Leakage Prevention Safeguards
            </h4>

            <div className="space-y-3">
              {DATA_LEAKAGE_PREVENTION_SPECS.map((spec, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                  <span className="font-semibold text-slate-200 block mb-1">
                    {spec.title}
                  </span>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {spec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
