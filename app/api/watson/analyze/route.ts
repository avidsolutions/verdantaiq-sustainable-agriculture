
import { NextResponse } from 'next/server';
import { watsonAI } from '@/lib/watson/watson-ai';
import { ApiResponse, WatsonAIAnalysis } from '@/types/agricultural';

export async function POST(request: Request) {
  try {
    const { environmentalData, analysisType } = await request.json();

    let result;

    switch (analysisType) {
      case 'environmental':
        result = await watsonAI.analyzeEnvironmentalData(environmentalData);
        break;
      case 'yield_prediction':
        result = await watsonAI.predictYield(environmentalData.historical, environmentalData.current);
        break;
      case 'document_processing':
        result = await watsonAI.processDocuments(environmentalData.documents);
        break;
      default:
        result = await watsonAI.analyzeEnvironmentalData(environmentalData);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Watson AI analysis error:', error);
    
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to perform Watson AI analysis',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
