
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertTriangle, Database, Leaf, TrendingUp } from 'lucide-react'
import { DashboardMetrics } from '@/types'

interface MetricsCardsProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Active Devices',
      value: metrics.activeDevices,
      total: metrics.totalDevices,
      icon: Database,
      description: 'IoT sensors online',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'System Health',
      value: `${metrics.systemHealth}%`,
      icon: Activity,
      description: 'Overall performance',
      color: metrics.systemHealth >= 90 ? 'text-green-600' : metrics.systemHealth >= 75 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.systemHealth >= 90 ? 'bg-green-50' : metrics.systemHealth >= 75 ? 'bg-yellow-50' : 'bg-red-50'
    },
    {
      title: 'Production Yield',
      value: `${metrics.productionYield.toFixed(1)} kg`,
      icon: TrendingUp,
      description: 'Last 30 days',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Alerts',
      value: metrics.criticalAlerts,
      total: metrics.totalAlerts,
      icon: AlertTriangle,
      description: 'Critical alerts',
      color: metrics.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: metrics.criticalAlerts > 0 ? 'bg-red-50' : 'bg-green-50'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.total && (
                <div className="text-xs text-muted-foreground">
                  of {card.total} total
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
