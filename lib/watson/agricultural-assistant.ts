import { watsonAssistant } from './watson-assistant';
import { watsonData } from './watson-data';
import { agriculturalWorkflows } from './agricultural-workflows';

interface AgriculturalContext {
  farmId: string;
  cropType: string;
  growthStage: string;
  currentConditions: {
    temperature: number;
    moisture: number;
    ph: number;
    humidity: number;
  };
  systemStatus: {
    activeSystems: string[];
    alerts: any[];
    lastMaintenance: string;
  };
  recentActivities: string[];
}

interface ConversationIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  context: AgriculturalContext;
}

class AgriculturalAssistantService {
  private knowledgeBase = {
    vermiculture: {
      optimal_conditions: {
        temperature: { min: 55, max: 77, ideal: 65 },
        moisture: { min: 60, max: 80, ideal: 70 },
        ph: { min: 6.0, max: 8.0, ideal: 7.0 }
      },
      feeding_guidelines: {
        frequency: 'every_2_3_days',
        amount: '1_pound_per_1000_worms',
        food_types: ['vegetable_scraps', 'fruit_waste', 'coffee_grounds', 'eggshells']
      },
      harvest_indicators: {
        compost_color: 'dark_brown_black',
        texture: 'crumbly_soil_like',
        smell: 'earthy_pleasant',
        worm_activity: 'concentrated_in_fresh_areas'
      }
    },
    plant_health: {
      nutrient_deficiencies: {
        nitrogen: { symptoms: ['yellowing_leaves', 'stunted_growth'], solution: 'increase_organic_matter' },
        phosphorus: { symptoms: ['purple_leaves', 'poor_root_development'], solution: 'bone_meal_application' },
        potassium: { symptoms: ['brown_leaf_edges', 'weak_stems'], solution: 'wood_ash_compost' }
      },
      pest_management: {
        prevention: ['beneficial_insects', 'companion_planting', 'crop_rotation'],
        organic_treatments: ['neem_oil', 'diatomaceous_earth', 'beneficial_bacteria']
      }
    },
    environmental_control: {
      temperature_management: {
        cooling: ['increase_ventilation', 'shade_cloth', 'evaporative_cooling'],
        heating: ['thermal_mass', 'compost_heat', 'greenhouse_effect']
      },
      moisture_control: {
        increase: ['drip_irrigation', 'mulching', 'humidity_systems'],
        decrease: ['improve_drainage', 'increase_ventilation', 'reduce_watering']
      }
    }
  };

  async handleAgriculturalQuery(query: string, context: AgriculturalContext) {
    try {
      // Analyze the query intent
      const intent = await this.analyzeQueryIntent(query, context);
      
      // Get relevant data for context
      const systemData = await this.getSystemData(context);
      
      // Generate enhanced query with context
      const enhancedQuery = this.buildEnhancedQuery(query, intent, systemData);
      
      // Get response from Watson Assistant
      const response = await watsonAssistant.handleAgriculturalQuery(enhancedQuery, {
        agricultural_context: context,
        system_data: systemData,
        intent_analysis: intent,
        knowledge_base: this.getRelevantKnowledge(intent.intent)
      });

      // Enhance response with specific recommendations
      const enhancedResponse = await this.enhanceResponse(response, intent, systemData);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Agricultural query handling error:', error);
      return this.getFallbackResponse(query, context);
    }
  }

  async getEnvironmentalGuidance(conditions: any, targetCrop: string) {
    const query = `
      Current environmental conditions for ${targetCrop}:
      - Temperature: ${conditions.temperature}°F
      - Moisture: ${conditions.moisture}%
      - pH: ${conditions.ph}
      - Humidity: ${conditions.humidity}%
      
      What adjustments should I make for optimal growing conditions?
    `;

    const context: AgriculturalContext = {
      farmId: 'default',
      cropType: targetCrop,
      growthStage: 'active',
      currentConditions: conditions,
      systemStatus: { activeSystems: [], alerts: [], lastMaintenance: '' },
      recentActivities: []
    };

    return await this.handleAgriculturalQuery(query, context);
  }

  async getVermicultureAdvice(systemStatus: any, issue?: string) {
    const query = issue 
      ? `I'm having an issue with my vermiculture system: ${issue}. Current status: ${JSON.stringify(systemStatus)}`
      : `Please analyze my vermiculture system status and provide optimization recommendations: ${JSON.stringify(systemStatus)}`;

    const context: AgriculturalContext = {
      farmId: 'vermiculture_system',
      cropType: 'vermiculture',
      growthStage: 'active',
      currentConditions: systemStatus.environmental || {},
      systemStatus: systemStatus,
      recentActivities: systemStatus.recentActivities || []
    };

    return await this.handleAgriculturalQuery(query, context);
  }

