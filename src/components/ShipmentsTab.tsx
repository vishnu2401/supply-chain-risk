import React, { useState, useMemo } from 'react';
import {
  Ship,
  Search,
  Filter,
  ArrowUpDown,
  Plane,
  Truck,
  Train,
  Clock,
  Sparkles,
  AlertTriangle,
  Anchor,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';
import { Shipment, TransportMode, RiskLevel } from '../types';

interface ShipmentsTabProps {
  shipments: Shipment[];
  onSelectShipmentForMitigation: (shipment: Shipment) => void;
}

export const ShipmentsTab: React.FC<ShipmentsTabProps> = ({
  shipments,
  onSelectShipmentForMitigation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [selectedShipmentDetail, setSelectedShipmentDetail] = useState<Shipment | null>(null);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch =
        s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMode = modeFilter === 'All' || s.mode === modeFilter;
      const matchesRisk = riskFilter === 'All' || s.riskLevel === riskFilter;

      return matchesSearch && matchesMode && matchesRisk;
    });
  }, [shipments, searchTerm, modeFilter, riskFilter]);

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'Ocean':
        return <Ship className="w-4 h-4 text-cyan-400" />;
      case 'Air':
        return <Plane className="w-4 h-4 text-blue-400" />;
      case 'Rail':
        return <Train className="w-4 h-4 text-purple-400" />;
      case 'Road':
        return <Truck className="w-4 h-4 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: Shipment['currentStatus']) => {
    switch (status) {
      case 'Severely Delayed':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'At Chokepoint':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Minor Delay':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
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
            <Ship className="w-5 h-5 text-cyan-400" />
            Live Shipment Monitoring & Delay Prediction Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time port congestion tracking, severe weather hazard vectors, and ML delay forecasting across global lanes.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Active Shipments: <strong className="text-white">{shipments.length}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-rose-400 font-semibold">
            {shipments.filter(s => s.predictedDelayDays > 3).length} Severely Delayed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tracking #, ports, carriers..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="All">All Transport Modes</option>
          <option value="Ocean">Ocean Freight</option>
          <option value="Air">Air Freight</option>
          <option value="Rail">Rail Intermodal</option>
          <option value="Road">Road Transit</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="All">All Risk Ratings</option>
          <option value="Critical">Critical Disruption</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk / On Schedule</option>
        </select>
      </div>

      {/* Shipments Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tracking # & Carrier</th>
                <th className="py-3.5 px-4">Origin & Destination</th>
                <th className="py-3.5 px-4">Cargo & Value</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Predicted Delay</th>
                <th className="py-3.5 px-4">Risk Rating</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShipments.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => setSelectedShipmentDetail(s)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-100 group-hover:text-cyan-400 transition">
                      {s.trackingNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.carrier}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{s.originPort} → {s.destinationPort}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.routeKey}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200">{s.cargoDescription}</div>
                    <div className="text-[11px] font-mono text-cyan-400 font-semibold mt-0.5">
                      ${(s.cargoValue).toLocaleString()} USD
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                      {getModeIcon(s.mode)}
                      <span>{s.mode}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(s.currentStatus)}`}>
                      {s.currentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`font-mono font-bold ${s.predictedDelayDays > 3 ? 'text-rose-400' : s.predictedDelayDays > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        +{s.predictedDelayDays}d
                      </span>
                      <span className="text-[10px] text-slate-500">({Math.round(s.delayProbability * 100)}% prob)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{s.riskScore}</span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectShipmentForMitigation(s)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800 text-cyan-300 hover:text-white hover:border-cyan-600 transition text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Reroute / Expedite</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Detail Modal */}
      {selectedShipmentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-mono">{selectedShipmentDetail.trackingNumber}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedShipmentDetail.currentStatus)}`}>
                    {selectedShipmentDetail.currentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Carrier: {selectedShipmentDetail.carrier} • Route: {selectedShipmentDetail.routeKey}
                </p>
              </div>
              <button onClick={() => setSelectedShipmentDetail(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chokepoint & Risk Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Weather Hazard Score</span>
                <span className="text-base font-bold text-amber-400 font-mono">{selectedShipmentDetail.weatherRiskIndex}/100</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Port Congestion Dwell</span>
                <span className="text-base font-bold text-rose-400 font-mono">{selectedShipmentDetail.portCongestionIndex}/100</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Cargo Value</span>
                <span className="text-base font-bold text-cyan-400 font-mono">${selectedShipmentDetail.cargoValue.toLocaleString()}</span>
              </div>
            </div>

            {/* Traversed Chokepoints */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Maritime Chokepoints Traversed:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedShipmentDetail.chokepointsTraversed.length > 0 ? (
                  selectedShipmentDetail.chokepointsTraversed.map((cp, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 font-medium flex items-center gap-1.5">
                      <Anchor className="w-3.5 h-3.5 text-rose-400" />
                      <span>{cp}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No maritime chokepoints in active path.</span>
                )}
              </div>
            </div>

            {/* ML Risk Drivers */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                XGBoost Delay Impact Drivers:
              </span>
              <div className="space-y-1.5">
                {selectedShipmentDetail.keyRiskDrivers.map((driver, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-300">{driver.factor}</span>
                    <span className="font-mono font-bold text-rose-400">+{driver.impact}% delay weight</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button onClick={() => setSelectedShipmentDetail(null)} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white">
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedShipmentDetail;
                  setSelectedShipmentDetail(null);
                  onSelectShipmentForMitigation(s);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Expedited Air/Rail Transshipment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
