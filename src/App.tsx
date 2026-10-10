/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { SuppliersTab } from './components/SuppliersTab';
import { ShipmentsTab } from './components/ShipmentsTab';
import { InventoryTab } from './components/InventoryTab';
import { PredictionsTab } from './components/PredictionsTab';
import { ScenariosTab } from './components/ScenariosTab';
import { ReportsTab } from './components/ReportsTab';
import { AiMitigationModal } from './components/AiMitigationModal';
import { DataIngestionModal } from './components/DataIngestionModal';
import { ExecutiveBriefingModal } from './components/ExecutiveBriefingModal';
import {
  INITIAL_SUPPLIERS,
  INITIAL_SHIPMENTS,
  INITIAL_INVENTORY,
  INITIAL_ALERTS
} from './mock/supplyChainData';
import { Supplier, Shipment, InventoryItem, DisruptionAlert, MitigationDecision } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLiveFeed, setIsLiveFeed] = useState(true);

  // Core Data States
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [alerts, setAlerts] = useState<DisruptionAlert[]>(INITIAL_ALERTS);
  const [auditLog, setAuditLog] = useState<MitigationDecision[]>([
    {
      id: 'LOG-001',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      recommendationId: 'REC-1',
      entityName: 'Shenzhen Precision Lithium Systems',
      actionTaken: 'Initiated dual-sourcing procurement with Monterrey Mechatronics (+25% initial volume)',
      decisionMaker: 'VP Supply Chain',
      status: 'Applied',
      predictedRiskBefore: 86,
      predictedRiskAfter: 64
    },
    {
      id: 'LOG-002',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      recommendationId: 'REC-2',
      entityName: 'OC-CN-NL-33291 (Maersk Cape Reroute)',
      actionTaken: 'Expedited 15% critical buffer inventory via Frankfurt Air Freight corridor',
      decisionMaker: 'Global Logistics Director',
      status: 'Applied',
      predictedRiskBefore: 94,
      predictedRiskAfter: 72
    }
  ]);

  // Modals
  const [isMitigationOpen, setIsMitigationOpen] = useState(false);
  const [mitigationEntity, setMitigationEntity] = useState<{ type: 'Supplier' | 'Shipment' | 'Inventory'; data: any }>({
    type: 'Supplier',
    data: null
  });
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);

  // Fetch live state from backend on mount
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.shipments) setShipments(data.shipments);
        if (data.inventory) setInventory(data.inventory);
        if (data.alerts) setAlerts(data.alerts);
        if (data.auditLog) setAuditLog(data.auditLog);
      }
    } catch (err) {
      console.warn('API data fetch failed, using memory state:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute overall global network risk score
  const overallRiskScore = Math.round(
    suppliers.reduce((sum, s) => sum + s.overallRiskScore, 0) / (suppliers.length || 1)
  );

  const criticalSuppliersCount = suppliers.filter(s => s.riskLevel === 'Critical' || s.riskLevel === 'High').length;
  const delayedShipmentsCount = shipments.filter(s => s.predictedDelayDays > 2).length;
  const criticalInventoryCount = inventory.filter(i => i.stockStatus === 'Critical Shortage').length;

  // Actions
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
    } catch (err) {
      console.warn(err);
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const handleResetData = async () => {
    try {
      await fetch('/api/data/reset', { method: 'POST' });
    } catch (err) {
      console.warn(err);
    }
    setSuppliers(INITIAL_SUPPLIERS);
    setShipments(INITIAL_SHIPMENTS);
    setInventory(INITIAL_INVENTORY);
    setAlerts(INITIAL_ALERTS);
  };

  const handleCommitAction = async (actionData: {
    entityName: string;
    actionTaken: string;
    decisionMaker: string;
    predictedRiskBefore: number;
    predictedRiskAfter: number;
  }) => {
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      if (res.ok) {
        const json = await res.json();
        setAuditLog(prev => [json.entry, ...prev]);
      }
    } catch (err) {
      console.warn(err);
    }

    // Apply immediate local relief to the entity
    if (mitigationEntity.type === 'Supplier') {
      setSuppliers(prev => prev.map(s => {
        if (s.name === actionData.entityName) {
          const newScore = actionData.predictedRiskAfter;
          return {
            ...s,
            overallRiskScore: newScore,
            riskLevel: newScore >= 75 ? 'Critical' : newScore >= 55 ? 'High' : newScore >= 35 ? 'Medium' : 'Low',
            failureProbability: Math.max(0.05, s.failureProbability - 0.15)
          };
        }
        return s;
      }));
    } else if (mitigationEntity.type === 'Shipment') {
      setShipments(prev => prev.map(shp => {
        if (shp.trackingNumber === actionData.entityName) {
          return {
            ...shp,
            riskScore: actionData.predictedRiskAfter,
            predictedDelayDays: Math.max(0.5, shp.predictedDelayDays - 3.5),
            currentStatus: 'On Schedule'
          };
        }
        return shp;
      }));
    } else if (mitigationEntity.type === 'Inventory') {
      setInventory(prev => prev.map(item => {
        if (item.productName === actionData.entityName || item.sku === actionData.entityName) {
          return {
            ...item,
            stockStatus: 'Healthy',
            stockoutProbability30d: 0.12,
            currentStock: item.recommendedSafetyStock
          };
        }
        return item;
      }));
    }
  };

  const openMitigationModal = (type: 'Supplier' | 'Shipment' | 'Inventory', data: any) => {
    setMitigationEntity({ type, data });
    setIsMitigationOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        overallScore={overallRiskScore}
        isLiveFeed={isLiveFeed}
        onToggleLiveFeed={() => setIsLiveFeed(!isLiveFeed)}
        alerts={alerts}
        onOpenIngest={() => setIsIngestOpen(true)}
        onOpenReportModal={() => setActiveTab('reports')}
        onResetData={handleResetData}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onRequestBriefing={() => setIsBriefingOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          criticalSuppliersCount={criticalSuppliersCount}
          delayedShipmentsCount={delayedShipmentsCount}
          criticalInventoryCount={criticalInventoryCount}
        />

        {/* Center Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950/60">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewTab
                suppliers={suppliers}
                shipments={shipments}
                inventory={inventory}
                alerts={alerts}
                overallScore={overallRiskScore}
                isLiveFeed={isLiveFeed}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectSupplierForMitigation={(sup) => openMitigationModal('Supplier', sup)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onRequestBriefing={() => setIsBriefingOpen(true)}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersTab
                suppliers={suppliers}
                onSelectSupplierForMitigation={(sup) => openMitigationModal('Supplier', sup)}
              />
            )}

            {activeTab === 'shipments' && (
              <ShipmentsTab
                shipments={shipments}
                onSelectShipmentForMitigation={(shp) => openMitigationModal('Shipment', shp)}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryTab
                inventory={inventory}
                onSelectInventoryForMitigation={(item) => openMitigationModal('Inventory', item)}
              />
            )}

            {activeTab === 'predictions' && (
              <PredictionsTab />
            )}

            {activeTab === 'scenarios' && (
              <ScenariosTab
                suppliers={suppliers}
                shipments={shipments}
                inventory={inventory}
                onCommitDecision={handleCommitAction}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab
                suppliers={suppliers}
                shipments={shipments}
                inventory={inventory}
                auditLog={auditLog}
                overallScore={overallRiskScore}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AiMitigationModal
        isOpen={isMitigationOpen}
        onClose={() => setIsMitigationOpen(false)}
        entityType={mitigationEntity.type}
        entityData={mitigationEntity.data}
        onCommitAction={handleCommitAction}
      />

      <DataIngestionModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onDataIngested={fetchData}
      />

      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        overallScore={overallRiskScore}
        highRiskCount={criticalSuppliersCount}
        delayedShipmentsCount={delayedShipmentsCount}
        criticalInventoryCount={criticalInventoryCount}
      />
    </div>
  );
}
