'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Activity, 
  Thermometer, 
  Droplets, 
  Zap,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Gauge,
  Wifi,
  Battery
} from 'lucide-react';

// Mock system data
const getSystemDetails = (id: string) => {
  const systems = {
    'north-unit': {
      id: 'north-unit',
      name: 'North Production Unit',
      location: 'Zone A - Building 1',
      status: 'optimal',
      efficiency: 88.7,
      yield: 892,
      zones: 1,
      capacity: 1200,
      currentLoad: 1065,
      lastMaintenance: '2024-09-15',
      nextMaintenance: '2024-11-15',
      sensors: [
        { id: 'temp-01', name: 'Temperature Sensor A1', value: '72.5°F', status: 'normal', battery: 87 },
        { id: 'humid-01', name: 'Humidity Sensor A1', value: '68.2%', status: 'normal', battery: 92 },
        { id: 'ph-01', name: 'pH Sensor A1', value: '6.4', status: 'normal', battery: 78 },
        { id: 'temp-02', name: 'Temperature Sensor A2', value: '74.1°F', status: 'normal', battery: 85 }
      ],
      environmentalData: {
        temperature: { current: 72.5, optimal: 75, min: 65, max: 80 },
        humidity: { current: 68.2, optimal: 70, min: 60, max: 80 },
        ph: { current: 6.4, optimal: 6.5, min: 6.0, max: 7.0 },
        moisture: { current: 75, optimal: 80, min: 70, max: 90 }
      },
      performance: {
        dailyYield: 12.5,
        weeklyYield: 87.3,
        monthlyYield: 342.8,
        efficiency: 88.7,
        uptime: 99.2
      }
    },
    'south-unit': {
      id: 'south-unit',
      name: 'South Production Unit',
      location: 'Zone B - Building 2',
      status: 'attention',
      efficiency: 75.2,
      yield: 157,
      zones: 1,
      capacity: 800,
      currentLoad: 602,
      lastMaintenance: '2024-08-20',
      nextMaintenance: '2024-10-20',
      sensors: [
        { id: 'temp-03', name: 'Temperature Sensor B1', value: '71.8°F', status: 'warning', battery: 45 },
        { id: 'humid-03', name: 'Humidity Sensor B1', value: '72.5%', status: 'normal', battery: 88 },
        { id: 'ph-03', name: 'pH Sensor B1', value: '6.2', status: 'normal', battery: 91 }
      ],
      environmentalData: {
        temperature: { current: 71.8, optimal: 75, min: 65, max: 80 },
        humidity: { current: 72.5, optimal: 70, min: 60, max: 80 },
        ph: { current: 6.2, optimal: 6.5, min: 6.0, max: 7.0 },
        moisture: { current: 68, optimal: 80, min: 70, max: 90 }
      },
      performance: {
        dailyYield: 8.2,
        weeklyYield: 57.4,
        monthlyYield: 234.1,
        efficiency: 75.2,
        uptime: 94.8
      }
    }
  };
  
  return systems[id as keyof typeof systems] || systems['north-unit'];
};

export default function SystemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [system, setSystem] = useState(getSystemDetails(params.id as string));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSensorStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getParameterStatus = (current: number, optimal: number, min: number, max: number) => {
    if (current < min || current > max) return 'critical';
    if (Math.abs(current - optimal) / optimal > 0.1) return 'warning';
    return 'normal';
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{system.name}</h2>
            <p className="text-muted-foreground">{system.location}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(system.status)}>
            {system.status === 'optimal' && <CheckCircle className="w-4 h-4 mr-1" />}
            {system.status === 'attention' && <AlertTriangle className="w-4 h-4 mr-1" />}
            {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
          </Badge>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Manage System
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{system.efficiency}%</div>
            <Progress value={system.efficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((system.currentLoad / system.capacity) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {system.currentLoad} / {system.capacity} lbs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{system.performance.dailyYield} kg</div>
            <p className="text-xs text-muted-foreground">
              +{((system.performance.dailyYield / 10) * 100 - 100).toFixed(1)}% vs target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{system.performance.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Health</span>
                  <Badge className={getStatusColor(system.status)}>
                    {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Sensors</span>
                  <span>{system.sensors.length} / {system.sensors.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Maintenance</span>
                  <span>{new Date(system.lastMaintenance).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Maintenance</span>
                  <span>{new Date(system.nextMaintenance).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Daily Yield</span>
                  <span className="font-semibold">{system.performance.dailyYield} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Weekly Yield</span>
                  <span className="font-semibold">{system.performance.weeklyYield} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Yield</span>
                  <span className="font-semibold">{system.performance.monthlyYield} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Efficiency Rating</span>
                  <span className="font-semibold">{system.performance.efficiency}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(system.environmentalData).map(([param, data]) => {
              const status = getParameterStatus(data.current, data.optimal, data.min, data.max);
              return (
                <Card key={param}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {param === 'temperature' && <Thermometer className="w-5 h-5" />}
                      {param === 'humidity' && <Droplets className="w-5 h-5" />}
                      {param === 'ph' && <Activity className="w-5 h-5" />}
                      {param === 'moisture' && <Droplets className="w-5 h-5" />}
                      {param.charAt(0).toUpperCase() + param.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {data.current}{param === 'temperature' ? '°F' : param === 'ph' ? '' : '%'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Optimal: {data.optimal}{param === 'temperature' ? '°F' : param === 'ph' ? '' : '%'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Range: {data.min} - {data.max}</span>
                        <Badge variant={status === 'normal' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                          {status}
                        </Badge>
                      </div>
                      <Progress 
                        value={((data.current - data.min) / (data.max - data.min)) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid gap-4">
            {system.sensors.map((sensor) => (
              <Card key={sensor.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    {getSensorStatusIcon(sensor.status)}
                    <div>
                      <h4 className="font-semibold">{sensor.name}</h4>
                      <p className="text-sm text-muted-foreground">ID: {sensor.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{sensor.value}</div>
                      <p className="text-xs text-muted-foreground">Current Reading</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{sensor.battery}%</span>
                      <Progress value={sensor.battery} className="w-16 h-2" />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Yield Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Daily</span>
                    <span className="font-semibold">{system.performance.dailyYield} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Weekly</span>
                    <span className="font-semibold">{system.performance.weeklyYield} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly</span>
                    <span className="font-semibold">{system.performance.monthlyYield} kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{system.performance.efficiency}%</div>
                  <p className="text-sm text-muted-foreground">Overall Efficiency</p>
                </div>
                <Progress value={system.performance.efficiency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Uptime</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{system.performance.uptime}%</div>
                  <p className="text-sm text-muted-foreground">Last 30 Days</p>
                </div>
                <Progress value={system.performance.uptime} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-semibold">Last Maintenance</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(system.lastMaintenance).toLocaleDateString()}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-semibold">Next Scheduled</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(system.nextMaintenance).toLocaleDateString()}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button className="w-full" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Run Diagnostics
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Maintenance History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
