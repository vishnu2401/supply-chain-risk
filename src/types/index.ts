export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type TransportMode = 'Ocean' | 'Air' | 'Rail' | 'Road';

export interface Supplier {
  id: string;
  name: string;
  country: string;
  region: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  category: 'Semiconductors' | 'Raw Materials' | 'Batteries & Energy' | 'Electronics & Displays' | 'Mechanical Parts' | 'Packaging';
  onTimeDeliveryRate: number; // percentage (0-100)
  defectRatePPM: number; // parts per million
  leadTimeDays: number;
  leadTimeVariance: number;
  financialStabilityScore: number; // 0-100 (Altman Z proxy)
  geopoliticalRiskScore: number; // 0-100
  esgScore: number; // 0-100
  isSingleSource: boolean;
  activeContractsCount: number;
  totalAnnualSpend: number; // USD
  overallRiskScore: number; // 0-100
  riskLevel: RiskLevel;
  failureProbability: number; // 0-1
  rank: number;
  primaryComponents: string[];
  lastAuditDate: string;
  status: 'Active' | 'Under Review' | 'Contingency Active';
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  originPort: string;
  originCountry: string;
  destinationPort: string;
  destinationCountry: string;
  supplierId: string;
  supplierName: string;
  cargoDescription: string;
  cargoValue: number; // USD
  mode: TransportMode;
  carrier: string;
  departureDate: string;
  estimatedArrivalDate: string;
  predictedDelayDays: number;
  delayProbability: number; // 0-1
  currentStatus: 'On Schedule' | 'Minor Delay' | 'Severely Delayed' | 'At Chokepoint' | 'Customs Hold';
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  routeKey: string;
  chokepointsTraversed: string[];
  weatherRiskIndex: number; // 0-100
  portCongestionIndex: number; // 0-100
  keyRiskDrivers: { factor: string; impact: number }[];
}

export interface InventoryItem {
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  safetyStock: number;
  reorderPoint: number;
  dailyDemand: number;
  unitCost: number;
  leadTimeDays: number;
  supplierId: string;
  supplierName: string;
  daysOfSupplyRemaining: number;
  stockoutProbability30d: number; // 0-1
  riskLevel: RiskLevel;
  stockStatus: 'Healthy' | 'Warning' | 'Critical Shortage' | 'Overstocked';
  recommendedSafetyStock: number;
  forecastDemand30d: number[];
}

export interface DisruptionAlert {
  id: string;
  title: string;
  category: 'Geopolitical' | 'Weather' | 'Port Congestion' | 'Labor Strike' | 'Raw Material Spike';
  region: string;
  chokepoint?: string;
  severity: RiskLevel;
  impactScore: number; // 0-100
  timestamp: string;
  isLive: boolean; // true = Live feed, false = Simulated/Scenario
  description: string;
  affectedSuppliersCount: number;
  affectedShipmentsCount: number;
  estimatedFinancialImpact: number; // USD
  acknowledged: boolean;
}

export interface ModelMetrics {
  modelName: string;
  targetTask: string;
  algorithm: string;
  trainSamples: number;
  testSamples: number;
  accuracy?: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc?: number;
  mae?: number;
  rmse?: number;
  confusionMatrix?: {
    labels: string[];
    matrix: number[][];
  };
  featureImportance: { feature: string; weight: number; description: string }[];
}

export interface AIRecommendation {
  id: string;
  entityType: 'Supplier' | 'Shipment' | 'Inventory' | 'Network';
  entityId: string;
  entityName: string;
  severity: RiskLevel;
  summary: string;
  rootCauses: string[];
  primaryMitigation: string;
  secondaryMitigation: string;
  potentialCostUSD: number;
  riskReductionScore: number;
  confidence: number;
  generatedByAI: boolean;
}

export interface MitigationDecision {
  id: string;
  timestamp: string;
  recommendationId: string;
  entityName: string;
  actionTaken: string;
  decisionMaker: string;
  status: 'Applied' | 'In Progress' | 'Reviewed';
  predictedRiskBefore: number;
  predictedRiskAfter: number;
}

export interface ScenarioSimulationResult {
  scenarioName: string;
  description: string;
  baselineNetworkRisk: number;
  simulatedNetworkRisk: number;
  additionalDelayedShipments: number;
  projectedCostImpactUSD: number;
  severelyImpactedSuppliers: string[];
  aiActionBrief: string;
}
