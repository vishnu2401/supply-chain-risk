import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, DollarSign, RefreshCw, CheckCircle2 } from 'lucide-react';
import { RiskLevel } from '../types';

interface AiMitigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'Supplier' | 'Shipment' | 'Inventory';
  entityData: any;
  onCommitAction: (actionData: {
    entityName: string;
    actionTaken: string;
    decisionMaker: string;
    predictedRiskBefore: number;
    predictedRiskAfter: number;
  }) => void;
}

export const AiMitigationModal: React.FC<AiMitigationModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityData,
  onCommitAction
}) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<'primary' | 'secondary'>('primary');
  const [decisionMaker, setDecisionMaker] = useState('Senior Supply Chain Analyst');
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (isOpen && entityData) {
      setCommitted(false);
      fetchRecommendation();
    }
  }, [isOpen, entityData]);

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityData })
      });
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error('Failed to fetch recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !entityData) return null;

  const entityName = entityData.name || entityData.trackingNumber || entityData.productName || 'Selected Item';
  const currentRisk = entityData.overallRiskScore || entityData.riskScore || (entityData.stockoutProbability30d ? Math.round(entityData.stockoutProbability30d * 100) : 75);

  const handleCommit = () => {
    if (!recommendation) return;
    const actionText = selectedAction === 'primary' ? recommendation.primaryMitigation : recommendation.secondaryMitigation;
    const riskAfter = Math.max(15, currentRisk - (recommendation.riskReductionScore || 25));

    onCommitAction({
      entityName,
      actionTaken: actionText,
      decisionMaker,
      predictedRiskBefore: currentRisk,
      predictedRiskAfter: riskAfter
    });

    setCommitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-slate-100">
                  AI Tactical Mitigation Engine
                </h3>
                {recommendation?.generatedByAI && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">
                    Gemini 3.8 Flash Powered
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Contextual risk remediation for <span className="text-slate-200 font-medium">{entityName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <div className="text-sm font-medium text-slate-200">
                Synthesizing multi-tier supply chain contingency plan...
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Analyzing supplier lead time variance, maritime bottlenecks, and safety stock reorder thresholds with Gemini AI.
              </p>
            </div>
          ) : recommendation ? (
            <>
              {/* Executive Assessment Box */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Risk Diagnostics
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Current Risk:</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {currentRisk}/100
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {recommendation.summary}
                </p>

                {/* Root Causes */}
                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  <span className="text-xs font-medium text-slate-400 block mb-1.5">Identified Vulnerabilities:</span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {recommendation.rootCauses?.map((cause: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Choices */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Select Mitigation Strategy to Execute
                </span>

                {/* Primary Option */}
                <div
                  onClick={() => setSelectedAction('primary')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAction === 'primary'
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-xs font-bold uppercase text-cyan-300">Option A: Immediate Operational Pivot</span>
                    </div>
                    <span className="text-xs font-medium text-emerald-400">
                      -{recommendation.riskReductionScore || 25} Risk Pts
                    </span>
                  </div>
                  <p className="text-sm text-slate-100 font-medium mb-2">
                    {recommendation.primaryMitigation}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Est. Execution Cost: ${(recommendation.potentialCostUSD || 35000).toLocaleString()}
                    </span>
                    <span>Confidence: {Math.round((recommendation.confidence || 0.9) * 100)}%</span>
                  </div>
                </div>

                {/* Secondary Option */}
                <div
                  onClick={() => setSelectedAction('secondary')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAction === 'secondary'
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-bold uppercase text-amber-300">Option B: Medium-Term Buffer & Safety Stock Adjust</span>
                    </div>
                    <span className="text-xs font-medium text-emerald-400">
                      -{Math.round((recommendation.riskReductionScore || 25) * 0.75)} Risk Pts
                    </span>
                  </div>
                  <p className="text-sm text-slate-100 font-medium mb-2">
                    {recommendation.secondaryMitigation}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Est. Execution Cost: ${Math.round((recommendation.potentialCostUSD || 35000) * 0.4).toLocaleString()}
                    </span>
                    <span>Confidence: 88%</span>
                  </div>
                </div>
              </div>

              {/* Recommended Qualified Alternates */}
              {recommendation.alternativeSuppliersOrRoutes?.length > 0 && (
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-200 block mb-1">Recommended Alternate Qualified Partners & Corridors:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recommendation.alternativeSuppliersOrRoutes.map((alt: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Maker Input */}
              <div className="pt-2">
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Authorizing Stakeholder / Decision Lead:
                </label>
                <input
                  type="text"
                  value={decisionMaker}
                  onChange={(e) => setDecisionMaker(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. VP Procurement / Director of Global Logistics"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-sm text-slate-400">
              Unable to load recommendations at this time.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>

          {committed ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 px-4 py-2 rounded-lg bg-emerald-950 border border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              Mitigation Action Logged & Applied!
            </div>
          ) : (
            <button
              onClick={handleCommit}
              disabled={loading || !recommendation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 disabled:opacity-50 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize & Commit Action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
