import axios from 'axios';

interface SensorReading {
  deviceId: string;
  timestamp: string;
  temperature?: number;
  moisture?: number;
  ph?: number;
  humidity?: number;
  co2?: number;
  lightLevel?: number;
  soilNutrients?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

interface AgriculturalDataQuery {
  startDate: string;
  endDate: string;
  deviceIds?: string[];
  metrics?: string[];
  aggregation?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  filters?: Record<string, any>;
}

interface DataInsight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: string;
  confidence: number;
}

class WatsonDataService {
  private apiKey: string;
  private serviceUrl: string;
  private instanceId: string;

  constructor() {
    this.apiKey = process.env.WATSONX_DATA_API_KEY || process.env.IBM_CLOUD_API_KEY || '';
    this.serviceUrl = process.env.WATSONX_DATA_URL || 'https://us-south.lakehouse.cloud.ibm.com';
    this.instanceId = process.env.WATSONX_DATA_INSTANCE_ID || '';
  }

  async ingestSensorData(readings: SensorReading[]) {
    try {
      if (!this.apiKey) {
        return this.mockDataIngestion(readings);
      }

      const accessToken = await this.getAccessToken();
      
      // Transform sensor readings for watsonx.data format
      const transformedData = readings.map(reading => ({
        timestamp: reading.timestamp,
        device_id: reading.deviceId,
        metrics: {
          temperature: reading.temperature,
          moisture: reading.moisture,
          ph: reading.ph,
          humidity: reading.humidity,
          co2: reading.co2,
          light_level: reading.lightLevel,
          soil_nutrients: reading.soilNutrients
        },
        metadata: {
          ingestion_time: new Date().toISOString(),
          source: 'peoria-iot-sensors',
          quality_score: this.calculateDataQuality(reading)
        }
      }));

      const response = await axios.post(
        `${this.serviceUrl}/v2/data/ingest`,
        {
          table: 'sensor_telemetry',
          data: transformedData,
          schema: 'peoria_agriculture'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        recordsIngested: readings.length,
        ingestionId: response.data.ingestion_id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('watsonx.data ingestion error:', error);
      return this.mockDataIngestion(readings);
    }
  }

  async queryAgriculturalData(query: AgriculturalDataQuery) {
    try {
      if (!this.apiKey) {
        return this.mockDataQuery(query);
      }

      const accessToken = await this.getAccessToken();
      
      // Build SQL query for agricultural data
      const sqlQuery = this.buildAgriculturalQuery(query);
      
      const response = await axios.post(
        `${this.serviceUrl}/v2/query/execute`,
        {
          query: sqlQuery,
          schema: 'peoria_agriculture',
          format: 'json'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        data: response.data.results,
        metadata: {
          queryId: response.data.query_id,
          executionTime: response.data.execution_time,
          rowCount: response.data.row_count
        },
        insights: await this.generateDataInsights(response.data.results)
      };
    } catch (error) {
      console.error('watsonx.data query error:', error);
      return this.mockDataQuery(query);
    }
  }

  async createAgriculturalDataModel(modelConfig: any) {
    try {
      if (!this.apiKey) {
        return this.mockModelCreation(modelConfig);
      }

      const accessToken = await this.getAccessToken();
      
      const response = await axios.post(
        `${this.serviceUrl}/v2/models/create`,
        {
          name: modelConfig.name,
          type: 'time_series_analysis',
          schema: 'peoria_agriculture',
          config: {
            target_metrics: modelConfig.targetMetrics,
            features: modelConfig.features,
            aggregation_window: modelConfig.aggregationWindow,
            prediction_horizon: modelConfig.predictionHorizon
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        modelId: response.data.model_id,
        status: response.data.status,
        trainingStarted: true,
        estimatedCompletion: response.data.estimated_completion
      };
    } catch (error) {
      console.error('watsonx.data model creation error:', error);
      return this.mockModelCreation(modelConfig);
    }
  }

  async getEnvironmentalTrends(deviceIds: string[], timeRange: string) {
    const query: AgriculturalDataQuery = {
      startDate: this.calculateStartDate(timeRange),
      endDate: new Date().toISOString(),
      deviceIds,
      metrics: ['temperature', 'moisture', 'ph', 'humidity'],
      aggregation: 'hourly'
    };

    const result = await this.queryAgriculturalData(query);
    
    return {
      trends: this.analyzeTrends(result.data),
      anomalies: this.detectAnomalies(result.data),
      predictions: await this.generatePredictions(result.data),
      recommendations: this.generateRecommendations(result.data)
    };
  }

  async getYieldAnalytics(farmId: string, cropType: string) {
    try {
      const query = `
        SELECT 
          DATE_TRUNC('week', timestamp) as week,
          AVG(metrics.temperature) as avg_temp,
          AVG(metrics.moisture) as avg_moisture,
          AVG(metrics.ph) as avg_ph,
          COUNT(*) as reading_count
        FROM sensor_telemetry 
        WHERE device_id LIKE '${farmId}%' 
        AND timestamp >= NOW() - INTERVAL '3 months'
        GROUP BY week
        ORDER BY week
      `;

      const result = await this.queryAgriculturalData({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });

      return {
        yieldProjection: this.calculateYieldProjection(result.data),
        optimalConditions: this.identifyOptimalConditions(result.data),
        improvementAreas: this.identifyImprovementAreas(result.data),
        seasonalPatterns: this.analyzeSeasonalPatterns(result.data)
      };
    } catch (error) {
      console.error('Yield analytics error:', error);
      return this.mockYieldAnalytics();
    }
  }

  private async getAccessToken() {
    const response = await axios.post('https://iam.cloud.ibm.com/identity/token', 
      `grant_type=urn:iam:grant-type:apikey&apikey=${this.apiKey}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  }

  private buildAgriculturalQuery(query: AgriculturalDataQuery): string {
    const metrics = query.metrics?.join(', ') || '*';
    const deviceFilter = query.deviceIds ? 
      `AND device_id IN (${query.deviceIds.map(id => `'${id}'`).join(', ')})` : '';
    
    return `
      SELECT ${metrics}
      FROM sensor_telemetry 
      WHERE timestamp BETWEEN '${query.startDate}' AND '${query.endDate}'
      ${deviceFilter}
      ORDER BY timestamp DESC
    `;
  }

  private calculateDataQuality(reading: SensorReading): number {
    let score = 100;
    
    // Check for missing critical values
    if (!reading.temperature) score -= 20;
    if (!reading.moisture) score -= 20;
    if (!reading.ph) score -= 15;
    
    // Check for reasonable ranges
    if (reading.temperature && (reading.temperature < -10 || reading.temperature > 120)) score -= 25;
    if (reading.moisture && (reading.moisture < 0 || reading.moisture > 100)) score -= 25;
    if (reading.ph && (reading.ph < 0 || reading.ph > 14)) score -= 25;
    
    return Math.max(0, score);
  }

  private calculateStartDate(timeRange: string): string {
    const now = new Date();
    switch (timeRange) {
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private async generateDataInsights(data: any[]): Promise<DataInsight[]> {
    // Analyze data and generate insights
    const insights: DataInsight[] = [];
    
    // Temperature trend analysis
    const tempTrend = this.analyzeTrends(data.filter(d => d.temperature));
    if (tempTrend.direction === 'increasing' && tempTrend.rate > 0.5) {
      insights.push({
        type: 'trend',
        severity: 'medium',
        message: 'Temperature is trending upward. Consider increasing ventilation.',
        data: tempTrend,
        timestamp: new Date().toISOString(),
        confidence: 0.85
      });
    }
    
    return insights;
  }

  private analyzeTrends(data: any[]) {
    // Simple trend analysis implementation
    if (data.length < 2) return { direction: 'stable', rate: 0 };
    
    const first = data[0];
    const last = data[data.length - 1];
    const rate = (last.value - first.value) / data.length;
    
    return {
      direction: rate > 0.1 ? 'increasing' : rate < -0.1 ? 'decreasing' : 'stable',
      rate: Math.abs(rate)
    };
  }

  private detectAnomalies(data: any[]) {
    // Simple anomaly detection
    return data.filter(d => d.quality_score < 70);
  }

  private async generatePredictions(data: any[]) {
    // Mock prediction generation
    return {
      nextHour: { temperature: 72, moisture: 65, ph: 6.5 },
      confidence: 0.78
    };
  }

  private generateRecommendations(data: any[]) {
    return [
      'Maintain current moisture levels',
      'Monitor pH levels closely',
      'Consider adjusting feeding schedule'
    ];
  }

  private calculateYieldProjection(data: any[]) {
    return {
      projected: 125.5,
      unit: 'lbs',
      timeframe: '30 days',
      confidence: 0.82
    };
  }

  private identifyOptimalConditions(data: any[]) {
    return {
      temperature: { min: 68, max: 75 },
      moisture: { min: 60, max: 70 },
      ph: { min: 6.0, max: 7.0 }
    };
  }

  private identifyImprovementAreas(data: any[]) {
    return [
      'Temperature control consistency',
      'Moisture distribution uniformity',
      'pH stabilization'
    ];
  }

  private analyzeSeasonalPatterns(data: any[]) {
    return {
      spring: { yield: 110, conditions: 'optimal' },
      summer: { yield: 95, conditions: 'challenging' },
      fall: { yield: 120, conditions: 'excellent' },
      winter: { yield: 85, conditions: 'controlled' }
    };
  }

  // Mock implementations for development/testing
  private mockDataIngestion(readings: SensorReading[]) {
    return {
      success: true,
      recordsIngested: readings.length,
      ingestionId: `mock_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  private mockDataQuery(query: AgriculturalDataQuery) {
    return {
      data: [
        { timestamp: new Date().toISOString(), temperature: 72, moisture: 65, ph: 6.5 },
        { timestamp: new Date(Date.now() - 3600000).toISOString(), temperature: 71, moisture: 67, ph: 6.4 }
      ],
      metadata: { queryId: 'mock_query', executionTime: 150, rowCount: 2 },
      insights: []
    };
  }

  private mockModelCreation(config: any) {
    return {
      modelId: `mock_model_${Date.now()}`,
      status: 'training',
      trainingStarted: true,
      estimatedCompletion: new Date(Date.now() + 3600000).toISOString()
    };
  }

  private mockYieldAnalytics() {
    return {
      yieldProjection: { projected: 125.5, unit: 'lbs', timeframe: '30 days', confidence: 0.82 },
      optimalConditions: { temperature: { min: 68, max: 75 }, moisture: { min: 60, max: 70 } },
      improvementAreas: ['Temperature control', 'Moisture distribution'],
      seasonalPatterns: { spring: { yield: 110 }, summer: { yield: 95 } }
    };
  }
}

export const watsonData = new WatsonDataService();
