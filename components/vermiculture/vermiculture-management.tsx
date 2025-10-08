
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Bug, Thermometer, Droplets, Beaker, Plus, Settings, History } from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'
import { VermicultureSystemInfo } from '@/types'

interface VermicultureManagementProps {
  className?: string
}

export function VermicultureManagement({ className }: VermicultureManagementProps) {
  const [systems, setSystems] = useState<VermicultureSystemInfo[]>([])
  const [selectedSystem, setSelectedSystem] = useState<VermicultureSystemInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchSystems()
  }, [])

  const fetchSystems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/vermiculture')
      const result = await response.json()
      if (result.success) {
        setSystems(result.data)
        if (result.data.length > 0) {
          setSelectedSystem(result.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch vermiculture systems:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      OPTIMAL: 'bg-green-100 text-green-800',
      NEEDS_ATTENTION: 'bg-yellow-100 text-yellow-800',
      CRITICAL: 'bg-red-100 text-red-800',
      MAINTENANCE: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || colors.OPTIMAL
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vermiculture Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add System
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vermiculture System</DialogTitle>
              <DialogDescription>
                Create a new vermiculture system for worm farming
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">System Name</Label>
                <Input id="name" placeholder="e.g., Worm Bin Delta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g., Facility A - Bay 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (kg)</Label>
                <Input id="capacity" type="number" placeholder="500" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Create System
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Systems overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {systems.map((system) => (
          <Card 
            key={system.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSystem?.id === system.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedSystem(system)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{system.name}</CardTitle>
                <Badge variant="outline" className={getStatusColor(system.status)}>
                  {system.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription>{system.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Load capacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Load Capacity</span>
                    <span>{system.loadPercentage}%</span>
                  </div>
                  <Progress value={system.loadPercentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {system.currentLoad} / {system.capacity} kg
                  </div>
                </div>

                {/* Environmental readings */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <Thermometer className="h-3 w-3 mx-auto mb-1 text-red-500" />
                    <div className="text-xs font-medium">{system.temperature?.toFixed(1)}°C</div>
                  </div>
                  <div className="text-center">
                    <Droplets className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                    <div className="text-xs font-medium">{system.moisture?.toFixed(1)}%</div>
                  </div>
                  <div className="text-center">
                    <Beaker className="h-3 w-3 mx-auto mb-1 text-green-500" />
                    <div className="text-xs font-medium">{system.ph?.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected system details */}
      {selectedSystem && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* System status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bug className="h-5 w-5" />
                    <span>{selectedSystem.name}</span>
                  </CardTitle>
                  <CardDescription>{selectedSystem.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge className={getStatusColor(selectedSystem.status)}>
                      {selectedSystem.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Load</span>
                      <span>{selectedSystem.currentLoad} kg</span>
                    </div>
                    <Progress value={selectedSystem.loadPercentage} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {selectedSystem.loadPercentage}% of {selectedSystem.capacity} kg capacity
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Fed</span>
                      <span>{selectedSystem.lastFeedTime ? formatDate(selectedSystem.lastFeedTime) : 'Never'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Harvest</span>
                      <span>{selectedSystem.lastHarvestTime ? formatDate(selectedSystem.lastHarvestTime) : 'Never'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environmental conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Conditions</CardTitle>
                  <CardDescription>Current environmental parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span>Temperature</span>
                      </div>
                      <span className="font-medium">{selectedSystem.temperature?.toFixed(1)}°C</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>Moisture</span>
                      </div>
                      <span className="font-medium">{selectedSystem.moisture?.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Beaker className="h-4 w-4 text-green-500" />
                        <span>pH Level</span>
                      </div>
                      <span className="font-medium">{selectedSystem.ph?.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Adjust Parameters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production History</CardTitle>
                <CardDescription>Recent production batches and yields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSystem.recentProductions && selectedSystem.recentProductions.length > 0 ? (
                    selectedSystem.recentProductions.map((production: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{production.batchNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            Started: {formatDate(production.startDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {production.actualYield ? 
                              `${production.actualYield.toFixed(1)} kg` : 
                              `${production.expectedYield.toFixed(1)} kg (expected)`
                            }
                          </p>
                          {production.quality && (
                            <Badge variant="outline">Grade {production.quality}</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No production history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Log</CardTitle>
                <CardDescription>Recent maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSystem.recentMaintenance && selectedSystem.recentMaintenance.length > 0 ? (
                    selectedSystem.recentMaintenance.map((log: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <h4 className="font-medium">{log.title}</h4>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(log.scheduledDate)}
                            </span>
                            <Badge variant="outline">{log.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No maintenance history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Feed controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Feeding Controls</CardTitle>
                  <CardDescription>Manage feeding schedule and amounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Feed Amount (kg)</Label>
                    <Input type="number" placeholder="10" />
                  </div>
                  <Button className="w-full">
                    Schedule Feed
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Last fed: {selectedSystem.lastFeedTime ? formatDate(selectedSystem.lastFeedTime) : 'Never'}
                  </div>
                </CardContent>
              </Card>

              {/* Harvest controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Harvest Controls</CardTitle>
                  <CardDescription>Schedule and manage harvests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Expected Yield (kg)</Label>
                    <Input type="number" placeholder="50" />
                  </div>
                  <Button variant="outline" className="w-full">
                    Schedule Harvest
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Last harvest: {selectedSystem.lastHarvestTime ? formatDate(selectedSystem.lastHarvestTime) : 'Never'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
