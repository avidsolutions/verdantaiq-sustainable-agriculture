import { NextRequest, NextResponse } from 'next/server';
import { watsonXIntegration } from '@/lib/watson/watsonx-integration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const farmId = searchParams.get('farmId') || 'default_farm';
    const cropType = searchParams.get('cropType') || 'mixed';

    // Initialize watsonx integration
    await watsonXIntegration.initialize();

    // Get yield optimization predictions
    const result = await watsonXIntegration.optimizeYieldPrediction(farmId, cropType);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate yield predictions'
      }, { status: 500 });
    }

    // Generate time-series yield prediction data
    const yieldData = generateYieldTimeSeriesData(timeframe, result.data);

    return NextResponse.json({
      success: true,
      data: yieldData,
      metadata: {
        timeframe,
        farmId,
        cropType,
        processed_at: new Date().toISOString(),
        confidence: result.confidence,
        insights: result.insights,
        recommendations: result.recommendations
      }
    });

  } catch (error) {
    console.error('Watsonx yield prediction API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Yield prediction failed'
    }, { status: 500 });
  }
}

function generateYieldTimeSeriesData(timeframe: string, watsonxData: any) {
  const days = getTimeframeDays(timeframe);
  const baseYield = watsonxData?.yieldAnalytics?.yieldProjection?.projected || 100;
  const confidence = watsonxData?.yieldAnalytics?.yieldProjection?.confidence || 0.8;
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Simulate yield growth over time with some variance
    const growthFactor = 1 + (i / days) * 0.3; // 30% growth over the timeframe
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    
    const predicted = baseYield * growthFactor * (1 + variance);
    const confidenceRange = predicted * (1 - confidence) * 0.5;
    
    return {
      date: date.toLocaleDateString(),
      predicted: Math.round(predicted * 100) / 100,
      confidence_upper: Math.round((predicted + confidenceRange) * 100) / 100,
      confidence_lower: Math.round((predicted - confidenceRange) * 100) / 100,
      actual: i < 3 ? Math.round((predicted * 0.95 + Math.random() * predicted * 0.1) * 100) / 100 : undefined
    };
  });
}

function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case '24h': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 7;
  }
}
