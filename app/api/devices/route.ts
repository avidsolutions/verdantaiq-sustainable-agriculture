
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

    const devices = await prisma.device.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            sensorReadings: true,
            alerts: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: devices.map((device: any) => ({
        id: device.id,
        name: device.name,
        deviceType: device.deviceType,
        location: device.location,
        status: device.status,
        lastSeen: device.lastSeen,
        firmware: device.firmware,
        readingsCount: device._count.sensorReadings,
        alertsCount: device._count.alerts,
        createdAt: device.createdAt
      }))
    })
  } catch (error) {
    console.error('Devices API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role === 'VIEWER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, deviceType, location, macAddress, ipAddress } = await request.json()

    if (!name || !deviceType || !macAddress) {
      return NextResponse.json(
        { error: 'Name, device type, and MAC address are required' },
        { status: 400 }
      )
    }

    const device = await prisma.device.create({
      data: {
        name,
        deviceType,
        location,
        macAddress,
        ipAddress,
        status: 'ACTIVE',
        lastSeen: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: device
    })
  } catch (error) {
    console.error('Device creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
