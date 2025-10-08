

import { NextRequest, NextResponse } from 'next/server';

const generatePestRiskAssessment = () => {
  const pestTypes = [
    {
      pest_type: 'Aphids',
      risk_level: 'medium',
      probability: 67,
      peak_period: 'Next 5-7 days',
      affected_crops: ['Tomatoes', 'Lettuce', 'Peppers'],
      prevention_actions: [
        'Apply neem oil spray to vulnerable plants',
        'Introduce beneficial insects (ladybugs)',
        'Monitor daily for early signs',
        'Increase air circulation in greenhouse'
      ]
    },
    {
      pest_type: 'Spider Mites',
      risk_level: 'low',
      probability: 23,
      peak_period: '2-3 weeks',
      affected_crops: ['Cucumbers', 'Beans'],
      prevention_actions: [
        'Maintain optimal humidity levels (>50%)',
        'Regular misting of plant leaves',
        'Monitor for webbing signs'
      ]
    },
    {
      pest_type: 'Whiteflies',
      risk_level: 'high',
      probability: 84,
      peak_period: 'Within 48 hours',
      affected_crops: ['Tomatoes', 'Cucumbers', 'Eggplant'],
      prevention_actions: [
        'Deploy yellow sticky traps immediately',
        'Apply insecticidal soap treatment',
        'Isolate affected plants',
        'Increase ventilation in affected areas'
      ]
    },
    {
      pest_type: 'Thrips',
      risk_level: 'medium',
      probability: 45,
      peak_period: '1-2 weeks',
      affected_crops: ['Peppers', 'Tomatoes'],
      prevention_actions: [
        'Use blue sticky traps for monitoring',
        'Apply predatory mites if detected',
        'Remove weeds around growing areas'
      ]
    }
  ];

  return pestTypes;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '7d';
    const riskLevel = url.searchParams.get('risk_level');
    const crop = url.searchParams.get('crop');
    
    let pestRisks = generatePestRiskAssessment();
    
    if (riskLevel) {
      pestRisks = pestRisks.filter(pest => pest.risk_level === riskLevel);
    }
    
    if (crop) {
      pestRisks = pestRisks.filter(pest => 
        pest.affected_crops.some(affectedCrop => 
          affectedCrop.toLowerCase().includes(crop.toLowerCase())
        )
      );
    }
    
    // Sort by risk level and probability
    const riskOrder: Record<string, number> = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    pestRisks.sort((a, b) => {
      if (riskOrder[a.risk_level] !== riskOrder[b.risk_level]) {
        return riskOrder[b.risk_level] - riskOrder[a.risk_level];
      }
      return b.probability - a.probability;
    });
    
    return NextResponse.json({
      success: true,
      data: pestRisks,
      metadata: {
        timeframe,
        model: 'Pest Detection Classifier v1.8',
        lastUpdated: new Date().toISOString(),
        totalRisks: pestRisks.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching pest risk assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pest risk assessment',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
