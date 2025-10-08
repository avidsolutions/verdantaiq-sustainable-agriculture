

import { NextRequest, NextResponse } from 'next/server';

const mockDecisionRules = [
  {
    id: 'rule_001',
    name: 'High Temperature Irrigation',
    category: 'irrigation',
    condition: 'Temperature > 80°F AND Soil Moisture < 40%',
    action: 'Activate irrigation system for 15 minutes',
    priority: 'high',
    enabled: true,
    confidence_threshold: 85,
    last_triggered: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    trigger_count: 23
  },
  {
    id: 'rule_002',
    name: 'Pest Alert Response',
    category: 'pest_control',
    condition: 'Pest Detection Confidence > 80% AND Risk Level = HIGH',
    action: 'Send alert to farm manager and activate IPM protocol',
    priority: 'critical',
    enabled: true,
    confidence_threshold: 80,
    last_triggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    trigger_count: 7
  },
  {
    id: 'rule_003',
    name: 'Climate Control Optimization',
    category: 'climate',
    condition: 'Humidity < 50% AND Temperature > 75°F',
    action: 'Increase misting system and adjust ventilation',
    priority: 'medium',
    enabled: true,
    confidence_threshold: 75,
    last_triggered: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    trigger_count: 45
  },
  {
    id: 'rule_004',
    name: 'Harvest Timing Alert',
    category: 'harvesting',
    condition: 'Yield Maturity > 90% AND Market Price Favorable',
    action: 'Schedule harvest within 24-48 hours',
    priority: 'high',
    enabled: true,
    confidence_threshold: 90,
    last_triggered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    trigger_count: 12
  },
  {
    id: 'rule_005',
    name: 'Nutrient Deficiency Response',
    category: 'nutrition',
    condition: 'pH < 6.0 OR Nitrogen Level < 150ppm',
    action: 'Adjust nutrient solution and schedule soil amendment',
    priority: 'medium',
    enabled: false, // Disabled for maintenance
    confidence_threshold: 70,
    trigger_count: 8
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const enabled = url.searchParams.get('enabled');
    
    let rules = mockDecisionRules;
    
    if (category) {
      rules = rules.filter(rule => rule.category === category);
    }
    
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      rules = rules.filter(rule => rule.enabled === isEnabled);
    }
    
    return NextResponse.json({
      success: true,
      data: rules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching decision rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch decision rules',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
