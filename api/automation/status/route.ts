/**
 * VerdantaIQ Production Automation Status API
 * Provides status and control for the automation system
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock automation service for demonstration
const mockAutomationService = {
  isRunning: true,
  
  getAutomationStatus() {
    return {
      isRunning: this.isRunning,
      totalRules: 5,
      enabledRules: 4,
      activeAlerts: 2,
      lastCycle: new Date()
    };
  },

  getActiveAlerts() {
    return [
      {
        id: 'alert_001',
        type: 'environmental',
        severity: 'medium',
        title: 'Temperature Above Optimal Range',
        message: 'Greenhouse temperature has exceeded 80°F for the past 30 minutes',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        source: 'temperature-sensor-01',
        acknowledged: false,
        resolved: false,
        actions: ['Increase ventilation', 'Check cooling system']
      },
      {
        id: 'alert_002',
        type: 'equipment',
        severity: 'low',
        title: 'Maintenance Due',
        message: 'Irrigation pump scheduled for maintenance within 7 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        source: 'maintenance-scheduler',
        acknowledged: true,
        resolved: false,
        actions: ['Schedule maintenance', 'Order replacement parts']
      }
    ];
  },

  async startAutomation() {
    this.isRunning = true;
    return { message: 'Automation system started', status: this.getAutomationStatus() };
  },

  stopAutomation() {
    this.isRunning = false;
    return { message: 'Automation system stopped', status: this.getAutomationStatus() };
  },

  acknowledgeAlert(alertId: string) {
    // In a real implementation, this would update the alert in the database
    console.log(`Alert ${alertId} acknowledged`);
    return true;
  },

  resolveAlert(alertId: string) {
    // In a real implementation, this would update the alert in the database
    console.log(`Alert ${alertId} resolved`);
    return true;
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    let data;

    switch (action) {
      case 'status':
        data = {
          automation: mockAutomationService.getAutomationStatus(),
          alerts: {
            active: mockAutomationService.getActiveAlerts(),
            summary: getAlertsSummary(mockAutomationService.getActiveAlerts())
          }
        };
        break;

      case 'alerts':
        data = {
          alerts: mockAutomationService.getActiveAlerts(),
          summary: getAlertsSummary(mockAutomationService.getActiveAlerts())
        };
        break;

      case 'start':
        data = await mockAutomationService.startAutomation();
        break;

      case 'stop':
        data = mockAutomationService.stopAutomation();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: status, alerts, start, stop' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Automation status API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get automation status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId } = body;

    let result;

    switch (action) {
      case 'acknowledge_alert':
        if (!alertId) {
          return NextResponse.json(
            { error: 'alertId is required for acknowledge_alert action' },
            { status: 400 }
          );
        }
        result = mockAutomationService.acknowledgeAlert(alertId);
        break;

      case 'resolve_alert':
        if (!alertId) {
          return NextResponse.json(
            { error: 'alertId is required for resolve_alert action' },
            { status: 400 }
          );
        }
        result = mockAutomationService.resolveAlert(alertId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: acknowledge_alert, resolve_alert' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      action,
      message: result ? 'Action completed successfully' : 'Action failed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Automation POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process automation action',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function getAlertsSummary(alerts: any[]) {
  const summary = {
    total: alerts.length,
    by_severity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    by_type: {
      environmental: 0,
      equipment: 0,
      crop: 0,
      market: 0,
      weather: 0
    },
    unacknowledged: 0,
    unresolved: 0
  };

  alerts.forEach(alert => {
    const severity = alert.severity as keyof typeof summary.by_severity;
    const type = alert.type as keyof typeof summary.by_type;

    if (severity in summary.by_severity) {
      summary.by_severity[severity]++;
    }
    if (type in summary.by_type) {
      summary.by_type[type]++;
    }
    if (!alert.acknowledged) summary.unacknowledged++;
    if (!alert.resolved) summary.unresolved++;
  });

  return summary;
}
