

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Droplets,
  Thermometer,
  Fan,
  Lightbulb,
  Activity
} from 'lucide-react';

interface DecisionRule {
  id: string;
  name: string;
  category: 'irrigation' | 'climate' | 'nutrition' | 'pest_control' | 'harvesting';
  condition: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  confidence_threshold: number;
  last_triggered?: Date;
  trigger_count: number;
}

interface AutomatedDecision {
  id: string;
  rule_id: string;
  rule_name: string;
  decision: string;
  action_taken: string;
  confidence: number;
  data_inputs: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed' | 'cancelled';
  result?: string;
}

interface SystemAction {
  id: string;
  type: 'irrigation' | 'climate_control' | 'nutrition' | 'alert' | 'workflow';
  description: string;
  parameters: Record<string, any>;
  estimated_impact: string;
  safety_checks: string[];
  requires_approval: boolean;
}

export function AIDecisionEngine() {
  const [rules, setRules] = useState<DecisionRule[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<AutomatedDecision[]>([]);
  const [pendingActions, setPendingActions] = useState<SystemAction[]>([]);
  const [engineEnabled, setEngineEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<DecisionRule | null>(null);

  useEffect(() => {
    loadDecisionEngine();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      loadRecentDecisions();
      loadPendingActions();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDecisionEngine = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, decisionsRes, actionsRes] = await Promise.all([
        fetch('/api/ai-ml/decision-engine/rules'),
        fetch('/api/ai-ml/decision-engine/decisions'),
        fetch('/api/ai-ml/decision-engine/actions')
      ]);

      const [rulesData, decisionsData, actionsData] = await Promise.all([
        rulesRes.json(),
        decisionsRes.json(),
        actionsRes.json()
      ]);

      if (rulesData.success) setRules(rulesData.data);
      if (decisionsData.success) setRecentDecisions(decisionsData.data);
      if (actionsData.success) setPendingActions(actionsData.data);

    } catch (error) {
      console.error('Failed to load decision engine:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentDecisions = async () => {
    try {
      const response = await fetch('/api/ai-ml/decision-engine/decisions');
      const result = await response.json();
      if (result.success) {
        setRecentDecisions(result.data);
      }
    } catch (error) {
      console.error('Failed to load recent decisions:', error);
    }
  };

  const loadPendingActions = async () => {
    try {
      const response = await fetch('/api/ai-ml/decision-engine/actions');
      const result = await response.json();
      if (result.success) {
        setPendingActions(result.data);
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/ai-ml/decision-engine/rules/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, enabled }),
      });

      const result = await response.json();
      if (result.success) {
        setRules(prev => prev.map(rule => 
          rule.id === ruleId ? { ...rule, enabled } : rule
        ));
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const approveAction = async (actionId: string) => {
    try {
      const response = await fetch('/api/ai-ml/decision-engine/actions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });

      const result = await response.json();
      if (result.success) {
        setPendingActions(prev => prev.filter(action => action.id !== actionId));
        await loadRecentDecisions();
      }
    } catch (error) {
      console.error('Failed to approve action:', error);
    }
  };

  const rejectAction = async (actionId: string) => {
    try {
      const response = await fetch('/api/ai-ml/decision-engine/actions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId }),
      });

      const result = await response.json();
      if (result.success) {
        setPendingActions(prev => prev.filter(action => action.id !== actionId));
      }
    } catch (error) {
      console.error('Failed to reject action:', error);
    }
  };

  const getCategoryIcon = (category: DecisionRule['category']) => {
    switch (category) {
      case 'irrigation':
        return <Droplets className="w-4 h-4" />;
      case 'climate':
        return <Thermometer className="w-4 h-4" />;
      case 'nutrition':
        return <Lightbulb className="w-4 h-4" />;
      case 'pest_control':
        return <AlertTriangle className="w-4 h-4" />;
      case 'harvesting':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: DecisionRule['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AutomatedDecision['status']) => {
    switch (status) {
      case 'executed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <Pause className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActionTypeIcon = (type: SystemAction['type']) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'climate_control':
        return <Fan className="w-4 h-4 text-green-600" />;
      case 'nutrition':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'workflow':
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading AI Decision Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Decision Engine</h2>
          <p className="text-muted-foreground">Autonomous decision-making for agricultural operations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${engineEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-sm">Engine Status</span>
            <Switch
              checked={engineEnabled}
              onCheckedChange={setEngineEnabled}
            />
          </div>
          <Badge className={engineEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {engineEnabled ? 'ACTIVE' : 'PAUSED'}
          </Badge>
        </div>
      </div>

      {!engineEnabled && (
        <Alert>
          <Pause className="w-4 h-4" />
          <AlertDescription>
            The AI Decision Engine is currently paused. Automated decisions will not be executed until reactivated.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decision Rules */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Decision Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rule.category)}
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{rule.name}</h4>
                        <Badge className={getPriorityColor(rule.priority)} variant="outline">
                          {rule.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rule.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>If:</strong> {rule.condition}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Then:</strong> {rule.action}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          Confidence threshold: {rule.confidence_threshold}% • 
                          Triggered: {rule.trigger_count} times
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedRule(rule)}
                          className="h-6 px-2"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Decisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {getStatusIcon(decision.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{decision.rule_name}</h4>
                        <Badge className={`${decision.confidence >= 80 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {decision.confidence}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {decision.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        <strong>Decision:</strong> {decision.decision}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Action:</strong> {decision.action_taken}
                      </p>
                      {decision.result && (
                        <p className="text-xs text-green-600">
                          <strong>Result:</strong> {decision.result}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(decision.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingActions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No pending actions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingActions.map((action) => (
                    <div key={action.id} className="border rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-2">
                        {getActionTypeIcon(action.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{action.description}</h4>
                          <p className="text-xs text-muted-foreground">
                            {action.estimated_impact}
                          </p>
                        </div>
                      </div>

                      {action.safety_checks.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium mb-1">Safety Checks:</h5>
                          <ul className="text-xs space-y-1">
                            {action.safety_checks.map((check, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{check}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveAction(action.id)}
                          className="flex-1 h-7"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectAction(action.id)}
                          className="flex-1 h-7"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engine Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Engine Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="font-medium text-blue-700">{rules.filter(r => r.enabled).length}</div>
                  <div className="text-blue-600">Active Rules</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="font-medium text-green-700">{recentDecisions.filter(d => d.status === 'executed').length}</div>
                  <div className="text-green-600">Executed Today</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <div className="font-medium text-yellow-700">{pendingActions.length}</div>
                  <div className="text-yellow-600">Pending Actions</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="font-medium text-purple-700">
                    {recentDecisions.length > 0 ? Math.round(recentDecisions.reduce((acc, d) => acc + d.confidence, 0) / recentDecisions.length) : 0}%
                  </div>
                  <div className="text-purple-600">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rule Details Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedRule.category)}
                  {selectedRule.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRule(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={getPriorityColor(selectedRule.priority)}>
                  {selectedRule.priority} priority
                </Badge>
                <Badge variant="outline">
                  {selectedRule.category.replace('_', ' ')}
                </Badge>
                <Badge className={selectedRule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {selectedRule.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Rule Logic</h4>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <div className="mb-2">
                    <strong>Condition:</strong> {selectedRule.condition}
                  </div>
                  <div>
                    <strong>Action:</strong> {selectedRule.action}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Confidence Threshold:</span>
                    <span>{selectedRule.confidence_threshold}%</span>
                  </div>
                  <Progress value={selectedRule.confidence_threshold} className="w-full" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="font-medium">{selectedRule.trigger_count}</div>
                    <div className="text-muted-foreground">Times Triggered</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <div className="font-medium">
                      {selectedRule.last_triggered ? new Date(selectedRule.last_triggered).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-muted-foreground">Last Triggered</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
