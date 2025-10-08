

'use client';

import { MLModelManager } from '@/components/ai-ml/ml-model-manager';

export default function MLModelsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">ML Model Manager</h2>
        <p className="text-muted-foreground">
          Train, deploy, and manage machine learning models for agricultural predictions
        </p>
      </div>
      
      <MLModelManager />
    </div>
  );
}
