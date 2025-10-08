
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

async function importFromBackup(backupFilePath: string) {
  console.log('📥 Starting data import to Supabase...')
  
  try {
    // Read backup file
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`)
    }
    
    const backupData: DataExport = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'))
    
    // Clear existing data in Supabase (in correct order due to foreign keys)
    console.log('🧹 Clearing existing data...')
    await prisma.sensorReading.deleteMany({})
    await prisma.alert.deleteMany({})
    await prisma.maintenanceLog.deleteMany({})
    await prisma.trainingCompletion.deleteMany({})
    await prisma.nutrientApplication.deleteMany({})
    await prisma.plantYield.deleteMany({})
    await prisma.plantHealth.deleteMany({})
    await prisma.plantSystem.deleteMany({})
    await prisma.vermicultureProduction.deleteMany({})
    await prisma.vermicultureSystem.deleteMany({})
    await prisma.device.deleteMany({})
    await prisma.trainingContent.deleteMany({})
    await prisma.systemConfig.deleteMany({})
    await prisma.session.deleteMany({})
    await prisma.account.deleteMany({})
    await prisma.user.deleteMany({})
    
    // Import data in correct order (respecting foreign key dependencies)
    console.log('📥 Importing users...')
    for (const user of backupData.users) {
      await prisma.user.create({ data: user })
    }
    
    console.log('📥 Importing devices...')
    for (const device of backupData.devices) {
      await prisma.device.create({ data: device })
    }
    
    console.log('📥 Importing vermiculture systems...')
    for (const system of backupData.vermicultureSystems) {
      await prisma.vermicultureSystem.create({ data: system })
    }
    
    console.log('📥 Importing plant systems...')
    for (const plantSystem of backupData.plantSystems) {
      await prisma.plantSystem.create({ data: plantSystem })
    }
    
    console.log('📥 Importing training content...')
    for (const content of backupData.trainingContent) {
      await prisma.trainingContent.create({ data: content })
    }
    
    console.log('📥 Importing system config...')
    for (const config of backupData.systemConfig) {
      await prisma.systemConfig.create({ data: config })
    }
    
    // Import dependent records
    console.log('📥 Importing sensor readings...')
    // Import in batches to avoid overwhelming the database
    const batchSize = 100
    for (let i = 0; i < backupData.sensorReadings.length; i += batchSize) {
      const batch = backupData.sensorReadings.slice(i, i + batchSize)
      await prisma.sensorReading.createMany({ data: batch })
      console.log(`   Imported ${Math.min(i + batchSize, backupData.sensorReadings.length)} / ${backupData.sensorReadings.length} sensor readings`)
    }
    
    console.log('📥 Importing alerts...')
    for (const alert of backupData.alerts) {
      await prisma.alert.create({ data: alert })
    }
    
    console.log('📥 Importing maintenance logs...')
    for (const log of backupData.maintenanceLogs) {
      await prisma.maintenanceLog.create({ data: log })
    }
    
    console.log('📥 Importing production records...')
    for (const production of backupData.vermicultureProductions) {
      await prisma.vermicultureProduction.create({ data: production })
    }
    
    console.log('📥 Importing plant health records...')
    for (const health of backupData.plantHealth) {
      await prisma.plantHealth.create({ data: health })
    }
    
    console.log('📥 Importing plant yields...')
    for (const yield_record of backupData.plantYields) {
      await prisma.plantYield.create({ data: yield_record })
    }
    
    console.log('📥 Importing nutrient applications...')
    for (const application of backupData.nutrientApplications) {
      await prisma.nutrientApplication.create({ data: application })
    }
    
    console.log('📥 Importing training completions...')
    for (const completion of backupData.trainingCompletions) {
      await prisma.trainingCompletion.create({ data: completion })
    }
    
    console.log('✅ Data import to Supabase completed successfully!')
    
    // Verify import
    const counts = {
      users: await prisma.user.count(),
      devices: await prisma.device.count(),
      sensorReadings: await prisma.sensorReading.count(),
      vermicultureSystems: await prisma.vermicultureSystem.count(),
      alerts: await prisma.alert.count()
    }
    
    console.log('\n📊 Import verification:')
    console.log(`   - Users: ${counts.users}`)
    console.log(`   - Devices: ${counts.devices}`)
    console.log(`   - Sensor Readings: ${counts.sensorReadings}`)
    console.log(`   - Vermiculture Systems: ${counts.vermicultureSystems}`)
    console.log(`   - Alerts: ${counts.alerts}`)
    
  } catch (error) {
    console.error('❌ Error importing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2]
if (!backupFile) {
  console.error('❌ Please provide backup file path as argument')
  console.log('Usage: npx tsx scripts/import-to-supabase.ts <backup-file-path>')
  process.exit(1)
}

importFromBackup(backupFile)
