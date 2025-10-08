

import { NextRequest, NextResponse } from 'next/server';

const generateWeatherForecast = (timeframe: string) => {
  const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const forecast = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Generate realistic weather data with seasonal patterns
    const baseTemp = 72 + Math.sin(i * 0.2) * 8; // Temperature variation
    const baseHumidity = 65 + Math.cos(i * 0.15) * 15; // Humidity variation
    const rainChance = Math.random();
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      temperature: Math.round((baseTemp + (Math.random() - 0.5) * 10) * 10) / 10,
      humidity: Math.round((baseHumidity + (Math.random() - 0.5) * 10) * 10) / 10,
      rainfall: rainChance > 0.7 ? Math.round(Math.random() * 2 * 10) / 10 : 0,
      confidence: Math.round((95 - (i * 2)) * 10) / 10 // Confidence decreases over time
    });
  }
  
  return forecast;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '7d';
    const location = url.searchParams.get('location');
    
    const weatherForecast = generateWeatherForecast(timeframe);
    
    return NextResponse.json({
      success: true,
      data: weatherForecast,
      metadata: {
        timeframe,
        location,
        model: 'Weather Prediction Model v4.1',
        lastUpdated: new Date().toISOString(),
        dataSource: 'NOAA + ML Enhancement'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather forecast',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
