import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Ship,
  Boxes,
  Cpu,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

export type ActiveTab = 'overview' | 'suppliers' | 'shipments' | 'inventory' | 'predictions' | 'scenarios' | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  criticalSuppliersCount: number;
  delayedShipmentsCount: number;
  criticalInventoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  criticalSuppliersCount,
  delayedShipmentsCount,
  criticalInventoryCount
}) => {
  const menuItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'suppliers' as ActiveTab,
      label: 'Supplier Risk Analysis',
      icon: Building2,
      badge: criticalSuppliersCount > 0 ? `${criticalSuppliersCount} High` : null,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    {
      id: 'shipments' as ActiveTab,
      label: 'Shipment Tracking',
      icon: Ship,
      badge: delayedShipmentsCount > 0 ? `${delayedShipmentsCount} Delayed` : null,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800'
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Inventory Shortage',
      icon: Boxes,
      badge: criticalInventoryCount > 0 ? `${criticalInventoryCount} Alert` : null,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    {
      id: 'predictions' as ActiveTab,
      label: 'ML Models & Evaluation',
      icon: Cpu,
      badge: '4 Models',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800'
    },
    {
      id: 'scenarios' as ActiveTab,
      label: 'What-If Stress Simulator',
      icon: SlidersHorizontal,
      badge: 'Interactive',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Decision Audit',
      icon: FileSpreadsheet,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/95 flex flex-col shrink-0 select-none">
      <div className="p-4 flex-1 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          Intelligence Modules
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-white border border-cyan-800/80 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">ML Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time multi-modal risk weighting & inference pipeline online.
          </p>
        </div>
      </div>
    </aside>
  );
};
