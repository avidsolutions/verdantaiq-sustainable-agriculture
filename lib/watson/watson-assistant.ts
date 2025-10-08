
import AssistantV2 from 'ibm-watson/assistant/v2';
import { IamAuthenticator } from 'ibm-watson/auth';

class WatsonAssistantService {
  private assistant: AssistantV2 | null = null;
  private assistantId: string;
  private sessions: Map<string, string> = new Map();

  constructor() {
    this.assistantId = process.env.WATSON_ASSISTANT_ID || '3e881fb7-e58c-4756-8f26-9e1820d37d3b';

    const apiKey = process.env.WATSON_ASSISTANT_API_KEY || 'jFVHtXdcsICsjT2kEGieHxAAJieJJryIRln7iPubiZqi';
    const serviceUrl = process.env.WATSON_ASSISTANT_URL || 'https://api.us-south.assistant.watson.cloud.ibm.com/instances/3e881fb7-e58c-4756-8f26-9e1820d37d3b';

    if (apiKey && serviceUrl) {
      this.assistant = new AssistantV2({
        version: '2023-06-15',
        authenticator: new IamAuthenticator({
          apikey: apiKey,
        }),
        serviceUrl: serviceUrl,
      });
    }
  }

  async createSession(userId: string) {
    try {
      if (!this.assistant) {
        const mockSessionId = `mock_session_${userId}_${Date.now()}`;
        this.sessions.set(userId, mockSessionId);
        return mockSessionId;
      }

      const response = await this.assistant.createSession({
        assistantId: this.assistantId
      });

      const sessionId = response.result.session_id;
      this.sessions.set(userId, sessionId);
      return sessionId;
    } catch (error) {
      console.error('Watson Assistant session creation error:', error);
      const mockSessionId = `mock_session_${userId}_${Date.now()}`;
      this.sessions.set(userId, mockSessionId);
      return mockSessionId;
    }
  }

