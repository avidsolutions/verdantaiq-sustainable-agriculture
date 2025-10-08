
import { 
  VermicultureSystem, 
  EnvironmentalData, 
  PerformanceMetrics, 
  AlertNotification, 
  AIInsight, 
  HarvestRecord, 
  MaintenanceTask,
  WorkflowExecution,
  SystemZone,
  FeedingSchedule
} from '@/types/agricultural';

// Mock Vermiculture Systems
export const mockSystems: VermicultureSystem[] = [
  {
    id: 'sys_001',
    name: 'North Greenhouse Complex',
    location: 'Zone A - Building 1',
    capacity: 5000,
    currentLoad: 4200,
    status: 'active',
    lastMaintenance: new Date('2024-09-15'),
    nextMaintenance: new Date('2024-10-15'),
    yieldToDate: 1250.5,
    efficiency: 92.3,
    zones: [
      {
        id: 'zone_001_a',
        name: 'Zone A1',
        systemId: 'sys_001',
        temperature: 72.5,
        moisture: 68.2,
        ph: 6.4,
        wormPopulation: 15000,
        feedingSchedule: {
          id: 'feed_001',
          zoneId: 'zone_001_a',
          frequency: 'weekly',
          amount: 50,
          feedType: 'Organic Compost Mix',
          lastFed: new Date('2024-09-20'),
          nextFeeding: new Date('2024-09-27'),
          automated: true
        },
        lastHarvest: new Date('2024-09-01'),
        status: 'optimal'
      },
      {
        id: 'zone_001_b',
        name: 'Zone A2',
        systemId: 'sys_001',
        temperature: 74.1,
        moisture: 65.8,
        ph: 6.7,
        wormPopulation: 12500,
        feedingSchedule: {
          id: 'feed_002',
          zoneId: 'zone_001_b',
          frequency: 'weekly',
          amount: 45,
          feedType: 'Vegetable Scraps',
          lastFed: new Date('2024-09-21'),
          nextFeeding: new Date('2024-09-28'),
          automated: true
        },
        lastHarvest: new Date('2024-08-28'),
        status: 'optimal'
      }
    ]
  },
  {
    id: 'sys_002',
    name: 'South Production Unit',
    location: 'Zone B - Building 2',
    capacity: 3500,
    currentLoad: 3100,
    status: 'active',
    lastMaintenance: new Date('2024-09-10'),
    nextMaintenance: new Date('2024-10-10'),
    yieldToDate: 892.3,
    efficiency: 88.7,
    zones: [
      {
        id: 'zone_002_a',
        name: 'Zone B1',
        systemId: 'sys_002',
        temperature: 71.8,
        moisture: 72.5,
        ph: 6.2,
        wormPopulation: 11000,
        feedingSchedule: {
          id: 'feed_003',
          zoneId: 'zone_002_a',
          frequency: 'biweekly',
          amount: 60,
          feedType: 'Premium Organic Mix',
          lastFed: new Date('2024-09-18'),
          nextFeeding: new Date('2024-10-02'),
          automated: true
        },
        lastHarvest: new Date('2024-08-30'),
        status: 'attention'
      }
    ]
  },
  {
    id: 'sys_003',
    name: 'Research & Development',
    location: 'Zone C - Lab Building',
    capacity: 1000,
    currentLoad: 750,
    status: 'maintenance',
    lastMaintenance: new Date('2024-09-22'),
    nextMaintenance: new Date('2024-10-22'),
    yieldToDate: 156.8,
    efficiency: 75.2,
    zones: [
      {
        id: 'zone_003_a',
        name: 'R&D Zone',
        systemId: 'sys_003',
        temperature: 69.5,
        moisture: 58.3,
        ph: 6.8,
        wormPopulation: 5500,
        feedingSchedule: {
          id: 'feed_004',
          zoneId: 'zone_003_a',
          frequency: 'daily',
          amount: 10,
          feedType: 'Experimental Feed A',
          lastFed: new Date('2024-09-22'),
          nextFeeding: new Date('2024-09-23'),
          automated: false
        },
        lastHarvest: new Date('2024-09-15'),
        status: 'critical'
      }
    ]
  }
];

