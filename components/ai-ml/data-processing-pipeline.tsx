

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Filter, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface DataPipeline {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'scheduled';
  progress: number;
  dataSource: string;
  targetModel: string;
  recordsProcessed: number;
  totalRecords: number;
  lastRun: Date;
  nextRun?: Date;
  processingTime: number; // in seconds
  errorCount: number;
  stages: PipelineStage[];
}

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  progress: number;
  duration?: number;
  error?: string;
}

interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  totalRecords: number;
  qualityScore: number;
}

export function DataProcessingPipeline() {
  const [pipelines, setPipelines] = useState<DataPipeline[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetrics | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<DataPipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPipelines();
    loadQualityMetrics();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      loadPipelines();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPipelines = async () => {
    try {
      // Mock data - in real implementation, this would fetch from API
      const mockPipelines: DataPipeline[] = [
        {
          id: 'pipeline_001',
          name: 'Environmental Data Preprocessing',
          description: 'Clean and prepare environmental sensor data for yield prediction models',
          status: 'running',
          progress: 67,
          dataSource: 'IoT Sensors',
          targetModel: 'Tomato Yield Predictor',
          recordsProcessed: 15420,
          totalRecords: 23000,
          lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          nextRun: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          processingTime: 1800, // 30 minutes
          errorCount: 12,
          stages: [
            {
              id: 'stage_001',
              name: 'Data Ingestion',
              description: 'Import data from IoT sensors and weather stations',
              status: 'completed',
              progress: 100,
              duration: 300
            },
            {
              id: 'stage_002',
              name: 'Data Cleaning',
              description: 'Remove outliers and handle missing values',
              status: 'running',
              progress: 67,
              duration: 600
            },
            {
              id: 'stage_003',
              name: 'Feature Engineering',
              description: 'Create derived features and normalize data',
              status: 'scheduled',
              progress: 0
            },
            {
              id: 'stage_004',
              name: 'Data Validation',
              description: 'Validate data quality and schema compliance',
              status: 'scheduled',
              progress: 0
            }
          ]
        },
        {
          id: 'pipeline_002',
          name: 'Image Data Processing',
          description: 'Process plant images for pest detection and health monitoring',
          status: 'completed',
          progress: 100,
          dataSource: 'Camera Systems',
          targetModel: 'Pest Detection Classifier',
          recordsProcessed: 8950,
          totalRecords: 8950,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          processingTime: 3600, // 1 hour
          errorCount: 3,
          stages: [
            {
              id: 'stage_005',
              name: 'Image Collection',
              description: 'Gather images from greenhouse cameras',
              status: 'completed',
              progress: 100,
              duration: 600
            },
            {
              id: 'stage_006',
              name: 'Image Preprocessing',
              description: 'Resize, normalize, and augment images',
              status: 'completed',
              progress: 100,
              duration: 1800
            },
            {
              id: 'stage_007',
              name: 'Annotation Validation',
              description: 'Verify image labels and annotations',
              status: 'completed',
              progress: 100,
              duration: 1200
            }
          ]
        },
        {
          id: 'pipeline_003',
          name: 'Market Data Integration',
          description: 'Aggregate and process market pricing data for optimization models',
          status: 'scheduled',
          progress: 0,
          dataSource: 'Market APIs',
          targetModel: 'Market Analysis AI',
          recordsProcessed: 0,
          totalRecords: 5000,
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
          processingTime: 900, // 15 minutes
          errorCount: 0,
          stages: [
            {
              id: 'stage_008',
              name: 'API Data Fetch',
              description: 'Collect pricing data from various market sources',
              status: 'scheduled',
              progress: 0
            },
            {
              id: 'stage_009',
              name: 'Data Standardization',
              description: 'Normalize data formats and units',
              status: 'scheduled',
              progress: 0
            },
            {
              id: 'stage_010',
              name: 'Trend Analysis',
              description: 'Calculate moving averages and trend indicators',
              status: 'scheduled',
              progress: 0
            }
          ]
        }
      ];

      setPipelines(mockPipelines);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load pipelines:', error);
      setIsLoading(false);
    }
  };

  const loadQualityMetrics = async () => {
    try {
      const mockMetrics: DataQualityMetrics = {
        completeness: 94.2,
        accuracy: 87.8,
        consistency: 91.5,
        timeliness: 96.3,
        validity: 89.7,
        totalRecords: 47370,
        qualityScore: 91.9
      };
      
      setQualityMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load quality metrics:', error);
    }
  };

  const controlPipeline = async (pipelineId: string, action: 'start' | 'pause' | 'restart') => {
    try {
      // Mock API call
      console.log(`${action} pipeline ${pipelineId}`);
      
      // Update pipeline status locally
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.id === pipelineId) {
          let newStatus = pipeline.status;
          if (action === 'start') newStatus = 'running';
          else if (action === 'pause') newStatus = 'paused';
          else if (action === 'restart') newStatus = 'running';
          
          return { ...pipeline, status: newStatus };
        }
        return pipeline;
      }));
    } catch (error) {
      console.error(`Failed to ${action} pipeline:`, error);
    }
  };

  const getStatusIcon = (status: DataPipeline['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: DataPipeline['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading data pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Processing Pipeline</h2>
          <p className="text-muted-foreground">Monitor and manage ML data preprocessing workflows</p>
        </div>
        <Badge className="bg-blue-600 text-white">
          <Database className="w-4 h-4 mr-1" />
          {pipelines.length} Pipelines
        </Badge>
      </div>

      <Tabs defaultValue="pipelines" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipelines">Active Pipelines</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pipelines.map((pipeline) => (
              <Card key={pipeline.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pipeline.status)}
                      <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pipeline.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{pipeline.progress}%</span>
                    </div>
                    <Progress value={pipeline.progress} className="w-full" />
                    <div className="text-xs text-muted-foreground">
                      {pipeline.recordsProcessed.toLocaleString()} / {pipeline.totalRecords.toLocaleString()} records
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Data Source:</span>
                      <div className="font-medium">{pipeline.dataSource}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target Model:</span>
                      <div className="font-medium">{pipeline.targetModel}</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last run: {pipeline.lastRun.toLocaleString()}
                    {pipeline.nextRun && (
                      <> • Next run: {pipeline.nextRun.toLocaleString()}</>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      {pipeline.errorCount > 0 && (
                        <span className="text-red-600">{pipeline.errorCount} errors</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {pipeline.status === 'paused' && (
                        <Button
                          size="sm"
                          onClick={() => controlPipeline(pipeline.id, 'start')}
                          className="h-6 px-2"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      {pipeline.status === 'running' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => controlPipeline(pipeline.id, 'pause')}
                          className="h-6 px-2"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => controlPipeline(pipeline.id, 'restart')}
                        className="h-6 px-2"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restart
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPipeline(pipeline)}
                        className="h-6 px-2"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {qualityMetrics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Data Quality Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-700">{qualityMetrics.qualityScore}%</div>
                      <div className="text-sm text-green-600">Overall Quality Score</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-700">{qualityMetrics.totalRecords.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">Total Records</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center lg:col-span-1 col-span-2">
                      <div className="text-3xl font-bold text-purple-700">
                        {Math.round((qualityMetrics.completeness + qualityMetrics.accuracy + qualityMetrics.consistency) / 3)}%
                      </div>
                      <div className="text-sm text-purple-600">Avg Metric Score</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Completeness', value: qualityMetrics.completeness, description: 'Percentage of non-null values' },
                      { name: 'Accuracy', value: qualityMetrics.accuracy, description: 'Data correctness and precision' },
                      { name: 'Consistency', value: qualityMetrics.consistency, description: 'Data format uniformity' },
                      { name: 'Timeliness', value: qualityMetrics.timeliness, description: 'Data freshness and currency' },
                      { name: 'Validity', value: qualityMetrics.validity, description: 'Schema and constraint compliance' }
                    ].map((metric) => (
                      <div key={metric.name}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <span className="text-sm font-bold">{metric.value}%</span>
                        </div>
                        <Progress value={metric.value} className="w-full mb-1" />
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Alert>
            <TrendingUp className="w-4 h-4" />
            <AlertDescription>
              Real-time monitoring dashboard showing pipeline performance metrics, resource utilization, and system health indicators.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Processing Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3k</div>
                <div className="text-xs text-muted-foreground">records/minute</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.02%</div>
                <div className="text-xs text-muted-foreground">15 errors in last hour</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67%</div>
                <div className="text-xs text-muted-foreground">4.2GB / 6.3GB</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pipeline Details Modal */}
      {selectedPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {selectedPipeline.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPipeline(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusColor(selectedPipeline.status)}>
                    {selectedPipeline.status}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="font-medium">{selectedPipeline.progress}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Pipeline Stages</h4>
                <div className="space-y-2">
                  {selectedPipeline.stages.map((stage, index) => (
                    <div key={stage.id} className="flex items-center gap-3 p-3 border rounded">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-sm">{stage.name}</h5>
                          <Badge variant="outline" className={getStatusColor(stage.status)}>
                            {stage.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                        {stage.progress > 0 && (
                          <Progress value={stage.progress} className="w-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Processing Time:</span>
                  <div className="font-medium">{Math.round(selectedPipeline.processingTime / 60)} minutes</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Error Count:</span>
                  <div className="font-medium">{selectedPipeline.errorCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
