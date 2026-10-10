import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_SUPPLIERS,
  INITIAL_SHIPMENTS,
  INITIAL_INVENTORY,
  INITIAL_ALERTS,
  MARITIME_CHOKEPOINTS
} from './src/mock/supplyChainData';
import { ML_MODELS_DATA, DATA_LEAKAGE_PREVENTION_SPECS } from './src/ml/modelMetrics';
import {
  calculateSupplierRiskScore,
  calculateShipmentRiskScore,
  calculateInventoryStockoutRisk,
  runWhatIfSimulation
} from './src/ml/riskEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// In-memory data store for live modifications, CSV ingestion, etc.
let currentSuppliers = [...INITIAL_SUPPLIERS];
let currentShipments = [...INITIAL_SHIPMENTS];
let currentInventory = [...INITIAL_INVENTORY];
let currentAlerts = [...INITIAL_ALERTS];
const auditLog: any[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    entityName: 'Shenzhen Precision Lithium Systems',
    actionTaken: 'Initiated dual-sourcing procurement with Monterrey Mechatronics',
    decisionMaker: 'VP Supply Chain',
    status: 'In Progress',
    predictedRiskBefore: 86,
    predictedRiskAfter: 68
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    entityName: 'OC-CN-NL-33291 (Maersk Cape Reroute)',
    actionTaken: 'Expedited 15% critical buffer inventory via Frankfurt Air Freight',
    decisionMaker: 'Global Logistics Director',
    status: 'Applied',
    predictedRiskBefore: 94,
    predictedRiskAfter: 72
  }
];

// Initialize Google Gen AI client
let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI();
  }
} catch (err) {
  console.warn('Google Gen AI client init error, will use rule-based fallback:', err);
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/data', (req, res) => {
  res.json({
    suppliers: currentSuppliers,
    shipments: currentShipments,
    inventory: currentInventory,
    alerts: currentAlerts,
    chokepoints: MARITIME_CHOKEPOINTS,
    auditLog
  });
});

app.get('/api/models/metrics', (req, res) => {
  res.json({
    models: ML_MODELS_DATA,
    leakagePrevention: DATA_LEAKAGE_PREVENTION_SPECS
  });
});

app.post('/api/predict/risk', (req, res) => {
  const { type, payload } = req.body;
  if (type === 'supplier') {
    const result = calculateSupplierRiskScore(payload);
    return res.json(result);
  } else if (type === 'shipment') {
    const result = calculateShipmentRiskScore(payload);
    return res.json(result);
  } else if (type === 'inventory') {
    const result = calculateInventoryStockoutRisk(payload);
    return res.json(result);
  }
  return res.status(400).json({ error: 'Invalid entity type for prediction' });
});

app.post('/api/scenarios/simulate', (req, res) => {
  const params = req.body;
  const result = runWhatIfSimulation(
    currentSuppliers,
    currentShipments,
    currentInventory,
    params
  );
  res.json(result);
});

// Acknowledge Alert
app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  const alert = currentAlerts.find(a => a.id === id);
  if (alert) {
    alert.acknowledged = true;
    return res.json({ success: true, alert });
  }
  res.status(404).json({ error: 'Alert not found' });
});

// Record Decision / Audit Log
app.post('/api/decisions', (req, res) => {
  const { entityName, actionTaken, decisionMaker, predictedRiskBefore, predictedRiskAfter } = req.body;
  const entry = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    entityName,
    actionTaken,
    decisionMaker: decisionMaker || 'Operations Lead',
    status: 'Applied',
    predictedRiskBefore: predictedRiskBefore || 80,
    predictedRiskAfter: predictedRiskAfter || 55
  };
  auditLog.unshift(entry);
  res.json({ success: true, entry });
});

// Reset data to defaults
app.post('/api/data/reset', (req, res) => {
  currentSuppliers = [...INITIAL_SUPPLIERS];
  currentShipments = [...INITIAL_SHIPMENTS];
  currentInventory = [...INITIAL_INVENTORY];
  currentAlerts = [...INITIAL_ALERTS];
  res.json({ success: true });
});

