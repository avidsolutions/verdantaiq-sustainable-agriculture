
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

    const systems = await prisma.vermicultureSystem.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        productions: {
          orderBy: { startDate: 'desc' },
          take: 5
        },
        maintenanceLogs: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: systems.map((system: any) => ({
        id: system.id,
        name: system.name,
        location: system.location,
        capacity: system.capacity,
        currentLoad: system.currentLoad,
        loadPercentage: Math.round((system.currentLoad / system.capacity) * 100),
        temperature: system.temperature,
        moisture: system.moisture,
        ph: system.ph,
        status: system.status,
        lastFeedTime: system.lastFeedTime,
        lastHarvestTime: system.lastHarvestTime,
        recentProductions: system.productions,
        recentMaintenance: system.maintenanceLogs
      }))
    })
  } catch (error) {
    console.error('Vermiculture API error:', error)
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

    const { name, location, capacity } = await request.json()

    if (!name || !location || !capacity) {
      return NextResponse.json(
        { error: 'Name, location, and capacity are required' },
        { status: 400 }
      )
    }

    const system = await prisma.vermicultureSystem.create({
      data: {
        name,
        location,
        capacity,
        currentLoad: 0,
        status: 'OPTIMAL'
      }
    })

    return NextResponse.json({
      success: true,
      data: system
    })
  } catch (error) {
    console.error('Vermiculture creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
