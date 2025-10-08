
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { AIInsight } from '@/types/agricultural';

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [implementingInsight, setImplementingInsight] = useState<string | null>(null);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'prediction':
        return <TrendingUp className="w-4 h-4" />;
      case 'optimization':
        return <Target className="w-4 h-4" />;
      case 'risk_assessment':
        return <AlertTriangle className="w-4 h-4" />;
      case 'recommendation':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 75) return 'text-blue-600 bg-blue-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleImplementAction = async (insightId: string, action: string) => {
    setImplementingInsight(insightId);
    
    // Simulate implementation
    setTimeout(() => {
      setImplementingInsight(null);
      console.log(`Implemented action: ${action} for insight: ${insightId}`);
    }, 2000);
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) {
      acc[insight.type] = [];
    }
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, AIInsight[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Watson AI Insights</h2>
          <p className="text-muted-foreground">AI-powered analysis and recommendations</p>
        </div>
        <Badge className="bg-blue-600 text-white">
          <Brain className="w-4 h-4 mr-1" />
          {insights.length} Insights
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="prediction">Predictions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="risk_assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <Badge className={getConfidenceColor(insight.confidence)}>
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact.toUpperCase()} impact
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(insight.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  {insight.actionItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                      <div className="space-y-1">
                        {insight.actionItems.slice(0, 2).map((action, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <span>{action}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleImplementAction(insight.id, action)}
                              disabled={implementingInsight === insight.id}
                              className="h-6 px-2"
                            >
                              {implementingInsight === insight.id ? (
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                'Implement'
                              )}
                            </Button>
                          </div>
                        ))}
                        {insight.actionItems.length > 2 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedInsight(insight)}
                            className="w-full h-6"
                          >
                            View all {insight.actionItems.length} actions
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {Object.entries(groupedInsights).map(([type, typeInsights]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {typeInsights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle>{insight.title}</CardTitle>
                      </div>
                      <Badge className={getConfidenceColor(insight.confidence)}>
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{insight.description}</p>

                    {insight.dataPoints && Object.keys(insight.dataPoints).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Data Analysis:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(insight.dataPoints).map(([key, value]) => (
                            <div key={key} className="text-xs p-2 bg-gray-50 rounded">
                              <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                              <span className="ml-1">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Action Items:</h4>
                      {insight.actionItems.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{action}</span>
                          <Button
                            size="sm"
                            onClick={() => handleImplementAction(insight.id, action)}
                            disabled={implementingInsight === insight.id}
                          >
                            {implementingInsight === insight.id ? 'Implementing...' : 'Implement'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(selectedInsight.type)}
                  <CardTitle>{selectedInsight.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInsight(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{selectedInsight.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Badge className={getConfidenceColor(selectedInsight.confidence)}>
                    {selectedInsight.confidence}% confidence
                  </Badge>
                </div>
                <div>
                  <Badge className={getImpactColor(selectedInsight.impact)}>
                    {selectedInsight.impact.toUpperCase()} impact
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">All Recommended Actions:</h4>
                {selectedInsight.actionItems.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <span>{action}</span>
                    <Button
                      size="sm"
                      onClick={() => handleImplementAction(selectedInsight.id, action)}
                      disabled={implementingInsight === selectedInsight.id}
                    >
                      {implementingInsight === selectedInsight.id ? 'Implementing...' : 'Implement'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
