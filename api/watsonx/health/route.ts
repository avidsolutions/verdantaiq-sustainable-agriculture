import { NextRequest, NextResponse } from 'next/server';
import { watsonXIntegration } from '@/lib/watson/watsonx-integration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId') || 'default_farm';

    // Initialize watsonx integration
    await watsonXIntegration.initialize();

    // Mock comprehensive system data for health assessment
    const systemData = {
      farmId,
      sensors: [
        {
          deviceId: 'temp_sensor_01',
          type: 'temperature',
          location: 'greenhouse_1',
          readings: [
            { timestamp: new Date().toISOString(), value: 72, quality_score: 95 },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 71, quality_score: 92 },
            { timestamp: new Date(Date.now() - 7200000).toISOString(), value: 73, quality_score: 94 }
          ]
        },
        {
          deviceId: 'moisture_sensor_01',
          type: 'moisture',
          location: 'greenhouse_1',
          readings: [
            { timestamp: new Date().toISOString(), value: 65, quality_score: 88 },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 67, quality_score: 90 },
            { timestamp: new Date(Date.now() - 7200000).toISOString(), value: 64, quality_score: 89 }
          ]
        },
        {
          deviceId: 'ph_sensor_01',
          type: 'ph',
          location: 'greenhouse_1',
          readings: [
            { timestamp: new Date().toISOString(), value: 6.8, quality_score: 94 },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 6.7, quality_score: 96 },
            { timestamp: new Date(Date.now() - 7200000).toISOString(), value: 6.9, quality_score: 93 }
          ]
        },
        {
          deviceId: 'humidity_sensor_01',
          type: 'humidity',
          location: 'greenhouse_1',
          readings: [
            { timestamp: new Date().toISOString(), value: 75, quality_score: 91 },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 73, quality_score: 93 },
            { timestamp: new Date(Date.now() - 7200000).toISOString(), value: 76, quality_score: 90 }
          ]
        }
      ],
      environmental: {
        temperature: 72,
        moisture: 65,
        ph: 6.8,
        humidity: 75,
        co2: 400,
        lightLevel: 85
      },
      equipment: [
        {
          id: 'pump_01',
          type: 'irrigation_pump',
          status: 'online' as const,
          lastMaintenance: '2024-09-15',
          performanceMetrics: { 
            efficiency: 92, 
            runtime_hours: 1250,
            power_consumption: 85,
            vibration_level: 'normal'
          }
        },
        {
          id: 'fan_01',
          type: 'ventilation_fan',
          status: 'online' as const,
          lastMaintenance: '2024-09-20',
          performanceMetrics: { 
            efficiency: 88, 
            runtime_hours: 2100,
            power_consumption: 120,
            vibration_level: 'normal'
          }
        },
        {
          id: 'heater_01',
          type: 'heating_system',
          status: 'maintenance' as const,
          lastMaintenance: '2024-08-10',
          performanceMetrics: { 
            efficiency: 75, 
            runtime_hours: 850,
            power_consumption: 200,
            vibration_level: 'elevated'
          }
        },
        {
          id: 'light_01',
          type: 'led_grow_lights',
          status: 'online' as const,
          lastMaintenance: '2024-09-25',
          performanceMetrics: { 
            efficiency: 95, 
            runtime_hours: 3200,
            power_consumption: 150,
            light_output: 'optimal'
          }
        }
      ],
      crops: [
        {
          type: 'lettuce',
          stage: 'mature',
          health: 85,
          expectedHarvest: '2024-10-15'
        },
        {
          type: 'tomatoes',
          stage: 'flowering',
          health: 92,
          expectedHarvest: '2024-11-01'
        },
        {
          type: 'herbs',
          stage: 'growing',
          health: 88,
          expectedHarvest: '2024-10-20'
        },
        {
          type: 'peppers',
          stage: 'fruiting',
          health: 90,
          expectedHarvest: '2024-10-25'
        }
      ],
      alerts: [
        {
          id: 'alert_01',
          type: 'temperature_high',
          severity: 'medium' as const,
          message: 'Temperature approaching upper threshold in greenhouse_1',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: false
        },
        {
          id: 'alert_02',
          type: 'equipment_maintenance',
          severity: 'high' as const,
          message: 'Heating system requires scheduled maintenance',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: false
        },
        {
          id: 'alert_03',
          type: 'moisture_low',
          severity: 'low' as const,
          message: 'Soil moisture slightly below optimal range',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          resolved: true
        }
      ]
    };

    // Get comprehensive system health report
    const healthReport = await watsonXIntegration.getSystemHealthReport(systemData);

    if (!healthReport.success) {
      return NextResponse.json({
        success: false,
        error: healthReport.error || 'Failed to generate system health report'
      }, { status: 500 });
    }

    // Add additional health metrics
    const enhancedReport = {
      ...healthReport.data,
      system_metrics: {
        total_sensors: systemData.sensors.length,
        active_sensors: systemData.sensors.filter(s => s.readings.length > 0).length,
        total_equipment: systemData.equipment.length,
        online_equipment: systemData.equipment.filter(e => e.status === 'online').length,
        total_crops: systemData.crops.length,
        healthy_crops: systemData.crops.filter(c => c.health >= 80).length,
        active_alerts: systemData.alerts.filter(a => !a.resolved).length,
        critical_alerts: systemData.alerts.filter(a => !a.resolved && a.severity === 'high').length
      },
      performance_summary: {
        overall_efficiency: calculateOverallEfficiency(systemData),
        environmental_stability: calculateEnvironmentalStability(systemData),
        equipment_reliability: calculateEquipmentReliability(systemData),
        crop_health_average: calculateAverageCropHealth(systemData)
      },
      recommendations_priority: prioritizeRecommendations(healthReport.data, systemData),
      next_actions: generateNextActions(systemData)
    };

    return NextResponse.json({
      success: true,
      data: enhancedReport,
      insights: healthReport.insights,
      recommendations: healthReport.recommendations,
      workflows: healthReport.workflows,
      confidence: healthReport.confidence,
      metadata: {
        farmId,
        assessment_time: new Date().toISOString(),
        data_quality: calculateDataQuality(systemData),
        system_uptime: calculateSystemUptime(systemData)
      }
    });

  } catch (error) {
    console.error('Watsonx health assessment API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Health assessment failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, parameters } = body;

    // Initialize watsonx integration
    await watsonXIntegration.initialize();

    let result;
    switch (action) {
      case 'trigger_workflow':
        // Trigger specific workflow based on parameters
        result = await triggerWorkflow(parameters);
        break;
      case 'optimize_system':
        // Run system optimization
        result = await optimizeSystem(parameters);
        break;
      case 'emergency_response':
        // Handle emergency situations
        result = await handleEmergency(parameters);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action specified'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      action_performed: action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Watsonx health action API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Action execution failed'
    }, { status: 500 });
  }
}

