
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
    // Enhanced mock responses with variety and context awareness
    const lowerMessage = message.toLowerCase();
    const previousTopic = context?.topic;
    const conversationCount = context?.conversation_count || 0;

    // Temperature-related queries
    if (lowerMessage.includes('temperature') || lowerMessage.includes('heat')) {
      const tempResponses = [
        'Based on your current system data, I recommend maintaining temperatures between 65-75°F for optimal vermiculture production. Your temperature readings look good! Consider adding thermal mass if you experience fluctuations.',
        'Temperature management is crucial for worm health. Current readings suggest your system is performing well. For winter months, consider insulation or heating elements to maintain consistency.',
        'I see you\'re monitoring temperature - excellent! The ideal range is 65-75°F. If you notice temperatures dropping below 60°F, worm activity will slow significantly. Would you like specific heating recommendations?',
        'Your temperature data indicates healthy conditions. Pro tip: Worms are most active at 70-72°F. If you\'re seeing temperatures above 80°F, increase ventilation immediately to prevent stress.'
      ];

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: tempResponses[conversationCount % tempResponses.length]
          }]
        },
        context: { ...context, topic: 'temperature_management', conversation_count: conversationCount + 1 },
        sessionId: 'mock_session'
      };
    }

    // Moisture and humidity queries
    if (lowerMessage.includes('moisture') || lowerMessage.includes('humidity') || lowerMessage.includes('water')) {
      const moistureResponses = [
        'Moisture levels should be maintained between 60-70% for optimal worm activity. Think "wrung-out sponge" consistency. Too dry? Increase watering frequency. Too wet? Add dry bedding materials.',
        'Great question about moisture! Your system should feel like a damp sponge when squeezed. If water drips out, it\'s too wet. If it feels dry, gradually increase moisture with a spray bottle.',
        'Moisture management is key to success. I recommend checking moisture daily by the "squeeze test" - grab a handful of bedding and squeeze. One or two drops of water should come out, no more.',
        'Humidity levels look important to you - smart thinking! Worms breathe through their skin, so proper moisture is vital. Aim for 75-85% humidity in the bin environment.'
      ];

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: moistureResponses[conversationCount % moistureResponses.length]
          }]
        },
        context: { ...context, topic: 'moisture_control', conversation_count: conversationCount + 1 },
        sessionId: 'mock_session'
      };
    }

    // pH and acidity queries
    if (lowerMessage.includes('ph') || lowerMessage.includes('acidity') || lowerMessage.includes('alkaline')) {
      const phResponses = [
        'pH balance is crucial! Maintain 6.0-7.0 for healthy vermiculture. Too acidic? Add crushed eggshells or agricultural lime. Too alkaline? Add coffee grounds or peat moss gradually.',
        'I see you\'re monitoring pH - excellent practice! Worms prefer neutral to slightly acidic conditions. Test weekly and adjust slowly to avoid shocking the system.',
        'pH management tip: Sudden changes stress worms. If your pH is off, make gradual adjustments over several days. Crushed eggshells are a gentle way to raise pH naturally.',
        'Your pH concerns are valid - it affects everything! Acidic conditions (below 6.0) slow decomposition and stress worms. Alkaline conditions (above 8.0) can be toxic. Aim for that sweet spot of 6.5-7.0.'
      ];

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: phResponses[conversationCount % phResponses.length]
          }]
        },
        context: { ...context, topic: 'ph_management', conversation_count: conversationCount + 1 },
        sessionId: 'mock_session'
      };
    }

    // Harvest and yield queries
    if (lowerMessage.includes('harvest') || lowerMessage.includes('yield') || lowerMessage.includes('compost')) {
      const harvestResponses = [
        'Harvest timing is an art! Look for dark, crumbly compost with an earthy smell. Mature vermicompost should have few recognizable food scraps. Typically ready every 3-6 months depending on feeding rate.',
        'Ready to harvest? Great! The "light method" works well - shine a bright light on one side of the bin. Worms will migrate away from light, making harvest easier. Your yield projections look promising!',
        'Harvest indicators: 1) Dark, rich color, 2) Earthy smell (not sour), 3) Crumbly texture, 4) Few visible food scraps. If you see these signs, you\'re ready for that black gold!',
        'Timing your harvest perfectly maximizes yield. I recommend harvesting when the bin is 80% processed material. This ensures quality while maintaining worm population for continuous production.'
      ];

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: harvestResponses[conversationCount % harvestResponses.length]
          }]
        },
        context: { ...context, topic: 'harvest_management', conversation_count: conversationCount + 1 },
        sessionId: 'mock_session'
      };
    }

    // Maintenance and repair queries
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair') || lowerMessage.includes('clean')) {
      const maintenanceResponses = [
        'Regular maintenance keeps your system thriving! Weekly: Check moisture and temperature. Monthly: Remove uneaten food, fluff bedding. Quarterly: Deep clean, inspect equipment. Your proactive approach is excellent!',
        'Maintenance schedule recommendation: Daily monitoring (5 min), weekly feeding adjustments (15 min), monthly system review (30 min), quarterly deep maintenance (2 hours). Consistency is key!',
        'Smart maintenance prevents problems! Key tasks: 1) Sensor calibration weekly, 2) Drainage check monthly, 3) Bedding refresh quarterly, 4) Equipment inspection bi-annually. What specific area needs attention?',
        'Preventive maintenance saves time and money. Focus on: moisture consistency, temperature stability, proper ventilation, and regular harvesting. Your system will reward you with consistent production!'
      ];

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: maintenanceResponses[conversationCount % maintenanceResponses.length]
          }]
        },
        context: { ...context, topic: 'maintenance_guidance', conversation_count: conversationCount + 1 },
        sessionId: 'mock_session'
      };
    }

    // Feeding and nutrition queries
    if (lowerMessage.includes('feed') || lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('scraps')) {
      const feedingResponses = [
        'Feeding strategy matters! Best foods: vegetable scraps, coffee grounds, eggshells, paper. Avoid: meat, dairy, oils, citrus. Feed little and often - worms should consume food within 3-5 days.',
        'Nutrition balance is key! Aim for 70% "greens" (nitrogen-rich: food scraps, coffee grounds) and 30% "browns" (carbon-rich: paper, cardboard). This ratio optimizes decomposition speed.',
        'Feeding frequency depends on population and temperature. Start with small amounts twice weekly. If food disappears quickly, increase frequency. If food sits longer than a week, reduce portions.',
        'Pro feeding tip: Chop food scraps smaller for faster processing. Bury food under bedding to prevent odors and fruit flies. Rotate feeding locations to encourage worm movement throughout the bin.'
      ];

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: feedingResponses[conversationCount % feedingResponses.length]
          }]
        },
        context: { ...context, topic: 'feeding_management', conversation_count: conversationCount + 1 },
        sessionId: 'mock_session'
      };
    }

    // Problem-solving and troubleshooting
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('help') || lowerMessage.includes('wrong')) {
      const troubleshootingResponses = [
        'I\'m here to help solve any issues! Common problems include: odors (usually overfeeding or poor drainage), fruit flies (exposed food), slow processing (temperature or moisture issues). What specific problem are you experiencing?',
        'Troubleshooting mode activated! Let\'s identify the issue: Is it related to smell, pests, slow decomposition, or worm behavior? Providing specific symptoms helps me give targeted solutions.',
        'Problem-solving approach: 1) Identify symptoms, 2) Check environmental conditions, 3) Review recent changes, 4) Apply targeted solutions, 5) Monitor results. What\'s the main concern you\'re facing?',
        'Every problem has a solution! Most issues stem from imbalanced conditions. Let\'s work through this systematically. Describe what you\'re observing, and I\'ll help you get back on track.'
      ];

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: troubleshootingResponses[conversationCount % troubleshootingResponses.length]
          }]
        },
        context: { ...context, topic: 'troubleshooting', conversation_count: conversationCount + 1 },
        sessionId: 'mock_session'
      };
    }

    // General responses with variety
    const generalResponses = [
      'Welcome to your AI agricultural assistant! I specialize in vermiculture and sustainable farming practices. I can help with temperature control, moisture management, pH balancing, harvest timing, feeding strategies, and troubleshooting. What would you like to explore?',
      'I\'m here to optimize your agricultural systems! My expertise covers environmental monitoring, system maintenance, production optimization, and problem-solving. Whether you\'re dealing with vermiculture, hydroponics, or traditional farming, I\'m ready to assist.',
      'Great to connect with you! I can provide guidance on: 🌡️ Environmental controls, 💧 Moisture management, 🔬 pH optimization, 🌱 Growth strategies, 🔧 Maintenance schedules, and 📊 Performance analysis. What\'s your priority today?',
      'Your agricultural success is my mission! I offer insights on system optimization, environmental management, harvest planning, and sustainable practices. From troubleshooting issues to maximizing yields, I\'m here to help. What can we work on together?',
      'Hello! I\'m your intelligent farming companion. I can assist with real-time monitoring, predictive analytics, maintenance scheduling, and optimization strategies. Whether you\'re a beginner or expert, I\'ll provide tailored guidance. What aspect interests you most?'
    ];

    return {
      output: {
        generic: [{
          response_type: 'text',
          text: generalResponses[conversationCount % generalResponses.length]
        }]
      },
      context: { ...context, topic: 'general_assistance', conversation_count: conversationCount + 1 },
      sessionId: 'mock_session'
    };
  }

export const watsonAssistant = new WatsonAssistantService();