  async getMaintenanceInstructions(equipment: string, issue: string, urgency: 'low' | 'medium' | 'high' | 'critical') {
    const query = `
      Equipment: ${equipment}
      Issue: ${issue}
      Urgency: ${urgency}
      
      Please provide step-by-step maintenance instructions and safety precautions.
    `;

    const response = await watsonAssistant.getMaintenanceGuidance(issue, equipment);
    
    // Enhance with specific agricultural equipment knowledge
    const enhancedInstructions = this.enhanceMaintenanceInstructions(response, equipment, urgency);
    
    return enhancedInstructions;
  }

  async getYieldOptimizationAdvice(performanceData: any, targetYield: number) {
    const currentYield = performanceData.currentYield || 0;
    const yieldGap = targetYield - currentYield;
    
    const query = `
      Current yield: ${currentYield} lbs
      Target yield: ${targetYield} lbs
      Yield gap: ${yieldGap} lbs
      
      Performance metrics:
      ${JSON.stringify(performanceData, null, 2)}
      
      What specific actions can I take to reach my target yield?
    `;

    const response = await watsonAssistant.getOptimizationSuggestions(performanceData);
    
    // Add specific yield optimization strategies
    const optimizationStrategies = this.generateYieldOptimizationStrategies(performanceData, yieldGap);
    
    return {
      ...response,
      yield_optimization: optimizationStrategies,
      action_plan: this.createYieldActionPlan(performanceData, targetYield)
    };
  }

  async getTroubleshootingGuidance(symptoms: string[], systemArea: string, severity: string) {
    const response = await watsonAssistant.getTroubleshootingHelp(symptoms, systemArea);
    
    // Enhance with agricultural-specific troubleshooting
    const agriculturalTroubleshooting = this.getAgriculturalTroubleshooting(symptoms, systemArea);
    
    return {
      ...response,
      agricultural_specific: agriculturalTroubleshooting,
      recommended_workflows: this.getRecommendedWorkflows(symptoms, systemArea),
      preventive_measures: this.getPreventiveMeasures(systemArea)
    };
  }

  private async analyzeQueryIntent(query: string, context: AgriculturalContext): Promise<ConversationIntent> {
    const lowerQuery = query.toLowerCase();
    
    // Intent classification based on keywords
    let intent = 'general_inquiry';
    let confidence = 0.5;
    
    if (lowerQuery.includes('temperature') || lowerQuery.includes('heat') || lowerQuery.includes('cold')) {
      intent = 'temperature_management';
      confidence = 0.9;
    } else if (lowerQuery.includes('moisture') || lowerQuery.includes('water') || lowerQuery.includes('irrigation')) {
      intent = 'moisture_management';
      confidence = 0.9;
    } else if (lowerQuery.includes('ph') || lowerQuery.includes('acid') || lowerQuery.includes('alkaline')) {
      intent = 'ph_management';
      confidence = 0.9;
    } else if (lowerQuery.includes('nutrient') || lowerQuery.includes('fertilizer') || lowerQuery.includes('feeding')) {
      intent = 'nutrient_management';
      confidence = 0.85;
    } else if (lowerQuery.includes('harvest') || lowerQuery.includes('yield') || lowerQuery.includes('production')) {
      intent = 'harvest_optimization';
      confidence = 0.85;
    } else if (lowerQuery.includes('maintenance') || lowerQuery.includes('repair') || lowerQuery.includes('fix')) {
      intent = 'maintenance_support';
      confidence = 0.8;
    } else if (lowerQuery.includes('pest') || lowerQuery.includes('disease') || lowerQuery.includes('problem')) {
      intent = 'problem_diagnosis';
      confidence = 0.8;
    }

    return {
      intent,
      confidence,
      entities: this.extractEntities(query),
      context
    };
  }

  private async getSystemData(context: AgriculturalContext) {
    try {
      // Get recent sensor data
      const sensorData = await watsonData.queryAgriculturalData({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        deviceIds: [context.farmId],
        aggregation: 'hourly'
      });

      return {
        current_conditions: context.currentConditions,
        recent_trends: sensorData.data,
        system_status: context.systemStatus,
        performance_metrics: await this.calculatePerformanceMetrics(sensorData.data)
      };
    } catch (error) {
      console.error('Error getting system data:', error);
      return { current_conditions: context.currentConditions };
    }
  }

  private buildEnhancedQuery(query: string, intent: ConversationIntent, systemData: any): string {
    return `
      Agricultural Query: ${query}
      
      Intent: ${intent.intent} (confidence: ${intent.confidence})
      
      Current System Status:
      ${JSON.stringify(systemData, null, 2)}
      
      Context: ${intent.context.cropType} farming, ${intent.context.growthStage} stage
      
      Please provide specific, actionable advice based on current conditions and agricultural best practices.
    `;
  }

