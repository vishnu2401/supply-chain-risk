import React, { useState } from 'react';
import { Anchor, AlertTriangle, ShieldCheck, Info, Compass, Waves } from 'lucide-react';
import { MARITIME_CHOKEPOINTS } from '../mock/supplyChainData';

interface ChokepointMapProps {
  onSelectChokepoint?: (chokepointName: string) => void;
}

export const ChokepointMap: React.FC<ChokepointMapProps> = ({ onSelectChokepoint }) => {
  const [selectedPoint, setSelectedPoint] = useState<typeof MARITIME_CHOKEPOINTS[0] | null>(MARITIME_CHOKEPOINTS[0]);
  const [activeLane, setActiveLane] = useState<'all' | 'asia-us' | 'asia-eu' | 'americas'>('all');

  // Relative SVG coordinates projection (Equirectangular approximation on 1000x520 canvas)
  const projectCoords = (lat: number, lng: number) => {
    // lng: -180 to 180 -> x: 0 to 1000
    // lat: 85 to -85 -> y: 0 to 520
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 520;
    return { x, y };
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'fill-rose-500 stroke-rose-300 shadow-rose-500';
      case 'High':
        return 'fill-amber-500 stroke-amber-300 shadow-amber-500';
      case 'Medium':
        return 'fill-yellow-500 stroke-yellow-300 shadow-yellow-500';
      default:
        return 'fill-emerald-500 stroke-emerald-300 shadow-emerald-500';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Global Maritime Chokepoints & Strategic Shipping Corridors
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
              Interactive Geo-Monitor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time vessel density, dwell backlogs, and risk ratings across primary ocean transit bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800 self-start md:self-auto text-xs">
          <button
            onClick={() => setActiveLane('all')}
            className={`px-2.5 py-1 rounded transition-all ${activeLane === 'all' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All Corridors
          </button>
          <button
            onClick={() => setActiveLane('asia-eu')}
            className={`px-2.5 py-1 rounded transition-all ${activeLane === 'asia-eu' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Asia-Europe
          </button>
          <button
            onClick={() => setActiveLane('asia-us')}
            className={`px-2.5 py-1 rounded transition-all ${activeLane === 'asia-us' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Trans-Pacific
          </button>
          <button
            onClick={() => setActiveLane('americas')}
            className={`px-2.5 py-1 rounded transition-all ${activeLane === 'americas' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Panama / Americas
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[2/1] min-h-[300px] max-h-[460px] bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <svg viewBox="0 0 1000 520" className="w-full h-full select-none">
          <defs>
            <linearGradient id="routeGradCritical" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="routeGradNormal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stylized Simplified Continents Outlines */}
          <g className="fill-slate-800/40 stroke-slate-700/50 stroke-[1]">
            {/* North America */}
            <path d="M 120 100 Q 220 80 270 120 T 260 210 T 200 240 T 150 200 Z" />
            {/* South America */}
            <path d="M 230 270 Q 290 280 320 340 T 280 440 T 240 400 T 220 300 Z" />
            {/* Europe */}
            <path d="M 450 110 Q 530 100 560 140 T 520 200 T 460 180 Z" />
            {/* Africa */}
            <path d="M 460 210 Q 560 210 570 290 T 540 420 T 480 390 T 440 270 Z" />
            {/* Asia */}
            <path d="M 570 100 Q 750 90 850 140 T 880 260 T 780 280 T 650 210 Z" />
            {/* Australia */}
            <path d="M 780 360 Q 860 360 880 410 T 820 440 T 770 400 Z" />
          </g>

          {/* Shipping Corridors */}
          {/* Lane 1: Asia to Europe via Cape detour (Active Red Sea rerouting) */}
          {(activeLane === 'all' || activeLane === 'asia-eu') && (
            <path
              d="M 820 230 Q 780 280 730 320 T 600 450 T 490 440 T 450 300 T 480 150"
              fill="none"
              stroke="url(#routeGradCritical)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          )}

          {/* Lane 2: Trans-Pacific (Asia to US West Coast) */}
          {(activeLane === 'all' || activeLane === 'asia-us') && (
            <path
              d="M 830 210 Q 950 160 990 180 M 10 180 Q 80 160 170 190"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.2"
              strokeDasharray="5 3"
            />
          )}

          {/* Lane 3: South America to US Gulf via Panama Canal */}
          {(activeLane === 'all' || activeLane === 'americas') && (
            <path
              d="M 250 380 Q 235 300 240 270 T 230 210"
              fill="none"
              stroke="url(#routeGradCritical)"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
          )}

          {/* Lane 4: Trans-Atlantic (Europe to US East Coast) */}
          {(activeLane === 'all') && (
            <path
              d="M 470 140 Q 340 160 240 170"
              fill="none"
              stroke="url(#routeGradNormal)"
              strokeWidth="1.8"
            />
          )}

          {/* Chokepoint Nodes */}
          {MARITIME_CHOKEPOINTS.map((cp) => {
            const { x, y } = projectCoords(cp.lat, cp.lng);
            const isSelected = selectedPoint?.id === cp.id;

            return (
              <g
                key={cp.id}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedPoint(cp);
                  if (onSelectChokepoint) onSelectChokepoint(cp.name);
                }}
              >
                {/* Pulse ring for critical/high */}
                {(cp.congestionLevel === 'Critical' || cp.congestionLevel === 'High') && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 16 : 11}
                    className={`${cp.congestionLevel === 'Critical' ? 'stroke-rose-500' : 'stroke-amber-500'} stroke-[1.5] fill-none animate-ping opacity-75`}
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 9 : 6}
                  className={`${getStatusColor(cp.congestionLevel)} stroke-2 transition-all duration-200 group-hover:scale-125`}
                  filter="url(#glow)"
                />

                {/* Label on Hover or Select */}
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold tracking-wide pointer-events-none transition-all ${
                    isSelected ? 'fill-cyan-300 font-bold' : 'fill-slate-300 group-hover:fill-white'
                  }`}
                >
                  {cp.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1.5 flex items-center gap-3 text-[11px] text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Critical Congestion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>High Dwell</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal Flow</span>
          </div>
        </div>
      </div>

      {/* Detail Card of Selected Chokepoint */}
      {selectedPoint && (
        <div className="mt-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 mt-0.5">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-100">{selectedPoint.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    selectedPoint.congestionLevel === 'Critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedPoint.congestionLevel === 'High'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {selectedPoint.congestionLevel} Congestion
                </span>
                <span className="text-xs text-slate-400">Risk Score: {selectedPoint.riskScore}/100</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Status: <span className="text-amber-300 font-medium">{selectedPoint.status}</span>. Average vessel transit delay currently at{' '}
                <strong className="text-white">+{selectedPoint.avgDwellDelayDays} days</strong> vs nominal schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 bg-slate-900/90 px-4 py-2 rounded-lg border border-slate-800 shrink-0">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Daily Vessels</span>
              <span className="text-sm font-bold text-slate-100">{selectedPoint.dailyVesselVolume}</span>
              <span className="text-slate-500 text-[10px]"> / {selectedPoint.normalCapacity} max</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Avg Dwell Delay</span>
              <span className="text-sm font-bold text-rose-400">+{selectedPoint.avgDwellDelayDays}d</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