// Ingest CSV data
app.post('/api/data/ingest', (req, res) => {
  const { type, records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'No records provided' });
  }

  try {
    if (type === 'suppliers') {
      const newSuppliers = records.map((r, idx) => {
        const sup: any = {
          id: r.id || `SUP-${900 + idx}`,
          name: r.name || `Imported Supplier ${idx + 1}`,
          country: r.country || 'Unknown',
          region: r.region || 'Global',
          tier: r.tier || 'Tier 2',
          category: r.category || 'Mechanical Parts',
          onTimeDeliveryRate: Number(r.onTimeDeliveryRate) || 85,
          defectRatePPM: Number(r.defectRatePPM) || 200,
          leadTimeDays: Number(r.leadTimeDays) || 30,
          leadTimeVariance: Number(r.leadTimeVariance) || 5,
          financialStabilityScore: Number(r.financialStabilityScore) || 75,
          geopoliticalRiskScore: Number(r.geopoliticalRiskScore) || 40,
          esgScore: Number(r.esgScore) || 75,
          isSingleSource: r.isSingleSource === true || r.isSingleSource === 'true',
          activeContractsCount: Number(r.activeContractsCount) || 3,
          totalAnnualSpend: Number(r.totalAnnualSpend) || 2000000,
          primaryComponents: r.primaryComponents ? String(r.primaryComponents).split(';') : ['Custom Subassembly'],
          lastAuditDate: r.lastAuditDate || new Date().toISOString().split('T')[0],
          status: 'Active'
        };
        const scoring = calculateSupplierRiskScore(sup);
        sup.overallRiskScore = scoring.score;
        sup.riskLevel = scoring.level;
        sup.failureProbability = scoring.failureProbability;
        sup.rank = idx + 1;
        return sup;
      });
      currentSuppliers = [...newSuppliers, ...currentSuppliers];
      return res.json({ success: true, count: newSuppliers.length });
    }

    if (type === 'shipments') {
      const newShipments = records.map((r, idx) => {
        const shp: any = {
          id: r.id || `SHP-${900 + idx}`,
          trackingNumber: r.trackingNumber || `TRK-${Date.now()}-${idx}`,
          originPort: r.originPort || 'Origin Hub',
          originCountry: r.originCountry || 'Origin Country',
          destinationPort: r.destinationPort || 'Destination Port',
          destinationCountry: r.destinationCountry || 'Destination Country',
          supplierId: r.supplierId || 'SUP-101',
          supplierName: r.supplierName || 'Primary Supplier',
          cargoDescription: r.cargoDescription || 'Industrial Cargo Batch',
          cargoValue: Number(r.cargoValue) || 500000,
          mode: r.mode || 'Ocean',
          carrier: r.carrier || 'Global Freight Line',
          departureDate: r.departureDate || new Date().toISOString().split('T')[0],
          estimatedArrivalDate: r.estimatedArrivalDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
          weatherRiskIndex: Number(r.weatherRiskIndex) || 25,
          portCongestionIndex: Number(r.portCongestionIndex) || 35,
          chokepointsTraversed: r.chokepointsTraversed ? String(r.chokepointsTraversed).split(';') : [],
          currentStatus: 'On Schedule'
        };
        const scoring = calculateShipmentRiskScore(shp);
        shp.riskScore = scoring.score;
        shp.riskLevel = scoring.level;
        shp.predictedDelayDays = scoring.predictedDelayDays;
        shp.delayProbability = scoring.delayProbability;
        shp.keyRiskDrivers = scoring.drivers;
        return shp;
      });
      currentShipments = [...newShipments, ...currentShipments];
      return res.json({ success: true, count: newShipments.length });
    }

    res.status(400).json({ error: 'Unknown data type' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to ingest data' });
  }
});

