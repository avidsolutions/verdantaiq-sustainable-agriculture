
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Droplets,
  Thermometer,
  Leaf,
  Bot,
  Play,
  Pause
} from 'lucide-react';
import { VermicultureSystem, AlertNotification, AIInsight, WorkflowExecution } from '@/types/agricultural';
import { EnvironmentalChart } from './environmental-chart';
import { SystemStatusGrid } from './system-status-grid';
import { AIInsightsPanel } from './ai-insights-panel';
import { WatsonAssistantChat } from './watson-assistant-chat';
import { WorkflowManager } from './workflow-manager';

interface MainDashboardProps {
  systems: VermicultureSystem[];
  alerts: AlertNotification[];
  aiInsights: AIInsight[];
  workflows: WorkflowExecution[];
}

export function MainDashboard({ systems, alerts, aiInsights, workflows }: MainDashboardProps) {
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [realTimeData, setRealTimeData] = useState(true);
  const [watsonChatOpen, setWatsonChatOpen] = useState(false);

  // Calculate summary metrics
  const totalCapacity = systems.reduce((sum, sys) => sum + sys.capacity, 0);
  const totalCurrentLoad = systems.reduce((sum, sys) => sum + sys.currentLoad, 0);
  const averageEfficiency = systems.reduce((sum, sys) => sum + sys.efficiency, 0) / systems.length;
  const totalYield = systems.reduce((sum, sys) => sum + sys.yieldToDate, 0);

  const activeSystems = systems.filter(sys => sys.status === 'active').length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length;
  const runningWorkflows = workflows.filter(wf => wf.status === 'running').length;

  useEffect(() => {
    if (realTimeData) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        console.log('Fetching real-time data...');
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeData]);

  return (
    <div className="space-y-6">
      {/* Header with Watson Integration */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Peoria Agricultural Management</h1>
          <p className="text-muted-foreground">Powered by IBM Watson X</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setWatsonChatOpen(!watsonChatOpen)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Bot className="w-4 h-4 mr-2" />
            Watson Assistant
          </Button>
          <Button
            variant={realTimeData ? "default" : "outline"}
            onClick={() => setRealTimeData(!realTimeData)}
          >
            {realTimeData ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Real-time {realTimeData ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {criticalAlerts} critical alert{criticalAlerts > 1 ? 's' : ''} require immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Capacity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalCurrentLoad / totalCapacity) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCurrentLoad.toLocaleString()} / {totalCapacity.toLocaleString()} lbs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across {activeSystems} active systems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Yield</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalYield.toLocaleString()} lbs</div>
            <p className="text-xs text-muted-foreground">Year to date production</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningWorkflows}</div>
            <p className="text-xs text-muted-foreground">Watson orchestrated</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status Grid */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemStatusGrid systems={systems} />
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 
                                     alert.severity === 'warning' ? 'secondary' : 'default'}>
                          {alert.severity}
                        </Badge>
                        {alert.watsonInsight && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Watson AI
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                    {!alert.acknowledged && (
                      <Button size="sm" variant="outline">
                        Acknowledge
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Environmental Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Environmental Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <EnvironmentalChart systemId={selectedSystem} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                <Thermometer className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72.1°F</div>
                <p className="text-xs text-muted-foreground">Optimal range: 65-75°F</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moisture</CardTitle>
                <Droplets className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.8%</div>
                <p className="text-xs text-muted-foreground">Target range: 60-70%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">pH Level</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.4</div>
                <p className="text-xs text-muted-foreground">Optimal range: 6.0-7.0</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Environmental Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <EnvironmentalChart systemId={selectedSystem} detailed={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Production Analytics</h3>
            <p className="text-muted-foreground">AI-powered yield predictions and optimization insights</p>
            <Button className="mt-4">View Detailed Analytics</Button>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <WorkflowManager workflows={workflows} />
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <AIInsightsPanel insights={aiInsights} />
        </TabsContent>
      </Tabs>

      {/* Watson Assistant Chat */}
      {watsonChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <WatsonAssistantChat onClose={() => setWatsonChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
