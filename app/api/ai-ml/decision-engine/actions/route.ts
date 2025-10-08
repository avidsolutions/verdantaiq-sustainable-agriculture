

import { NextRequest, NextResponse } from 'next/server';

const generatePendingActions = () => {
  const actions = [
    {
      id: 'action_001',
      type: 'irrigation',
      description: 'Emergency irrigation activation for heat stress prevention',
      parameters: {
        zones: ['North Greenhouse Zone 1', 'North Greenhouse Zone 2'],
        duration: 20, // minutes
        intensity: 'high',
        trigger_temp: 85
      },
      estimated_impact: 'Prevent heat stress on 150+ plants, improve yield by ~8%',
      safety_checks: [
        'Water pressure within normal limits',
        'No electrical hazards detected',
        'Drainage systems functioning properly',
        'No conflicting operations scheduled'
      ],
      requires_approval: true
    },
    {
      id: 'action_002',
      type: 'climate_control',
      description: 'Automated ventilation adjustment for CO₂ optimization',
      parameters: {
        fan_speed_increase: 25, // percent
        duration: 45, // minutes
        target_co2: 800, // ppm
        affected_zones: ['South Production Area']
      },
      estimated_impact: 'Optimize CO₂ levels for photosynthesis, increase growth rate by 12%',
      safety_checks: [
        'Fans operational and within safe RPM range',
        'No maintenance scheduled for ventilation systems',
        'Temperature differential acceptable',
        'Air quality sensors functioning'
      ],
      requires_approval: false
    },
    {
      id: 'action_003',
      type: 'nutrition',
      description: 'Automated nutrient solution adjustment for pH correction',
      parameters: {
        ph_target: 6.2,
        nutrient_adjustment: {
          'nitrogen': '+50ppm',
          'phosphorus': '+10ppm',
          'potassium': 'maintain'
        },
        affected_systems: ['Hydroponic System A', 'Hydroponic System B']
      },
      estimated_impact: 'Correct pH imbalance, improve nutrient uptake efficiency by 15%',
      safety_checks: [
        'Nutrient concentrations within safe ranges',
        'pH adjustment chemicals available',
        'Mixing systems operational',
        'No plant sensitivity alerts'
      ],
      requires_approval: true
    }
  ];

  return actions;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const requiresApproval = url.searchParams.get('requires_approval');
    
    let actions = generatePendingActions();
    
    if (type) {
      actions = actions.filter(action => action.type === type);
    }
    
    if (requiresApproval !== null) {
      const needsApproval = requiresApproval === 'true';
      actions = actions.filter(action => action.requires_approval === needsApproval);
    }
    
    return NextResponse.json({
      success: true,
      data: actions,
      metadata: {
        total: actions.length,
        pending_approval: actions.filter(a => a.requires_approval).length,
        auto_executable: actions.filter(a => !a.requires_approval).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching pending actions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending actions',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
