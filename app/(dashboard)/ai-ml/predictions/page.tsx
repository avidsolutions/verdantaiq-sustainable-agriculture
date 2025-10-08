

'use client';

import { PredictiveAnalyticsDashboard } from '@/components/ai-ml/predictive-analytics-dashboard';

export default function PredictiveAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Predictive Analytics</h2>
        <p className="text-muted-foreground">
          AI-powered predictions for yield, weather, pest risk, and market analysis
        </p>
      </div>
      
      <PredictiveAnalyticsDashboard />
    </div>
  );
}
