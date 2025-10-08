
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

    // Get system performance metrics
    const [
      totalDevices,
      activeDevices,
      maintenanceLogs,
      recentAlerts
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: 'ACTIVE' } }),
      prisma.maintenanceLog.findMany({
        where: {
          scheduledDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { scheduledDate: 'desc' },
        include: {
          performer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          vermicultureSystem: {
            select: {
              name: true,
              location: true
            }
          }
        }
      }),
      prisma.alert.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    // Calculate uptime percentage
    const uptime = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 100

    // Calculate maintenance efficiency
    const completedMaintenance = maintenanceLogs.filter((log: any) => log.status === 'COMPLETED').length
    const maintenanceEfficiency = maintenanceLogs.length > 0 
      ? Math.round((completedMaintenance / maintenanceLogs.length) * 100)
      : 100

    // Mock response time and throughput (in a real system, this would come from monitoring tools)
    const avgResponseTime = 350 + Math.random() * 150 // 350-500ms
    const throughput = 150 + Math.random() * 50 // 150-200 requests/second

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          uptime,
          responseTime: Math.round(avgResponseTime),
          throughput: Math.round(throughput),
          errorRate: Math.max(0, Math.round((recentAlerts / 100) * 100) / 100), // Convert to percentage
          maintenanceEfficiency,
          activeDevices,
          totalDevices
        },
        maintenanceLogs: maintenanceLogs.map((log: any) => ({
          id: log.id,
          title: log.title,
          description: log.description,
          type: log.maintenanceType,
          status: log.status,
          scheduledDate: log.scheduledDate,
          completedDate: log.completedDate,
          duration: log.duration,
          cost: log.cost,
          performer: log.performer,
          system: log.vermicultureSystem
        })),
        upcomingMaintenance: maintenanceLogs
          .filter((log: any) => log.status === 'SCHEDULED' && log.scheduledDate > new Date())
          .slice(0, 10)
      }
    })
  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