  private getRelevantKnowledge(intent: string) {
    switch (intent) {
      case 'temperature_management':
        return this.knowledgeBase.environmental_control.temperature_management;
      case 'moisture_management':
        return this.knowledgeBase.environmental_control.moisture_control;
      case 'nutrient_management':
        return this.knowledgeBase.plant_health.nutrient_deficiencies;
      case 'harvest_optimization':
        return this.knowledgeBase.vermiculture.harvest_indicators;
      default:
        return this.knowledgeBase;
    }
  }

  private async enhanceResponse(response: any, intent: ConversationIntent, systemData: any) {
    const baseResponse = response.output?.generic?.[0]?.text || 'I can help you with your agricultural question.';
    
    // Add specific recommendations based on intent
    const recommendations = this.generateSpecificRecommendations(intent, systemData);
    
    // Add workflow suggestions
    const workflowSuggestions = this.getWorkflowSuggestions(intent.intent);
    
    return {
      response: baseResponse,
      recommendations,
      workflow_suggestions: workflowSuggestions,
      follow_up_questions: this.generateFollowUpQuestions(intent.intent),
      confidence: intent.confidence,
      intent: intent.intent
    };
  }

  private generateSpecificRecommendations(intent: ConversationIntent, systemData: any): string[] {
    const recommendations: string[] = [];
    
    switch (intent.intent) {
      case 'temperature_management':
        if (systemData.current_conditions?.temperature > 75) {
          recommendations.push('Consider increasing ventilation or adding shade cloth');
          recommendations.push('Monitor for heat stress in plants');
        } else if (systemData.current_conditions?.temperature < 65) {
          recommendations.push('Consider adding thermal mass or heating elements');
          recommendations.push('Check for cold drafts affecting the system');
        }
        break;
        
      case 'moisture_management':
        if (systemData.current_conditions?.moisture < 60) {
          recommendations.push('Increase irrigation frequency or duration');
          recommendations.push('Consider adding mulch to retain moisture');
        } else if (systemData.current_conditions?.moisture > 80) {
          recommendations.push('Improve drainage and increase ventilation');
          recommendations.push('Reduce watering frequency');
        }
        break;
        
      case 'nutrient_management':
        recommendations.push('Test soil nutrient levels before applying fertilizers');
        recommendations.push('Consider organic compost for slow-release nutrients');
        recommendations.push('Monitor plant response to nutrient applications');
        break;
    }
    
    return recommendations;
  }

  private getWorkflowSuggestions(intent: string): string[] {
    const workflowMap: Record<string, string[]> = {
      'temperature_management': ['Environmental Control Automation'],
      'moisture_management': ['Environmental Control Automation', 'Intelligent Nutrient Distribution'],
      'nutrient_management': ['Intelligent Nutrient Distribution'],
      'harvest_optimization': ['Vermiculture System Management'],
      'maintenance_support': ['Predictive Maintenance System'],
      'problem_diagnosis': ['Intelligent Alert Processing']
    };
    
    return workflowMap[intent] || [];
  }

  private generateFollowUpQuestions(intent: string): string[] {
    const questionMap: Record<string, string[]> = {
      'temperature_management': [
        'Would you like me to set up automated temperature monitoring?',
        'Do you need help configuring temperature alerts?'
      ],
      'moisture_management': [
        'Should I help you optimize your irrigation schedule?',
        'Would you like recommendations for moisture sensors?'
      ],
      'nutrient_management': [
        'Do you need help creating a feeding schedule?',
        'Would you like me to analyze your soil composition?'
      ]
    };
    
    return questionMap[intent] || ['Is there anything else I can help you with?'];
  }

  private extractEntities(query: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract temperature values
    const tempMatch = query.match(/(\d+)\s*°?[Ff]?/);
    if (tempMatch) entities.temperature = parseInt(tempMatch[1]);
    
    // Extract percentage values
    const percentMatch = query.match(/(\d+)\s*%/);
    if (percentMatch) entities.percentage = parseInt(percentMatch[1]);
    
    // Extract pH values
    const phMatch = query.match(/ph\s*(\d+\.?\d*)/i);
    if (phMatch) entities.ph = parseFloat(phMatch[1]);
    
    return entities;
  }

  private calculatePerformanceMetrics(data: any[]): any {
    if (!data || data.length === 0) return {};
    
    return {
      average_temperature: data.reduce((sum, d) => sum + (d.temperature || 0), 0) / data.length,
      average_moisture: data.reduce((sum, d) => sum + (d.moisture || 0), 0) / data.length,
      average_ph: data.reduce((sum, d) => sum + (d.ph || 0), 0) / data.length,
      data_quality: data.filter(d => d.quality_score > 80).length / data.length
    };
  }

