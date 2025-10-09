
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Thermometer, Droplets, Beaker, TrendingUp, TrendingDown } from 'lucide-react'
import { CHART_COLORS, ENVIRONMENTAL_THRESHOLDS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

// Environmental-specific status color function
function getEnvironmentalStatusColor(
  currentValue: number,
  minThreshold: number,
  maxThreshold: number,
  optimalRange: { min: number; max: number }
): string {
  if (currentValue < minThreshold || currentValue > maxThreshold) {
    return 'text-red-600 bg-red-50 border-red-200';
  }
  if (currentValue >= optimalRange.min && currentValue <= optimalRange.max) {
    return 'text-green-600 bg-green-50 border-green-200';
  }
  return 'text-yellow-600 bg-yellow-50 border-yellow-200';
}

interface EnvironmentalOverviewProps {
  className?: string
}

export function EnvironmentalOverview({ className }: EnvironmentalOverviewProps) {
  const [data, setData] = useState<any>({})
  const [timeRange, setTimeRange] = useState('24')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEnvironmentalData()
  }, [timeRange])

  const fetchEnvironmentalData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/environmental?hours=${timeRange}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        // Fallback to mock data if API fails
        setData(getMockEnvironmentalData())
      }
    } catch (error) {
      console.error('Failed to fetch environmental data:', error)
      // Fallback to mock data on error
      setData(getMockEnvironmentalData())
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data fallback function
  const getMockEnvironmentalData = () => {
    const now = new Date()
    const generateReadings = (baseValue: number, variance: number, count: number = 50) => {
      return Array.from({ length: count }, (_, i) => ({
        timestamp: new Date(now.getTime() - (count - i) * 30 * 60 * 1000), // 30 min intervals
        value: baseValue + (Math.random() - 0.5) * variance,
        unit: '',
        location: 'North Unit',
        deviceName: 'Environmental Sensor 1'
      }))
    }

    return {
      readings: {
        TEMPERATURE: generateReadings(22.5, 4),
        MOISTURE: generateReadings(65, 20),
        PH: generateReadings(7.0, 1)
      },
      totalReadings: 150,
      timeRange: `${timeRange} hours`
    }
  }

  const getLatestReading = (sensorType: string) => {
    const readings = data.readings?.[sensorType] || []
    return readings[0] || null
  }

  const getAverageReading = (sensorType: string) => {
    const readings = data.readings?.[sensorType] || []
    if (readings.length === 0) return 0
    const sum = readings.reduce((acc: number, reading: any) => acc + reading.value, 0)
    return sum / readings.length
  }

  const getTrend = (sensorType: string) => {
    const readings = data.readings?.[sensorType] || []
    if (readings.length < 2) return 'stable'
    
    const recent = readings.slice(0, 5)
    const older = readings.slice(-5)
    
    const recentAvg = recent.reduce((sum: number, r: any) => sum + r.value, 0) / recent.length
    const olderAvg = older.reduce((sum: number, r: any) => sum + r.value, 0) / older.length
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (Math.abs(change) < 2) return 'stable'
    return change > 0 ? 'increasing' : 'decreasing'
  }

  const formatChartData = (sensorType: string) => {
    const readings = data.readings?.[sensorType] || []
    return readings
      .slice(-50) // Last 50 readings
      .reverse()
      .map((reading: any, index: number) => ({
        time: index,
        value: reading.value,
        timestamp: formatDate(reading.timestamp)
      }))
  }

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-[300px] bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const temperatureReading = getLatestReading('TEMPERATURE')
  const moistureReading = getLatestReading('MOISTURE')
  const phReading = getLatestReading('PH')

  const sensors = [
    {
      title: 'Temperature',
      icon: Thermometer,
      reading: temperatureReading,
      average: getAverageReading('TEMPERATURE'),
      trend: getTrend('TEMPERATURE'),
      thresholds: ENVIRONMENTAL_THRESHOLDS.TEMPERATURE,
      unit: '°C',
      color: CHART_COLORS[0],
      chartData: formatChartData('TEMPERATURE')
    },
    {
      title: 'Moisture',
      icon: Droplets,
      reading: moistureReading,
      average: getAverageReading('MOISTURE'),
      trend: getTrend('MOISTURE'),
      thresholds: ENVIRONMENTAL_THRESHOLDS.MOISTURE,
      unit: '%',
      color: CHART_COLORS[1],
      chartData: formatChartData('MOISTURE')
    },
    {
      title: 'pH Level',
      icon: Beaker,
      reading: phReading,
      average: getAverageReading('PH'),
      trend: getTrend('PH'),
      thresholds: ENVIRONMENTAL_THRESHOLDS.PH,
      unit: '',
      color: CHART_COLORS[2],
      chartData: formatChartData('PH')
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Environmental Monitoring</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Last 6 hours</SelectItem>
            <SelectItem value="24">Last 24 hours</SelectItem>
            <SelectItem value="72">Last 3 days</SelectItem>
            <SelectItem value="168">Last week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {sensors.map((sensor, index) => {
          const Icon = sensor.icon
          const currentValue = sensor.reading?.value || 0
          const statusColor = getEnvironmentalStatusColor(
            currentValue,
            sensor.thresholds.MIN,
            sensor.thresholds.MAX,
            { min: sensor.thresholds.OPTIMAL.MIN, max: sensor.thresholds.OPTIMAL.MAX }
          )
          
          const TrendIcon = sensor.trend === 'increasing' ? TrendingUp : 
                           sensor.trend === 'decreasing' ? TrendingDown : null

          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{sensor.title}</CardTitle>
                <div className="p-2 rounded-lg bg-gray-50">
                  <Icon className={`h-4 w-4`} style={{ color: sensor.color }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentValue.toFixed(1)}{sensor.unit}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" style={{ 
                      backgroundColor: statusColor + '20', 
                      borderColor: statusColor,
                      color: statusColor
                    }}>
                      {currentValue >= sensor.thresholds.OPTIMAL.MIN && 
                       currentValue <= sensor.thresholds.OPTIMAL.MAX ? 'Optimal' :
                       currentValue >= sensor.thresholds.MIN && 
                       currentValue <= sensor.thresholds.MAX ? 'Warning' : 'Critical'}
                    </Badge>
                    {TrendIcon && <TrendIcon className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Avg: {sensor.average.toFixed(1)}{sensor.unit}
                </div>
                
                {/* Mini chart */}
                <div className="mt-4 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sensor.chartData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={sensor.color}
                        fill={`${sensor.color}20`}
                        strokeWidth={2}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const value = payload[0].value
                            const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
                            return (
                              <div className="bg-white p-2 border rounded shadow text-xs">
                                <p>{`${numValue.toFixed(1)}${sensor.unit}`}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed chart */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Environmental Trends</CardTitle>
          <CardDescription>Real-time monitoring over the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart>
              <XAxis
                dataKey="time"
                tickLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                labelFormatter={() => 'Time'}
                formatter={(value: number, name: string) => [value.toFixed(1), name]}
              />
              {sensors.map((sensor, index) => (
                <Line
                  key={sensor.title}
                  data={sensor.chartData}
                  type="monotone"
                  dataKey="value"
                  stroke={sensor.color}
                  strokeWidth={2}
                  dot={false}
                  name={sensor.title}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
