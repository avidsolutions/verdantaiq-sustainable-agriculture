
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24')
    const sensorType = searchParams.get('sensorType')
    const location = searchParams.get('location')

    const whereClause: any = {
      timestamp: {
        gte: new Date(Date.now() - hours * 60 * 60 * 1000)
      }
    }

    if (sensorType) {
      whereClause.sensorType = sensorType
    }

    if (location) {
      whereClause.location = location
    }

    const readings = await prisma.sensorReading.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 1000,
      include: {
        device: {
          select: {
            name: true,
            location: true,
            status: true
          }
        }
      }
    })

    // Group readings by sensor type for easier charting
    const groupedReadings = readings.reduce((acc: any, reading: any) => {
      const key = reading.sensorType
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push({
        timestamp: reading.timestamp,
        value: reading.value,
        unit: reading.unit,
        location: reading.location,
        deviceName: reading.device.name
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      data: {
        readings: groupedReadings,
        totalReadings: readings.length,
        timeRange: `${hours} hours`
      }
    })
  } catch (error) {
    console.error('Environmental API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
