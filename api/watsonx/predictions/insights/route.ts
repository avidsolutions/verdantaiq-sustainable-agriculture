import { NextRequest, NextResponse } from 'next/server';
import { watsonXIntegration } from '@/lib/watson/watsonx-integration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const farmId = searchParams.get('farmId') || 'default_farm';

    // Initialize watsonx integration if not already done
    await watsonXIntegration.initialize();

    // Mock system data for demonstration - in production this would come from VerdantaIQ database
    const mockSystemData = {
      farmId,
      sensors: [
        {
          deviceId: 'temp_sensor_01',
          type: 'temperature',
          location: 'greenhouse_1',
          readings: [
            { timestamp: new Date().toISOString(), value: 72, quality_score: 95 },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 71, quality_score: 92 }
          ]
        },
        {
          deviceId: 'moisture_sensor_01',
          type: 'moisture',
          location: 'greenhouse_1',
          readings: [
            { timestamp: new Date().toISOString(), value: 65, quality_score: 88 },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 67, quality_score: 90 }
          ]
        },
        {
          deviceId: 'ph_sensor_01',
          type: 'ph',
          location: 'greenhouse_1',
          readings: [
            { timestamp: new Date().toISOString(), value: 6.8, quality_score: 94 },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 6.7, quality_score: 96 }
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
          performanceMetrics: { efficiency: 92, runtime_hours: 1250 }
        },
        {
          id: 'fan_01',
          type: 'ventilation_fan',
          status: 'online' as const,
          lastMaintenance: '2024-09-20',
          performanceMetrics: { efficiency: 88, runtime_hours: 2100 }
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
        }
      ],
      alerts: [
        {
          id: 'alert_01',
          type: 'temperature_high',
          severity: 'medium' as const,
          message: 'Temperature approaching upper threshold',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: false
        }
      ]
    };

    // Process agricultural data through watsonx
    const result = await watsonXIntegration.processAgriculturalData(mockSystemData);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to process agricultural data'
      }, { status: 500 });
    }

    // Transform the result for the frontend
    const insights = result.insights?.map((insight, index) => ({
      id: `watsonx_insight_${index}`,
      type: 'environmental' as const,
      title: insight,
      prediction: result.data,
      confidence: result.confidence || 75,
      timeframe,
      impact: result.recommendations && result.recommendations.length > 0 ? 'high' as const : 'medium' as const,
      recommendation: result.recommendations?.[index] || insight,
      modelUsed: 'watsonx.ai',
      timestamp: new Date()
    })) || [];

    return NextResponse.json({
      success: true,
      data: insights,
      metadata: {
        timeframe,
        farmId,
        processed_at: new Date().toISOString(),
        confidence: result.confidence,
        workflows_triggered: result.workflows
      }
    });

  } catch (error) {
    console.error('Watsonx insights API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, systemData } = body;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    // Initialize watsonx integration
    await watsonXIntegration.initialize();

    // Handle natural language query
    const result = await watsonXIntegration.handleNaturalLanguageQuery(query, systemData);

    return NextResponse.json({
      success: result.success,
      data: result.data,
      insights: result.insights,
      recommendations: result.recommendations,
      workflows: result.workflows,
      confidence: result.confidence,
      error: result.error
    });

  } catch (error) {
    console.error('Watsonx query API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Query processing failed'
    }, { status: 500 });
  }
}
