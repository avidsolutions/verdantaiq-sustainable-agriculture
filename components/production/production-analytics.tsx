
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Package, Award, Calendar, Leaf } from 'lucide-react'
import { CHART_COLORS } from '@/lib/constants'
import { formatDate, formatNumber } from '@/lib/utils'

interface ProductionAnalyticsProps {
  className?: string
}

export function ProductionAnalytics({ className }: ProductionAnalyticsProps) {
  const [data, setData] = useState<any>({})
  const [timeRange, setTimeRange] = useState('30')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProductionData()
  }, [timeRange])

  const fetchProductionData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/production?days=${timeRange}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch production data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-[300px] bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Process vermiculture production data for charts
  const vermicultureData = data.vermicultureProductions?.map((prod: any, index: number) => ({
    name: `Batch ${index + 1}`,
    expected: prod.expectedYield,
    actual: prod.actualYield || prod.expectedYield * 0.9,
    efficiency: prod.efficiency || 90,
    date: formatDate(prod.startDate)
  })) || []

  // Process plant yields data
  const plantYieldData = data.plantYields?.map((plantYield: any, index: number) => ({
    name: plantYield.systemName,
    crop: plantYield.cropType,
    quantity: plantYield.quantity,
    quality: plantYield.quality,
    date: formatDate(plantYield.harvestDate)
  })) || []

  // Quality distribution
  const qualityData = [
    { name: 'Grade A', value: data.vermicultureProductions?.filter((p: any) => p.quality === 'A').length || 0, color: CHART_COLORS[0] },
    { name: 'Grade B', value: data.vermicultureProductions?.filter((p: any) => p.quality === 'B').length || 0, color: CHART_COLORS[1] },
    { name: 'Grade C', value: data.vermicultureProductions?.filter((p: any) => p.quality === 'C').length || 0, color: CHART_COLORS[2] }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Production Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics?.totalProduction || 0)} kg</div>
            <p className="text-xs text-muted-foreground">
              Combined yield
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vermiculture Yield</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics?.vermicultureYield || 0)} kg</div>
            <p className="text-xs text-muted-foreground">
              {data.metrics?.totalBatches || 0} batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plant Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics?.plantYield || 0)} kg</div>
            <p className="text-xs text-muted-foreground">
              {data.metrics?.totalHarvests || 0} harvests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics?.avgQualityScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Average grade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics tabs */}
      <Tabs defaultValue="vermiculture" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vermiculture">Vermiculture</TabsTrigger>
          <TabsTrigger value="plants">Plant Systems</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="vermiculture" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vermiculture yield comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Yield Performance</CardTitle>
                <CardDescription>Expected vs Actual yield by batch</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vermicultureData}>
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Yield (kg)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 11 }
                      }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)} kg`,
                        name === 'expected' ? 'Expected' : 'Actual'
                      ]}
                    />
                    <Bar dataKey="expected" fill={CHART_COLORS[0]} name="expected" />
                    <Bar dataKey="actual" fill={CHART_COLORS[1]} name="actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency trend */}
            <Card>
              <CardHeader>
                <CardTitle>Production Efficiency</CardTitle>
                <CardDescription>Efficiency percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={vermicultureData}>
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Efficiency (%)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 11 }
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Efficiency']}
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke={CHART_COLORS[2]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plant System Yields</CardTitle>
              <CardDescription>Harvest quantities by system and crop type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={plantYieldData}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    label={{
                      value: 'Quantity (kg)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 11 }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Harvest']}
                    labelFormatter={(label) => `System: ${label}`}
                  />
                  <Bar dataKey="quantity" fill={CHART_COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quality distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
                <CardDescription>Distribution of production quality grades</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {qualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} batches`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {qualityData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <Badge variant="outline">{item.value} batches</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Production summary */}
            <Card>
              <CardHeader>
                <CardTitle>Production Summary</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">{data.metrics?.totalBatches || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Batches</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600">{data.metrics?.totalHarvests || 0}</p>
                    <p className="text-xs text-muted-foreground">Plant Harvests</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Batch Size</span>
                    <span className="font-medium">
                      {data.metrics?.totalBatches > 0 
                        ? (data.metrics.vermicultureYield / data.metrics.totalBatches).toFixed(1)
                        : 0} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Production Rate</span>
                    <span className="font-medium">
                      {(data.metrics?.totalProduction / parseInt(timeRange) || 0).toFixed(1)} kg/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Quality Rate</span>
                    <span className="font-medium">
                      {data.metrics?.avgQualityScore || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
