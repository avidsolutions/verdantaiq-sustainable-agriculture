
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface DataExport {
  users: any[]
  devices: any[]
  sensorReadings: any[]
  vermicultureSystems: any[]
  vermicultureProductions: any[]
  plantSystems: any[]
  plantHealth: any[]
  plantYields: any[]
  nutrientApplications: any[]
  alerts: any[]
  maintenanceLogs: any[]
  trainingContent: any[]
  trainingCompletions: any[]
  systemConfig: any[]
}

async function exportData() {
  console.log('📦 Starting database export...')
  
  try {
    // Export all data from current database
    const dataExport: DataExport = {
      users: await prisma.user.findMany(),
      devices: await prisma.device.findMany(),
      sensorReadings: await prisma.sensorReading.findMany(),
      vermicultureSystems: await prisma.vermicultureSystem.findMany(),
      vermicultureProductions: await prisma.vermicultureProduction.findMany(),
      plantSystems: await prisma.plantSystem.findMany(),
      plantHealth: await prisma.plantHealth.findMany(),
      plantYields: await prisma.plantYield.findMany(),
      nutrientApplications: await prisma.nutrientApplication.findMany(),
      alerts: await prisma.alert.findMany(),
      maintenanceLogs: await prisma.maintenanceLog.findMany(),
      trainingContent: await prisma.trainingContent.findMany(),
      trainingCompletions: await prisma.trainingCompletion.findMany(),
      systemConfig: await prisma.systemConfig.findMany()
    }

    // Create backup directory
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Save backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const backupFile = path.join(backupDir, `peoria-backup-${timestamp}.json`)
    
    fs.writeFileSync(backupFile, JSON.stringify(dataExport, null, 2))
    
    console.log('✅ Database backup completed!')
    console.log(`📁 Backup saved to: ${backupFile}`)
    console.log('\n📊 Exported data summary:')
    console.log(`   - Users: ${dataExport.users.length}`)
    console.log(`   - Devices: ${dataExport.devices.length}`)
    console.log(`   - Sensor Readings: ${dataExport.sensorReadings.length}`)
    console.log(`   - Vermiculture Systems: ${dataExport.vermicultureSystems.length}`)
    console.log(`   - Production Records: ${dataExport.vermicultureProductions.length}`)
    console.log(`   - Plant Systems: ${dataExport.plantSystems.length}`)
    console.log(`   - Plant Health Records: ${dataExport.plantHealth.length}`)
    console.log(`   - Plant Yields: ${dataExport.plantYields.length}`)
    console.log(`   - Nutrient Applications: ${dataExport.nutrientApplications.length}`)
    console.log(`   - Alerts: ${dataExport.alerts.length}`)
    console.log(`   - Maintenance Logs: ${dataExport.maintenanceLogs.length}`)
    console.log(`   - Training Content: ${dataExport.trainingContent.length}`)
    console.log(`   - Training Completions: ${dataExport.trainingCompletions.length}`)
    console.log(`   - System Config: ${dataExport.systemConfig.length}`)
    
    return backupFile
    
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
