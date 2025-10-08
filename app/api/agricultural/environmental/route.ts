
import { NextResponse } from 'next/server';
import { generateEnvironmentalData } from '@/lib/data/mock-data';
import { ApiResponse, EnvironmentalData } from '@/types/agricultural';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');
    const hours = parseInt(searchParams.get('hours') || '24');
    const zone = searchParams.get('zone');

    let data = generateEnvironmentalData(hours);

    // Filter by system if specified
    if (systemId) {
      data = data.filter(d => d.systemId === systemId);
    }

    // Filter by zone if specified
    if (zone) {
      data = data.filter(d => d.zone === zone);
    }

    const response: ApiResponse<EnvironmentalData[]> = {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch environmental data',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const environmentalData = await request.json();
    
    // In a real application, this would save to the database
    const newData: EnvironmentalData = {
      id: `env_${Date.now()}`,
      timestamp: new Date(),
      temperature: environmentalData.temperature,
      moisture: environmentalData.moisture,
      ph: environmentalData.ph,
      systemId: environmentalData.systemId,
      zone: environmentalData.zone,
      sensorId: environmentalData.sensorId
    };

    const response: ApiResponse<EnvironmentalData> = {
      success: true,
      data: newData,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to save environmental data',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
