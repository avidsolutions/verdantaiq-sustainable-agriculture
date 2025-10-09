
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
    const userMood = this.detectUserMood(message);
    const timeOfDay = this.getTimeOfDay();
    const conversationFlow = this.getConversationFlow(context);

    // Temperature-related queries
    if (lowerMessage.includes('temperature') || lowerMessage.includes('heat') || lowerMessage.includes('temp') || lowerMessage.includes('cold')) {
      const dynamicResponse = this.generateDynamicTemperatureResponse(conversationCount, userMood, timeOfDay, previousTopic);

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: dynamicResponse
          }]
        },
        context: {
          ...context,
          topic: 'temperature_management',
          conversation_count: conversationCount + 1,
          user_mood: userMood,
          conversation_flow: conversationFlow,
          last_interaction: new Date().toISOString()
        },
        sessionId: 'mock_session'
      };
    }

    // Moisture and humidity queries
    if (lowerMessage.includes('moisture') || lowerMessage.includes('humidity') || lowerMessage.includes('water') || lowerMessage.includes('wet') || lowerMessage.includes('dry')) {
      const dynamicResponse = this.generateDynamicMoistureResponse(conversationCount, userMood, timeOfDay, previousTopic);

      return {
        output: {
          generic: [{
            response_type: 'text',
            text: dynamicResponse
          }]
        },
        context: {
          ...context,
          topic: 'moisture_control',
          conversation_count: conversationCount + 1,
          user_mood: userMood,
          conversation_flow: conversationFlow,
          last_interaction: new Date().toISOString()
        },
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

    // General responses with dynamic personality
    const dynamicResponse = this.generateDynamicGeneralResponse(conversationCount, userMood, timeOfDay, previousTopic);

    return {
      output: {
        generic: [{
          response_type: 'text',
          text: dynamicResponse
        }]
      },
      context: {
        ...context,
        topic: 'general_assistance',
        conversation_count: conversationCount + 1,
        user_mood: userMood,
        conversation_flow: conversationFlow,
        last_interaction: new Date().toISOString()
      },
      sessionId: 'mock_session'
    };
  }

  // Helper methods for dynamic conversation
  private detectUserMood(message: string): 'excited' | 'concerned' | 'frustrated' | 'curious' | 'neutral' {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('help') || lowerMessage.includes('problem') || lowerMessage.includes('wrong') || lowerMessage.includes('issue')) {
      return 'concerned';
    }
    if (lowerMessage.includes('!') || lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('amazing')) {
      return 'excited';
    }
    if (lowerMessage.includes('why') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('?')) {
      return 'curious';
    }
    if (lowerMessage.includes('not working') || lowerMessage.includes('failed') || lowerMessage.includes('broken')) {
      return 'frustrated';
    }
    return 'neutral';
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private getConversationFlow(context?: any): 'opening' | 'continuing' | 'deep_dive' | 'wrapping_up' {
    const count = context?.conversation_count || 0;
    if (count === 0) return 'opening';
    if (count < 3) return 'continuing';
    if (count < 6) return 'deep_dive';
    return 'wrapping_up';
  }

  private generateDynamicTemperatureResponse(count: number, mood: string, timeOfDay: string, previousTopic?: string): string {
    const greetings = {
      morning: "Good morning! ",
      afternoon: "Good afternoon! ",
      evening: "Good evening! ",
      night: "Working late, I see! "
    };

    const moodResponses = {
      excited: "I love your enthusiasm about temperature monitoring! ",
      concerned: "I understand your temperature concerns - let's sort this out together. ",
      frustrated: "Temperature issues can be frustrating, but we'll get this fixed. ",
      curious: "Great question about temperature! ",
      neutral: ""
    };

    const baseResponses = [
      "Temperature is the foundation of a healthy vermiculture system. The sweet spot is 65-75°F - think of it as creating a cozy environment where your worms can thrive.",
      "I've been analyzing temperature patterns, and consistency is key. Worms are like us - they don't like sudden temperature swings. Gradual changes are much better.",
      "Here's a pro tip: worms are most active at 70-72°F. At this temperature, they'll process food faster and reproduce more efficiently.",
      "Temperature management is an art! If you're seeing readings above 80°F, your worms are getting stressed. Time for some ventilation or shade.",
      "Winter temperature challenges? I recommend insulation around your bins or even a small heating element for consistent warmth.",
      "Your temperature monitoring shows you're serious about this! Small fluctuations are normal, but watch for trends over time."
    ];

    const followUps = [
      " What specific temperature readings are you seeing?",
      " Would you like some heating or cooling strategies?",
      " Are you noticing any changes in worm activity?",
      " Have you considered thermal mass to stabilize temperatures?",
      " Let me know if you need troubleshooting help!",
      " Want to dive deeper into temperature optimization?"
    ];

    const greeting = greetings[timeOfDay] || "";
    const moodResponse = moodResponses[mood] || "";
    const baseResponse = baseResponses[count % baseResponses.length];
    const followUp = followUps[count % followUps.length];

    return `${greeting}${moodResponse}${baseResponse}${followUp}`;
  }

  private generateDynamicMoistureResponse(count: number, mood: string, timeOfDay: string, previousTopic?: string): string {
    const greetings = {
      morning: "Morning! ",
      afternoon: "Afternoon! ",
      evening: "Evening! ",
      night: "Still working on your system? "
    };

    const moodResponses = {
      excited: "I can tell you're passionate about moisture management! ",
      concerned: "Moisture issues can be tricky, but we'll figure this out. ",
      frustrated: "I know moisture problems are annoying - let's solve this step by step. ",
      curious: "Excellent question about moisture! ",
      neutral: ""
    };

    const baseResponses = [
      "Moisture is like the heartbeat of your vermiculture system. Think 'wrung-out sponge' - damp but not dripping. Your worms breathe through their skin, so they need that perfect humidity.",
      "The squeeze test is your best friend! Grab a handful of bedding and squeeze. You should get 1-2 drops of water, no more. Too dry? Mist lightly. Too wet? Add dry bedding.",
      "Here's what I've learned from monitoring thousands of systems: 75-85% humidity is the sweet spot. Your worms will be most active and productive in this range.",
      "Moisture management is all about balance. Too wet and you get anaerobic conditions (smelly!). Too dry and your worms become sluggish and stressed.",
      "Pro tip: Check moisture daily, but adjust gradually. Sudden changes shock the system. Small, consistent adjustments work best.",
      "Your attention to moisture shows you understand the fundamentals! Consistent moisture leads to consistent results."
    ];

    const followUps = [
      " How does your bedding feel when you squeeze it?",
      " Are you seeing any signs of over or under-watering?",
      " Want some tips for maintaining consistent moisture?",
      " Have you tried the squeeze test recently?",
      " Need help troubleshooting moisture issues?",
      " Ready to dive deeper into humidity optimization?"
    ];

    const greeting = greetings[timeOfDay] || "";
    const moodResponse = moodResponses[mood] || "";
    const baseResponse = baseResponses[count % baseResponses.length];
    const followUp = followUps[count % followUps.length];

    return `${greeting}${moodResponse}${baseResponse}${followUp}`;
  }

  private generateDynamicGeneralResponse(count: number, mood: string, timeOfDay: string, previousTopic?: string): string {
    const personalizedGreetings = [
      `${timeOfDay === 'morning' ? 'Good morning' : timeOfDay === 'afternoon' ? 'Good afternoon' : timeOfDay === 'evening' ? 'Good evening' : 'Hello there'}! I'm your agricultural AI assistant, and I'm here to help you succeed.`,
      `Hey there! I'm excited to help you with your vermiculture journey. What's on your mind today?`,
      `Welcome back! I love helping farmers and growers optimize their systems. What can we work on together?`,
      `Hi! I'm your AI farming companion, ready to dive into whatever agricultural challenge you're facing.`
    ];

    const moodAdjustments = {
      excited: " I can feel your enthusiasm - that's the spirit that leads to great harvests!",
      concerned: " I'm here to help you work through any challenges you're facing.",
      frustrated: " I understand things can be challenging sometimes. Let's tackle this together.",
      curious: " I love curious minds - that's how we learn and improve!",
      neutral: " I'm here and ready to help with whatever you need."
    };

    const contextualOffers = [
      " Whether it's temperature, moisture, feeding schedules, or troubleshooting, I've got you covered.",
      " I can help with everything from basic setup to advanced optimization techniques.",
      " From pest management to harvest timing, I'm here to guide you through it all.",
      " Whether you're a beginner or experienced, I can provide insights tailored to your level.",
      " I have access to the latest agricultural research and best practices to help you succeed."
    ];

    const callsToAction = [
      " What specific aspect of your system would you like to explore?",
      " What's your biggest challenge right now?",
      " How can I help you improve your agricultural operation today?",
      " What questions do you have about your current setup?",
      " Ready to optimize something specific in your system?"
    ];

    const greeting = personalizedGreetings[count % personalizedGreetings.length];
    const moodAdjustment = moodAdjustments[mood] || "";
    const offer = contextualOffers[count % contextualOffers.length];
    const cta = callsToAction[count % callsToAction.length];

    return `${greeting}${moodAdjustment}${offer}${cta}`;
  }
}

export const watsonAssistant = new WatsonAssistantService();