// Generate mock environmental data
export function generateEnvironmentalData(hours: number = 48): EnvironmentalData[] {
  const data: EnvironmentalData[] = [];
  const now = new Date();
  
  mockSystems.forEach(system => {
    system.zones.forEach(zone => {
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
        
        // Generate realistic variations
        const tempBase = zone.temperature;
        const moistBase = zone.moisture;
        const phBase = zone.ph;
        
        data.push({
          id: `env_${system.id}_${zone.id}_${i}`,
          timestamp,
          temperature: tempBase + (Math.random() - 0.5) * 4,
          moisture: moistBase + (Math.random() - 0.5) * 10,
          ph: phBase + (Math.random() - 0.5) * 0.6,
          systemId: system.id,
          zone: zone.name,
          sensorId: `sensor_${zone.id}_${Math.floor(Math.random() * 3) + 1}`
        });
      }
    });
  });
  
  return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Mock Performance Metrics
export function generatePerformanceMetrics(days: number = 30): PerformanceMetrics[] {
  const metrics: PerformanceMetrics[] = [];
  const now = new Date();
  
  mockSystems.forEach(system => {
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      
      metrics.push({
        systemId: system.id,
        date,
        yieldEfficiency: system.efficiency + (Math.random() - 0.5) * 10,
        energyUsage: 150 + Math.random() * 50,
        waterUsage: 200 + Math.random() * 100,
        uptime: 95 + Math.random() * 5,
        qualityScore: 7 + Math.random() * 2,
        costPerPound: 2.5 + Math.random() * 1,
        environmentalImpact: 0.8 + Math.random() * 0.4
      });
    }
  });
  
  return metrics;
}

// Mock Alerts
export const mockAlerts: AlertNotification[] = [
  {
    id: 'alert_001',
    systemId: 'sys_003',
    type: 'environmental',
    severity: 'critical',
    title: 'Low Moisture Alert',
    message: 'Zone R&D moisture level has dropped below 60%. Immediate attention required.',
    timestamp: new Date('2024-09-23T08:15:00'),
    acknowledged: false,
    actionRequired: 'Increase watering system output',
    watsonInsight: true
  },
  {
    id: 'alert_002',
    systemId: 'sys_002',
    type: 'maintenance',
    severity: 'warning',
    title: 'Scheduled Maintenance Due',
    message: 'Zone B1 requires routine sensor calibration and cleaning.',
    timestamp: new Date('2024-09-23T07:30:00'),
    acknowledged: true,
    actionRequired: 'Schedule maintenance team visit'
  },
  {
    id: 'alert_003',
    systemId: 'sys_001',
    type: 'ai_insight',
    severity: 'info',
    title: 'Yield Optimization Opportunity',
    message: 'Watson AI has identified potential 8% yield increase through feeding schedule adjustment.',
    timestamp: new Date('2024-09-23T06:45:00'),
    acknowledged: false,
    watsonInsight: true
  },
  {
    id: 'alert_004',
    type: 'system',
    severity: 'warning',
    title: 'High Energy Usage Detected',
    message: 'Overall system energy consumption is 15% above baseline.',
    timestamp: new Date('2024-09-22T22:15:00'),
    acknowledged: false,
    actionRequired: 'Review ventilation system efficiency'
  }
];

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight_001',
    type: 'prediction',
    systemId: 'sys_001',
    title: 'Optimal Harvest Window Predicted',
    description: 'Watson AI analysis indicates optimal harvest conditions will occur in Zone A1 within the next 5-7 days.',
    confidence: 94,
    impact: 'high',
    actionItems: [
      'Prepare harvest equipment for Zone A1',
      'Schedule harvest team for September 28-30',
      'Ensure adequate storage capacity'
    ],
    dataPoints: {
      moisture_trend: 'stable',
      temperature_optimal: true,
      worm_activity: 'peak',
      decomposition_rate: 'optimal'
    },
    timestamp: new Date('2024-09-23T09:00:00'),
    source: 'watson_ai'
  },
  {
    id: 'insight_002',
    type: 'optimization',
    systemId: 'sys_002',
    title: 'Feeding Schedule Optimization',
    description: 'Current feeding pattern can be optimized to reduce waste by 12% and improve yield by 8%.',
    confidence: 87,
    impact: 'medium',
    actionItems: [
      'Adjust feeding frequency from biweekly to every 10 days',
      'Reduce portion size by 15%',
      'Monitor worm population response'
    ],
    dataPoints: {
      current_efficiency: 88.7,
      projected_efficiency: 96.2,
      waste_reduction: 12,
      cost_savings: 145
    },
    timestamp: new Date('2024-09-23T08:30:00'),
    source: 'watson_ai'
  },
  {
    id: 'insight_003',
    type: 'risk_assessment',
    systemId: 'sys_003',
    title: 'Environmental Risk Assessment',
    description: 'Low moisture levels combined with maintenance schedule may impact worm population health.',
    confidence: 76,
    impact: 'high',
    actionItems: [
      'Increase moisture monitoring frequency',
      'Implement emergency watering protocol',
      'Consider temporary feeding reduction'
    ],
    dataPoints: {
      risk_level: 'medium-high',
      affected_population: 5500,
      recovery_time: '3-5 days',
      mitigation_cost: 250
    },
    timestamp: new Date('2024-09-23T07:15:00'),
    source: 'watson_ai'
  }
];

