
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Database, Wifi, HardDrive } from 'lucide-react'
import { DeviceInfo } from '@/types'

interface SystemStatusProps {
  className?: string
}

export function SystemStatus({ className }: SystemStatusProps) {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      const data = await response.json()
      if (data.success) {
        setDevices(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.INACTIVE
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'TEMPERATURE_SENSOR':
      case 'MOISTURE_SENSOR':
      case 'PH_SENSOR':
        return <Activity className="h-4 w-4" />
      case 'VERMICULTURE_CONTROLLER':
      case 'NUTRIENT_DISTRIBUTOR':
        return <HardDrive className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeDevices = devices.filter(d => d.status === 'ACTIVE').length
  const totalDevices = devices.length
  const systemHealth = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 100

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Status
          <Badge variant="outline" className="text-green-600">
            {systemHealth}% Healthy
          </Badge>
        </CardTitle>
        <CardDescription>Real-time device and system monitoring</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall health */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Health</span>
            <span>{systemHealth}%</span>
          </div>
          <Progress value={systemHealth} className="h-2" />
        </div>

        {/* Device status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Device Status</h4>
          {devices.slice(0, 6).map((device) => (
            <div key={device.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded-full bg-gray-100">
                  {getDeviceIcon(device.deviceType)}
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-32">{device.name}</p>
                  <p className="text-xs text-muted-foreground">{device.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getStatusColor(device.status)}>
                  {device.status}
                </Badge>
                <Wifi className={`h-3 w-3 ${device.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{activeDevices}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{totalDevices - activeDevices}</p>
              <p className="text-xs text-muted-foreground">Offline</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
