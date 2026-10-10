import { ModelMetrics } from '../types';

export const ML_MODELS_DATA: ModelMetrics[] = [
  {
    modelName: 'Vortex-SupplierRisk-XGB (Multi-Class Classifier)',
    targetTask: 'Supplier Reliability & Failure Classification (Low, Medium, High, Critical)',
    algorithm: 'Gradient Boosted Decision Trees (LightGBM / XGBoost architecture)',
    trainSamples: 14400,
    testSamples: 3600,
    accuracy: 0.918,
    precision: 0.912,
    recall: 0.898,
    f1Score: 0.905,
    rocAuc: 0.954,
    confusionMatrix: {
      labels: ['Low', 'Medium', 'High', 'Critical'],
      matrix: [
        [885, 24, 6, 1],     // Actual Low
        [32, 910, 48, 8],    // Actual Medium
        [9, 41, 840, 32],    // Actual High
        [2, 7, 39, 764]      // Actual Critical
      ]
    },
    featureImportance: [
      { feature: 'On-Time In-Full Delivery (OTIF %)', weight: 0.285, description: 'Historical 12-month delivery adherence vs contract SLA' },
      { feature: 'Geopolitical & Regional Risk Index', weight: 0.224, description: 'Sovereign risk, sanction exposure, trade corridor stability' },
      { feature: 'Lead Time Variance (σ days)', weight: 0.182, description: 'Standard deviation of actual vs quoted dispatch timelines' },
      { feature: 'Single-Source Dependency Flag', weight: 0.141, description: 'Absence of secondary qualified tooling or supplier alternate' },
      { feature: 'Defect Rate (PPM)', weight: 0.098, description: 'Incoming quality acceptance and RMA return frequency' },
      { feature: 'Financial Health / Altman Z-Score Proxy', weight: 0.070, description: 'Working capital ratio, supplier debt coverage, credit solvency' }
    ]
  },
  {
    modelName: 'Vortex-ShipmentDelay-XGB (Hybrid Classifier & Regressor)',
    targetTask: 'Shipment Delay Probability & Estimated Delay Days',
    algorithm: 'Dual-Head Gradient Boosting (Log-Loss for P(Delay > 2d) + Huber Regressor for Delay Days)',
    trainSamples: 28000,
    testSamples: 7000,
    accuracy: 0.901,
    precision: 0.887,
    recall: 0.913,
    f1Score: 0.900,
    rocAuc: 0.941,
    mae: 1.18,
    rmse: 1.62,
    confusionMatrix: {
      labels: ['On Schedule (≤ 2d)', 'Delayed (> 2d)'],
      matrix: [
        [4120, 340],
        [295, 2245]
      ]
    },
    featureImportance: [
      { feature: 'Maritime Chokepoint Transit Delay', weight: 0.320, description: 'Congestion and detour nautical miles across Suez/Panama/Bab-el-Mandeb' },
      { feature: 'Destination Port Anchorage Dwell Index', weight: 0.245, description: 'Real-time berth waiting queue and container yard saturation' },
      { feature: 'Extreme Weather Hazard Score', weight: 0.175, description: 'Significant wave height, typhoon trajectories, winter storm vectors' },
      { feature: 'Carrier Schedule Reliability Rate', weight: 0.140, description: 'Liner on-time reliability score for specific carrier-lane pairing' },
      { feature: 'Customs Intermodal Transfer Hops', weight: 0.080, description: 'Number of transshipment hubs and cross-border customs touchpoints' },
      { feature: 'Seasonality Peak Factor', weight: 0.040, description: 'Golden Week / Q4 holiday peak shipping surge multiplier' }
    ]
  },
  {
    modelName: 'Vortex-StockoutHazard-Cox (Survival & Risk Regressor)',
    targetTask: 'Inventory Stockout Probability within 7, 14, and 30 Days',
    algorithm: 'Survival Trees / Gradient Boosted Cox Proportional Hazard Model',
    trainSamples: 9600,
    testSamples: 2400,
    accuracy: 0.892,
    precision: 0.895,
    recall: 0.880,
    f1Score: 0.887,
    rocAuc: 0.928,
    mae: 2.14,
    rmse: 2.91,
    confusionMatrix: {
      labels: ['Stock Retained (≥0 units)', 'Stockout Event (0 units)'],
      matrix: [
        [1580, 110],
        [98, 612]
      ]
    },
    featureImportance: [
      { feature: 'Days of Supply Remaining (Current / Daily Demand)', weight: 0.360, description: 'Direct burn rate runway based on active inventory' },
      { feature: 'Supplier Lead Time Volatility', weight: 0.260, description: 'Predicted delay variance on active inbound replenishments' },
      { feature: 'Demand Volatility Coefficient of Variation (CV)', weight: 0.190, description: 'Weekly standard deviation of consumption divided by mean' },
      { feature: 'Safety Stock Buffer Margin', weight: 0.125, description: 'Current stock deficit relative to statistically required safety stock' },
      { feature: 'BOM Criticality & Replacement Multiplier', weight: 0.065, description: 'Sub-assembly dependency level across manufacturing lines' }
    ]
  },
  {
    modelName: 'Vortex-DemandForecast-NeuralTFT (Temporal Trend & Seasonality)',
    targetTask: 'Multi-Horizon SKU Consumption Forecasting (30-day forecast)',
    algorithm: 'Temporal Fusion Transformer (TFT) + Exponential Smoothing Ensemble',
    trainSamples: 32000,
    testSamples: 8000,
    accuracy: 0.952,
    precision: 0.941,
    recall: 0.938,
    f1Score: 0.939,
    mae: 14.2,
    rmse: 18.9,
    featureImportance: [
      { feature: 'Lagged 7-day & 14-day Moving Averages', weight: 0.340, description: 'Recent smoothed consumption run-rate' },
      { feature: 'Day of Week & Month Seasonality Embeddings', weight: 0.270, description: 'Cyclical shift and calendar production schedules' },
      { feature: 'Macroeconomic Purchasing Managers Index (PMI)', weight: 0.180, description: 'Global manufacturing manufacturing output indicator' },
      { feature: 'Downstream Work-In-Progress (WIP) Order Books', weight: 0.130, description: 'Confirmed production build plan requirements' },
      { feature: 'Pricing & Promotional Elasticity Factor', weight: 0.080, description: 'Cost fluctuations affecting volume purchase schedules' }
    ]
  }
];

export const DATA_LEAKAGE_PREVENTION_SPECS = [
  {
    title: 'Temporal Train-Test Split (No Future Peeking)',
    description: 'Data is strictly partitioned chronologically using a rolling 80/20 temporal split. No future weather events, carrier congestion rates, or inventory draws are visible to model training.'
  },
  {
    title: 'Isolated Feature Preprocessing & Scaling',
    description: 'Min-Max normalization parameters, categorical frequency encodings, and imputation medians are computed solely on training folds and frozen before transforming test splits.'
  },
  {
    title: 'Target Encoding Cross-Fold Isolation',
    description: 'Supplier and port historical delay rates use out-of-fold target encoding with additive Laplacian smoothing to prevent direct memorization of validation instances.'
  },
  {
    title: 'SHAP Attribution Explainability',
    description: 'TreeSHAP (Tree Explainer) calculates exact Shapley values for individual inference calls, decomposing every risk score into transparent positive and negative feature contributions.'
  }
];