function calculateOverallEfficiency(systemData: any): number {
  const equipmentEfficiencies = systemData.equipment
    .filter((e: any) => e.status === 'online')
    .map((e: any) => e.performanceMetrics.efficiency || 0);
  
  if (equipmentEfficiencies.length === 0) return 0;
  
  return Math.round(equipmentEfficiencies.reduce((sum: number, eff: number) => sum + eff, 0) / equipmentEfficiencies.length);
}

function calculateEnvironmentalStability(systemData: any): number {
  const { environmental } = systemData;
  
  // Check if environmental parameters are within optimal ranges
  const tempStable = environmental.temperature >= 65 && environmental.temperature <= 75;
  const moistureStable = environmental.moisture >= 60 && environmental.moisture <= 70;
  const phStable = environmental.ph >= 6.0 && environmental.ph <= 7.0;
  const humidityStable = environmental.humidity >= 50 && environmental.humidity <= 80;
  
  const stableCount = [tempStable, moistureStable, phStable, humidityStable].filter(Boolean).length;
  return Math.round((stableCount / 4) * 100);
}

function calculateEquipmentReliability(systemData: any): number {
  const onlineCount = systemData.equipment.filter((e: any) => e.status === 'online').length;
  const totalCount = systemData.equipment.length;
  
  return Math.round((onlineCount / totalCount) * 100);
}

