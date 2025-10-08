
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { EnvironmentalData } from '@/types/agricultural';

interface EnvironmentalChartProps {
  systemId?: string;
  detailed?: boolean;
}

export function EnvironmentalChart({ systemId = 'all', detailed = false }: EnvironmentalChartProps) {
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [metric, setMetric] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720; // 24h, 7d, 30d
        const params = new URLSearchParams({ 
          hours: hours.toString(),
          ...(systemId !== 'all' && { systemId })
        });
        
        const response = await fetch(`/api/agricultural/environmental?${params}`);
        const result = await response.json();
        
        if (result.success) {
          setEnvironmentalData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch environmental data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [systemId, timeRange]);

  // Process data for charts
  const processedData = React.useMemo(() => {
    if (!environmentalData.length) return [];

    // Group by timestamp and average values
    const groupedData = environmentalData.reduce((acc, item) => {
      const timeKey = new Date(item.timestamp).toISOString().slice(0, 16); // Group by hour
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          timestamp: timeKey,
          temperature: [],
          moisture: [],
          ph: []
        };
      }
      
      acc[timeKey].temperature.push(item.temperature);
      acc[timeKey].moisture.push(item.moisture);
      acc[timeKey].ph.push(item.ph);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedData).map((group: any) => ({
      timestamp: new Date(group.timestamp).toLocaleDateString() + ' ' + 
                new Date(group.timestamp).toLocaleTimeString(),
      temperature: +(group.temperature.reduce((a: number, b: number) => a + b, 0) / group.temperature.length).toFixed(1),
      moisture: +(group.moisture.reduce((a: number, b: number) => a + b, 0) / group.moisture.length).toFixed(1),
      ph: +(group.ph.reduce((a: number, b: number) => a + b, 0) / group.ph.length).toFixed(2),
    })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [environmentalData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading environmental data...</div>
      </div>
    );
  }

  const chartHeight = detailed ? 400 : 300;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>

        {detailed && (
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="moisture">Moisture</SelectItem>
              <SelectItem value="ph">pH Level</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex gap-2 ml-auto">
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Temperature (°F)
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Moisture (%)
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            pH Level
          </Badge>
        </div>
      </div>

      {/* Charts */}
      {detailed ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          {(metric === 'all' || metric === 'temperature') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Temperature Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <AreaChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                    <YAxis domain={[60, 85]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#f97316" 
                      fill="#fed7aa" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Moisture Chart */}
          {(metric === 'all' || metric === 'moisture') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Moisture Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <AreaChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                    <YAxis domain={[40, 90]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="moisture" 
                      stroke="#3b82f6" 
                      fill="#bfdbfe" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* pH Chart */}
          {(metric === 'all' || metric === 'ph') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">pH Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <AreaChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                    <YAxis domain={[5.5, 7.5]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="ph" 
                      stroke="#10b981" 
                      fill="#a7f3d0" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Combined chart for overview
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="temp" orientation="left" domain={[60, 85]} />
            <YAxis yAxisId="moisture" orientation="right" domain={[40, 90]} />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="temp"
              type="monotone" 
              dataKey="temperature" 
              stroke="#f97316" 
              strokeWidth={2}
              name="Temperature (°F)"
            />
            <Line 
              yAxisId="moisture"
              type="monotone" 
              dataKey="moisture" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Moisture (%)"
            />
            <Line 
              yAxisId="temp"
              type="monotone" 
              dataKey="ph" 
              stroke="#10b981" 
              strokeWidth={2}
              name="pH Level"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {processedData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No environmental data available for the selected time range.
        </div>
      )}
    </div>
  );
}
