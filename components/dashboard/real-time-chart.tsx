
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatDate } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'
import { SensorReading } from '@/types'

interface RealTimeChartProps {
  readings: SensorReading[]
  isLoading?: boolean
}

export function RealTimeChart({ readings, isLoading }: RealTimeChartProps) {
  const [selectedSensor, setSelectedSensor] = useState('TEMPERATURE')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (!readings?.length) return

    // Filter readings by selected sensor type
    const filteredReadings = readings
      .filter(reading => reading.sensorType === selectedSensor)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-24) // Last 24 readings

    // Transform data for chart
    const data = filteredReadings.map(reading => ({
      timestamp: formatDate(reading.timestamp),
      value: reading.value,
      unit: reading.unit
    }))

    setChartData(data)
  }, [readings, selectedSensor])

  const sensorOptions = [
    { value: 'TEMPERATURE', label: 'Temperature' },
    { value: 'MOISTURE', label: 'Moisture' },
    { value: 'PH', label: 'pH Level' },
    { value: 'HUMIDITY', label: 'Humidity' },
    { value: 'LIGHT_INTENSITY', label: 'Light Intensity' },
    { value: 'CO2_LEVEL', label: 'CO2 Level' }
  ]

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Environmental Monitoring</CardTitle>
          <CardDescription>Real-time sensor data trends</CardDescription>
        </div>
        <Select value={selectedSensor} onValueChange={setSelectedSensor}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sensorOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              tick={{ fontSize: 10 }}
              label={{
                value: chartData[0]?.unit || '',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 11 }
              }}
            />
            <Tooltip
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value: number, name: string) => [
                `${value} ${chartData[0]?.unit || ''}`,
                'Value'
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
