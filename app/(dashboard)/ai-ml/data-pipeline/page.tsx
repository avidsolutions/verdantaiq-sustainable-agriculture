

'use client';

import { DataProcessingPipeline } from '@/components/ai-ml/data-processing-pipeline';

export default function DataPipelinePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Data Processing Pipeline</h2>
        <p className="text-muted-foreground">
          Monitor and manage ML data preprocessing workflows and quality metrics
        </p>
      </div>
      
      <DataProcessingPipeline />
    </div>
  );
}
