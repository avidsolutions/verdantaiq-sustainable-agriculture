

import { NextRequest, NextResponse } from 'next/server';

// Mock predictive insights data
const generateMockInsights = (timeframe: string) => {
  const insights = [
    {
      id: 'insight_001',
      type: 'yield',
      title: 'Expected 23% Yield Increase',
      prediction: { increase: 23, confidence: 89 },
      confidence: 89,
      timeframe: '30d',
      impact: 'high',
      recommendation: 'Optimal growing conditions detected. Consider increasing harvesting capacity.',
      modelUsed: 'Tomato Yield Predictor v2.1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'insight_002',
      type: 'pest',
      title: 'Aphid Risk Alert',
      prediction: { risk_level: 'medium', probability: 67 },
      confidence: 82,
      timeframe: '7d',
      impact: 'medium',
      recommendation: 'Deploy preventive treatment in North greenhouse within 48 hours.',
      modelUsed: 'Pest Detection Classifier v1.8',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 'insight_003',
      type: 'irrigation',
      title: 'Water Optimization Available',
      prediction: { water_savings: 18, efficiency_gain: 12 },
      confidence: 94,
      timeframe: '24h',
      impact: 'medium',
      recommendation: 'Adjust irrigation schedule to reduce water usage by 18% while maintaining yield.',
      modelUsed: 'Water Optimization AI v3.2',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'insight_004',
      type: 'market_price',
      title: 'Price Surge Expected',
      prediction: { price_increase: 15, optimal_harvest: '2024-10-05' },
      confidence: 76,
      timeframe: '90d',
      impact: 'high',
      recommendation: 'Delay harvest by 3 days to capture 15% price premium.',
      modelUsed: 'Market Analysis AI v2.0',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 'insight_005',
      type: 'weather',
      title: 'Storm System Approaching',
      prediction: { precipitation: 2.5, wind_speed: 45, severity: 'moderate' },
      confidence: 91,
      timeframe: '24h',
      impact: 'high',
      recommendation: 'Activate greenhouse protection systems and secure outdoor equipment.',
      modelUsed: 'Weather Prediction Model v4.1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  // Filter by timeframe if specified
  const timeframeHours: Record<string, number> = {
    '24h': 24,
    '7d': 168,
    '30d': 720,
    '90d': 2160
  };

  if (timeframe && timeframeHours[timeframe]) {
    const cutoff = Date.now() - (timeframeHours[timeframe] * 60 * 60 * 1000);
    return insights.filter(insight => new Date(insight.timestamp).getTime() > cutoff);
  }

  return insights;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '7d';
    const type = url.searchParams.get('type');
    const impact = url.searchParams.get('impact');

    let insights = generateMockInsights(timeframe);

    if (type) {
      insights = insights.filter(insight => insight.type === type);
    }

    if (impact) {
      insights = insights.filter(insight => insight.impact === impact);
    }

    // Sort by confidence and timestamp
    insights.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching predictive insights:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch predictive insights',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
