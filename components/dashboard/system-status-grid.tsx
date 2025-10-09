
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Thermometer,
  Droplets,
  Zap
} from 'lucide-react';
import { VermicultureSystem } from '@/types/agricultural';

interface SystemStatusGridProps {
  systems: VermicultureSystem[];
}

export function SystemStatusGrid({ systems }: SystemStatusGridProps) {
  const router = useRouter();

  const getStatusIcon = (status: VermicultureSystem['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-orange-600" />;
      case 'inactive':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: VermicultureSystem['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'maintenance':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {systems.map((system) => {
        const utilizationRate = (system.currentLoad / system.capacity) * 100;
        
        return (
          <Card key={system.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{system.name}</CardTitle>
                <Badge className={getStatusColor(system.status)}>
                  {getStatusIcon(system.status)}
                  <span className="ml-1 capitalize">{system.status}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{system.location}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{system.efficiency.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{system.yieldToDate.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">Yield (lbs)</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{system.zones.length}</div>
                  <p className="text-xs text-muted-foreground">Zones</p>
                </div>
              </div>

              {/* Utilization Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Capacity Utilization</span>
                  <span className="text-sm text-muted-foreground">
                    {utilizationRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={utilizationRate} 
                  className="h-2"
                />
              </div>

              {/* Zone Status */}
              <div>
                <h4 className="text-sm font-medium mb-2">Zone Status</h4>
                <div className="grid grid-cols-1 gap-2">
                  {system.zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{zone.name}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            zone.status === 'optimal' ? 'text-green-600 border-green-600' :
                            zone.status === 'attention' ? 'text-yellow-600 border-yellow-600' :
                            'text-red-600 border-red-600'
                          }
                        >
                          {zone.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-orange-600" />
                          <span>{zone.temperature.toFixed(1)}°F</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-600" />
                          <span>{zone.moisture.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-green-600" />
                          <span>pH {zone.ph.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/system/${system.id}/details`)}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/system/${system.id}/manage`)}
                >
                  Manage System
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
