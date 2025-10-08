

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, enabled } = body;

    if (!ruleId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: ruleId (string), enabled (boolean)',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // In real implementation, you would:
    // 1. Validate user permissions
    // 2. Update rule status in database
    // 3. Notify decision engine of rule change
    // 4. Log the configuration change

    return NextResponse.json({
      success: true,
      data: {
        ruleId,
        enabled,
        updatedAt: new Date().toISOString()
      },
      message: `Rule ${enabled ? 'enabled' : 'disabled'} successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling decision rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to toggle decision rule',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