  async sendMessage(userId: string, message: string, context?: any) {
    try {
      let sessionId = this.sessions.get(userId);
      if (!sessionId) {
        sessionId = await this.createSession(userId);
      }

      if (!this.assistant) {
        return this.mockAssistantResponse(message, context);
      }

      const response = await this.assistant.message({
        assistantId: this.assistantId,
        sessionId: sessionId,
        environmentId: 'draft', // Use draft environment for development
        input: {
          message_type: 'text',
          text: message,
          options: {
            return_context: true
          }
        },
        context: context
      });

      return {
        output: response.result.output,
        context: response.result.context,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('Watson Assistant message error:', error);
      return this.mockAssistantResponse(message, context);
    }
  }

  async handleAgriculturalQuery(query: string, systemData: any) {
    const enhancedQuery = `
      Agricultural System Query: ${query}
      
      Current System Data:
      - Temperature: ${systemData.temperature}°F
      - Moisture: ${systemData.moisture}%
      - pH Level: ${systemData.ph}
      - Active Systems: ${systemData.activeSystems?.join(', ')}
      - Last Harvest: ${systemData.lastHarvest}
      - Current Yield: ${systemData.currentYield} lbs
    `;

    return await this.sendMessage('system', enhancedQuery, {
      skills: {
        'main skill': {
          user_defined: {
            system_context: systemData,
            query_type: 'agricultural_management'
          }
        }
      }
    });
  }

  async getMaintenanceGuidance(issue: string, systemComponent: string) {
    const query = `I need maintenance guidance for ${systemComponent}. The issue is: ${issue}. What are the recommended steps?`;
    
    return await this.sendMessage('maintenance', query, {
      skills: {
        'main skill': {
          user_defined: {
            query_type: 'maintenance_guidance',
            component: systemComponent,
            issue_description: issue
          }
        }
      }
    });
  }

  async getOptimizationSuggestions(performanceData: any) {
    const query = `
      Based on current performance metrics, what optimizations do you recommend?
      
      Performance Data:
      - Yield Efficiency: ${performanceData.yieldEfficiency}%
      - Energy Usage: ${performanceData.energyUsage} kWh/day
      - Water Usage: ${performanceData.waterUsage} gallons/day
      - System Uptime: ${performanceData.uptime}%
      - Quality Score: ${performanceData.qualityScore}/10
    `;

    return await this.sendMessage('optimization', query, {
      skills: {
        'main skill': {
          user_defined: {
            query_type: 'optimization_suggestions',
            performance_metrics: performanceData
          }
        }
      }
    });
  }

  async getTroubleshootingHelp(symptoms: string[], systemArea: string) {
    const query = `
      I'm experiencing issues in ${systemArea} with the following symptoms:
      ${symptoms.map((symptom, index) => `${index + 1}. ${symptom}`).join('\n')}
      
      What troubleshooting steps do you recommend?
    `;

    return await this.sendMessage('troubleshooting', query, {
      skills: {
        'main skill': {
          user_defined: {
            query_type: 'troubleshooting',
            system_area: systemArea,
            symptoms: symptoms
          }
        }
      }
    });
  }

  async deleteSession(userId: string) {
    try {
      const sessionId = this.sessions.get(userId);
      if (!sessionId || !this.assistant) {
        this.sessions.delete(userId);
        return;
      }

      await this.assistant.deleteSession({
        assistantId: this.assistantId,
        sessionId: sessionId
      });

      this.sessions.delete(userId);
    } catch (error) {
      console.error('Watson Assistant session deletion error:', error);
      this.sessions.delete(userId);
    }
  }

  private mockAssistantResponse(message: string, context?: any) {
    // Mock responses based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('temperature') || lowerMessage.includes('heat')) {
      return {
        output: {
          generic: [{
            response_type: 'text',
            text: 'Based on your temperature data, I recommend maintaining temperatures between 65-75°F for optimal vermiculture production. Your current temperature appears to be within the acceptable range. Consider adjusting ventilation if temperatures exceed 78°F.'
          }]
        },
        context: { ...context, topic: 'temperature_management' },
        sessionId: 'mock_session'
      };
    }

    if (lowerMessage.includes('moisture') || lowerMessage.includes('humidity')) {
      return {
        output: {
          generic: [{
            response_type: 'text',
            text: 'Moisture levels should be maintained between 60-70% for optimal worm activity. If levels are below 60%, increase watering frequency. If above 80%, improve drainage and ventilation.'
          }]
        },
        context: { ...context, topic: 'moisture_control' },
        sessionId: 'mock_session'
      };
    }

    if (lowerMessage.includes('ph') || lowerMessage.includes('acidity')) {
      return {
        output: {
          generic: [{
            response_type: 'text',
            text: 'pH levels should be maintained between 6.0-7.0 for healthy vermiculture. If pH is too low, add crushed eggshells or limestone. If too high, add organic matter like coffee grounds.'
          }]
        },
        context: { ...context, topic: 'ph_management' },
        sessionId: 'mock_session'
      };
    }

    if (lowerMessage.includes('harvest') || lowerMessage.includes('yield')) {
      return {
        output: {
          generic: [{
            response_type: 'text',
            text: 'For optimal harvest timing, check for mature compost (dark, crumbly texture) and active worm population. Harvest every 3-6 months depending on system size and feeding schedule. Current yield projections look promising.'
          }]
        },
        context: { ...context, topic: 'harvest_management' },
        sessionId: 'mock_session'
      };
    }

    if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
      return {
        output: {
          generic: [{
            response_type: 'text',
            text: 'Regular maintenance should include: 1) Weekly sensor calibration, 2) Monthly system cleaning, 3) Quarterly equipment inspection, 4) Bi-annual deep system maintenance. Check specific component manuals for detailed procedures.'
          }]
        },
        context: { ...context, topic: 'maintenance_guidance' },
        sessionId: 'mock_session'
      };
    }

    // General response
    return {
      output: {
        generic: [{
          response_type: 'text',
          text: 'I\'m here to help with your vermiculture system management. I can provide guidance on temperature control, moisture management, pH balancing, harvest timing, maintenance procedures, and optimization strategies. What specific area would you like assistance with?'
        }]
      },
      context: { ...context, topic: 'general_assistance' },
      sessionId: 'mock_session'
    };
  }
}

export const watsonAssistant = new WatsonAssistantService();
