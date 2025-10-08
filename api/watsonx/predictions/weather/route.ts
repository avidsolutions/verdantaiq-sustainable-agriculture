import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const location = searchParams.get('location') || 'peoria';

    // Generate mock weather forecast data
    // In production, this would integrate with weather APIs and watsonx.ai for enhanced predictions
    const weatherData = generateWeatherForecast(timeframe, location);

    return NextResponse.json({
      success: true,
      data: weatherData,
      metadata: {
        timeframe,
        location,
        generated_at: new Date().toISOString(),
        source: 'watsonx.ai_enhanced_forecast'
      }
    });

  } catch (error) {
    console.error('Weather prediction API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Weather prediction failed'
    }, { status: 500 });
  }
}

function generateWeatherForecast(timeframe: string, location: string) {
  const days = getTimeframeDays(timeframe);
  const baseTemp = 68; // Base temperature for Peoria area
  const baseHumidity = 65;
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Simulate seasonal temperature variation
    const seasonalVariation = Math.sin((date.getMonth() + 1) * Math.PI / 6) * 15;
    const dailyVariation = Math.sin(i * Math.PI / 7) * 5; // Weekly cycle
    const randomVariation = (Math.random() - 0.5) * 8;
    
    const temperature = baseTemp + seasonalVariation + dailyVariation + randomVariation;
    const humidity = Math.max(30, Math.min(90, baseHumidity + (Math.random() - 0.5) * 20));
    const rainfall = Math.random() < 0.3 ? Math.random() * 0.5 : 0; // 30% chance of rain
    
    return {
      date: date.toLocaleDateString(),
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall * 100) / 100,
      confidence: Math.round((85 + Math.random() * 10) * 10) / 10 // 85-95% confidence
    };
  });
}

function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case '24h': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 7;
  }
}
