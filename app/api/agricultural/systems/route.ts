
import { NextResponse } from 'next/server';
import { mockSystems, generateEnvironmentalData, generatePerformanceMetrics } from '@/lib/data/mock-data';
import { ApiResponse, VermicultureSystem } from '@/types/agricultural';

export async function GET() {
  try {
    const systems = mockSystems.map(system => ({
      ...system,
      currentEnvironmentalData: generateEnvironmentalData(1)[0], // Latest data point
      recentPerformance: generatePerformanceMetrics(1)[0] // Latest performance
    }));

    const response: ApiResponse<VermicultureSystem[]> = {
      success: true,
      data: systems,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch systems data',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const systemData = await request.json();
    
    // In a real application, this would save to the database
    const newSystem: VermicultureSystem = {
      id: `sys_${Date.now()}`,
      name: systemData.name,
      location: systemData.location,
      capacity: systemData.capacity,
      currentLoad: 0,
      status: 'active',
      lastMaintenance: new Date(),
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      yieldToDate: 0,
      efficiency: 100,
      zones: []
    };

    const response: ApiResponse<VermicultureSystem> = {
      success: true,
      data: newSystem,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to create system',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