// AI Mitigation Recommendations via Gemini 3.8 Flash
app.post('/api/ai/recommend', async (req, res) => {
  const { entityType, entityData } = req.body;

  try {
    if (process.env.GEMINI_API_KEY) {
      if (!aiClient) aiClient = new GoogleGenAI();
      const prompt = `You are the Chief Risk Officer and AI Supply Chain Intelligence engine for an enterprise supply chain resilience platform.
Analyze the following high-risk ${entityType} and provide structured, actionable mitigation recommendations:

Entity Data:
${JSON.stringify(entityData, null, 2)}

Provide your response in JSON format matching this schema:
{
  "summary": "Concise 2-sentence executive summary of the critical vulnerability",
  "rootCauses": ["Root cause 1", "Root cause 2", "Root cause 3"],
  "primaryMitigation": "Concrete immediate operational action (e.g. specific rerouting, spot air-freight reservation, or activating dual supplier)",
  "secondaryMitigation": "Medium-term tactical adjustment (e.g. safety stock recalibration, local buffer consolidation)",
  "potentialCostUSD": 45000,
  "riskReductionScore": 28,
  "confidence": 0.92,
  "alternativeSuppliersOrRoutes": ["Option A details", "Option B details"]
}
Return only valid JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({
          ...parsed,
          generatedByAI: true
        });
      } catch (parseError) {
        console.warn('JSON parse issue, cleaning response:', responseText);
      }
    }
  } catch (err) {
    console.warn('Gemini API call failed or timed out, using analytical fallback:', err);
  }

  // High-fidelity analytical fallback if key is missing or API errors
  const name = entityData?.name || entityData?.trackingNumber || entityData?.productName || 'Entity';
  const score = entityData?.overallRiskScore || entityData?.riskScore || 78;
  const isSingle = entityData?.isSingleSource;
  const category = entityData?.category || 'Component';

  res.json({
    summary: `${name} presents an elevated risk profile (score: ${score}/100) driven by lead time volatility, geographical chokepoints, and ${isSingle ? 'critical single-source dependency' : 'carrier transit dwell'}.`,
    rootCauses: [
      isSingle ? 'Single-source dependency with zero qualified secondary tooling' : 'Port congestion and maritime chokepoint transit delays',
      'Lead time variance exceeding contract SLA bounds by >20%',
      'Regional geopolitical exposure and seasonal transit friction'
    ],
    primaryMitigation: isSingle
      ? `Accelerate qualification of nearshore secondary supplier in Mexico/Europe for ${category} with a 25% initial volume allocation.`
      : `Reroute 30% of critical volume to alternative intermodal air/rail corridors to circumvent active chokepoints.`,
    secondaryMitigation: `Dynamically increase safety stock buffer by +21 days of supply and negotiate dual-sourcing framework agreement.`,
    potentialCostUSD: Math.round(score * 850),
    riskReductionScore: Math.round(score * 0.38),
    confidence: 0.94,
    alternativeSuppliersOrRoutes: [
      'Bavaria Precision Hydraulik (Secondary qualification ready)',
      'Monterrey Mechatronics (Cross-border lead time 14 days)',
      'Intermodal Air Sea combo via Frankfurt Hub'
    ],
    generatedByAI: false
  });
});

// AI Executive Report Briefing Generator
app.post('/api/ai/executive-summary', async (req, res) => {
  const { overallRiskScore, highRiskCount, delayedShipmentsCount, criticalInventoryCount } = req.body;

  try {
    if (process.env.GEMINI_API_KEY) {
      if (!aiClient) aiClient = new GoogleGenAI();
      const prompt = `Generate an Executive Supply Chain Intelligence Briefing for senior leadership (C-Suite / VP of Supply Chain).
Current Metrics:
- Global Network Risk Score: ${overallRiskScore}/100
- High/Critical Risk Suppliers: ${highRiskCount}
- At-Risk Inbound Shipments: ${delayedShipmentsCount}
- SKUs in Critical Stockout Threat: ${criticalInventoryCount}

Structure response in JSON:
{
  "executiveHeadline": "A clear, compelling executive title",
  "situationSummary": "A concise 3-4 sentence operational briefing of current global supply chain health.",
  "topThreats": ["Key threat 1", "Key threat 2", "Key threat 3"],
  "strategicDirectives": ["Immediate tactical directive", "Medium-term buffering directive", "Executive supply security action"],
  "financialExposureEst": "$6.8M USD"
}
Return only valid JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json({ ...parsed, generatedByAI: true });
    }
  } catch (err) {
    console.warn('Gemini summary error:', err);
  }

  res.json({
    executiveHeadline: `Global Logistics Status: Elevated Chokepoint & Inbound Lead-Time Strain`,
    situationSummary: `The enterprise supply chain is operating under elevated friction (Score: ${overallRiskScore}/100). Maritime delays across the Red Sea and Panama Canal combined with port berth dwell at Long Beach have placed ${delayedShipmentsCount} inbound shipments and ${criticalInventoryCount} critical SKUs at risk of production stoppage within 14-21 days.`,
    topThreats: [
      'Maritime transit detours adding 10-14 days to Asia-Europe and Trans-Pacific container flows',
      'Single-source dependency across Taiwan semiconductor and Shenzhen lithium battery suppliers',
      'Safety stock deficits on automotive SoCs and battery grade cathode materials'
    ],
    strategicDirectives: [
      'Authorize emergency spot air freight allocation for critical wafer batches (SKU-SOC-301)',
      'Execute secondary qualification contracts with Monterrey and European suppliers',
      'Recalibrate ERP safety stock parameters dynamically by +35% for ocean-transit components'
    ],
    financialExposureEst: '$7.4M USD',
    generatedByAI: false
  });
});

// Dev vs Prod Vite Integration
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vortex Supply Chain Platform server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
