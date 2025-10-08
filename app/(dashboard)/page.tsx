
'use client';

import React, { useState, useEffect } from 'react';
import { MainDashboard } from '@/components/dashboard/main-dashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  VermicultureSystem, 
  AlertNotification, 
  AIInsight, 
  WorkflowExecution 
} from '@/types/agricultural';
import { 
  mockSystems, 
  mockAlerts, 
  mockAIInsights, 
  mockWorkflowExecutions 
} from '@/lib/data/mock-data';

export default function DashboardPage() {
  const [systems, setSystems] = useState<VermicultureSystem[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch systems data
      const systemsResponse = await fetch('/api/agricultural/systems');
      const systemsResult = await systemsResponse.json();
      
      if (systemsResult.success) {
        setSystems(systemsResult.data || mockSystems);
      } else {
        setSystems(mockSystems);
      }

      // Use mock data for alerts, insights, and workflows
      setAlerts(mockAlerts);
      setAiInsights(mockAIInsights);
      setWorkflows(mockWorkflowExecutions);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to mock data
      setSystems(mockSystems);
      setAlerts(mockAlerts);
      setAiInsights(mockAIInsights);
      setWorkflows(mockWorkflowExecutions);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <MainDashboard
        systems={systems}
        alerts={alerts}
        aiInsights={aiInsights}
        workflows={workflows}
      />
    </div>
  );
}