// Mock Harvest Records
export const mockHarvestRecords: HarvestRecord[] = [
  {
    id: 'harvest_001',
    systemId: 'sys_001',
    zoneId: 'zone_001_a',
    date: new Date('2024-09-01'),
    yieldAmount: 125.5,
    quality: 'premium',
    moisture: 45.2,
    contamination: false,
    notes: 'Excellent quality harvest with optimal decomposition',
    harvestedBy: 'John Smith'
  },
  {
    id: 'harvest_002',
    systemId: 'sys_001',
    zoneId: 'zone_001_b',
    date: new Date('2024-08-28'),
    yieldAmount: 98.3,
    quality: 'standard',
    moisture: 48.7,
    contamination: false,
    notes: 'Good quality, slightly higher moisture content',
    harvestedBy: 'Maria Garcia'
  },
  {
    id: 'harvest_003',
    systemId: 'sys_002',
    zoneId: 'zone_002_a',
    date: new Date('2024-08-30'),
    yieldAmount: 87.1,
    quality: 'premium',
    moisture: 43.8,
    contamination: false,
    notes: 'Premium quality, perfect moisture content',
    harvestedBy: 'David Kim'
  }
];

// Mock Maintenance Tasks
export const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 'task_001',
    systemId: 'sys_002',
    taskType: 'routine',
    description: 'Sensor calibration and cleaning for Zone B1',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Maintenance Team A',
    scheduledDate: new Date('2024-09-25'),
    estimatedDuration: 4
  },
  {
    id: 'task_002',
    systemId: 'sys_003',
    taskType: 'repair',
    description: 'Replace moisture sensor in R&D Zone',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Tech Team',
    scheduledDate: new Date('2024-09-23'),
    estimatedDuration: 2,
    cost: 350
  },
  {
    id: 'task_003',
    systemId: 'sys_001',
    taskType: 'upgrade',
    description: 'Install new automated feeding system',
    priority: 'low',
    status: 'pending',
    assignedTo: 'Installation Team',
    scheduledDate: new Date('2024-10-05'),
    estimatedDuration: 8,
    cost: 2500
  }
];

// Mock Workflow Executions
export const mockWorkflowExecutions: WorkflowExecution[] = [
  {
    id: 'exec_001',
    workflowId: 'wf_feeding',
    workflowName: 'Automated Feeding Schedule',
    status: 'completed',
    startTime: new Date('2024-09-23T06:00:00'),
    endTime: new Date('2024-09-23T06:15:00'),
    progress: 100,
    currentStep: 'completed',
    result: { zones_fed: 3, total_amount: 155, success_rate: 100 },
    triggeredBy: 'schedule',
    parameters: { zones: ['zone_001_a', 'zone_001_b', 'zone_002_a'] }
  },
  {
    id: 'exec_002',
    workflowId: 'wf_maintenance',
    workflowName: 'Preventive Maintenance',
    status: 'running',
    startTime: new Date('2024-09-23T08:00:00'),
    progress: 65,
    currentStep: 'system_diagnostics',
    triggeredBy: 'schedule',
    parameters: { system_id: 'sys_002' }
  },
  {
    id: 'exec_003',
    workflowId: 'wf_harvest',
    workflowName: 'Harvest Management',
    status: 'pending',
    startTime: new Date('2024-09-25T09:00:00'),
    progress: 0,
    currentStep: 'assess_readiness',
    triggeredBy: 'ai_decision',
    parameters: { zone_id: 'zone_001_a', predicted_yield: 130 }
  }
];
