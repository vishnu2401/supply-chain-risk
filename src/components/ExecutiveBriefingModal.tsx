import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, DollarSign, RefreshCw, Printer } from 'lucide-react';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  overallScore: number;
  highRiskCount: number;
  delayedShipmentsCount: number;
  criticalInventoryCount: number;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose,
  overallScore,
  highRiskCount,
  delayedShipmentsCount,
  criticalInventoryCount
}) => {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBriefing();
    }
  }, [isOpen]);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRiskScore: overallScore,
          highRiskCount,
          delayedShipmentsCount,
          criticalInventoryCount
        })
      });
      const data = await res.json();
      setBriefing(data);
    } catch (err) {
      console.error('Failed to generate executive briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-slate-100">
                  C-Suite Executive Supply Chain Intelligence Briefing
                </h3>
                {briefing?.generatedByAI && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">
                    Gemini 3.8 Flash
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Strategic synthesis for Board & Executive Leadership review
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <div className="text-sm font-medium text-slate-200">
                Synthesizing global risk exposure & strategic directives with Gemini AI...
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Correlating maritime chokepoints, Tier-1 supplier health, and assembly plant inventory buffers.
              </p>
            </div>
          ) : briefing ? (
            <>
              {/* Headline */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  Situation Headline
                </span>
                <h4 className="text-base font-bold text-white leading-snug">
                  {briefing.executiveHeadline}
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {briefing.situationSummary}
                </p>
              </div>

              {/* Financial Exposure */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-rose-400" />
                  <span className="text-slate-300 font-semibold">Estimated Network Value At Exposure:</span>
                </div>
                <span className="text-base font-mono font-bold text-rose-300">
                  {briefing.financialExposureEst || '$7.4M USD'}
                </span>
              </div>

              {/* Key Vulnerabilities */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Top Priority Vulnerabilities:
                </span>
                <div className="space-y-1.5">
                  {briefing.topThreats?.map((threat: string, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span className="text-slate-200">{threat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Directives */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block">
                  Recommended Executive Directives:
                </span>
                <div className="space-y-1.5">
                  {briefing.strategicDirectives?.map((directive: string, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60 text-xs flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="text-slate-200">{directive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/90 mt-auto">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition">
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Briefing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
