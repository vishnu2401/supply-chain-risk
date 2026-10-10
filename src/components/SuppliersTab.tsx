import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { Supplier, RiskLevel } from '../types';

interface SuppliersTabProps {
  suppliers: Supplier[];
  onSelectSupplierForMitigation: (supplier: Supplier) => void;
}

export const SuppliersTab: React.FC<SuppliersTabProps> = ({
  suppliers,
  onSelectSupplierForMitigation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [singleSourceOnly, setSingleSourceOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'risk' | 'otif' | 'spend' | 'ppm'>('risk');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [activeDetailSupplier, setActiveDetailSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.primaryComponents.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRisk = riskFilter === 'All' || s.riskLevel === riskFilter;
        const matchesTier = tierFilter === 'All' || s.tier === tierFilter;
        const matchesSingleSource = !singleSourceOnly || s.isSingleSource;

        return matchesSearch && matchesRisk && matchesTier && matchesSingleSource;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'risk') diff = b.overallRiskScore - a.overallRiskScore;
        else if (sortBy === 'otif') diff = b.onTimeDeliveryRate - a.onTimeDeliveryRate;
        else if (sortBy === 'spend') diff = b.totalAnnualSpend - a.totalAnnualSpend;
        else if (sortBy === 'ppm') diff = b.defectRatePPM - a.defectRatePPM;
        return sortOrder === 'desc' ? diff : -diff;
      });
  }, [suppliers, searchTerm, riskFilter, tierFilter, singleSourceOnly, sortBy, sortOrder]);

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'Medium':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Supplier Risk Intelligence & Failure Prediction
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ML-evaluated supplier reliability, lead-time variance, geopolitical exposure, and failure probabilities.
          </p>
        </div>

        {/* Quick KPI Count */}
        <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Total: <strong className="text-white">{suppliers.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-rose-400 font-semibold">
            {suppliers.filter((s) => s.riskLevel === 'Critical').length} Critical
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400 font-semibold">
            {suppliers.filter((s) => s.riskLevel === 'High').length} High
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers, components, countries..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        {/* Risk Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="All">All Risk Levels</option>
          <option value="Critical">Critical Only</option>
          <option value="High">High Risk Only</option>
          <option value="Medium">Medium Risk Only</option>
          <option value="Low">Low Risk Only</option>
        </select>

        {/* Tier Filter */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="All">All Tiers</option>
          <option value="Tier 1">Tier 1</option>
          <option value="Tier 2">Tier 2</option>
          <option value="Tier 3">Tier 3</option>
        </select>

        {/* Single Source Toggle */}
        <button
          onClick={() => setSingleSourceOnly(!singleSourceOnly)}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition flex items-center justify-center gap-2 ${
            singleSourceOnly
              ? 'bg-rose-950/70 border-rose-800 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Single-Source Only</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                <th className="py-3.5 px-4">Supplier & Country</th>
                <th className="py-3.5 px-4">Category & Components</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      if (sortBy === 'otif') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('otif'); setSortOrder('desc'); }
                    }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>OTIF Adherence</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Defect Rate (PPM)</th>
                <th className="py-3.5 px-4">Lead Time</th>
                <th className="py-3.5 px-4">Failure Prob</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      if (sortBy === 'risk') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('risk'); setSortOrder('desc'); }
                    }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSuppliers.map((sup, idx) => (
                <tr
                  key={sup.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => setActiveDetailSupplier(sup)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-center text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition flex items-center gap-2">
                      <span>{sup.name}</span>
                      {sup.isSingleSource && (
                        <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-bold">
                          SINGLE-SOURCE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{sup.country}</span>
                      <span>•</span>
                      <span>{sup.tier}</span>
                      <span>•</span>
                      <span>${(sup.totalAnnualSpend / 1000000).toFixed(1)}M/yr</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-300 block">{sup.category}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                      {sup.primaryComponents.slice(0, 2).join(', ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            sup.onTimeDeliveryRate >= 92
                              ? 'bg-emerald-500'
                              : sup.onTimeDeliveryRate >= 80
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${sup.onTimeDeliveryRate}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-slate-200">
                        {sup.onTimeDeliveryRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <span className={sup.defectRatePPM > 300 ? 'text-rose-400 font-bold' : ''}>
                      {sup.defectRatePPM} PPM
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span>{sup.leadTimeDays}d</span>
                    <span className="text-slate-500 text-[10px] block">±{sup.leadTimeVariance}d</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono font-bold ${
                          sup.failureProbability > 0.4
                            ? 'text-rose-400'
                            : sup.failureProbability > 0.2
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {Math.round(sup.failureProbability * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100">{sup.overallRiskScore}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(
                          sup.riskLevel
                        )}`}
                      >
                        {sup.riskLevel}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectSupplierForMitigation(sup)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800 text-cyan-300 hover:text-white hover:border-cyan-600 transition text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>AI Mitigate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Detail Modal / Drawer */}
      {activeDetailSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activeDetailSupplier.name}</h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRiskBadge(
                      activeDetailSupplier.riskLevel
                    )}`}
                  >
                    {activeDetailSupplier.riskLevel} Risk ({activeDetailSupplier.overallRiskScore}/100)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  ID: {activeDetailSupplier.id} • {activeDetailSupplier.country} • {activeDetailSupplier.tier} • Last Audited: {activeDetailSupplier.lastAuditDate}
                </p>
              </div>
              <button
                onClick={() => setActiveDetailSupplier(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">OTIF Adherence</span>
                <span className="text-base font-bold text-white font-mono">{activeDetailSupplier.onTimeDeliveryRate}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Defect PPM</span>
                <span className="text-base font-bold text-white font-mono">{activeDetailSupplier.defectRatePPM}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Financial Solvency</span>
                <span className="text-base font-bold text-white font-mono">{activeDetailSupplier.financialStabilityScore}/100</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Geopolitical Risk</span>
                <span className="text-base font-bold text-rose-400 font-mono">{activeDetailSupplier.geopoliticalRiskScore}/100</span>
              </div>
            </div>

            {/* Primary Components Supplied */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Primary Components Supplied:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeDetailSupplier.primaryComponents.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Single Source Warning */}
            {activeDetailSupplier.isSingleSource && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong className="block text-white">Single-Source Vulnerability Active</strong>
                  No qualified backup supplier exists in the ERP registry. An interruption will cause assembly line stockout.
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveDetailSupplier(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = activeDetailSupplier;
                  setActiveDetailSupplier(null);
                  onSelectSupplierForMitigation(s);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Contingency & Dual-Sourcing Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