  private enhanceMaintenanceInstructions(response: any, equipment: string, urgency: string) {
    const baseInstructions = response.output?.generic?.[0]?.text || 'Maintenance instructions not available.';
    
    return {
      instructions: baseInstructions,
      safety_precautions: this.getSafetyPrecautions(equipment),
      tools_required: this.getRequiredTools(equipment),
      estimated_time: this.getEstimatedTime(equipment, urgency),
      urgency_level: urgency,
      follow_up_actions: this.getFollowUpActions(equipment)
    };
  }

  private generateYieldOptimizationStrategies(performanceData: any, yieldGap: number): string[] {
    const strategies: string[] = [];
    
    if (yieldGap > 0) {
      strategies.push('Optimize nutrient distribution timing');
      strategies.push('Improve environmental control consistency');
      strategies.push('Enhance monitoring frequency');
      
      if (performanceData.energyUsage > 100) {
        strategies.push('Implement energy-efficient practices');
      }
      
      if (performanceData.qualityScore < 8) {
        strategies.push('Focus on quality improvement measures');
      }
    }
    
    return strategies;
  }

  private createYieldActionPlan(performanceData: any, targetYield: number): any {
    return {
      immediate_actions: [
        'Review current environmental settings',
        'Analyze recent performance trends',
        'Check equipment calibration'
      ],
      short_term_goals: [
        'Optimize feeding schedules',
        'Improve monitoring accuracy',
        'Enhance environmental control'
      ],
      long_term_objectives: [
        `Achieve target yield of ${targetYield} lbs`,
        'Maintain consistent quality standards',
        'Optimize resource efficiency'
      ],
      timeline: '30-90 days for full implementation'
    };
  }

  private getAgriculturalTroubleshooting(symptoms: string[], systemArea: string): any {
    return {
      common_causes: this.getCommonCauses(symptoms, systemArea),
      diagnostic_steps: this.getDiagnosticSteps(systemArea),
      quick_fixes: this.getQuickFixes(symptoms),
      when_to_escalate: this.getEscalationCriteria(symptoms)
    };
  }

  private getRecommendedWorkflows(symptoms: string[], systemArea: string): string[] {
    if (symptoms.some(s => s.includes('temperature'))) {
      return ['Environmental Control Automation'];
    }
    if (symptoms.some(s => s.includes('equipment'))) {
      return ['Predictive Maintenance System'];
    }
    return ['Intelligent Alert Processing'];
  }

  private getPreventiveMeasures(systemArea: string): string[] {
    const measures: Record<string, string[]> = {
      'environmental': ['Regular sensor calibration', 'Backup system checks', 'Environmental logging'],
      'equipment': ['Scheduled maintenance', 'Performance monitoring', 'Wear part replacement'],
      'biological': ['Health monitoring', 'Nutrition optimization', 'Stress prevention']
    };
    
    return measures[systemArea] || ['Regular system monitoring', 'Preventive maintenance'];
  }

  private getSafetyPrecautions(equipment: string): string[] {
    return ['Turn off power before maintenance', 'Use appropriate PPE', 'Follow lockout/tagout procedures'];
  }

  private getRequiredTools(equipment: string): string[] {
    return ['Basic hand tools', 'Multimeter', 'Safety equipment'];
  }

  private getEstimatedTime(equipment: string, urgency: string): string {
    const timeMap: Record<string, string> = {
      'low': '1-2 hours',
      'medium': '30-60 minutes',
      'high': '15-30 minutes',
      'critical': 'Immediate attention required'
    };
    return timeMap[urgency] || '1 hour';
  }

  private getFollowUpActions(equipment: string): string[] {
    return ['Test system operation', 'Update maintenance logs', 'Schedule next inspection'];
  }

  private getCommonCauses(symptoms: string[], systemArea: string): string[] {
    return ['Environmental factors', 'Equipment wear', 'Configuration issues'];
  }

  private getDiagnosticSteps(systemArea: string): string[] {
    return ['Check system status', 'Review recent changes', 'Analyze sensor data'];
  }

  private getQuickFixes(symptoms: string[]): string[] {
    return ['Restart system', 'Check connections', 'Verify settings'];
  }

  private getEscalationCriteria(symptoms: string[]): string[] {
    return ['Safety concerns', 'Equipment damage risk', 'Production impact'];
  }

  private getFallbackResponse(query: string, context: AgriculturalContext) {
    return {
      response: 'I understand you have a question about your agricultural system. While I process your request, here are some general recommendations based on your current conditions.',
      recommendations: [
        'Monitor environmental conditions regularly',
        'Maintain optimal temperature and moisture levels',
        'Follow established feeding and maintenance schedules'
      ],
      workflow_suggestions: ['Environmental Control Automation'],
      follow_up_questions: ['Could you provide more specific details about your concern?'],
      confidence: 0.3,
      intent: 'general_inquiry'
    };
  }
}

export const agriculturalAssistant = new AgriculturalAssistantService();
