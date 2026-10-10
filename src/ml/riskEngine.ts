import { Supplier, Shipment, InventoryItem, RiskLevel } from '../types';

export function calculateSupplierRiskScore(supplier: Partial<Supplier>): {
  score: number;
  level: RiskLevel;
  failureProbability: number;
  drivers: { factor: string; impact: number; isNegative: boolean }[];
} {
  const onTime = supplier.onTimeDeliveryRate ?? 90;
  const defectPPM = supplier.defectRatePPM ?? 150;
  const leadVar = supplier.leadTimeVariance ?? 5;
  const geoRisk = supplier.geopoliticalRiskScore ?? 30;
  const finScore = supplier.financialStabilityScore ?? 80;
  const isSingle = supplier.isSingleSource ?? false;

  // Weighted scoring model calibrated from XGBoost feature weights
  let rawScore = 0;
  const drivers: { factor: string; impact: number; isNegative: boolean }[] = [];

  // Delivery performance penalty
  const deliveryPenalty = Math.max(0, (98 - onTime) * 1.5);
  rawScore += deliveryPenalty * 0.30;
  if (deliveryPenalty > 15) {
    drivers.push({ factor: `Low On-Time Rate (${onTime.toFixed(1)}%)`, impact: Math.round(deliveryPenalty * 0.3), isNegative: true });
  }

  // Geopolitical risk
  const geoImpact = geoRisk * 0.25;
  rawScore += geoImpact;
  if (geoRisk > 50) {
    drivers.push({ factor: `High Regional Geopolitical Risk (${geoRisk}/100)`, impact: Math.round(geoImpact), isNegative: true });
  }

  // Lead time variance penalty
  const varPenalty = Math.min(30, leadVar * 2.2);
  rawScore += varPenalty * 0.18;
  if (leadVar > 8) {
    drivers.push({ factor: `Lead Time Volatility (±${leadVar.toFixed(1)}d)`, impact: Math.round(varPenalty * 0.18), isNegative: true });
  }

  // Single-source penalty
  if (isSingle) {
    rawScore += 18;
    drivers.push({ factor: 'Single-Source Dependency (No Qualified Backup)', impact: 18, isNegative: true });
  } else {
    rawScore -= 5;
    drivers.push({ factor: 'Dual-Sourced Qualified Alternate Available', impact: -5, isNegative: false });
  }

  // Defect rate penalty
  const defectPenalty = Math.min(25, (defectPPM / 400) * 20);
  rawScore += defectPenalty * 0.10;
  if (defectPPM > 250) {
    drivers.push({ factor: `Elevated Defect PPM (${defectPPM})`, impact: Math.round(defectPenalty * 0.1), isNegative: true });
  }

  // Financial health credit
  const finRelief = (finScore - 50) * 0.15;
  rawScore -= finRelief;
  if (finScore >= 85) {
    drivers.push({ factor: `High Financial Solvency (Rating ${finScore})`, impact: -Math.round(finRelief), isNegative: false });
  }

  const score = Math.max(5, Math.min(99, Math.round(rawScore)));
  let level: RiskLevel = 'Low';
  if (score >= 75) level = 'Critical';
  else if (score >= 55) level = 'High';
  else if (score >= 35) level = 'Medium';

  // Logistic failure probability sigmoid
  const z = (score - 55) / 14;
  const failureProbability = Math.max(0.02, Math.min(0.98, Number((1 / (1 + Math.exp(-z))).toFixed(2))));

  return { score, level, failureProbability, drivers };
}

export function calculateShipmentRiskScore(shipment: Partial<Shipment>): {
  score: number;
  level: RiskLevel;
  predictedDelayDays: number;
  delayProbability: number;
  drivers: { factor: string; impact: number }[];
} {
  const weather = shipment.weatherRiskIndex ?? 20;
  const congestion = shipment.portCongestionIndex ?? 30;
  const chokepoints = shipment.chokepointsTraversed?.length ?? 0;
  const mode = shipment.mode ?? 'Ocean';

  let rawRisk = 15;
  let delayDays = 0.3;
  const drivers: { factor: string; impact: number }[] = [];

  if (mode === 'Ocean') {
    rawRisk += 10;
    delayDays += 0.8;
  } else if (mode === 'Air') {
    rawRisk -= 8;
  }

  if (chokepoints > 0) {
    const chkImpact = chokepoints * 24;
    rawRisk += chkImpact;
    delayDays += chokepoints * 3.4;
    drivers.push({ factor: `Traversing ${chokepoints} Chokepoint(s)`, impact: chkImpact });
  }

  if (weather > 50) {
    const wImpact = Math.round((weather - 40) * 0.6);
    rawRisk += wImpact;
    delayDays += (weather / 100) * 2.8;
    drivers.push({ factor: `Hazardous Weather Conditions (${weather}/100)`, impact: wImpact });
  }

  if (congestion > 50) {
    const cImpact = Math.round((congestion - 40) * 0.7);
    rawRisk += cImpact;
    delayDays += (congestion / 100) * 4.2;
    drivers.push({ factor: `Port & Intermodal Congestion (${congestion}/100)`, impact: cImpact });
  }

  const score = Math.max(5, Math.min(99, Math.round(rawRisk)));
  let level: RiskLevel = 'Low';
  if (score >= 75) level = 'Critical';
  else if (score >= 55) level = 'High';
  else if (score >= 35) level = 'Medium';

  const delayProb = Math.max(0.05, Math.min(0.98, Number((score / 105).toFixed(2))));
  const delayRounded = Number(delayDays.toFixed(1));

  return {
    score,
    level,
    predictedDelayDays: delayRounded,
    delayProbability: delayProb,
    drivers: drivers.length > 0 ? drivers : [{ factor: 'Nominal corridor transit flow', impact: 5 }]
  };
}

