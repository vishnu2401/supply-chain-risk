import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { InventoryItem, RiskLevel } from '../types';

interface InventoryTabProps {
  inventory: InventoryItem[];
  onSelectInventoryForMitigation: (item: InventoryItem) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  onSelectInventoryForMitigation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || item.stockStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchTerm, statusFilter]);

  const getStatusBadge = (status: InventoryItem['stockStatus']) => {
    switch (status) {
      case 'Critical Shortage':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'Warning':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Overstocked':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            Inventory Shortage Forecasting & Dynamic Safety Stock
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Survival hazard modeling of stockout events, consumption velocity forecasting, and buffer recalibration.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Total SKUs: <strong className="text-white">{inventory.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-rose-400 font-semibold">
            {inventory.filter(i => i.stockStatus === 'Critical Shortage').length} Critical Shortages
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, product name, supplier..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="All">All Stock Statuses</option>
          <option value="Critical Shortage">Critical Shortage (&lt;15 days)</option>
          <option value="Warning">Warning Buffer Deficit</option>
          <option value="Healthy">Healthy Stock Level</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">SKU & Product Name</th>
                <th className="py-3.5 px-4">Category & Supplier</th>
                <th className="py-3.5 px-4">Current Stock / Reorder Pt</th>
                <th className="py-3.5 px-4">Days of Supply Runway</th>
                <th className="py-3.5 px-4">30-Day Stockout Hazard</th>
                <th className="py-3.5 px-4">Rec. Safety Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInventory.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-100">{item.sku}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{item.productName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300 font-medium">{item.category}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.supplierName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-slate-100 font-semibold">
                      {item.currentStock.toLocaleString()} units
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ROP: {item.reorderPoint.toLocaleString()} | ${item.unitCost}/unit
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.daysOfSupplyRemaining > 30
                              ? 'bg-emerald-500'
                              : item.daysOfSupplyRemaining > 15
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.daysOfSupplyRemaining / 60) * 100)}%` }}
                        />
                      </div>
                      <span className={`font-mono font-bold ${item.daysOfSupplyRemaining < 15 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {item.daysOfSupplyRemaining}d
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono font-bold ${item.stockoutProbability30d > 0.6 ? 'text-rose-400' : item.stockoutProbability30d > 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {Math.round(item.stockoutProbability30d * 100)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {item.recommendedSafetyStock.toLocaleString()}
                    <span className="text-[10px] text-slate-500 block">
                      (+{Math.max(0, item.recommendedSafetyStock - item.safetyStock).toLocaleString()} buffer)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.stockStatus)}`}>
                      {item.stockStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectInventoryForMitigation(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800 text-cyan-300 hover:text-white hover:border-cyan-600 transition text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Rebalance</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
