import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const cropType = searchParams.get('cropType') || 'mixed';

    // Generate pest risk assessment data
    // In production, this would use watsonx.ai models trained on pest data, weather patterns, and crop conditions
    const pestRisks = generatePestRiskAssessment(timeframe, cropType);

    return NextResponse.json({
      success: true,
      data: pestRisks,
      metadata: {
        timeframe,
        cropType,
        generated_at: new Date().toISOString(),
        model: 'watsonx.ai_pest_predictor'
      }
    });

  } catch (error) {
    console.error('Pest risk prediction API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Pest risk prediction failed'
    }, { status: 500 });
  }
}

function generatePestRiskAssessment(timeframe: string, cropType: string) {
  const commonPests = [
    {
      pest_type: 'Aphids',
      base_risk: 0.3,
      affected_crops: ['lettuce', 'tomatoes', 'peppers', 'herbs'],
      prevention_actions: [
        'Introduce beneficial insects like ladybugs',
        'Use reflective mulch to deter aphids',
        'Apply neem oil spray as preventive measure',
        'Monitor plants daily for early detection'
      ]
    },
    {
      pest_type: 'Spider Mites',
      base_risk: 0.25,
      affected_crops: ['tomatoes', 'peppers', 'cucumbers', 'beans'],
      prevention_actions: [
        'Maintain adequate humidity levels (>50%)',
        'Ensure proper air circulation',
        'Use predatory mites as biological control',
        'Avoid over-fertilizing with nitrogen'
      ]
    },
    {
      pest_type: 'Whiteflies',
      base_risk: 0.2,
      affected_crops: ['tomatoes', 'peppers', 'eggplant', 'herbs'],
      prevention_actions: [
        'Install yellow sticky traps',
        'Use reflective mulch',
        'Introduce parasitic wasps',
        'Remove infected plant material promptly'
      ]
    },
    {
      pest_type: 'Thrips',
      base_risk: 0.15,
      affected_crops: ['lettuce', 'onions', 'peppers', 'flowers'],
      prevention_actions: [
        'Use blue sticky traps for monitoring',
        'Maintain clean growing environment',
        'Apply beneficial nematodes to soil',
        'Use row covers during vulnerable periods'
      ]
    },
    {
      pest_type: 'Fungus Gnats',
      base_risk: 0.35,
      affected_crops: ['all_seedlings', 'herbs', 'leafy_greens'],
      prevention_actions: [
        'Allow soil surface to dry between waterings',
        'Use yellow sticky traps near soil level',
        'Apply beneficial bacteria (BTI) to growing medium',
        'Improve drainage and air circulation'
      ]
    }
  ];

  return commonPests.map(pest => {
    // Adjust risk based on timeframe and season
    const seasonalFactor = getSeasonalRiskFactor(pest.pest_type);
    const timeframeFactor = getTimeframeRiskFactor(timeframe);
    const cropFactor = pest.affected_crops.includes(cropType) ? 1.2 : 0.8;
    
    const adjustedRisk = Math.min(0.95, pest.base_risk * seasonalFactor * timeframeFactor * cropFactor);
    const probability = Math.round(adjustedRisk * 100);
    
    let risk_level: 'low' | 'medium' | 'high' | 'critical';
    if (probability >= 80) risk_level = 'critical';
    else if (probability >= 60) risk_level = 'high';
    else if (probability >= 30) risk_level = 'medium';
    else risk_level = 'low';

    return {
      pest_type: pest.pest_type,
      risk_level,
      probability,
      peak_period: getPeakPeriod(pest.pest_type, timeframe),
      affected_crops: pest.affected_crops,
      prevention_actions: pest.prevention_actions
    };
  }).filter(pest => pest.probability > 10); // Only show pests with >10% probability
}

function getSeasonalRiskFactor(pestType: string): number {
  const month = new Date().getMonth() + 1; // 1-12
  
  // Different pests have different seasonal patterns
  switch (pestType) {
    case 'Aphids':
      return month >= 4 && month <= 9 ? 1.3 : 0.7; // Higher in spring/summer
    case 'Spider Mites':
      return month >= 6 && month <= 8 ? 1.5 : 0.8; // Peak in hot summer months
    case 'Whiteflies':
      return month >= 5 && month <= 10 ? 1.2 : 0.6; // Warm weather pests
    case 'Thrips':
      return month >= 3 && month <= 10 ? 1.1 : 0.7; // Active in growing season
    case 'Fungus Gnats':
      return month >= 10 || month <= 3 ? 1.4 : 0.9; // Higher in cooler, humid months
    default:
      return 1.0;
  }
}

function getTimeframeRiskFactor(timeframe: string): number {
  // Longer timeframes have higher cumulative risk
  switch (timeframe) {
    case '24h': return 0.3;
    case '7d': return 0.7;
    case '30d': return 1.0;
    case '90d': return 1.3;
    default: return 1.0;
  }
}

function getPeakPeriod(pestType: string, timeframe: string): string {
  const currentDate = new Date();
  const endDate = new Date(currentDate);
  
  switch (timeframe) {
    case '24h':
      endDate.setDate(endDate.getDate() + 1);
      break;
    case '7d':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case '30d':
      endDate.setDate(endDate.getDate() + 30);
      break;
    case '90d':
      endDate.setDate(endDate.getDate() + 90);
      break;
  }

  // Simulate peak periods based on pest behavior
  const peakStart = new Date(currentDate);
  peakStart.setDate(peakStart.getDate() + Math.floor(Math.random() * 7));
  
  const peakEnd = new Date(peakStart);
  peakEnd.setDate(peakEnd.getDate() + Math.floor(Math.random() * 5) + 2);

  return `${peakStart.toLocaleDateString()} - ${peakEnd.toLocaleDateString()}`;
}