function calculateAverageCropHealth(systemData: any): number {
  if (systemData.crops.length === 0) return 0;
  
  const totalHealth = systemData.crops.reduce((sum: number, crop: any) => sum + crop.health, 0);
  return Math.round(totalHealth / systemData.crops.length);
}

function calculateDataQuality(systemData: any): number {
  const allReadings = systemData.sensors.flatMap((s: any) => s.readings);
  if (allReadings.length === 0) return 0;
  
  const totalQuality = allReadings.reduce((sum: number, reading: any) => sum + (reading.quality_score || 0), 0);
  return Math.round(totalQuality / allReadings.length);
}

function calculateSystemUptime(systemData: any): number {
  // Mock uptime calculation - in production this would be based on actual system logs
  const onlineEquipment = systemData.equipment.filter((e: any) => e.status === 'online').length;
  const totalEquipment = systemData.equipment.length;
  
  return Math.round((onlineEquipment / totalEquipment) * 100);
}

function prioritizeRecommendations(healthData: any, systemData: any): string[] {
  const priorities = [];
  
  // Critical alerts first
  const criticalAlerts = systemData.alerts.filter((a: any) => !a.resolved && a.severity === 'critical');
  if (criticalAlerts.length > 0) {
    priorities.push('Address critical system alerts immediately');
  }
  
  // Equipment maintenance
  const maintenanceNeeded = systemData.equipment.filter((e: any) => e.status === 'maintenance');
  if (maintenanceNeeded.length > 0) {
    priorities.push('Schedule maintenance for offline equipment');
  }
  
  // Environmental issues
  if (healthData.environmental_status === 'needs_attention') {
    priorities.push('Optimize environmental control settings');
  }
  
  // Crop health
  const unhealthyCrops = systemData.crops.filter((c: any) => c.health < 80);
  if (unhealthyCrops.length > 0) {
    priorities.push('Monitor and improve crop health conditions');
  }
  
  return priorities;
}

function generateNextActions(systemData: any): string[] {
  const actions = [];
  
  // Based on current system state
  const activeAlerts = systemData.alerts.filter((a: any) => !a.resolved);
  if (activeAlerts.length > 0) {
    actions.push('Review and resolve active system alerts');
  }
  
  // Equipment checks
  const oldMaintenance = systemData.equipment.filter((e: any) => {
    const lastMaintenance = new Date(e.lastMaintenance);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return lastMaintenance < thirtyDaysAgo;
  });
  
  if (oldMaintenance.length > 0) {
    actions.push('Schedule preventive maintenance for aging equipment');
  }
  
  // Harvest planning
  const nearHarvest = systemData.crops.filter((c: any) => {
    const harvestDate = new Date(c.expectedHarvest);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return harvestDate <= sevenDaysFromNow;
  });
  
  if (nearHarvest.length > 0) {
    actions.push('Prepare for upcoming harvest activities');
  }
  
  // System optimization
  actions.push('Run daily system optimization routines');
  actions.push('Update sensor calibration schedules');
  
  return actions;
}

async function triggerWorkflow(parameters: any) {
  // Mock workflow triggering - in production this would use the actual workflow system
  return {
    workflow_id: parameters.workflow_name || 'unknown',
    status: 'triggered',
    estimated_completion: '15 minutes',
    message: `Workflow ${parameters.workflow_name} has been initiated`
  };
}

async function optimizeSystem(parameters: any) {
  // Mock system optimization - in production this would run actual optimization algorithms
  return {
    optimization_type: parameters.type || 'general',
    improvements_found: Math.floor(Math.random() * 5) + 1,
    estimated_savings: `${Math.floor(Math.random() * 15) + 5}% efficiency improvement`,
    message: 'System optimization completed successfully'
  };
}

async function handleEmergency(parameters: any) {
  // Mock emergency response - in production this would trigger actual emergency protocols
  return {
    emergency_type: parameters.type || 'unknown',
    response_initiated: true,
    protocols_activated: ['alert_notifications', 'system_safeguards', 'emergency_contacts'],
    message: 'Emergency response protocols have been activated'
  };
}
