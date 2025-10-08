
import { NextResponse } from 'next/server';
import { watsonOrchestrate } from '@/lib/watson/watson-orchestrate';
import { ApiResponse } from '@/types/agricultural';

export async function POST(request: Request) {
  try {
    const { action, workflowId, parameters } = await request.json();

    let result;

    switch (action) {
      case 'trigger_workflow':
        result = await watsonOrchestrate.triggerWorkflow(workflowId, parameters);
        break;
      case 'setup_feeding':
        result = await watsonOrchestrate.setupFeedingWorkflow();
        break;
      case 'setup_harvest':
        result = await watsonOrchestrate.setupHarvestWorkflow();
        break;
      case 'setup_maintenance':
        result = await watsonOrchestrate.setupMaintenanceWorkflow();
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
    console.error('Watson Orchestrate error:', error);
    
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to execute Watson Orchestrate action',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');

    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    const status = await watsonOrchestrate.getWorkflowStatus(executionId);

    const response: ApiResponse<any> = {
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Watson Orchestrate status error:', error);
    
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: 'Failed to get workflow status',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
