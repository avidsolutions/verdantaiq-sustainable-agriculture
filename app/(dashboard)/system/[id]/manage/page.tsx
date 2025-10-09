'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Settings, 
  Power, 
  Thermometer, 
  Droplets, 
  Zap,
  Play,
  Pause,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Calendar,
  Bell
} from 'lucide-react';

// Mock system data
const getSystemData = (id: string) => {
  const systems = {
    'north-unit': {
      id: 'north-unit',
      name: 'North Production Unit',
      location: 'Zone A - Building 1',
      status: 'optimal',
      isRunning: true,
      settings: {
        temperature: { current: 72.5, target: 75, min: 65, max: 80 },
        humidity: { current: 68.2, target: 70, min: 60, max: 80 },
        ph: { current: 6.4, target: 6.5, min: 6.0, max: 7.0 },
        feedingSchedule: { interval: 8, amount: 2.5, enabled: true },
        ventilation: { speed: 65, auto: true },
        lighting: { intensity: 80, schedule: 'auto' }
      }
    },
    'south-unit': {
      id: 'south-unit',
      name: 'South Production Unit',
      location: 'Zone B - Building 2',
      status: 'attention',
      isRunning: true,
      settings: {
        temperature: { current: 71.8, target: 75, min: 65, max: 80 },
        humidity: { current: 72.5, target: 70, min: 60, max: 80 },
        ph: { current: 6.2, target: 6.5, min: 6.0, max: 7.0 },
        feedingSchedule: { interval: 12, amount: 2.0, enabled: true },
        ventilation: { speed: 45, auto: false },
        lighting: { intensity: 75, schedule: 'manual' }
      }
    }
  };
  
  return systems[id as keyof typeof systems] || systems['north-unit'];
};

