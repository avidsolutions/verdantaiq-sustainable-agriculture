

import { NextRequest, NextResponse } from 'next/server';

// Mock training jobs data
const mockTrainingJobs = [
  {
    id: 'job_001',
    modelId: 'model_001',
    modelName: 'Tomato Yield Predictor',
    status: 'running',
    progress: 67,
    startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    dataSize: 15420,
    epochs: 50,
    currentEpoch: 34,
    metrics: {
      loss: 0.0245,
      accuracy: 87.5,
      valLoss: 0.0312,
      valAccuracy: 85.2
    }
  },
  {
    id: 'job_002',
    modelId: 'model_003',
    modelName: 'Soil Analysis Optimizer',
    status: 'queued',
    progress: 0,
    startTime: new Date(),
    dataSize: 5240,
    epochs: 30,
    currentEpoch: 0
  },
  {
    id: 'job_003',
    modelId: 'model_002',
    modelName: 'Pest Detection Classifier',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    dataSize: 8950,
    epochs: 40,
    currentEpoch: 40,
    metrics: {
      loss: 0.0156,
      accuracy: 93.1,
      valLoss: 0.0189,
      valAccuracy: 91.7
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const modelId = url.searchParams.get('modelId');
    
    let filteredJobs = mockTrainingJobs;
    
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }
    
    if (modelId) {
      filteredJobs = filteredJobs.filter(job => job.modelId === modelId);
    }

    // Sort by start time (most recent first)
    filteredJobs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return NextResponse.json({
      success: true,
      data: filteredJobs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching training jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch training jobs',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, modelName, trainingConfig } = body;

    if (!modelId || !modelName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: modelId, modelName',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Create new training job
    const newJob = {
      id: `job_${Date.now()}`,
      modelId,
      modelName,
      status: 'queued',
      progress: 0,
      startTime: new Date(),
      dataSize: trainingConfig?.dataSize || Math.floor(Math.random() * 15000) + 5000,
      epochs: trainingConfig?.epochs || 50,
      currentEpoch: 0
    };

    return NextResponse.json({
      success: true,
      data: newJob,
      message: 'Training job created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating training job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create training job',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
