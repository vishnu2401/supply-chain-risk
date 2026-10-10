import React, { useState } from 'react';
import { X, Upload, FileText, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataIngested: () => void;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({
  isOpen,
  onClose,
  onDataIngested
}) => {
  const [dataType, setDataType] = useState<'suppliers' | 'shipments'>('suppliers');
  const [csvContent, setCsvContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const sampleSupplierCsv = `name,country,region,tier,category,onTimeDeliveryRate,defectRatePPM,leadTimeDays,leadTimeVariance,financialStabilityScore,geopoliticalRiskScore,isSingleSource,totalAnnualSpend
Tokyo Micro Photonics,Japan,East Asia,Tier 1,Electronics & Displays,91.5,110,28,4.2,88,22,false,3800000
Veracruz Precision Castings,Mexico,North America,Tier 2,Mechanical Parts,86.0,240,16,3.8,72,34,true,4100000
Seoul Advanced Silicon Fab,South Korea,East Asia,Tier 1,Semiconductors,89.4,95,35,5.1,90,44,false,9500000`;

  const sampleShipmentCsv = `trackingNumber,originPort,originCountry,destinationPort,destinationCountry,cargoDescription,cargoValue,mode,carrier,weatherRiskIndex,portCongestionIndex,chokepointsTraversed
TRK-PAC-991,Busan Port,South Korea,Port of Oakland,United States,Solid State Batteries Batch A,3200000,Ocean,HMM Line,45,60,San Pedro Bay
TRK-AIR-204,Incheon Airport,South Korea,Chicago O'Hare,United States,Critical Wafer Stepper Optics,1400000,Air,Korean Air Cargo,15,20,`;

  const handleLoadSample = () => {
    if (dataType === 'suppliers') {
      setCsvContent(sampleSupplierCsv);
    } else {
      setCsvContent(sampleShipmentCsv);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(v => v.trim());
      const record: any = {};
      headers.forEach((h, index) => {
        record[h] = values[index] || '';
      });
      records.push(record);
    }
    return records;
  };

  const handleSubmit = async () => {
    if (!csvContent.trim()) {
      setFeedback({ success: false, message: 'Please provide CSV content or upload a file.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const records = parseCsv(csvContent);
      if (records.length === 0) {
        setFeedback({ success: false, message: 'Could not parse any valid rows from CSV.' });
        return;
      }

      const res = await fetch('/api/data/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: dataType, records })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ success: true, message: `Successfully ingested and ML-scored ${data.count} ${dataType} records!` });
        onDataIngested();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ success: false, message: data.error || 'Failed to ingest records.' });
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Error communicating with server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                Supply Chain Data Ingestion Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Ingest ERP or logistics data via CSV with automatic ML risk classification
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => { setDataType('suppliers'); setCsvContent(''); }}
              className={`flex-1 py-1.5 rounded transition font-medium ${
                dataType === 'suppliers' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suppliers Dataset (ERP)
            </button>
            <button
              onClick={() => { setDataType('shipments'); setCsvContent(''); }}
              className={`flex-1 py-1.5 rounded transition font-medium ${
                dataType === 'shipments' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shipments Dataset (TMS / AIS)
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              CSV Content (comma separated):
            </label>
            <div className="flex items-center gap-2">
              <label className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 font-medium">
                <FileText className="w-3.5 h-3.5" />
                Upload CSV
                <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={handleLoadSample}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Load Sample
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder={`Paste CSV data here with headers... e.g.:\n${dataType === 'suppliers' ? sampleSupplierCsv : sampleShipmentCsv}`}
            className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
          />

          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                feedback.success
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-800'
              }`}
            >
              {feedback.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition">
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !csvContent.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950 disabled:opacity-50 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ingesting & Scoring...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Ingest & Run ML Scoring</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
