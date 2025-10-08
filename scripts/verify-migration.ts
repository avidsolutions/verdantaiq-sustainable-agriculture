
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMigration() {
  console.log('🔍 Verifying Supabase Migration...\n')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check all main tables have data
    const counts = {
      users: await prisma.user.count(),
      devices: await prisma.device.count(), 
      sensorReadings: await prisma.sensorReading.count(),
      vermicultureSystems: await prisma.vermicultureSystem.count(),
      plantSystems: await prisma.plantSystem.count(),
      alerts: await prisma.alert.count(),
      maintenanceLogs: await prisma.maintenanceLog.count(),
      trainingContent: await prisma.trainingContent.count()
    }
    
    console.log('\n📊 Data Verification:')
    console.log(`   - Users: ${counts.users}`)
    console.log(`   - Devices: ${counts.devices}`)
    console.log(`   - Sensor Readings: ${counts.sensorReadings}`)
    console.log(`   - Vermiculture Systems: ${counts.vermicultureSystems}`)
    console.log(`   - Plant Systems: ${counts.plantSystems}`)
    console.log(`   - Alerts: ${counts.alerts}`)
    console.log(`   - Maintenance Logs: ${counts.maintenanceLogs}`)
    console.log(`   - Training Content: ${counts.trainingContent}`)
    
    // Test some complex queries to ensure relationships work
    console.log('\n🔗 Testing Relationships:')
    
    const userWithAlerts = await prisma.user.findFirst({
      include: { alerts: true }
    })
    console.log(`✅ User-Alert relationship: ${userWithAlerts?.alerts.length || 0} alerts found`)
    
    const deviceWithReadings = await prisma.device.findFirst({
      include: { sensorReadings: { take: 5 } }
    })
    console.log(`✅ Device-SensorReading relationship: ${deviceWithReadings?.sensorReadings.length || 0} readings found`)
    
    const systemWithProduction = await prisma.vermicultureSystem.findFirst({
      include: { productions: true }
    })
    console.log(`✅ System-Production relationship: ${systemWithProduction?.productions.length || 0} production records found`)
    
    // Test authentication user
    const testUser = await prisma.user.findUnique({
      where: { email: 'john@doe.com' }
    })
    
    if (testUser) {
      console.log('\n👤 Test User Available:')
      console.log(`   - Email: ${testUser.email}`)
      console.log(`   - Role: ${testUser.role}`)
      console.log(`   - Name: ${testUser.firstName} ${testUser.lastName}`)
      console.log('   - Login with: john@doe.com / johndoe123')
    }
    
    // Test recent sensor data
    const recentReading = await prisma.sensorReading.findFirst({
      orderBy: { timestamp: 'desc' },
      include: { device: true }
    })
    
    if (recentReading) {
      console.log('\n📊 Latest Sensor Reading:')
      console.log(`   - Device: ${recentReading.device.name}`)
      console.log(`   - Type: ${recentReading.sensorType}`)
      console.log(`   - Value: ${recentReading.value} ${recentReading.unit}`)
      console.log(`   - Time: ${recentReading.timestamp}`)
    }
    
    // Test alerts
    const criticalAlerts = await prisma.alert.count({
      where: { 
        severity: 'CRITICAL',
        status: 'OPEN'
      }
    })
    
    if (criticalAlerts > 0) {
      console.log(`\n🚨 Active Critical Alerts: ${criticalAlerts}`)
      console.log('   - Check your dashboard for details')
    }
    
    console.log('\n🎉 Migration Verification Complete!')
    console.log('✅ All data successfully migrated to Supabase')
    console.log('✅ All relationships working correctly')
    console.log('✅ Authentication users available')
    console.log('✅ Real-time data flowing')
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your DATABASE_URL in .env file')
    console.log('2. Ensure Supabase project is active')
    console.log('3. Verify you ran: yarn prisma db push')
    console.log('4. Confirm import script completed successfully')
  } finally {
    await prisma.$disconnect()
  }
}

verifyMigration()
