# Vortex: AI-Powered Supply Chain Risk Intelligence & Prediction Platform

Vortex is an enterprise-grade AI supply chain risk intelligence platform that monitors supply chain operations, evaluates supplier reliability, predicts disruptions, forecasts shipment delays and inventory stockouts, and delivers automated tactical mitigation playbooks.

---

## 1. System Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide icons, Motion, jsPDF
- **Backend:** Node.js Express server (`server.ts`) with Vite dev middleware
- **AI Engine:** Google GenAI SDK (`@google/genai`) powered by `gemini-3.8-flash` for contextual risk mitigation and executive briefings
- **Machine Learning Inference:**
  - **Supplier Risk Classification:** Gradient Boosted Decision Tree (LightGBM/XGBoost architecture) classifying suppliers into Low, Medium, High, or Critical risk tiers.
  - **Shipment Delay Prediction:** Dual-head XGBoost classifier (delay probability) + Huber loss regressor (predicted delay days).
  - **Inventory Stockout Hazard:** Cox Proportional Hazards & Survival Tree model estimating 7, 14, and 30-day stockout probabilities.
  - **Demand Forecasting:** Temporal Fusion Transformer (TFT) with 30-day forecast horizons and seasonality embeddings.
- **Explainability:** TreeSHAP-calibrated feature attribution decomposing scores into positive/negative drivers.

---

## 2. Core Modules

1. **Executive Overview Dashboard (`OverviewTab.tsx`):**
   - Global Supply Chain Risk Index (0-100)
   - Real-time vs Simulated data feed toggle
   - Interactive World Logistics & Chokepoint Map (Suez Canal, Panama Canal, Strait of Malacca, Bab-el-Mandeb, San Pedro Bay, Rotterdam)
   - Live Disruption Alert Ticker with acknowledgment workflows
   - Risk Classification Matrix

2. **Supplier Risk Intelligence (`SuppliersTab.tsx`):**
   - Multi-metric supplier evaluation: OTIF adherence %, Defect PPM, Lead time variance, Financial stability (Altman Z proxy), Geopolitical sovereign risk
   - Single-source vulnerability detection
   - Failure probability calculations and supplier ranking
   - Detailed supplier drawer with SHAP driver breakdown and 1-click AI mitigation

3. **Shipment Tracking & Delay Forecast (`ShipmentsTab.tsx`):**
   - Multimodal tracking (Ocean, Air, Rail, Road)
   - Weather hazard index and destination port congestion dwell metrics
   - Delay day estimations and chokepoints traversed
   - Reroute and expedite actions

4. **Inventory Shortage Forecasting (`InventoryTab.tsx`):**
   - Days of Supply runway calculations
   - 30-day stockout hazard probabilities
   - Statistically calibrated recommended safety stock vs current stock
   - Dynamic rebalancing suggestions

5. **ML Models, Validation & Explainability (`PredictionsTab.tsx`):**
   - Full evaluation metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC, MAE, RMSE
   - Interactive test set Confusion Matrices
   - SHAP Global Feature Importance weight charts
   - Live interactive parameter playground for real-time inference
   - Data Leakage Prevention safeguards documentation

6. **What-If Scenario Stress Simulator (`ScenariosTab.tsx`):**
   - Interactive disruption simulator: Suez/Red Sea detour, Pacific Super Typhoon, LA Port Berth Strike, and Q4 Demand Spikes
   - Baseline vs Simulated network risk comparison
   - Projected financial loss estimation and AI strategic playbooks

7. **Reports & Immutable Audit Trail (`ReportsTab.tsx`):**
   - Downloadable Executive Risk Report in PDF format (`jsPDF`)
   - CSV data exports for Suppliers, Shipments, Inventory, and Decision Logs
   - Complete decision tracking with before/after risk scores

---

## 3. API Endpoints

- `GET /api/health` - Server health check
- `GET /api/data` - Fetches suppliers, shipments, inventory, alerts, and chokepoints
- `GET /api/models/metrics` - Model evaluation metrics and leakage prevention specs
- `POST /api/predict/risk` - Live ML inference calculation for custom inputs
- `POST /api/ai/recommend` - Gemini 3.8 Flash contextual tactical mitigation generator
- `POST /api/ai/executive-summary` - C-Suite executive risk summary generation
- `POST /api/scenarios/simulate` - Runs What-If stress test matrix
- `POST /api/data/ingest` - CSV batch ingestion with automatic ML scoring
- `POST /api/decisions` - Records authorized mitigation actions to the audit log
- `POST /api/alerts/:id/acknowledge` - Acknowledges disruption alerts

---

## 4. Local Execution & Testing

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the full-stack server (runs Express + Vite dev server on port 3000):
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   npm start
   ```
4. Run tests and linting:
   ```bash
   npm run lint
   ```
