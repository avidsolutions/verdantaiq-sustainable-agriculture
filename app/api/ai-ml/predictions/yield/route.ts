

import { NextRequest, NextResponse } from 'next/server';

const generateYieldPredictions = (timeframe: string) => {
  const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const predictions = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Generate realistic yield prediction with seasonal variation
    const baseYield = 1200 + Math.sin(i * 0.1) * 200;
    const predicted = baseYield + (Math.random() - 0.5) * 100;
    const confidence_range = predicted * 0.15; // ±15% confidence interval
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(predicted),
      confidence_upper: Math.round(predicted + confidence_range),
      confidence_lower: Math.round(predicted - confidence_range),
      actual: i < 3 ? Math.round(predicted + (Math.random() - 0.5) * 50) : undefined // Only past days have actual data
    });
  }
  
  return predictions;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '7d';
    const systemId = url.searchParams.get('systemId');
    
    const yieldPredictions = generateYieldPredictions(timeframe);
    
    return NextResponse.json({
      success: true,
      data: yieldPredictions,
      metadata: {
        timeframe,
        systemId,
        model: 'Tomato Yield Predictor v2.1',
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching yield predictions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch yield predictions',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
