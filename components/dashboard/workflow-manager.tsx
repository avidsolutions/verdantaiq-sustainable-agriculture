
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Bot
} from 'lucide-react';
import { WorkflowExecution } from '@/types/agricultural';

interface WorkflowManagerProps {
  workflows: WorkflowExecution[];
}

export function WorkflowManager({ workflows }: WorkflowManagerProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowExecution | null>(null);
  const [creatingWorkflow, setCreatingWorkflow] = useState<string | null>(null);

  const getStatusIcon = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleTriggerWorkflow = async (workflowId: string, parameters: any = {}) => {
    try {
      const response = await fetch('/api/watson/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'trigger_workflow',
          workflowId,
          parameters
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('Workflow triggered:', result.data);
        // In a real app, you would refresh the workflows list
      }
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }
  };

  const handleCreateWorkflow = async (workflowType: string) => {
    setCreatingWorkflow(workflowType);
    
    try {
      const response = await fetch('/api/watson/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: `setup_${workflowType}`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log(`${workflowType} workflow created:`, result.data);
        // In a real app, you would refresh the workflows list
      }
    } catch (error) {
      console.error(`Failed to create ${workflowType} workflow:`, error);
    } finally {
      setCreatingWorkflow(null);
    }
  };

  const runningWorkflows = workflows.filter(wf => wf.status === 'running');
  const completedWorkflows = workflows.filter(wf => wf.status === 'completed');
  const failedWorkflows = workflows.filter(wf => wf.status === 'failed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Watson Workflow Manager</h2>
          <p className="text-muted-foreground">Automated agricultural process orchestration</p>
        </div>
        <Badge className="bg-purple-600 text-white">
          <Bot className="w-4 h-4 mr-1" />
          Watson Orchestrate
        </Badge>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold">{runningWorkflows.length}</p>
              </div>
              <Play className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedWorkflows.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failedWorkflows.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="history">Workflow History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {runningWorkflows.length > 0 ? (
            <div className="space-y-4">
              {runningWorkflows.map((workflow) => (
                <Card key={workflow.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        {workflow.workflowName}
                      </CardTitle>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {workflow.progress}%
                        </span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <span className="ml-2">{new Date(workflow.startTime).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current Step:</span>
                        <span className="ml-2 capitalize">{workflow.currentStep.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Triggered By:</span>
                        <span className="ml-2 capitalize">{workflow.triggeredBy.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Workflow ID:</span>
                        <span className="ml-2 font-mono text-xs">{workflow.workflowId}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button size="sm" variant="outline">
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Workflows</h3>
              <p className="text-muted-foreground mb-4">All workflows are currently idle</p>
              <Button onClick={() => handleTriggerWorkflow('wf_feeding')}>
                <Play className="w-4 h-4 mr-2" />
                Start Feeding Workflow
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {workflows.filter(wf => wf.status === 'completed' || wf.status === 'failed').map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      {workflow.workflowName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(workflow.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2">
                        {workflow.endTime 
                          ? Math.round((new Date(workflow.endTime).getTime() - new Date(workflow.startTime).getTime()) / 60000)
                          : 0} minutes
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Result:</span>
                      <span className="ml-2">
                        {workflow.result ? JSON.stringify(workflow.result).slice(0, 50) + '...' : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      View Log
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTriggerWorkflow(workflow.workflowId, workflow.parameters)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Run Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Feeding Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automated vermiculture feeding based on environmental conditions and AI analysis.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => handleCreateWorkflow('feeding')}
                  disabled={creatingWorkflow === 'feeding'}
                >
                  {creatingWorkflow === 'feeding' ? 'Creating...' : 'Create Workflow'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Harvest Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimized harvest timing and quality control with AI predictions.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => handleCreateWorkflow('harvest')}
                  disabled={creatingWorkflow === 'harvest'}
                >
                  {creatingWorkflow === 'harvest' ? 'Creating...' : 'Create Workflow'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Preventive maintenance scheduling and automated diagnostics.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => handleCreateWorkflow('maintenance')}
                  disabled={creatingWorkflow === 'maintenance'}
                >
                  {creatingWorkflow === 'maintenance' ? 'Creating...' : 'Create Workflow'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              Custom workflow creation is powered by Watson Orchestrate. Define your automation logic and let AI optimize the process.
            </AlertDescription>
          </Alert>
          
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Custom Workflow Builder</h3>
            <p className="text-muted-foreground mb-4">
              Create custom workflows tailored to your specific agricultural processes
            </p>
            <Button size="lg">
              <Zap className="w-4 h-4 mr-2" />
              Launch Workflow Builder
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedWorkflow.status)}
                  <CardTitle>{selectedWorkflow.workflowName}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWorkflow(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Workflow Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-muted-foreground">ID:</span> {selectedWorkflow.id}</div>
                    <div><span className="text-muted-foreground">Type:</span> {selectedWorkflow.workflowId}</div>
                    <div><span className="text-muted-foreground">Status:</span> {selectedWorkflow.status}</div>
                    <div><span className="text-muted-foreground">Progress:</span> {selectedWorkflow.progress}%</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Execution Info</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-muted-foreground">Started:</span> {new Date(selectedWorkflow.startTime).toLocaleString()}</div>
                    <div><span className="text-muted-foreground">Current Step:</span> {selectedWorkflow.currentStep}</div>
                    <div><span className="text-muted-foreground">Triggered By:</span> {selectedWorkflow.triggeredBy}</div>
                  </div>
                </div>
              </div>

              {selectedWorkflow.parameters && Object.keys(selectedWorkflow.parameters).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Parameters</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <pre>{JSON.stringify(selectedWorkflow.parameters, null, 2)}</pre>
                  </div>
                </div>
              )}

              {selectedWorkflow.result && (
                <div>
                  <h4 className="font-medium mb-2">Results</h4>
                  <div className="bg-gray-50 p-3 rounded text-xs">
                    <pre>{JSON.stringify(selectedWorkflow.result, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
