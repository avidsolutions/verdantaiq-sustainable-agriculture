/**
 * VerdantaIQ Weather Data API Endpoint
 * Provides access to NOAA weather data via Data.gov
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock weather data service for demonstration
const mockWeatherService = {
  async getWeatherData(location: string, days: number) {
    return Array.from({ length: days }, (_, i) => ({
      location,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: {
        min: 65 + Math.random() * 10,
        max: 75 + Math.random() * 15,
        avg: 70 + Math.random() * 10
      },
      precipitation: Math.random() * 0.5,
      humidity: 60 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
      conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      source: 'NOAA'
    }));
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'ILLINOIS';
    const days = parseInt(searchParams.get('days') || '7');
    const includeHistorical = searchParams.get('includeHistorical') === 'true';

    // Get weather forecast
    const weatherData = await mockWeatherService.getWeatherData(location, days);

    // Calculate weather insights for agriculture
    const insights = calculateAgriculturalWeatherInsights(weatherData);

    return NextResponse.json({
      success: true,
      location,
      forecast: weatherData,
      insights,
      recommendations: generateWeatherRecommendations(insights),
      timestamp: new Date().toISOString(),
      source: 'VerdantaIQ Weather Service'
    });

  } catch (error) {
    console.error('Weather API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations, analysis_type } = body;

    if (!Array.isArray(locations)) {
      return NextResponse.json(
        { error: 'locations must be an array' },
        { status: 400 }
      );
    }

    let data;

    switch (analysis_type) {
      case 'multi-location':
        // Get weather for multiple locations
        data = await Promise.all(
          locations.map(async (location: string) => {
            const weather = await mockWeatherService.getWeatherData(location, 7);
            const insights = calculateAgriculturalWeatherInsights(weather);
            return { location, weather, insights };
          })
        );
        break;

      case 'agricultural-impact':
        // Analyze weather impact on specific crops
        const { crop_type, growth_stage } = body;
        
        data = await Promise.all(
          locations.map(async (location: string) => {
            const weather = await mockWeatherService.getWeatherData(location, 14);
            const impact = analyzeWeatherImpactOnCrop(weather, crop_type, growth_stage);
            return { location, weather, impact };
          })
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid analysis_type. Use "multi-location" or "agricultural-impact"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      analysis_type,
      data,
      timestamp: new Date().toISOString(),
      source: 'VerdantaIQ Weather Service'
    });

  } catch (error) {
    console.error('Weather POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process weather analysis request',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper functions for weather analysis
function calculateAgriculturalWeatherInsights(weatherData: any[]) {
  if (!weatherData.length) return {};

  const avgTemp = weatherData.reduce((sum, day) => sum + day.temperature.avg, 0) / weatherData.length;
  const totalPrecipitation = weatherData.reduce((sum, day) => sum + day.precipitation, 0);
  const avgHumidity = weatherData.reduce((sum, day) => sum + day.humidity, 0) / weatherData.length;
  const maxWindSpeed = Math.max(...weatherData.map(day => day.windSpeed));

  // Calculate growing degree days (base 50°F for most crops)
  const growingDegreeDays = weatherData.reduce((sum, day) => {
    const dailyGDD = Math.max(0, day.temperature.avg - 50);
    return sum + dailyGDD;
  }, 0);

  // Stress indicators
  const heatStressDays = weatherData.filter(day => day.temperature.max > 85).length;
  const coldStressDays = weatherData.filter(day => day.temperature.min < 50).length;
  const droughtRisk = totalPrecipitation < 1.0;
  const floodRisk = weatherData.some(day => day.precipitation > 1.5);

  return {
    averageTemperature: Math.round(avgTemp * 10) / 10,
    totalPrecipitation: Math.round(totalPrecipitation * 100) / 100,
    averageHumidity: Math.round(avgHumidity),
    maxWindSpeed: Math.round(maxWindSpeed * 10) / 10,
    growingDegreeDays: Math.round(growingDegreeDays),
    stressIndicators: {
      heatStressDays,
      coldStressDays,
      droughtRisk,
      floodRisk
    },
    favorableConditions: heatStressDays === 0 && coldStressDays === 0 && !droughtRisk && !floodRisk
  };
}

function generateWeatherRecommendations(insights: any): string[] {
  const recommendations: string[] = [];

  if (insights.stressIndicators?.heatStressDays > 0) {
    recommendations.push(`${insights.stressIndicators.heatStressDays} days of heat stress expected - ensure adequate irrigation and shade`);
  }

  if (insights.stressIndicators?.coldStressDays > 0) {
    recommendations.push(`${insights.stressIndicators.coldStressDays} days of cold stress expected - consider protective measures`);
  }

  if (insights.stressIndicators?.droughtRisk) {
    recommendations.push('Low precipitation forecasted - monitor soil moisture and increase irrigation');
  }

  if (insights.stressIndicators?.floodRisk) {
    recommendations.push('Heavy precipitation expected - ensure proper drainage and flood protection');
  }

  if (insights.maxWindSpeed > 25) {
    recommendations.push('High winds forecasted - secure equipment and protect sensitive crops');
  }

  if (insights.growingDegreeDays > 0) {
    recommendations.push(`${insights.growingDegreeDays} growing degree days accumulated - good conditions for crop development`);
  }

  if (insights.favorableConditions) {
    recommendations.push('Favorable weather conditions expected - optimal time for field operations');
  }

  return recommendations;
}

function analyzeWeatherImpactOnCrop(weatherData: any[], cropType: string, growthStage: string) {
  const insights = calculateAgriculturalWeatherInsights(weatherData);
  
  // Crop-specific analysis
  const cropRequirements = getCropRequirements(cropType, growthStage);
  
  const impact = {
    overall: 'neutral' as 'positive' | 'negative' | 'neutral',
    factors: [] as string[],
    recommendations: [] as string[]
  };

  // Temperature analysis
  if (insights.averageTemperature && insights.averageTemperature < cropRequirements.minTemp) {
    impact.overall = 'negative';
    impact.factors.push('Below optimal temperature range');
    impact.recommendations.push('Consider protective measures or heating');
  } else if (insights.averageTemperature && insights.averageTemperature > cropRequirements.maxTemp) {
    impact.overall = 'negative';
    impact.factors.push('Above optimal temperature range');
    impact.recommendations.push('Increase cooling and irrigation');
  } else if (insights.averageTemperature) {
    impact.factors.push('Temperature within optimal range');
  }

  // Precipitation analysis
  if (insights.totalPrecipitation && insights.totalPrecipitation < cropRequirements.minPrecipitation) {
    impact.overall = 'negative';
    impact.factors.push('Insufficient precipitation');
    impact.recommendations.push('Increase irrigation frequency');
  } else if (insights.totalPrecipitation && insights.totalPrecipitation > cropRequirements.maxPrecipitation) {
    impact.overall = 'negative';
    impact.factors.push('Excessive precipitation');
    impact.recommendations.push('Improve drainage and reduce irrigation');
  } else if (insights.totalPrecipitation) {
    impact.factors.push('Precipitation within optimal range');
  }

  return impact;
}

function getCropRequirements(cropType: string, growthStage: string) {
  // Simplified crop requirements - in production would be more comprehensive
  const requirements: Record<string, any> = {
    'corn': {
      minTemp: 60,
      maxTemp: 85,
      minPrecipitation: 1.0,
      maxPrecipitation: 3.0
    },
    'soybeans': {
      minTemp: 65,
      maxTemp: 80,
      minPrecipitation: 0.8,
      maxPrecipitation: 2.5
    },
    'wheat': {
      minTemp: 55,
      maxTemp: 75,
      minPrecipitation: 0.6,
      maxPrecipitation: 2.0
    }
  };

  return requirements[cropType.toLowerCase()] || requirements['corn'];
}
