
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
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get vermiculture production data
    const vermicultureProductions = await prisma.vermicultureProduction.findMany({
      where: {
        startDate: { gte: startDate }
      },
      include: {
        system: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    // Get plant yields
    const plantYields = await prisma.plantYield.findMany({
      where: {
        harvestDate: { gte: startDate }
      },
      include: {
        plantSystem: {
          select: {
            name: true,
            cropType: true,
            location: true
          }
        }
      },
      orderBy: { harvestDate: 'desc' }
    })

    // Calculate metrics
    const totalVermicultureYield = vermicultureProductions.reduce((sum: any, prod: any) =>
      sum + (prod.actualYield || prod.expectedYield), 0)

    const totalPlantYield = plantYields.reduce((sum: any, plantYield: any) =>
      sum + plantYield.quantity, 0)

    const avgQualityScore = vermicultureProductions.filter((p: any) => p.quality).length > 0
      ? vermicultureProductions.reduce((sum: any, prod: any) => {
          const score = prod.quality === 'A' ? 90 : prod.quality === 'B' ? 75 : 60
          return sum + score
        }, 0) / vermicultureProductions.filter((p: any) => p.quality).length
      : 85

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalProduction: totalVermicultureYield + totalPlantYield,
          vermicultureYield: totalVermicultureYield,
          plantYield: totalPlantYield,
          avgQualityScore: Math.round(avgQualityScore),
          totalBatches: vermicultureProductions.length,
          totalHarvests: plantYields.length
        },
        vermicultureProductions: vermicultureProductions.map((prod: any) => ({
          id: prod.id,
          batchNumber: prod.batchNumber,
          systemName: prod.system.name,
          systemLocation: prod.system.location,
          startDate: prod.startDate,
          expectedHarvest: prod.expectedHarvest,
          actualHarvest: prod.actualHarvest,
          expectedYield: prod.expectedYield,
          actualYield: prod.actualYield,
          quality: prod.quality,
          efficiency: prod.actualYield && prod.expectedYield 
            ? Math.round((prod.actualYield / prod.expectedYield) * 100)
            : null
        })),
        plantYields: plantYields.map((plantYield: any) => ({
          id: plantYield.id,
          systemName: plantYield.plantSystem.name,
          cropType: plantYield.plantSystem.cropType,
          location: plantYield.plantSystem.location,
          harvestDate: plantYield.harvestDate,
          quantity: plantYield.quantity,
          quality: plantYield.quality
        }))
      }
    })
  } catch (error) {
    console.error('Production API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
