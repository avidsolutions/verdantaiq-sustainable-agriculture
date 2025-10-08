

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MLModelManager } from '@/components/ai-ml/ml-model-manager';
import { PredictiveAnalyticsDashboard } from '@/components/ai-ml/predictive-analytics-dashboard';
import { AIDecisionEngine } from '@/components/ai-ml/ai-decision-engine';
import { AIInsightsPanel } from '@/components/dashboard/ai-insights-panel';
import { WatsonAssistantChat } from '@/components/dashboard/watson-assistant-chat';
import { 
  Brain, 
  TrendingUp, 
  Settings, 
  Zap,
  Bot,
  Activity,
  BarChart3,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function AIMLDashboard() {
  const [showWatsonChat, setShowWatsonChat] = useState(false);

  // Mock AI insights data - in real implementation, this would come from API
  const mockAIInsights = [
    {
      id: 'insight_001',
      type: 'prediction' as const,
      systemId: 'sys_001',
      title: 'Yield Increase Predicted',
      description: 'AI models predict a 23% yield increase over the next 30 days based on current environmental conditions and growth patterns.',
      confidence: 89,
      impact: 'high' as const,
      actionItems: [
        'Increase harvesting capacity planning',
        'Optimize nutrient delivery systems',
        'Prepare additional storage facilities'
      ],
      dataPoints: {
        current_yield_rate: 1250,
        predicted_yield_rate: 1538,
        confidence_interval: '±8%',
        primary_factors: ['temperature', 'humidity', 'nutrient_levels']
      },
      timestamp: new Date(),
      source: 'watson_ai' as const
    },
    {
      id: 'insight_002',
      type: 'risk_assessment' as const,
      systemId: 'sys_002',
      title: 'Pest Risk Alert',
      description: 'High probability of whitefly infestation detected in East Greenhouse based on environmental conditions and historical patterns.',
      confidence: 84,
      impact: 'medium' as const,
      actionItems: [
        'Deploy yellow sticky traps in East Greenhouse',
        'Apply preventive organic pesticide treatment',
        'Increase monitoring frequency in affected area'
      ],
      dataPoints: {
        risk_level: 'HIGH',
        probability: 84,
        affected_area: 'East Greenhouse',
        pest_type: 'whiteflies'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      source: 'watson_ai' as const
    }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">AI & Machine Learning</h2>
          <p className="text-muted-foreground">
            Advanced AI-powered agricultural intelligence and automation platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowWatsonChat(!showWatsonChat)}
            className="flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Watson Assistant
          </Button>
        </div>
      </div>

      {/* AI Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 deployed, 1 training
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions Made</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,832</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Engine</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">Active</div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              5 rules active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main AI/ML Components */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            ML Models
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Decision Engine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <AIInsightsPanel insights={mockAIInsights} />
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <MLModelManager />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <PredictiveAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <AIDecisionEngine />
        </TabsContent>
      </Tabs>

      {/* Watson Assistant Chat - Floating Widget */}
      {showWatsonChat && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden z-50">
          <WatsonAssistantChat onClose={() => setShowWatsonChat(false)} />
        </div>
      )}
    </div>
  );
}
