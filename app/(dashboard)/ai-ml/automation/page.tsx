

'use client';

import { AIDecisionEngine } from '@/components/ai-ml/ai-decision-engine';

export default function AIAutomationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">AI Decision Engine</h2>
        <p className="text-muted-foreground">
          Autonomous decision-making and automated responses for agricultural operations
        </p>
      </div>
      
      <AIDecisionEngine />
    </div>
  );
}
