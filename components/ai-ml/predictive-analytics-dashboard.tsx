

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Droplets,
  Thermometer,
  Bug,
  Leaf,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PredictiveInsight {
  id: string;
  type: 'yield' | 'weather' | 'pest' | 'irrigation' | 'harvest_timing' | 'market_price';
  title: string;
  prediction: any;
  confidence: number;
  timeframe: '24h' | '7d' | '30d' | '90d' | '1y';
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  modelUsed: string;
  timestamp: Date;
}

interface YieldPrediction {
  date: string;
  predicted: number;
  confidence_upper: number;
  confidence_lower: number;
  actual?: number;
}

interface WeatherForecast {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  confidence: number;
}

interface PestRiskAssessment {
  pest_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  peak_period: string;
  affected_crops: string[];
  prevention_actions: string[];
}

interface MarketPrediction {
  crop: string;
  current_price: number;
  predicted_price: number;
  price_change: number;
  optimal_harvest_window: {
    start: string;
    end: string;
  };
  market_factors: string[];
}

export function PredictiveAnalyticsDashboard() {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [yieldData, setYieldData] = useState<YieldPrediction[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([]);
  const [pestRisks, setPestRisks] = useState<PestRiskAssessment[]>([]);
  const [marketData, setMarketData] = useState<MarketPrediction[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPredictiveData();
  }, [selectedTimeframe]);

  const loadPredictiveData = async () => {
    setIsLoading(true);
    try {
      // Use the new watsonx integration endpoints
      const [insightsRes, yieldRes, weatherRes, pestRes, marketRes] = await Promise.all([
        fetch(`/api/watsonx/predictions/insights?timeframe=${selectedTimeframe}`),
        fetch(`/api/watsonx/predictions/yield?timeframe=${selectedTimeframe}`),
        fetch(`/api/watsonx/predictions/weather?timeframe=${selectedTimeframe}`),
        fetch(`/api/watsonx/predictions/pest-risk?timeframe=${selectedTimeframe}`),
        fetch(`/api/watsonx/predictions/market?timeframe=${selectedTimeframe}`)
      ]);

      const [insights, yield_data, weather, pest, market] = await Promise.all([
        insightsRes.json(),
        yieldRes.json(),
        weatherRes.json(),
        pestRes.json(),
        marketRes.json()
      ]);

      if (insights.success) {
        // Transform watsonx insights to component format
        const transformedInsights = insights.data.insights?.map((insight: string, index: number) => ({
          id: `insight_${index}`,
          type: 'yield' as const,
          title: insight,
          prediction: insights.data.data,
          confidence: insights.confidence || 75,
          timeframe: selectedTimeframe,
          impact: 'medium' as const,
          recommendation: insights.data.recommendations?.[index] || insight,
          modelUsed: 'watsonx.ai',
          timestamp: new Date()
        })) || [];
        setInsights(transformedInsights);
      }

      if (yield_data.success) setYieldData(yield_data.data);
      if (weather.success) setWeatherData(weather.data);
      if (pest.success) setPestRisks(pest.data);
      if (market.success) setMarketData(market.data);

    } catch (error) {
      console.error('Failed to load predictive data:', error);
      // Fallback to mock data for development
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock data for development when watsonx is not available
    setInsights([
      {
        id: 'mock_1',
        type: 'yield',
        title: 'Optimal harvest window approaching',
        prediction: { yield: 125, confidence: 85 },
        confidence: 85,
        timeframe: selectedTimeframe,
        impact: 'high',
        recommendation: 'Prepare harvesting equipment and schedule labor',
        modelUsed: 'watsonx.ai (mock)',
        timestamp: new Date()
      },
      {
        id: 'mock_2',
        type: 'weather',
        title: 'Temperature increase predicted',
        prediction: { temp_change: 5 },
        confidence: 78,
        timeframe: selectedTimeframe,
        impact: 'medium',
        recommendation: 'Increase ventilation and monitor moisture levels',
        modelUsed: 'watsonx.ai (mock)',
        timestamp: new Date()
      }
    ]);

    // Mock yield data
    const mockYieldData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      predicted: 100 + Math.random() * 50,
      confidence_upper: 120 + Math.random() * 30,
      confidence_lower: 80 + Math.random() * 20,
      actual: i < 3 ? 95 + Math.random() * 40 : undefined
    }));
    setYieldData(mockYieldData);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-blue-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case '24h': return '24 Hours';
      case '7d': return '7 Days';
      case '30d': return '30 Days';
      case '90d': return '90 Days';
      case '1y': return '1 Year';
      default: return timeframe;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Predictive Analytics Dashboard</h2>
          <p className="text-muted-foreground">AI-powered predictions for optimal agricultural decisions</p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d', '90d'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              size="sm"
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {formatTimeframe(timeframe)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="yield">Yield Forecast</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="pest">Pest Risk</TabsTrigger>
          <TabsTrigger value="market">Market Price</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.slice(0, 4).map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(insight.impact)}
                      <Badge variant="outline" className="text-xs">
                        {insight.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <Badge className={`${getConfidenceColor(insight.confidence)} bg-opacity-10`}>
                      {insight.confidence}%
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">{insight.recommendation}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{insight.modelUsed}</span>
                    <span className="text-muted-foreground">{formatTimeframe(insight.timeframe)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Combined Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Yield Prediction Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={yieldData.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="predicted" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="confidence_upper" stroke="#94a3b8" fill="transparent" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="confidence_lower" stroke="#94a3b8" fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  Weather Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weatherData.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Insights List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getImpactIcon(insight.impact)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getConfidenceColor(insight.confidence)} bg-opacity-10 text-xs`}>
                          {insight.confidence}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{insight.recommendation}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Model: {insight.modelUsed}</span>
                        <span>{new Date(insight.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yield" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Yield Predictions & Confidence Intervals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={yieldData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="confidence_upper" 
                    stroke="transparent" 
                    fill="#3b82f6" 
                    fillOpacity={0.1} 
                    name="Confidence Upper"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidence_lower" 
                    stroke="transparent" 
                    fill="#ffffff" 
                    fillOpacity={1} 
                    name="Confidence Lower"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    name="Predicted Yield"
                  />
                  {yieldData.some(d => d.actual) && (
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      name="Actual Yield"
                      strokeDasharray="5 5"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  Temperature & Humidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperature (°F)" />
                    <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Rainfall Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rainfall" fill="#3b82f6" name="Rainfall (inches)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pest" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pestRisks.map((risk, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="w-5 h-5" />
                      {risk.pest_type}
                    </CardTitle>
                    <Badge className={getRiskColor(risk.risk_level)}>
                      {risk.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Risk Probability</span>
                      <span className="font-medium">{risk.probability}%</span>
                    </div>
                    <Progress value={risk.probability} className="w-full" />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Affected Crops</h4>
                    <div className="flex flex-wrap gap-1">
                      {risk.affected_crops.map((crop) => (
                        <Badge key={crop} variant="outline" className="text-xs">{crop}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Prevention Actions</h4>
                    <ul className="text-xs space-y-1">
                      {risk.prevention_actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-blue-600">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Peak risk period: {risk.peak_period}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {marketData.map((market, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {market.crop} Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-muted-foreground">Current Price</div>
                      <div className="text-lg font-bold">${market.current_price.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Predicted Price</div>
                      <div className="text-lg font-bold text-blue-700">${market.predicted_price.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {market.price_change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-medium ${market.price_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {market.price_change > 0 ? '+' : ''}{market.price_change.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground text-sm">price change</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Optimal Harvest Window</h4>
                    <div className="p-2 bg-green-50 rounded text-sm">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(market.optimal_harvest_window.start).toLocaleDateString()} - {new Date(market.optimal_harvest_window.end).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Market Factors</h4>
                    <ul className="text-xs space-y-1">
                      {market.market_factors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-blue-600">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
