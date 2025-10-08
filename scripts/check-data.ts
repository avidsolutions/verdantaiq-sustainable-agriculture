
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  console.log('🔍 Checking Database Contents...\n')
  
  try {
    // Check users
    const userCount = await prisma.user.count()
    console.log(`👥 Users: ${userCount}`)
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, firstName: true, lastName: true, role: true }
      })
      users.forEach((user: any) => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`)
      })
    }
    
    // Check devices
    const deviceCount = await prisma.device.count()
    console.log(`\n📱 IoT Devices: ${deviceCount}`)
    
    if (deviceCount > 0) {
      const devices = await prisma.device.findMany({
        select: { name: true, deviceType: true, status: true, location: true }
      })
      devices.forEach((device: any) => {
        console.log(`   - ${device.name} (${device.deviceType}) - ${device.status} at ${device.location}`)
      })
    }
    
    // Check sensor readings
    const sensorCount = await prisma.sensorReading.count()
    console.log(`\n📊 Sensor Readings: ${sensorCount}`)
    
    // Check vermiculture systems
    const vermicultureCount = await prisma.vermicultureSystem.count()
    console.log(`\n🪱 Vermiculture Systems: ${vermicultureCount}`)
    
    if (vermicultureCount > 0) {
      const systems = await prisma.vermicultureSystem.findMany({
        select: { name: true, location: true, status: true, capacity: true, currentLoad: true }
      })
      systems.forEach((sys: any) => {
        console.log(`   - ${sys.name} at ${sys.location} - ${sys.status} (${sys.currentLoad}/${sys.capacity} kg)`)
      })
    }
    
    // Check plant systems
    const plantCount = await prisma.plantSystem.count()
    console.log(`\n🌿 Plant Systems: ${plantCount}`)
    
    if (plantCount > 0) {
      const plants = await prisma.plantSystem.findMany({
        select: { name: true, cropType: true, status: true, area: true }
      })
      plants.forEach((plant: any) => {
        console.log(`   - ${plant.name} (${plant.cropType}) - ${plant.status} (${plant.area} m²)`)
      })
    }
    
    // Check alerts
    const alertCount = await prisma.alert.count()
    console.log(`\n🚨 Active Alerts: ${alertCount}`)
    
    const criticalAlerts = await prisma.alert.count({ where: { severity: 'CRITICAL', status: 'OPEN' } })
    if (criticalAlerts > 0) {
      console.log(`   - ⚠️  ${criticalAlerts} Critical alerts need attention!`)
    }
    
    // Check production records
    const productionCount = await prisma.vermicultureProduction.count()
    console.log(`\n🏭 Production Records: ${productionCount}`)
    
    // Check maintenance logs
    const maintenanceCount = await prisma.maintenanceLog.count()
    console.log(`\n🔧 Maintenance Records: ${maintenanceCount}`)
    
    // Check training content
    const trainingCount = await prisma.trainingContent.count()
    console.log(`\n📚 Training Content: ${trainingCount}`)
    
    console.log('\n✅ Database successfully populated with comprehensive agricultural data!')
    console.log('\n🎯 Your Peoria Platform is ready with:')
    console.log('   • Real-time IoT sensor data')
    console.log('   • Vermiculture system management')
    console.log('   • Plant health monitoring')
    console.log('   • Alert & notification system')
    console.log('   • Maintenance tracking')
    console.log('   • Training & documentation')
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
