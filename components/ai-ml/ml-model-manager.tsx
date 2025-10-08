

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'forecasting';
  purpose: 'yield_prediction' | 'pest_detection' | 'soil_analysis' | 'weather_forecast' | 'optimization';
  status: 'training' | 'ready' | 'deploying' | 'active' | 'error';
  accuracy: number;
  lastTrained: Date;
  trainingData: number; // number of data points
  version: string;
  predictions: number; // total predictions made
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  dataSize: number;
  epochs: number;
  currentEpoch?: number;
  metrics?: {
    loss: number;
    accuracy: number;
    valLoss: number;
    valAccuracy: number;
  };
}

export function MLModelManager() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    type: 'regression' as MLModel['type'],
    purpose: 'yield_prediction' as MLModel['purpose']
  });

  useEffect(() => {
    loadModels();
    loadTrainingJobs();
    
    // Poll training jobs every 5 seconds
    const interval = setInterval(() => {
      loadTrainingJobs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch('/api/ai-ml/models');
      const result = await response.json();
      if (result.success) {
        setModels(result.data);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadTrainingJobs = async () => {
    try {
      const response = await fetch('/api/ai-ml/training-jobs');
      const result = await response.json();
      if (result.success) {
        setTrainingJobs(result.data);
      }
    } catch (error) {
      console.error('Failed to load training jobs:', error);
    }
  };

  const createModel = async () => {
    if (!newModel.name.trim()) return;
    
    setIsCreatingModel(true);
    try {
      const response = await fetch('/api/ai-ml/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModel),
      });
      
      const result = await response.json();
      if (result.success) {
        await loadModels();
        setNewModel({ name: '', type: 'regression', purpose: 'yield_prediction' });
      }
    } catch (error) {
      console.error('Failed to create model:', error);
    } finally {
      setIsCreatingModel(false);
    }
  };

  const trainModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/ai-ml/models/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      });
      
      const result = await response.json();
      if (result.success) {
        await loadTrainingJobs();
      }
    } catch (error) {
      console.error('Failed to start training:', error);
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/ai-ml/models/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      });
      
      const result = await response.json();
      if (result.success) {
        await loadModels();
      }
    } catch (error) {
      console.error('Failed to deploy model:', error);
    }
  };

  const getStatusIcon = (status: MLModel['status']) => {
    switch (status) {
      case 'training':
        return <Activity className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'active':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'deploying':
        return <Settings className="w-4 h-4 text-purple-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: MLModel['status']) => {
    switch (status) {
      case 'training':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ready':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'deploying':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatModelType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatModelPurpose = (purpose: string) => {
    return purpose.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ML Model Manager</h2>
          <p className="text-muted-foreground">Train and deploy machine learning models for agricultural intelligence</p>
        </div>
        <Badge className="bg-blue-600 text-white">
          <Brain className="w-4 h-4 mr-1" />
          {models.length} Models
        </Badge>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training Jobs</TabsTrigger>
          <TabsTrigger value="create">Create Model</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {models.map((model) => (
              <Card key={model.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(model.status)}
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {formatModelType(model.type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatModelPurpose(model.purpose)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <div className="font-medium text-lg">{model.accuracy}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Predictions:</span>
                      <div className="font-medium text-lg">{model.predictions.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Performance Metrics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="block">Precision</span>
                        <span className="font-medium">{model.performance.precision}%</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="block">Recall</span>
                        <span className="font-medium">{model.performance.recall}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {model.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => deployModel(model.id)}
                        className="flex-1"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Deploy
                      </Button>
                    )}
                    {model.status !== 'training' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => trainModel(model.id)}
                        className="flex-1"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Retrain
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedModel(model)}
                    >
                      Details
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                    <br />
                    Version: {model.version} • {model.trainingData.toLocaleString()} data points
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {models.length === 0 && (
            <Alert>
              <Brain className="w-4 h-4" />
              <AlertDescription>
                No models found. Create your first ML model to get started with predictive agriculture.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="space-y-4">
            {trainingJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${job.status === 'running' ? 'animate-pulse text-blue-600' : 'text-gray-600'}`} />
                      {job.modelName}
                    </CardTitle>
                    <Badge className={job.status === 'running' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <div className="font-medium">{job.progress}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Size:</span>
                      <div className="font-medium">{job.dataSize.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Epochs:</span>
                      <div className="font-medium">
                        {job.currentEpoch ? `${job.currentEpoch}/` : ''}{job.epochs}
                      </div>
                    </div>
                  </div>

                  <Progress value={job.progress} className="w-full" />

                  {job.metrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-green-50 rounded">
                        <span className="block text-muted-foreground">Accuracy</span>
                        <span className="font-medium text-green-700">{job.metrics.accuracy}%</span>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <span className="block text-muted-foreground">Loss</span>
                        <span className="font-medium text-blue-700">{job.metrics.loss.toFixed(4)}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Started: {new Date(job.startTime).toLocaleString()}
                    {job.endTime && (
                      <> • Completed: {new Date(job.endTime).toLocaleString()}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {trainingJobs.length === 0 && (
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                No training jobs in progress. Start training a model to see job progress here.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New ML Model</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define a new machine learning model for agricultural predictions
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Model Name</label>
                <Input
                  value={newModel.name}
                  onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Tomato Yield Predictor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Model Type</label>
                  <select
                    value={newModel.type}
                    onChange={(e) => setNewModel(prev => ({ ...prev, type: e.target.value as MLModel['type'] }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="regression">Regression</option>
                    <option value="classification">Classification</option>
                    <option value="clustering">Clustering</option>
                    <option value="forecasting">Forecasting</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Purpose</label>
                  <select
                    value={newModel.purpose}
                    onChange={(e) => setNewModel(prev => ({ ...prev, purpose: e.target.value as MLModel['purpose'] }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="yield_prediction">Yield Prediction</option>
                    <option value="pest_detection">Pest Detection</option>
                    <option value="soil_analysis">Soil Analysis</option>
                    <option value="weather_forecast">Weather Forecast</option>
                    <option value="optimization">Resource Optimization</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={createModel}
                disabled={!newModel.name.trim() || isCreatingModel}
                className="w-full"
              >
                {isCreatingModel ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Creating Model...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Create Model
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  {selectedModel.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedModel(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{selectedModel.accuracy}%</div>
                  <div className="text-sm text-blue-600">Accuracy</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{selectedModel.predictions.toLocaleString()}</div>
                  <div className="text-sm text-green-600">Total Predictions</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">{selectedModel.performance.precision}%</div>
                    <div className="text-sm text-muted-foreground">Precision</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">{selectedModel.performance.recall}%</div>
                    <div className="text-sm text-muted-foreground">Recall</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">{selectedModel.performance.f1Score}%</div>
                    <div className="text-sm text-muted-foreground">F1 Score</div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="font-medium">{selectedModel.version}</div>
                    <div className="text-sm text-muted-foreground">Version</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Model Information</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Type:</strong> {formatModelType(selectedModel.type)}</div>
                  <div><strong>Purpose:</strong> {formatModelPurpose(selectedModel.purpose)}</div>
                  <div><strong>Training Data:</strong> {selectedModel.trainingData.toLocaleString()} data points</div>
                  <div><strong>Last Trained:</strong> {new Date(selectedModel.lastTrained).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