export default function SystemManagePage() {
  const params = useParams();
  const router = useRouter();
  const [system, setSystem] = useState(getSystemData(params.id as string));
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateSetting = (category: string, field: string, value: any) => {
    setSystem(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [category]: {
          ...prev.settings[category as keyof typeof prev.settings],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setHasChanges(false);
    setIsLoading(false);
  };

  const handleResetSettings = () => {
    setSystem(getSystemData(params.id as string));
    setHasChanges(false);
  };

  const toggleSystemPower = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSystem(prev => ({ ...prev, isRunning: !prev.isRunning }));
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'attention': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <h2 className="text-3xl font-bold tracking-tight">Manage {system.name}</h2>
            <p className="text-muted-foreground">{system.location}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(system.status)}>
            {system.isRunning ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {system.isRunning ? 'Running' : 'Stopped'}
          </Badge>
          <Button 
            variant={system.isRunning ? "destructive" : "default"}
            onClick={toggleSystemPower}
            disabled={isLoading}
          >
            <Power className="w-4 h-4 mr-2" />
            {system.isRunning ? 'Stop System' : 'Start System'}
          </Button>
        </div>
      </div>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You have unsaved changes</span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleResetSettings}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSaveSettings} disabled={isLoading}>
                <Save className="w-4 h-4 mr-1" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* System Controls */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Restart System
            </Button>
            <Button className="w-full" size="sm" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </Button>
            <Button className="w-full" size="sm" variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Test Alerts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Power</span>
              <Badge variant={system.isRunning ? "default" : "secondary"}>
                {system.isRunning ? "On" : "Off"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Health</span>
              <Badge className={getStatusColor(system.status)}>
                {system.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Mode</span>
              <Badge variant="outline">
                {system.settings.ventilation.auto ? "Enabled" : "Manual"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current Readings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Temperature</span>
              <span>{system.settings.temperature.current}°F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Humidity</span>
              <span>{system.settings.humidity.current}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>pH Level</span>
              <span>{system.settings.ph.current}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Target Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Temperature</span>
              <span>{system.settings.temperature.target}°F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Humidity</span>
              <span>{system.settings.humidity.target}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>pH Level</span>
              <span>{system.settings.ph.target}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings */}
      <Tabs defaultValue="environmental" className="space-y-4">
        <TabsList>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="feeding">Feeding</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Temperature Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  Temperature Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Temperature: {system.settings.temperature.target}°F</Label>
                  <Slider
                    value={[system.settings.temperature.target]}
                    onValueChange={(value) => updateSetting('temperature', 'target', value[0])}
                    min={system.settings.temperature.min}
                    max={system.settings.temperature.max}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{system.settings.temperature.min}°F</span>
                    <span>Current: {system.settings.temperature.current}°F</span>
                    <span>{system.settings.temperature.max}°F</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Humidity Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Humidity Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Humidity: {system.settings.humidity.target}%</Label>
                  <Slider
                    value={[system.settings.humidity.target]}
                    onValueChange={(value) => updateSetting('humidity', 'target', value[0])}
                    min={system.settings.humidity.min}
                    max={system.settings.humidity.max}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{system.settings.humidity.min}%</span>
                    <span>Current: {system.settings.humidity.current}%</span>
                    <span>{system.settings.humidity.max}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* pH Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  pH Level Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target pH: {system.settings.ph.target}</Label>
                  <Slider
                    value={[system.settings.ph.target]}
                    onValueChange={(value) => updateSetting('ph', 'target', value[0])}
                    min={system.settings.ph.min}
                    max={system.settings.ph.max}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{system.settings.ph.min}</span>
                    <span>Current: {system.settings.ph.current}</span>
                    <span>{system.settings.ph.max}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ventilation Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Ventilation Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto Ventilation</Label>
                  <Switch
                    checked={system.settings.ventilation.auto}
                    onCheckedChange={(checked) => updateSetting('ventilation', 'auto', checked)}
                  />
                </div>
                
                {!system.settings.ventilation.auto && (
                  <div className="space-y-2">
                    <Label>Fan Speed: {system.settings.ventilation.speed}%</Label>
                    <Slider
                      value={[system.settings.ventilation.speed]}
                      onValueChange={(value) => updateSetting('ventilation', 'speed', value[0])}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feeding" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feeding Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Automatic Feeding</Label>
                  <Switch
                    checked={system.settings.feedingSchedule.enabled}
                    onCheckedChange={(checked) => updateSetting('feedingSchedule', 'enabled', checked)}
                  />
                </div>

                {system.settings.feedingSchedule.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Feeding Interval (hours)</Label>
                      <Input
                        type="number"
                        value={system.settings.feedingSchedule.interval}
                        onChange={(e) => updateSetting('feedingSchedule', 'interval', parseInt(e.target.value))}
                        min={1}
                        max={24}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Feed Amount (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={system.settings.feedingSchedule.amount}
                        onChange={(e) => updateSetting('feedingSchedule', 'amount', parseFloat(e.target.value))}
                        min={0.1}
                        max={10}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Feeding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (kg)</Label>
                  <Input type="number" step="0.1" placeholder="Enter amount" />
                </div>
                <Button className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Feed Now
                </Button>
                <p className="text-xs text-muted-foreground">
                  Last feeding: 2 hours ago (2.5 kg)
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto Temperature Control</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto Humidity Control</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto pH Adjustment</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Smart Feeding</Label>
                  <Switch checked={system.settings.feedingSchedule.enabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>AI-Powered Optimization</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Predictive Maintenance</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Yield Optimization</Label>
                  <Switch defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  AI optimization has improved efficiency by 12% this month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperature Alert (°F)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min" defaultValue="65" />
                    <Input placeholder="Max" defaultValue="80" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Humidity Alert (%)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min" defaultValue="60" />
                    <Input placeholder="Max" defaultValue="80" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>pH Alert Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min" defaultValue="6.0" />
                    <Input placeholder="Max" defaultValue="7.0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>SMS Alerts</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Push Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Critical Alerts Only</Label>
                  <Switch />
                </div>
                <Button className="w-full" variant="outline">
                  <Bell className="w-4 h-4 mr-2" />
                  Test Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
