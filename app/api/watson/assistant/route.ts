
import { NextResponse } from 'next/server';
import { watsonAssistant } from '@/lib/watson/watson-assistant';
import { ApiResponse } from '@/types/agricultural';

export async function POST(request: Request) {
  try {
    const { action, userId, message, context, queryType, ...params } = await request.json();

    let result;

    switch (action) {
      case 'send_message':
        result = await watsonAssistant.sendMessage(userId, message, context);
        break;
      case 'agricultural_query':
        result = await watsonAssistant.handleAgriculturalQuery(message, params.systemData);
        break;
      case 'maintenance_guidance':
        result = await watsonAssistant.getMaintenanceGuidance(message, params.systemComponent);
        break;
      case 'optimization_suggestions':
        result = await watsonAssistant.getOptimizationSuggestions(params.performanceData);
        break;
      case 'troubleshooting':
        result = await watsonAssistant.getTroubleshootingHelp(params.symptoms, params.systemArea);
        break;
      case 'create_session':
        result = { sessionId: await watsonAssistant.createSession(userId) };
        break;
      case 'delete_session':
        await watsonAssistant.deleteSession(userId);
        result = { success: true };
        break;
      default:
        throw new Error('Invalid action specified');
    }

    const response: ApiResponse<any> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Watson Assistant error:', error);
    
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to process Watson Assistant request',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
