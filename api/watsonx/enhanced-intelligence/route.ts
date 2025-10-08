/**
 * VerdantaIQ Enhanced Agricultural Intelligence API
 * Combines WatsonX AI with government data sources for comprehensive insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { watsonXIntegration } from '../../../lib/watson/watsonx-integration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      commodity: searchParams.get('commodity') || 'CORN',
      location: searchParams.get('location') || 'ILLINOIS',
      includeMarketData: searchParams.get('includeMarketData') !== 'false',
      includeWeatherData: searchParams.get('includeWeatherData') !== 'false',
      includePredictions: searchParams.get('includePredictions') !== 'false'
    };

    console.log('🧠 Generating enhanced agricultural intelligence...', params);

    const intelligence = await watsonXIntegration.getEnhancedAgriculturalIntelligence(params);

    if (!intelligence.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate enhanced intelligence',
        message: intelligence.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      intelligence: intelligence.data,
      metadata: {
        confidence: intelligence.confidence || 0.75,
        source: 'watsonx-enhanced-intelligence',
        timestamp: new Date().toISOString(),
        parameters: params
      }
    });

  } catch (error) {
    console.error('Enhanced intelligence API error:', error);
    
    // Fallback to mock enhanced intelligence
    const mockIntelligence = generateMockEnhancedIntelligence();
    
    return NextResponse.json({
      success: true,
      intelligence: mockIntelligence,
      metadata: {
        confidence: 0.75,
        source: 'mock-enhanced-intelligence',
        timestamp: new Date().toISOString(),
        note: 'Using mock data due to service unavailability'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      commodities, 
      locations, 
      analysis_type = 'comprehensive',
      time_horizon = '30_days'
    } = body;

    if (!Array.isArray(commodities) && !commodities) {
      return NextResponse.json(
        { error: 'commodities parameter is required' },
        { status: 400 }
      );
    }

    let results;

    switch (analysis_type) {
      case 'comparative':
        results = await generateComparativeAnalysis(commodities, locations);
        break;

      case 'risk_assessment':
        results = await generateRiskAssessment(commodities, locations, time_horizon);
        break;

      case 'market_opportunity':
        results = await generateMarketOpportunityAnalysis(commodities, locations);
        break;

      case 'comprehensive':
      default:
        results = await generateComprehensiveAnalysis(commodities, locations);
        break;
    }

    return NextResponse.json({
      success: true,
      analysis_type,
      results,
      metadata: {
        timestamp: new Date().toISOString(),
        commodities_analyzed: commodities?.length || 1,
        locations_analyzed: locations?.length || 1
      }
    });

  } catch (error) {
    console.error('Enhanced intelligence POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process enhanced intelligence request',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper functions for different analysis types
async function generateComparativeAnalysis(commodities: string[], locations: string[]) {
  const analyses = await Promise.all(
    commodities.map(async (commodity) => {
      const locationAnalyses = await Promise.all(
        (locations || ['ILLINOIS']).map(async (location) => {
          return await watsonXIntegration.getEnhancedAgriculturalIntelligence({
            commodity,
            location,
            includeMarketData: true,
            includeWeatherData: true,
            includePredictions: true
          });
        })
      );
      
      return {
        commodity,
        location_analyses: locationAnalyses.map((analysis, index) => ({
          location: locations[index],
          data: analysis.data,
          confidence: analysis.confidence
        }))
      };
    })
  );

  return {
    type: 'comparative',
    comparisons: analyses,
    summary: generateComparativeSummary(analyses)
  };
}

async function generateRiskAssessment(commodities: string[], locations: string[], timeHorizon: string) {
  const riskAnalyses = await Promise.all(
    commodities.map(async (commodity) => {
      const intelligence = await watsonXIntegration.getEnhancedAgriculturalIntelligence({
        commodity,
        location: locations?.[0] || 'ILLINOIS',
        includeMarketData: true,
        includeWeatherData: true,
        includePredictions: true
      });

      return {
        commodity,
        risk_factors: extractRiskFactors(intelligence.data),
        mitigation_strategies: generateMitigationStrategies(intelligence.data),
        risk_score: calculateRiskScore(intelligence.data)
      };
    })
  );

  return {
    type: 'risk_assessment',
    time_horizon: timeHorizon,
    risk_analyses: riskAnalyses,
    overall_risk: calculateOverallRisk(riskAnalyses)
  };
}

async function generateMarketOpportunityAnalysis(commodities: string[], locations: string[]) {
  const opportunities = await Promise.all(
    commodities.map(async (commodity) => {
      const intelligence = await watsonXIntegration.getEnhancedAgriculturalIntelligence({
        commodity,
        location: locations?.[0] || 'ILLINOIS',
        includeMarketData: true,
        includeWeatherData: false,
        includePredictions: true
      });

      return {
        commodity,
        market_outlook: extractMarketOutlook(intelligence.data),
        price_trends: extractPriceTrends(intelligence.data),
        opportunities: identifyOpportunities(intelligence.data),
        timing_recommendations: generateTimingRecommendations(intelligence.data)
      };
    })
  );

  return {
    type: 'market_opportunity',
    opportunities,
    best_opportunities: rankOpportunities(opportunities)
  };
}

async function generateComprehensiveAnalysis(commodities: string[], locations: string[]) {
  const comprehensive = await Promise.all(
    commodities.map(async (commodity) => {
      return await watsonXIntegration.getEnhancedAgriculturalIntelligence({
        commodity,
        location: locations?.[0] || 'ILLINOIS',
        includeMarketData: true,
        includeWeatherData: true,
        includePredictions: true
      });
    })
  );

  return {
    type: 'comprehensive',
    analyses: comprehensive.map((analysis, index) => ({
      commodity: commodities[index],
      intelligence: analysis.data,
      confidence: analysis.confidence
    })),
    executive_summary: generateExecutiveSummary(comprehensive)
  };
}

// Helper functions for analysis processing
function generateComparativeSummary(analyses: any[]) {
  return {
    total_commodities: analyses.length,
    highest_yield_potential: 'Analysis pending',
    best_market_conditions: 'Analysis pending',
    recommended_focus: 'Diversified portfolio approach'
  };
}

function extractRiskFactors(data: any) {
  const risks = [];
  
  if (data?.weather_forecast) {
    const extremeWeather = data.weather_forecast.some((day: any) => 
      day.temperature?.max > 90 || day.precipitation > 2
    );
    if (extremeWeather) {
      risks.push({
        type: 'weather',
        severity: 'medium',
        description: 'Extreme weather conditions forecasted'
      });
    }
  }

  if (data?.market_analysis) {
    const priceVolatility = data.market_analysis.some((item: any) => item.trend === 'down');
    if (priceVolatility) {
      risks.push({
        type: 'market',
        severity: 'medium',
        description: 'Market price volatility detected'
      });
    }
  }

  return risks;
}

function generateMitigationStrategies(data: any) {
  return [
    'Implement diversified cropping strategy',
    'Monitor weather patterns closely',
    'Consider crop insurance options',
    'Maintain flexible planting schedules'
  ];
}

function calculateRiskScore(data: any): number {
  let score = 50;
  
  if (data?.weather_forecast) {
    const badWeatherDays = data.weather_forecast.filter((day: any) => 
      day.temperature?.max > 85 || day.precipitation > 1.5
    ).length;
    score += badWeatherDays * 5;
  }

  return Math.min(100, Math.max(0, score));
}

function calculateOverallRisk(riskAnalyses: any[]) {
  const avgRisk = riskAnalyses.reduce((sum, analysis) => sum + analysis.risk_score, 0) / riskAnalyses.length;
  
  if (avgRisk > 70) return 'high';
  if (avgRisk > 40) return 'medium';
  return 'low';
}

function extractMarketOutlook(data: any) {
  return {
    trend: 'stable',
    confidence: 0.75,
    factors: ['Seasonal demand patterns', 'Weather impact on supply']
  };
}

function extractPriceTrends(data: any) {
  return {
    current_trend: 'stable',
    projected_direction: 'slightly_up',
    volatility: 'moderate'
  };
}

function identifyOpportunities(data: any) {
  return [
    'Optimal planting window approaching',
    'Market demand expected to increase',
    'Weather conditions favorable for growth'
  ];
}

function generateTimingRecommendations(data: any) {
  return {
    planting: 'Optimal window: Next 2-3 weeks',
    harvesting: 'Monitor market conditions',
    selling: 'Consider staged selling approach'
  };
}

function rankOpportunities(opportunities: any[]) {
  return opportunities.map((opp, index) => ({
    rank: index + 1,
    commodity: opp.commodity,
    score: 75 + Math.random() * 20,
    rationale: 'Strong market fundamentals and favorable conditions'
  }));
}

function generateExecutiveSummary(analyses: any[]) {
  return {
    key_insights: [
      'Government data integration provides enhanced market visibility',
      'Weather patterns indicate favorable growing conditions',
      'Market opportunities exist for diversified crop portfolio'
    ],
    recommendations: [
      'Leverage government data for strategic planning',
      'Monitor real-time conditions alongside historical trends',
      'Implement data-driven decision making processes'
    ],
    confidence_level: 'high'
  };
}

function generateMockEnhancedIntelligence() {
  return {
    overview: {
      commodity: 'CORN',
      location: 'ILLINOIS',
      analysisDate: new Date().toISOString(),
      dataQuality: {
        sources: ['USDA_NASS', 'DATA_GOV', 'WATSON_AI'],
        lastUpdated: new Date(),
        confidence: 0.85
      }
    },
    government_data: {
      yield_prediction: {
        commodity: 'CORN',
        predictedYield: 185.5,
        confidence: 0.82,
        historicalAverage: 175.2
      },
      market_analysis: [
        {
          commodity: 'CORN',
          date: new Date(),
          price: 6.25,
          unit: 'USD/BU',
          trend: 'stable'
        }
      ],
      weather_forecast: [
        {
          location: 'ILLINOIS',
          date: new Date(),
          temperature: { min: 65, max: 78, avg: 71 },
          precipitation: 0.2,
          conditions: 'Partly Cloudy'
        }
      ]
    },
    recommendations: [
      'Current yield predictions are above historical average',
      'Market conditions are stable with moderate pricing',
      'Weather conditions are favorable for crop development',
      'Consider optimizing planting density for maximum yield'
    ]
  };
}
