'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Bot, 
  Zap, 
  Activity, 
  TrendingUp, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

// Mock data for agentic AI
const mockAgentStatus = [
  {
    id: 'env-monitor',
    name: 'Environmental Monitor Agent',
    status: 'active',
    lastAction: '2 minutes ago',
    confidence: 94,
    description: 'Monitoring temperature, humidity, and pH levels across all zones'
  },
  {
    id: 'production-optimizer',
    name: 'Production Optimizer Agent',
    status: 'active',
    lastAction: '5 minutes ago',
    confidence: 87,
    description: 'Analyzing yield patterns and optimizing feeding schedules'
  },
  {
    id: 'maintenance-predictor',
    name: 'Predictive Maintenance Agent',
    status: 'warning',
    lastAction: '15 minutes ago',
    confidence: 76,
    description: 'Predicting equipment maintenance needs and scheduling'
  },
  {
    id: 'quality-controller',
    name: 'Quality Control Agent',
    status: 'active',
    lastAction: '1 minute ago',
    confidence: 91,
    description: 'Monitoring compost quality and worm health indicators'
  }
];

const mockDecisions = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 300000),
    agent: 'Environmental Monitor',
    decision: 'Increased ventilation in Zone A2',
    reason: 'Temperature exceeded optimal range (76°F)',
    impact: 'High',
    status: 'executed'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 600000),
    agent: 'Production Optimizer',
    decision: 'Adjusted feeding schedule for Zone B1',
    reason: 'Detected slower decomposition rate',
    impact: 'Medium',
    status: 'executed'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 900000),
    agent: 'Quality Controller',
    decision: 'Recommended moisture adjustment',
    reason: 'Moisture levels below optimal threshold',
    impact: 'Medium',
    status: 'pending'
  }
];

export default function AgenticAIPage() {
  const [activeAgents, setActiveAgents] = useState(mockAgentStatus);
  const [recentDecisions, setRecentDecisions] = useState(mockDecisions);
  const [systemHealth, setSystemHealth] = useState(92);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agentic AI Dashboard</h2>
          <p className="text-muted-foreground">
            Autonomous AI agents managing your agricultural systems
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            System Healthy
          </Badge>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgents.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              of {activeAgents.length} total agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth}%</div>
            <Progress value={systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decisions Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentDecisions.length}</div>
            <p className="text-xs text-muted-foreground">
              Autonomous actions taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(activeAgents.reduce((acc, agent) => acc + agent.confidence, 0) / activeAgents.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Decision confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="decisions">Recent Decisions</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {activeAgents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    {getStatusBadge(agent.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence</span>
                    <span className="text-sm">{agent.confidence}%</span>
                  </div>
                  <Progress value={agent.confidence} />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Action</span>
                    <span>{agent.lastAction}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Autonomous Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {decision.status === 'executed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{decision.decision}</h4>
                        <Badge variant={decision.impact === 'High' ? 'destructive' : 'secondary'}>
                          {decision.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{decision.reason}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{decision.agent}</span>
                        <span>{decision.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAgents.map((agent) => (
                    <div key={agent.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{agent.name}</span>
                        <span>{agent.confidence}%</span>
                      </div>
                      <Progress value={agent.confidence} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      AI agents have improved system efficiency by 23% this month through autonomous optimizations.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Energy Efficiency</span>
                      <span className="text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Production Rate</span>
                      <span className="text-green-600">+18%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Maintenance Costs</span>
                      <span className="text-green-600">-12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
