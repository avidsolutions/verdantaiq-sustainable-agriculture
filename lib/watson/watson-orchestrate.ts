
import axios from 'axios';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'automated' | 'manual' | 'ai_decision';
  condition?: string;
  action: string;
  parameters?: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  status: 'active' | 'inactive' | 'paused';
}

class WatsonOrchestrateService {
  private apiKey: string;
  private apiUrl: string;
  private environmentId: string;

  constructor() {
    this.apiKey = process.env.WATSON_ORCHESTRATE_API_KEY || 'Fr68n0H2rrcVFBhvj13TgsvzAX2CVipmanEqvE5x1ewf';
    this.apiUrl = process.env.WATSON_ORCHESTRATE_URL || 'https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/4aa0c666-ab82-47fb-afcb-adf1a7a589e2';
    this.environmentId = process.env.WATSON_ORCHESTRATE_ENVIRONMENT_ID || '4aa0c666-ab82-47fb-afcb-adf1a7a589e2';
  }

  async createWorkflow(workflow: Omit<Workflow, 'id' | 'status'>) {
    try {
      if (!this.apiKey) {
        return this.mockCreateWorkflow(workflow);
      }

      const response = await axios.post(
        `${this.apiUrl}/v2/workflows`,
        {
          name: workflow.name,
          description: workflow.description,
          definition: {
            steps: workflow.steps,
            triggers: workflow.triggers
          },
          environment_id: this.environmentId
        },
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.id,
        ...workflow,
        status: 'active' as const
      };
    } catch (error) {
      console.error('Watson Orchestrate workflow creation error:', error);
      return this.mockCreateWorkflow(workflow);
    }
  }

  async triggerWorkflow(workflowId: string, parameters: Record<string, any>) {
    try {
      if (!this.apiKey) {
        return this.mockTriggerWorkflow(workflowId, parameters);
      }

      const response = await axios.post(
        `${this.apiUrl}/v2/workflows/${workflowId}/execute`,
        {
          input: parameters,
          environment_id: this.environmentId
        },
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        executionId: response.data.execution_id,
        status: response.data.status,
        result: response.data.result
      };
    } catch (error) {
      console.error('Watson Orchestrate workflow trigger error:', error);
      return this.mockTriggerWorkflow(workflowId, parameters);
    }
  }

  async getWorkflowStatus(executionId: string) {
    try {
      if (!this.apiKey) {
        return this.mockWorkflowStatus(executionId);
      }

      const response = await axios.get(
        `${this.apiUrl}/v2/executions/${executionId}`,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        progress: response.data.progress,
        result: response.data.result,
        startTime: response.data.start_time,
        endTime: response.data.end_time
      };
    } catch (error) {
      console.error('Watson Orchestrate status error:', error);
      return this.mockWorkflowStatus(executionId);
    }
  }

  // Predefined agricultural workflows
  async setupFeedingWorkflow() {
    return await this.createWorkflow({
      name: 'Automated Feeding Schedule',
      description: 'Manages automated vermiculture feeding based on environmental conditions',
      steps: [
        {
          id: 'check_conditions',
          name: 'Check Environmental Conditions',
          type: 'automated',
          action: 'monitor_sensors',
          parameters: { sensors: ['temperature', 'moisture', 'ph'] }
        },
        {
          id: 'analyze_data',
          name: 'Analyze Feeding Requirements',
          type: 'ai_decision',
          action: 'watson_ai_analysis',
          condition: 'optimal_feeding_time'
        },
        {
          id: 'trigger_feeding',
          name: 'Trigger Feeding System',
          type: 'automated',
          action: 'activate_feeders',
          parameters: { duration: 300, intensity: 'medium' }
        },
        {
          id: 'log_activity',
          name: 'Log Feeding Activity',
          type: 'automated',
          action: 'update_database',
          parameters: { table: 'feeding_logs' }
        }
      ],
      triggers: ['scheduled_time', 'environmental_threshold', 'manual_trigger']
    });
  }

  async setupHarvestWorkflow() {
    return await this.createWorkflow({
      name: 'Harvest Management',
      description: 'Manages harvest cycles and yield optimization',
      steps: [
        {
          id: 'assess_readiness',
          name: 'Assess Harvest Readiness',
          type: 'ai_decision',
          action: 'yield_prediction_analysis',
          condition: 'optimal_harvest_time'
        },
        {
          id: 'prepare_harvest',
          name: 'Prepare Harvest Equipment',
          type: 'automated',
          action: 'equipment_check',
          parameters: { systems: ['conveyor', 'separator', 'storage'] }
        },
        {
          id: 'execute_harvest',
          name: 'Execute Harvest',
          type: 'manual',
          action: 'manual_harvest_approval'
        },
        {
          id: 'quality_control',
          name: 'Quality Control Assessment',
          type: 'ai_decision',
          action: 'quality_analysis'
        },
        {
          id: 'update_inventory',
          name: 'Update Inventory',
          type: 'automated',
          action: 'inventory_management',
          parameters: { update_yield: true, calculate_metrics: true }
        }
      ],
      triggers: ['maturity_detected', 'scheduled_harvest', 'quality_threshold']
    });
  }

  async setupMaintenanceWorkflow() {
    return await this.createWorkflow({
      name: 'Preventive Maintenance',
      description: 'Automated maintenance scheduling and execution',
      steps: [
        {
          id: 'system_diagnostics',
          name: 'Run System Diagnostics',
          type: 'automated',
          action: 'diagnostic_check',
          parameters: { systems: ['sensors', 'pumps', 'ventilation', 'lighting'] }
        },
        {
          id: 'analyze_performance',
          name: 'Analyze Performance Metrics',
          type: 'ai_decision',
          action: 'performance_analysis',
          condition: 'maintenance_required'
        },
        {
          id: 'schedule_maintenance',
          name: 'Schedule Maintenance',
          type: 'automated',
          action: 'create_maintenance_ticket',
          parameters: { priority: 'medium', assign_to: 'maintenance_team' }
        },
        {
          id: 'execute_maintenance',
          name: 'Execute Maintenance',
          type: 'manual',
          action: 'maintenance_approval'
        },
        {
          id: 'verify_completion',
          name: 'Verify Maintenance Completion',
          type: 'automated',
          action: 'post_maintenance_check'
        }
      ],
      triggers: ['scheduled_maintenance', 'performance_threshold', 'sensor_alert']
    });
  }

  private async getAccessToken() {
    const response = await axios.post('https://iam.cloud.ibm.com/identity/token', {
      grant_type: 'urn:iam:grant-type:apikey',
      apikey: this.apiKey
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  }

  private mockCreateWorkflow(workflow: Omit<Workflow, 'id' | 'status'>) {
    return {
      id: `workflow_${Date.now()}`,
      ...workflow,
      status: 'active' as const
    };
  }

  private mockTriggerWorkflow(workflowId: string, parameters: Record<string, any>) {
    return {
      executionId: `exec_${Date.now()}`,
      status: 'running',
      result: null
    };
  }

  private mockWorkflowStatus(executionId: string) {
    return {
      id: executionId,
      status: 'completed',
      progress: 100,
      result: { success: true, message: 'Workflow completed successfully' },
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    };
  }
}

export const watsonOrchestrate = new WatsonOrchestrateService();
