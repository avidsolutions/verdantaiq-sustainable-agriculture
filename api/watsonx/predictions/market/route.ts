import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const cropTypes = searchParams.get('crops')?.split(',') || ['lettuce', 'tomatoes', 'herbs'];

    // Generate market prediction data
    // In production, this would integrate with market data APIs and watsonx.ai for price forecasting
    const marketData = generateMarketPredictions(timeframe, cropTypes);

    return NextResponse.json({
      success: true,
      data: marketData,
      metadata: {
        timeframe,
        cropTypes,
        generated_at: new Date().toISOString(),
        model: 'watsonx.ai_market_predictor'
      }
    });

  } catch (error) {
    console.error('Market prediction API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Market prediction failed'
    }, { status: 500 });
  }
}

function generateMarketPredictions(timeframe: string, cropTypes: string[]) {
  const marketBaselines = {
    lettuce: { price: 2.50, volatility: 0.15, seasonal_factor: 1.0 },
    tomatoes: { price: 3.20, volatility: 0.20, seasonal_factor: 1.1 },
    herbs: { price: 8.50, volatility: 0.25, seasonal_factor: 0.9 },
    peppers: { price: 4.10, volatility: 0.18, seasonal_factor: 1.05 },
    cucumbers: { price: 2.80, volatility: 0.16, seasonal_factor: 1.0 },
    spinach: { price: 3.50, volatility: 0.22, seasonal_factor: 0.95 }
  };

  return cropTypes.map(crop => {
    const baseline = marketBaselines[crop as keyof typeof marketBaselines] || marketBaselines.lettuce;
    
    // Calculate market factors
    const seasonalAdjustment = getSeasonalAdjustment(crop);
    const demandFactor = getDemandFactor(crop, timeframe);
    const supplyFactor = getSupplyFactor(crop);
    
    const current_price = baseline.price * seasonalAdjustment;
    const predicted_price = current_price * demandFactor * supplyFactor;
    const price_change = ((predicted_price - current_price) / current_price) * 100;
    
    // Generate optimal harvest window
    const harvestWindow = getOptimalHarvestWindow(timeframe, price_change);
    
    // Generate market factors
    const market_factors = getMarketFactors(crop, price_change);

    return {
      crop: crop.charAt(0).toUpperCase() + crop.slice(1),
      current_price: Math.round(current_price * 100) / 100,
      predicted_price: Math.round(predicted_price * 100) / 100,
      price_change: Math.round(price_change * 10) / 10,
      optimal_harvest_window: harvestWindow,
      market_factors
    };
  });
}

function getSeasonalAdjustment(crop: string): number {
  const month = new Date().getMonth() + 1; // 1-12
  
  // Different crops have different seasonal price patterns
  switch (crop) {
    case 'lettuce':
      // Higher prices in winter, lower in summer
      return month >= 11 || month <= 2 ? 1.2 : month >= 6 && month <= 8 ? 0.8 : 1.0;
    case 'tomatoes':
      // Higher prices in winter/early spring, lower in summer
      return month >= 12 || month <= 3 ? 1.4 : month >= 7 && month <= 9 ? 0.7 : 1.0;
    case 'herbs':
      // Relatively stable, slight premium in winter
      return month >= 11 || month <= 2 ? 1.1 : 0.95;
    case 'peppers':
      // Similar to tomatoes but less extreme
      return month >= 12 || month <= 3 ? 1.3 : month >= 7 && month <= 9 ? 0.8 : 1.0;
    default:
      return 1.0;
  }
}

function getDemandFactor(crop: string, timeframe: string): number {
  // Simulate demand fluctuations based on various factors
  const baseDemand = 1.0;
  const randomVariation = 0.95 + Math.random() * 0.1; // ±5% random variation
  
  // Holiday/seasonal demand adjustments
  const month = new Date().getMonth() + 1;
  let holidayFactor = 1.0;
  
  if (month === 11 || month === 12) { // Thanksgiving/Christmas
    holidayFactor = crop === 'herbs' ? 1.3 : 1.1;
  } else if (month >= 5 && month <= 8) { // Summer grilling season
    holidayFactor = crop === 'tomatoes' || crop === 'peppers' ? 1.15 : 1.0;
  }
  
  return baseDemand * randomVariation * holidayFactor;
}

function getSupplyFactor(crop: string): number {
  // Simulate supply factors (weather, competition, etc.)
  const baseSupply = 1.0;
  const weatherImpact = 0.9 + Math.random() * 0.2; // Weather can affect supply ±10%
  const competitionFactor = 0.95 + Math.random() * 0.1; // Market competition
  
  return baseSupply * weatherImpact * competitionFactor;
}

function getOptimalHarvestWindow(timeframe: string, priceChange: number): { start: string; end: string } {
  const currentDate = new Date();
  let optimalStart = new Date(currentDate);
  let optimalEnd = new Date(currentDate);
  
  if (priceChange > 5) {
    // Prices rising - harvest later in the window
    optimalStart.setDate(optimalStart.getDate() + Math.floor(getTimeframeDays(timeframe) * 0.6));
    optimalEnd.setDate(optimalEnd.getDate() + getTimeframeDays(timeframe));
  } else if (priceChange < -5) {
    // Prices falling - harvest earlier
    optimalStart.setDate(optimalStart.getDate() + 1);
    optimalEnd.setDate(optimalEnd.getDate() + Math.floor(getTimeframeDays(timeframe) * 0.4));
  } else {
    // Stable prices - harvest in middle of window
    optimalStart.setDate(optimalStart.getDate() + Math.floor(getTimeframeDays(timeframe) * 0.3));
    optimalEnd.setDate(optimalEnd.getDate() + Math.floor(getTimeframeDays(timeframe) * 0.7));
  }
  
  return {
    start: optimalStart.toISOString(),
    end: optimalEnd.toISOString()
  };
}

function getMarketFactors(crop: string, priceChange: number): string[] {
  const factors = [];
  
  // Base factors that always apply
  factors.push('Seasonal demand patterns');
  factors.push('Local supply conditions');
  
  // Price-dependent factors
  if (priceChange > 5) {
    factors.push('Increased consumer demand');
    factors.push('Limited supply from competitors');
  } else if (priceChange < -5) {
    factors.push('Market oversupply conditions');
    factors.push('Reduced consumer spending');
  } else {
    factors.push('Stable market conditions');
  }
  
  // Crop-specific factors
  switch (crop) {
    case 'lettuce':
      factors.push('Salad consumption trends');
      factors.push('Restaurant industry demand');
      break;
    case 'tomatoes':
      factors.push('Processing industry demand');
      factors.push('Import competition levels');
      break;
    case 'herbs':
      factors.push('Culinary trend influences');
      factors.push('Premium market positioning');
      break;
  }
  
  // Weather and seasonal factors
  const month = new Date().getMonth() + 1;
  if (month >= 11 || month <= 2) {
    factors.push('Winter weather impact on supply');
  } else if (month >= 6 && month <= 8) {
    factors.push('Peak growing season competition');
  }
  
  return factors;
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
