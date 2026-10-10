import React, { useState } from 'react';
import {
  ShieldAlert,
  Bell,
  Cpu,
  Upload,
  FileDown,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DisruptionAlert } from '../types';

interface NavbarProps {
  overallScore: number;
  isLiveFeed: boolean;
  onToggleLiveFeed: () => void;
  alerts: DisruptionAlert[];
  onOpenIngest: () => void;
  onOpenReportModal: () => void;
  onResetData: () => void;
  onAcknowledgeAlert: (id: string) => void;
  onRequestBriefing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  overallScore,
  isLiveFeed,
  onToggleLiveFeed,
  alerts,
  onOpenIngest,
  onOpenReportModal,
  onResetData,
  onAcknowledgeAlert,
  onRequestBriefing
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  const getScoreBadge = (score: number) => {
    if (score >= 75) return { label: 'CRITICAL DISRUPTION', color: 'bg-rose-950 text-rose-400 border-rose-800' };
    if (score >= 55) return { label: 'ELEVATED RISK', color: 'bg-amber-950 text-amber-400 border-amber-800' };
    if (score >= 35) return { label: 'MODERATE FRICTION', color: 'bg-yellow-950 text-yellow-400 border-yellow-800' };
    return { label: 'HEALTHY FLOW', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
  };

  const badge = getScoreBadge(overallScore);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-mono">VORTEX</span>
              <span className="text-xs uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px]">
                RISK INTEL
              </span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              AI Supply Chain Risk Intelligence & Prediction
            </div>
          </div>
        </div>

        {/* Global Network Risk Status Pill */}
        <div className="hidden md:flex items-center gap-2.5 pl-4 border-l border-slate-800/80">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Network Risk Index</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono text-white">{overallScore}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Live vs Simulated Mode Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => isLiveFeed && onToggleLiveFeed()}
            className={`px-2.5 py-1 rounded transition text-[11px] font-medium flex items-center gap-1.5 ${
              !isLiveFeed ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Simulated</span>
          </button>
          <button
            onClick={() => !isLiveFeed && onToggleLiveFeed()}
            className={`px-2.5 py-1 rounded transition text-[11px] font-medium flex items-center gap-1.5 ${
              isLiveFeed ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Live Feed</span>
          </button>
        </div>

        {/* AI Briefing Button */}
        <button
          onClick={onRequestBriefing}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800/80 text-cyan-300 hover:text-white hover:border-cyan-600 text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Executive Briefing</span>
        </button>

        {/* Ingest CSV */}
        <button
          onClick={onOpenIngest}
          title="Import CSV Data"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Export PDF */}
        <button
          onClick={onOpenReportModal}
          title="Export Risk Report"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <FileDown className="w-4 h-4" />
        </button>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition relative"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unacknowledgedCount}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Active Disruption Alerts ({alerts.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  {unacknowledgedCount} pending
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className={`p-2.5 rounded-lg border text-xs transition ${
                      a.acknowledged
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : a.severity === 'Critical'
                        ? 'bg-rose-950/40 border-rose-800/80'
                        : 'bg-amber-950/40 border-amber-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${a.severity === 'Critical' ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span className="font-semibold text-slate-100">{a.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                        {a.isLive ? 'LIVE' : 'SIM'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{a.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/50">
                      <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                      {!a.acknowledged && (
                        <button
                          onClick={() => onAcknowledgeAlert(a.id)}
                          className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Data */}
        <button
          onClick={onResetData}
          title="Reset to Baseline Data"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