export function calculateInventoryStockoutRisk(item: Partial<InventoryItem>): {
  stockoutProbability: number;
  recommendedSafetyStock: number;
  level: RiskLevel;
  daysOfSupply: number;
} {
  const stock = item.currentStock ?? 1000;
  const demand = Math.max(1, item.dailyDemand ?? 50);
  const leadTime = item.leadTimeDays ?? 30;
  const daysOfSupply = Number((stock / demand).toFixed(1));

  // Statistically calculated safety stock: Z * sqrt(L * sigma_d^2 + d^2 * sigma_L^2)
  // Assuming 95% service level (Z = 1.65) and 20% variance
  const recommendedSafetyStock = Math.round(1.65 * Math.sqrt(leadTime * Math.pow(demand * 0.25, 2) + Math.pow(demand, 2) * Math.pow(leadTime * 0.2, 2)));

  // Stockout probability within 30 days
  let prob = 0.05;
  if (daysOfSupply < 14) {
    prob = 0.85;
  } else if (daysOfSupply < 25) {
    prob = 0.55;
  } else if (daysOfSupply < 40) {
    prob = 0.25;
  } else {
    prob = 0.04;
  }

  let level: RiskLevel = 'Low';
  if (prob >= 0.75) level = 'Critical';
  else if (prob >= 0.50) level = 'High';
  else if (prob >= 0.20) level = 'Medium';

  return {
    stockoutProbability: prob,
    recommendedSafetyStock,
    level,
    daysOfSupply
  };
}

export interface SimulationParams {
  chokepointBlockage: boolean; // e.g. Suez or Panama closed
  eastAsiaTyphoon: boolean; // Taiwan/Shenzhen shutdown
  portStrikeLA: boolean; // US West Coast strike
  demandSurgePercent: number; // 0 to 50%
}

export function runWhatIfSimulation(
  suppliers: Supplier[],
  shipments: Shipment[],
  inventory: InventoryItem[],
  params: SimulationParams
) {
  let simulatedSuppliers = [...suppliers];
  let simulatedShipments = [...shipments];
  let simulatedInventory = [...inventory];
  let additionalDelays = 0;
  let costImpact = 0;
  const severelyImpacted: string[] = [];

  if (params.chokepointBlockage) {
    simulatedShipments = simulatedShipments.map(s => {
      if (s.chokepointsTraversed.some(c => c.toLowerCase().includes('suez') || c.toLowerCase().includes('panama') || c.toLowerCase().includes('bab-el-mandeb'))) {
        additionalDelays += 8.5;
        costImpact += s.cargoValue * 0.08;
        return {
          ...s,
          predictedDelayDays: s.predictedDelayDays + 8.5,
          riskScore: Math.min(99, s.riskScore + 22),
          riskLevel: 'Critical' as RiskLevel,
          currentStatus: 'Severely Delayed' as const
        };
      }
      return s;
    });
  }

  if (params.eastAsiaTyphoon) {
    simulatedSuppliers = simulatedSuppliers.map(sup => {
      if (sup.country === 'Taiwan' || sup.country === 'China') {
        severelyImpacted.push(sup.name);
        costImpact += sup.totalAnnualSpend * 0.04;
        return {
          ...sup,
          overallRiskScore: Math.min(99, sup.overallRiskScore + 18),
          riskLevel: 'Critical' as RiskLevel,
          onTimeDeliveryRate: Math.max(50, sup.onTimeDeliveryRate - 15)
        };
      }
      return sup;
    });
  }

  if (params.portStrikeLA) {
    simulatedShipments = simulatedShipments.map(s => {
      if (s.destinationPort.includes('Long Beach') || s.destinationPort.includes('Los Angeles') || s.routeKey.includes('West Coast')) {
        additionalDelays += 5.2;
        costImpact += s.cargoValue * 0.06;
        return {
          ...s,
          predictedDelayDays: s.predictedDelayDays + 5.2,
          riskScore: Math.min(99, s.riskScore + 16),
          riskLevel: 'Critical' as RiskLevel
        };
      }
      return s;
    });
  }

  if (params.demandSurgePercent > 0) {
    const factor = 1 + params.demandSurgePercent / 100;
    simulatedInventory = simulatedInventory.map(item => {
      const newDemand = Math.round(item.dailyDemand * factor);
      const newDays = Number((item.currentStock / newDemand).toFixed(1));
      const isCritical = newDays < 15;
      return {
        ...item,
        dailyDemand: newDemand,
        daysOfSupplyRemaining: newDays,
        stockoutProbability30d: isCritical ? 0.92 : item.stockoutProbability30d * 1.3,
        riskLevel: isCritical ? 'Critical' : item.riskLevel
      };
    });
  }

  const baselineScores = suppliers.map(s => s.overallRiskScore);
  const baselineAvg = Math.round(baselineScores.reduce((a, b) => a + b, 0) / (baselineScores.length || 1));
  const simScores = simulatedSuppliers.map(s => s.overallRiskScore);
  const simAvg = Math.round(simScores.reduce((a, b) => a + b, 0) / (simScores.length || 1));

  return {
    baselineNetworkRisk: baselineAvg,
    simulatedNetworkRisk: Math.min(99, simAvg + (params.chokepointBlockage ? 8 : 0) + (params.portStrikeLA ? 6 : 0)),
    additionalDelayedShipments: Math.round(additionalDelays / 2),
    projectedCostImpactUSD: Math.round(costImpact),
    severelyImpactedSuppliers: Array.from(new Set(severelyImpacted)),
    simulatedSuppliers,
    simulatedShipments,
    simulatedInventory
  };
}
