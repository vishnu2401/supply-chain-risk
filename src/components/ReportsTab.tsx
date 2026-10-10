import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileDown,
  Download,
  ShieldCheck,
  Clock,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Supplier, Shipment, InventoryItem, MitigationDecision } from '../types';

interface ReportsTabProps {
  suppliers: Supplier[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  auditLog: MitigationDecision[];
  overallScore: number;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  suppliers,
  shipments,
  inventory,
  auditLog,
  overallScore
}) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Generate Executive PDF Report via jsPDF
  const handleExportPDF = () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF();

      // Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('VORTEX SUPPLY CHAIN RISK INTELLIGENCE', 14, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Executive Risk Briefing | Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`, 14, 25);

      // Section 1: Executive KPI Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. EXECUTIVE NETWORK POSTURE', 14, 45);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Global Supply Chain Risk Score: ${overallScore} / 100 (${overallScore >= 75 ? 'CRITICAL DISRUPTION' : overallScore >= 55 ? 'ELEVATED FRICTION' : 'HEALTHY FLOW'})`, 14, 53);
      doc.text(`Total Active Suppliers Evaluated: ${suppliers.length} (Critical/High-Risk: ${suppliers.filter(s => s.riskLevel === 'Critical' || s.riskLevel === 'High').length})`, 14, 60);
      doc.text(`Active Inbound Shipments: ${shipments.length} (Severely Delayed: ${shipments.filter(s => s.predictedDelayDays > 2).length})`, 14, 67);
      doc.text(`Total Monitored In-Transit Cargo Value: $${(shipments.reduce((sum, s) => sum + s.cargoValue, 0) / 1000000).toFixed(2)}M USD`, 14, 74);

      // Section 2: Top Critical Suppliers
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. CRITICAL SUPPLIER FAILURE VULNERABILITY RANKING', 14, 88);

      let yPos = 96;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Supplier Name', 14, yPos);
      doc.text('Country', 75, yPos);
      doc.text('Category', 105, yPos);
      doc.text('OTIF Adherence', 145, yPos);
      doc.text('Risk Score', 175, yPos);

      yPos += 3;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, yPos, 196, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      const topSuppliers = suppliers.slice(0, 6);
      topSuppliers.forEach((s) => {
        doc.text(s.name.slice(0, 32), 14, yPos);
        doc.text(s.country, 75, yPos);
        doc.text(s.category.slice(0, 18), 105, yPos);
        doc.text(`${s.onTimeDeliveryRate}%`, 145, yPos);
        doc.text(`${s.overallRiskScore} (${s.riskLevel})`, 175, yPos);
        yPos += 6;
      });

      // Section 3: Inbound Shipments with Highest Delay Risk
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. CRITICAL INBOUND SHIPMENTS & CHOKEPOINT BOTTLENECKS', 14, yPos);

      yPos += 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Tracking #', 14, yPos);
      doc.text('Origin → Destination', 60, yPos);
      doc.text('Carrier', 125, yPos);
      doc.text('Delay Forecast', 165, yPos);

      yPos += 3;
      doc.line(14, yPos, 196, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      const topShipments = shipments.slice(0, 5);
      topShipments.forEach((shp) => {
        doc.text(shp.trackingNumber, 14, yPos);
        doc.text(`${shp.originCountry} → ${shp.destinationCountry}`, 60, yPos);
        doc.text(shp.carrier.slice(0, 20), 125, yPos);
        doc.text(`+${shp.predictedDelayDays}d (${shp.riskLevel})`, 165, yPos);
        yPos += 6;
      });

      // Section 4: Decisions & Audit Log
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('4. RECENT MITIGATION ACTIONS COMMITTED', 14, yPos);

      yPos += 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      auditLog.slice(0, 3).forEach((log) => {
        doc.text(`• [${log.timestamp.slice(0, 10)}] ${log.entityName}: ${log.actionTaken.slice(0, 85)}`, 14, yPos);
        yPos += 5;
        doc.text(`   Authorized by: ${log.decisionMaker} | Risk: ${log.predictedRiskBefore} → ${log.predictedRiskAfter}`, 14, yPos);
        yPos += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Confidential - Generated by Vortex Supply Chain Risk Intelligence System', 14, 285);

      doc.save(`Vortex_Supply_Chain_Risk_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // CSV Exporter helper
  const exportCsv = (filename: string, rows: any[]) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map(r =>
          headers
            .map(h => {
              const val = r[h];
              if (Array.isArray(val)) return `"${val.join(';')}"`;
              if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
              return val;
            })
            .join(',')
        )
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            Executive Reports, Exports & Decision Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Download executive risk dossiers in PDF, export raw data tables in CSV, and maintain complete compliance tracking.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={generatingPdf}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 transition cursor-pointer disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" />
          <span>{generatingPdf ? 'Generating PDF...' : 'Download Executive PDF Report'}</span>
        </button>
      </div>

      {/* CSV Export Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Suppliers CSV */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="font-semibold text-xs text-slate-200 block">Suppliers Registry</span>
            <span className="text-[11px] text-slate-400">{suppliers.length} records with ML scores</span>
          </div>
          <button
            onClick={() => exportCsv('vortex_suppliers_risk.csv', suppliers)}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Shipments CSV */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="font-semibold text-xs text-slate-200 block">Shipments & AIS Feed</span>
            <span className="text-[11px] text-slate-400">{shipments.length} active cargo movements</span>
          </div>
          <button
            onClick={() => exportCsv('vortex_shipments_delay_forecast.csv', shipments)}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Inventory CSV */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="font-semibold text-xs text-slate-200 block">Inventory Shortage SKU</span>
            <span className="text-[11px] text-slate-400">{inventory.length} BOM components</span>
          </div>
          <button
            onClick={() => exportCsv('vortex_inventory_shortage.csv', inventory)}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Log CSV */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="font-semibold text-xs text-slate-200 block">Decision Audit Trail</span>
            <span className="text-[11px] text-slate-400">{auditLog.length} authorized mitigations</span>
          </div>
          <button
            onClick={() => exportCsv('vortex_decision_audit_trail.csv', auditLog)}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Decision Tracking & Audit Trail Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Risk Decision History & Authorization Audit Log
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Immutable Audit Trail
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Log ID & Timestamp</th>
                <th className="py-3 px-4">Affected Entity</th>
                <th className="py-3 px-4">Mitigation Action Authorized</th>
                <th className="py-3 px-4">Authorizing Lead</th>
                <th className="py-3 px-4">Risk Delta</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLog.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    <span className="font-bold text-slate-200 block">{log.id}</span>
                    <span className="text-[10px]">{log.timestamp.slice(0, 16).replace('T', ' ')} UTC</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {log.entityName}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-sm">
                    {log.actionTaken}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.decisionMaker}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-slate-400">{log.predictedRiskBefore}</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="text-emerald-400 font-bold">{log.predictedRiskAfter}</span>
                    <span className="text-emerald-400 text-[10px] ml-1">
                      (-{log.predictedRiskBefore - log.predictedRiskAfter} pts)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {log.status}
                    </span>
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
