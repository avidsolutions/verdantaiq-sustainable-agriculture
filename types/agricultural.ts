
export interface EnvironmentalData {
  id: string;
  timestamp: Date;
  temperature: number;
  moisture: number;
  ph: number;
  systemId: string;
  zone: string;
  sensorId: string;
}

export interface VermicultureSystem {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentLoad: number;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenance: Date;
  nextMaintenance: Date;
  yieldToDate: number;
  efficiency: number;
  zones: SystemZone[];
}

export interface SystemZone {
  id: string;
  name: string;
  systemId: string;
  temperature: number;
  moisture: number;
  ph: number;
  wormPopulation: number;
  feedingSchedule: FeedingSchedule;
  lastHarvest: Date;
  status: 'optimal' | 'attention' | 'critical';
}

export interface FeedingSchedule {
  id: string;
  zoneId: string;
  frequency: 'daily' | 'weekly' | 'biweekly';
  amount: number; // in pounds
  feedType: string;
  lastFed: Date;
  nextFeeding: Date;
  automated: boolean;
}

export interface HarvestRecord {
  id: string;
  systemId: string;
  zoneId: string;
  date: Date;
  yieldAmount: number; // in pounds
  quality: 'premium' | 'standard' | 'compost';
  moisture: number;
  contamination: boolean;
  notes: string;
  harvestedBy: string;
}

export interface MaintenanceTask {
  id: string;
  systemId: string;
  taskType: 'routine' | 'repair' | 'upgrade' | 'calibration';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  scheduledDate: Date;
  completedDate?: Date;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  cost?: number;
  notes?: string;
}

export interface PerformanceMetrics {
  systemId: string;
  date: Date;
  yieldEfficiency: number; // percentage
  energyUsage: number; // kWh
  waterUsage: number; // gallons
  uptime: number; // percentage
  qualityScore: number; // 1-10
  costPerPound: number;
  environmentalImpact: number; // CO2 equivalent
}

export interface AlertNotification {
  id: string;
  systemId?: string;
  type: 'environmental' | 'maintenance' | 'harvest' | 'system' | 'ai_insight';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedDate?: Date;
  actionRequired?: string;
  watsonInsight?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'prediction' | 'optimization' | 'risk_assessment' | 'recommendation';
  systemId?: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  actionItems: string[];
  dataPoints: Record<string, any>;
  timestamp: Date;
  source: 'watson_ai' | 'watson_orchestrate' | 'system_analysis';
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  progress: number; // 0-100
  currentStep: string;
  result?: any;
  error?: string;
  triggeredBy: 'schedule' | 'manual' | 'ai_decision' | 'threshold';
  parameters: Record<string, any>;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  systemAccess: string[];
}

export interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  lastLogin: Date;
  preferences: {
    notifications: boolean;
    dashboard_view: 'overview' | 'detailed' | 'minimal';
    default_system?: string;
    ai_assistance: boolean;
  };
}

// Watson X Integration Types
export interface WatsonAIAnalysis {
  environmentalPredictions: {
    optimalTemperature: { min: number; max: number; current: number };
    moistureRecommendations: { current: number; target: number; action: string };
    phAdjustments: { current: number; target: number; adjustment: string };
  };
  insights: string[];
  recommendations: string[];
  riskAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
    alerts: string[];
  };
}

export interface WatsonYieldPrediction {
  predictedYield: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  timeline: {
    weeks: number[];
    expectedYield: number[];
  };
}

export interface WatsonConversation {
  sessionId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: any;
  }>;
  context: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface DashboardData {
  systems: VermicultureSystem[];
  environmentalData: EnvironmentalData[];
  performanceMetrics: PerformanceMetrics[];
  alerts: AlertNotification[];
  aiInsights: AIInsight[];
  activeWorkflows: WorkflowExecution[];
  recentHarvests: HarvestRecord[];
  upcomingTasks: MaintenanceTask[];
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: string | Date;
  value: number;
  label?: string;
  category?: string;
}

export interface TimeSeriesData {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  unit?: string;
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  realTime?: boolean;
  updateInterval?: number;
}
