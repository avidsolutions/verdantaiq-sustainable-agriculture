
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Activity, Clock, Zap, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'

export default function PerformancePage() {
  const [data, setData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/performance')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600'
    if (uptime >= 95) return 'text-yellow-600'
    return 'text-red-600'
  }

  const generateMockChartData = () => {
    const data = []
    for (let i = 24; i >= 0; i--) {
      data.push({
        hour: `${24 - i}:00`,
        uptime: 95 + Math.random() * 5,
        responseTime: 300 + Math.random() * 200,
        throughput: 100 + Math.random() * 100
      })
    }
    return data
  }

  const chartData = generateMockChartData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
        <p className="text-gray-600">System performance metrics and maintenance tracking</p>
      </div>

      {/* Performance metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUptimeColor(data.metrics?.uptime || 0)}`}>
              {data.metrics?.uptime || 0}%
            </div>
            <Progress value={data.metrics?.uptime || 0} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {data.metrics?.activeDevices || 0} of {data.metrics?.totalDevices || 0} devices online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics?.responseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average API response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.metrics?.throughput || 0)}/s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests per second
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.metrics?.errorRate || 0).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              System error rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Uptime chart */}
            <Card>
              <CardHeader>
                <CardTitle>System Uptime (24h)</CardTitle>
                <CardDescription>Uptime percentage over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      domain={[90, 100]}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Uptime (%)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 11 }
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Uptime']}
                    />
                    <Area
                      type="monotone"
                      dataKey="uptime"
                      stroke={CHART_COLORS[0]}
                      fill={`${CHART_COLORS[0]}20`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response time chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time (24h)</CardTitle>
                <CardDescription>Average response time in milliseconds</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'Response Time (ms)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 11 }
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Response Time']}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Maintenance schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming and recent maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.maintenanceLogs?.slice(0, 5).map((log: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-1 rounded-full ${
                        log.status === 'COMPLETED' ? 'bg-green-100' :
                        log.status === 'IN_PROGRESS' ? 'bg-blue-100' :
                        log.status === 'SCHEDULED' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        {log.status === 'COMPLETED' ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <Calendar className="h-3 w-3 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{log.title}</h4>
                        <p className="text-xs text-muted-foreground">{log.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(log.scheduledDate)}
                          </span>
                          <Badge variant="outline">{log.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Efficiency</CardTitle>
                <CardDescription>Performance metrics and completion rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>{data.metrics?.maintenanceEfficiency || 0}%</span>
                  </div>
                  <Progress value={data.metrics?.maintenanceEfficiency || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {data.maintenanceLogs?.filter((log: any) => log.status === 'COMPLETED').length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600">
                      {data.upcomingMaintenance?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Average completion time: 
                      <span className="font-medium ml-1">
                        {data.maintenanceLogs?.filter((log: any) => log.duration).reduce((sum: number, log: any) => sum + log.duration, 0) / 
                         (data.maintenanceLogs?.filter((log: any) => log.duration).length || 1) || 0} min
                      </span>
                    </p>
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
