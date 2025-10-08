
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get dashboard metrics in parallel for performance
    const [
      totalDevices,
      activeDevices,
      totalAlerts,
      criticalAlerts,
      vermicultureSystems,
      plantSystems,
      recentProduction,
      systemHealth
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: 'ACTIVE' } }),
      prisma.alert.count({ where: { status: 'OPEN' } }),
      prisma.alert.count({ where: { status: 'OPEN', severity: 'CRITICAL' } }),
      prisma.vermicultureSystem.count(),
      prisma.plantSystem.count(),
      prisma.vermicultureProduction.aggregate({
        _sum: { actualYield: true },
        where: {
          actualHarvest: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.device.count({ where: { status: 'ACTIVE' } })
    ])

    // Calculate system health percentage
    const healthPercentage = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 100

    // Get recent environmental data for trends
    const recentReadings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        device: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalDevices,
          activeDevices,
          totalAlerts,
          criticalAlerts,
          vermicultureSystems,
          plantSystems,
          productionYield: recentProduction._sum.actualYield || 0,
          systemHealth: healthPercentage
        },
        recentReadings: recentReadings.map((reading: any) => ({
          id: reading.id,
          deviceName: reading.device.name,
          sensorType: reading.sensorType,
          value: reading.value,
          unit: reading.unit,
          timestamp: reading.timestamp
        }))
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
