
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
    const status = searchParams.get('status') || 'OPEN'
    const severity = searchParams.get('severity')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = {}
    
    if (status !== 'ALL') {
      whereClause.status = status
    }
    
    if (severity) {
      whereClause.severity = severity
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        device: {
          select: {
            name: true,
            location: true,
            deviceType: true
          }
        },
        assignedUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: alerts.map((alert: any) => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        alertType: alert.alertType,
        severity: alert.severity,
        status: alert.status,
        createdAt: alert.createdAt,
        resolvedAt: alert.resolvedAt,
        device: alert.device,
        assignedUser: alert.assignedUser
      }))
    })
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, alertType, severity, deviceId } = await request.json()

    if (!title || !description || !alertType || !severity) {
      return NextResponse.json(
        { error: 'Title, description, alert type, and severity are required' },
        { status: 400 }
      )
    }

    const alert = await prisma.alert.create({
      data: {
        title,
        description,
        alertType,
        severity,
        deviceId: deviceId || null,
        status: 'OPEN'
      }
    })

    return NextResponse.json({
      success: true,
      data: alert
    })
  } catch (error) {
    console.error('Alert creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
