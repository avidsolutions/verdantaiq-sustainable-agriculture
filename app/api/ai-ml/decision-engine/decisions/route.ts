

import { NextRequest, NextResponse } from 'next/server';

const generateRecentDecisions = () => {
  const decisions = [
    {
      id: 'decision_001',
      rule_id: 'rule_001',
      rule_name: 'High Temperature Irrigation',
      decision: 'Activate irrigation for North Greenhouse Zone 2',
      action_taken: 'Irrigation system activated for 15 minutes',
      confidence: 92,
      data_inputs: {
        temperature: 82.3,
        soil_moisture: 35.2,
        humidity: 45.8,
        zone: 'North Greenhouse Zone 2'
      },
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      status: 'executed',
      result: 'Soil moisture increased to 52%. Plants showing improved hydration.'
    },
    {
      id: 'decision_002',
      rule_id: 'rule_003',
      rule_name: 'Climate Control Optimization',
      decision: 'Adjust climate controls for optimal growing conditions',
      action_taken: 'Increased misting frequency and adjusted ventilation',
      confidence: 87,
      data_inputs: {
        temperature: 78.1,
        humidity: 47.2,
        co2_level: 420,
        zone: 'South Production Area'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'executed',
      result: 'Humidity stabilized at 62%. Temperature maintained at 76°F.'
    },
    {
      id: 'decision_003',
      rule_id: 'rule_002',
      rule_name: 'Pest Alert Response',
      decision: 'High confidence pest detection requires immediate attention',
      action_taken: 'Alert sent to farm manager, IPM protocol initiated',
      confidence: 94,
      data_inputs: {
        pest_type: 'whiteflies',
        confidence: 94,
        affected_plants: 23,
        zone: 'East Greenhouse'
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      status: 'executed',
      result: 'Manager responded within 30 minutes. Treatment applied to affected area.'
    },
    {
      id: 'decision_004',
      rule_id: 'rule_004',
      rule_name: 'Harvest Timing Alert',
      decision: 'Optimal harvest window detected for tomatoes',
      action_taken: 'Harvest scheduling notification sent to operations team',
      confidence: 96,
      data_inputs: {
        maturity_level: 92,
        market_price: 4.25,
        price_trend: 'increasing',
        crop: 'tomatoes'
      },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      status: 'pending',
      result: 'Awaiting harvest team availability confirmation.'
    },
    {
      id: 'decision_005',
      rule_id: 'rule_001',
      rule_name: 'High Temperature Irrigation',
      decision: 'Emergency irrigation required due to extreme conditions',
      action_taken: 'Extended irrigation cycle activated',
      confidence: 98,
      data_inputs: {
        temperature: 89.5,
        soil_moisture: 28.1,
        heat_index: 95,
        zone: 'Outdoor Growing Area B'
      },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      status: 'failed',
      result: 'Irrigation system malfunction detected. Manual intervention required.'
    }
  ];

  return decisions;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const ruleId = url.searchParams.get('rule_id');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    let decisions = generateRecentDecisions();
    
    if (status) {
      decisions = decisions.filter(decision => decision.status === status);
    }
    
    if (ruleId) {
      decisions = decisions.filter(decision => decision.rule_id === ruleId);
    }
    
    // Sort by timestamp (most recent first) and limit results
    decisions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    decisions = decisions.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: decisions,
      metadata: {
        total: decisions.length,
        limit,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recent decisions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recent decisions',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
