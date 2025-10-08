
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Peoria Platform Seeding...')

  // Clear existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.sensorReading.deleteMany({})
  await prisma.alert.deleteMany({})
  await prisma.maintenanceLog.deleteMany({})
  await prisma.vermicultureProduction.deleteMany({})
  await prisma.vermicultureSystem.deleteMany({})
  await prisma.plantHealth.deleteMany({})
  await prisma.plantYield.deleteMany({})
  await prisma.nutrientApplication.deleteMany({})
  await prisma.plantSystem.deleteMany({})
  await prisma.device.deleteMany({})
  await prisma.trainingCompletion.deleteMany({})
  await prisma.trainingContent.deleteMany({})
  await prisma.systemConfig.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})

  // Create test users with different roles
  console.log('👥 Creating users...')
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN',
      organization: 'Peoria Urban Farm',
      phone: '+1-555-0101',
      isActive: true
    }
  })

  const operatorUser = await prisma.user.create({
    data: {
      email: 'sarah.operator@peoria.com',
      password: await bcrypt.hash('password123', 12),
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'OPERATOR',
      organization: 'Peoria Urban Farm',
      phone: '+1-555-0102'
    }
  })

  const analystUser = await prisma.user.create({
    data: {
      email: 'mike.analyst@peoria.com',
      password: await bcrypt.hash('password123', 12),
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'ANALYST',
      organization: 'Peoria Analytics',
      phone: '+1-555-0103'
    }
  })

  const maintenanceUser = await prisma.user.create({
    data: {
      email: 'tom.maintenance@peoria.com',
      password: await bcrypt.hash('password123', 12),
      firstName: 'Tom',
      lastName: 'Rodriguez',
      role: 'MAINTENANCE',
      organization: 'Peoria Maintenance',
      phone: '+1-555-0104'
    }
  })

  // Create IoT devices
  console.log('📱 Creating IoT devices...')
  const devices = await Promise.all([
    prisma.device.create({
      data: {
        name: 'Greenhouse A - Temperature Sensor',
        deviceType: 'TEMPERATURE_SENSOR',
        location: 'Greenhouse A - Zone 1',
        macAddress: '00:1B:44:11:3A:B7',
        ipAddress: '192.168.1.101',
        status: 'ACTIVE',
        firmware: 'v2.3.1',
        lastSeen: new Date()
      }
    }),
    prisma.device.create({
      data: {
        name: 'Greenhouse A - Moisture Sensor',
        deviceType: 'MOISTURE_SENSOR',
        location: 'Greenhouse A - Zone 1',
        macAddress: '00:1B:44:11:3A:B8',
        ipAddress: '192.168.1.102',
        status: 'ACTIVE',
        firmware: 'v2.3.1',
        lastSeen: new Date()
      }
    }),
    prisma.device.create({
      data: {
        name: 'Greenhouse A - pH Sensor',
        deviceType: 'PH_SENSOR',
        location: 'Greenhouse A - Zone 1',
        macAddress: '00:1B:44:11:3A:B9',
        ipAddress: '192.168.1.103',
        status: 'ACTIVE',
        firmware: 'v2.3.1',
        lastSeen: new Date()
      }
    }),
    prisma.device.create({
      data: {
        name: 'Vermiculture Controller #1',
        deviceType: 'VERMICULTURE_CONTROLLER',
        location: 'Vermiculture Facility - Bay 1',
        macAddress: '00:1B:44:11:3A:C0',
        ipAddress: '192.168.1.104',
        status: 'ACTIVE',
        firmware: 'v3.1.2',
        lastSeen: new Date()
      }
    }),
    prisma.device.create({
      data: {
        name: 'Nutrient Distributor - North',
        deviceType: 'NUTRIENT_DISTRIBUTOR',
        location: 'Greenhouse B - Zone 2',
        macAddress: '00:1B:44:11:3A:C1',
        ipAddress: '192.168.1.105',
        status: 'ACTIVE',
        firmware: 'v1.8.3',
        lastSeen: new Date()
      }
    }),
    prisma.device.create({
      data: {
        name: 'Environmental Monitor - Outdoor',
        deviceType: 'ENVIRONMENTAL_MONITOR',
        location: 'Outdoor Station',
        macAddress: '00:1B:44:11:3A:C2',
        ipAddress: '192.168.1.106',
        status: 'MAINTENANCE',
        firmware: 'v2.1.0',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    })
  ])

  // Generate historical sensor readings
  console.log('📊 Generating sensor readings...')
  const sensorTypes = ['TEMPERATURE', 'MOISTURE', 'PH', 'HUMIDITY', 'LIGHT_INTENSITY', 'CO2_LEVEL']
  const units = { TEMPERATURE: '°C', MOISTURE: '%', PH: '', HUMIDITY: '%', LIGHT_INTENSITY: 'lux', CO2_LEVEL: 'ppm' }
  const baseValues = { TEMPERATURE: 23, MOISTURE: 65, PH: 7.0, HUMIDITY: 70, LIGHT_INTENSITY: 15000, CO2_LEVEL: 400 }
  
  const readings = []
  
  // Generate readings for the last 7 days
  for (let day = 7; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour += 1) {
      const timestamp = new Date(Date.now() - (day * 24 * 60 * 60 * 1000) + (hour * 60 * 60 * 1000))
      
      for (const device of devices.slice(0, 4)) { // First 4 devices for sensor readings
        for (const sensorType of sensorTypes) {
          const baseValue = baseValues[sensorType as keyof typeof baseValues]
          const variance = Math.random() * 0.2 - 0.1 // ±10% variance
          const value = Math.max(0, baseValue * (1 + variance))
          
          readings.push({
            deviceId: device.id,
            sensorType: sensorType as any,
            value: Math.round(value * 100) / 100,
            unit: units[sensorType as keyof typeof units],
            location: device.location,
            timestamp
          })
        }
      }
    }
  }

  // Insert readings in batches for performance
  const batchSize = 100
  for (let i = 0; i < readings.length; i += batchSize) {
    await prisma.sensorReading.createMany({
      data: readings.slice(i, i + batchSize)
    })
  }

  // Create vermiculture systems
  console.log('🪱 Creating vermiculture systems...')
  const vermicultureSystems = await Promise.all([
    prisma.vermicultureSystem.create({
      data: {
        name: 'Worm Bin Alpha',
        location: 'Facility A - Bay 1',
        capacity: 500,
        currentLoad: 320,
        temperature: 24.5,
        moisture: 68.0,
        ph: 6.8,
        status: 'OPTIMAL',
        lastFeedTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        lastHarvestTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      }
    }),
    prisma.vermicultureSystem.create({
      data: {
        name: 'Worm Bin Beta',
        location: 'Facility A - Bay 2',
        capacity: 750,
        currentLoad: 580,
        temperature: 23.8,
        moisture: 72.0,
        ph: 7.2,
        status: 'NEEDS_ATTENTION',
        lastFeedTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        lastHarvestTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.vermicultureSystem.create({
      data: {
        name: 'Worm Bin Gamma',
        location: 'Facility B - Bay 1',
        capacity: 600,
        currentLoad: 450,
        temperature: 25.2,
        moisture: 65.0,
        ph: 6.9,
        status: 'OPTIMAL',
        lastFeedTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        lastHarvestTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    })
  ])

  // Create vermiculture production records
  console.log('🏭 Creating production records...')
  for (const system of vermicultureSystems) {
    // Create multiple production batches for each system
    for (let i = 0; i < 5; i++) {
      const startDate = new Date(Date.now() - (i * 30 + Math.random() * 15) * 24 * 60 * 60 * 1000)
      const expectedHarvest = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days later
      const actualHarvest = i < 3 ? new Date(expectedHarvest.getTime() - (Math.random() * 10 - 5) * 24 * 60 * 60 * 1000) : null
      const expectedYield = system.capacity * 0.3 + Math.random() * 50
      const actualYield = actualHarvest ? expectedYield * (0.8 + Math.random() * 0.4) : null
      const qualities = ['A', 'B', 'C']
      
      await prisma.vermicultureProduction.create({
        data: {
          systemId: system.id,
          batchNumber: `BATCH-${system.name.replace(/\s+/g, '')}-${String(i + 1).padStart(3, '0')}`,
          startDate,
          expectedHarvest,
          actualHarvest,
          expectedYield: Math.round(expectedYield * 100) / 100,
          actualYield: actualYield ? Math.round(actualYield * 100) / 100 : null,
          quality: actualHarvest ? qualities[Math.floor(Math.random() * qualities.length)] : null,
          notes: actualHarvest ? 'Production completed successfully' : 'In progress'
        }
      })
    }
  }

  // Create plant systems
  console.log('🌿 Creating plant systems...')
  const plantSystems = await Promise.all([
    prisma.plantSystem.create({
      data: {
        name: 'Lettuce Farm A',
        cropType: 'Lettuce',
        plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        location: 'Greenhouse A - Zone 1',
        area: 100.5,
        plantCount: 500,
        status: 'HEALTHY'
      }
    }),
    prisma.plantSystem.create({
      data: {
        name: 'Tomato Farm B',
        cropType: 'Tomato',
        plantingDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        location: 'Greenhouse B - Zone 1',
        area: 150.0,
        plantCount: 120,
        status: 'HEALTHY'
      }
    }),
    prisma.plantSystem.create({
      data: {
        name: 'Herb Garden C',
        cropType: 'Mixed Herbs',
        plantingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        location: 'Greenhouse C - Zone 1',
        area: 75.5,
        plantCount: 300,
        status: 'STRESSED'
      }
    })
  ])

  // Create plant health records
  console.log('🌱 Creating plant health records...')
  for (const plantSystem of plantSystems) {
    for (let i = 0; i < 10; i++) {
      const recordedAt = new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000) // Every 3 days
      const healthScore = plantSystem.status === 'HEALTHY' ? 80 + Math.random() * 20 : 60 + Math.random() * 20
      
      await prisma.plantHealth.create({
        data: {
          plantSystemId: plantSystem.id,
          healthScore: Math.round(healthScore),
          diseaseLevel: Math.random() * 10,
          pestLevel: Math.random() * 5,
          notes: `Health check for ${plantSystem.name}`,
          recordedAt
        }
      })
    }
  }

  // Create plant yields
  for (const plantSystem of plantSystems) {
    for (let i = 0; i < 3; i++) {
      const harvestDate = new Date(Date.now() - (i * 20 + Math.random() * 10) * 24 * 60 * 60 * 1000)
      const quantity = (plantSystem.area || 100) * (0.5 + Math.random() * 1.0)
      
      await prisma.plantYield.create({
        data: {
          plantSystemId: plantSystem.id,
          harvestDate,
          quantity: Math.round(quantity * 100) / 100,
          quality: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          notes: `Harvest from ${plantSystem.name}`
        }
      })
    }
  }

  // Create nutrient applications
  for (const plantSystem of plantSystems) {
    for (let i = 0; i < 8; i++) {
      const applicationDate = new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000) // Every 5 days
      const nutrientTypes = ['NITROGEN', 'PHOSPHORUS', 'POTASSIUM', 'ORGANIC_COMPOST', 'VERMICULTURE_COMPOST']
      
      await prisma.nutrientApplication.create({
        data: {
          plantSystemId: plantSystem.id,
          nutrientType: nutrientTypes[Math.floor(Math.random() * nutrientTypes.length)] as any,
          quantity: 5 + Math.random() * 15,
          concentration: 10 + Math.random() * 20,
          applicationDate,
          method: ['spray', 'irrigation', 'manual'][Math.floor(Math.random() * 3)],
          notes: `Nutrient application for ${plantSystem.name}`
        }
      })
    }
  }

  // Create alerts
  console.log('🚨 Creating alerts...')
  const alertTypes = ['ENVIRONMENTAL', 'SYSTEM_ERROR', 'MAINTENANCE_DUE', 'THRESHOLD_EXCEEDED', 'DEVICE_OFFLINE', 'PRODUCTION_ISSUE']
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  const statuses = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED']

  for (let i = 0; i < 25; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    
    await prisma.alert.create({
      data: {
        title: `${alertType.replace('_', ' ')} Alert #${i + 1}`,
        description: `This is a ${severity.toLowerCase()} priority ${alertType.toLowerCase().replace('_', ' ')} alert requiring attention.`,
        alertType: alertType as any,
        severity: severity as any,
        status: status as any,
        deviceId: Math.random() > 0.5 ? devices[Math.floor(Math.random() * devices.length)].id : null,
        assignedTo: Math.random() > 0.3 ? [operatorUser.id, maintenanceUser.id][Math.floor(Math.random() * 2)] : null,
        createdAt,
        resolvedAt: status === 'RESOLVED' ? new Date(createdAt.getTime() + Math.random() * 72 * 60 * 60 * 1000) : null
      }
    })
  }

  // Create maintenance logs
  console.log('🔧 Creating maintenance logs...')
  const maintenanceTypes = ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'CALIBRATION', 'CLEANING']
  const maintenanceStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  for (let i = 0; i < 20; i++) {
    const scheduledDate = new Date(Date.now() + (Math.random() - 0.7) * 30 * 24 * 60 * 60 * 1000)
    const status = maintenanceStatuses[Math.floor(Math.random() * maintenanceStatuses.length)]
    const type = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)]
    const completedDate = status === 'COMPLETED' ? 
      new Date(scheduledDate.getTime() + Math.random() * 4 * 60 * 60 * 1000) : null

    await prisma.maintenanceLog.create({
      data: {
        title: `${type.replace('_', ' ')} Maintenance #${i + 1}`,
        description: `Scheduled ${type.toLowerCase().replace('_', ' ')} maintenance task`,
        maintenanceType: type as any,
        status: status as any,
        scheduledDate,
        completedDate,
        duration: completedDate ? Math.floor(Math.random() * 240) + 30 : null, // 30-270 minutes
        cost: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 100 : null, // $100-600
        performedBy: status === 'COMPLETED' ? maintenanceUser.id : null,
        systemId: Math.random() > 0.5 ? vermicultureSystems[Math.floor(Math.random() * vermicultureSystems.length)].id : null,
        notes: status === 'COMPLETED' ? 'Maintenance completed successfully' : null
      }
    })
  }

  // Create training content
  console.log('📚 Creating training content...')
  const contentTypes = ['VIDEO', 'DOCUMENT', 'INTERACTIVE_MODULE', 'CHECKLIST', 'PROCEDURE']
  const difficulties = ['Beginner', 'Intermediate', 'Advanced']

  const trainingContent = await Promise.all([
    prisma.trainingContent.create({
      data: {
        title: 'Vermiculture Basics',
        description: 'Introduction to vermiculture systems and worm farming',
        contentType: 'VIDEO',
        status: 'PUBLISHED',
        duration: 25,
        difficulty: 'Beginner',
        tags: ['vermiculture', 'basics', 'introduction']
      }
    }),
    prisma.trainingContent.create({
      data: {
        title: 'pH Monitoring Best Practices',
        description: 'How to properly monitor and maintain pH levels',
        contentType: 'DOCUMENT',
        status: 'PUBLISHED',
        difficulty: 'Intermediate',
        tags: ['pH', 'monitoring', 'best-practices']
      }
    }),
    prisma.trainingContent.create({
      data: {
        title: 'System Maintenance Checklist',
        description: 'Complete checklist for system maintenance procedures',
        contentType: 'CHECKLIST',
        status: 'PUBLISHED',
        difficulty: 'Intermediate',
        tags: ['maintenance', 'checklist', 'procedures']
      }
    }),
    prisma.trainingContent.create({
      data: {
        title: 'Advanced Nutrient Management',
        description: 'Advanced techniques for optimizing nutrient distribution',
        contentType: 'INTERACTIVE_MODULE',
        status: 'PUBLISHED',
        duration: 45,
        difficulty: 'Advanced',
        tags: ['nutrients', 'advanced', 'optimization']
      }
    }),
    prisma.trainingContent.create({
      data: {
        title: 'Emergency Procedures',
        description: 'What to do in case of system emergencies',
        contentType: 'PROCEDURE',
        status: 'PUBLISHED',
        difficulty: 'Intermediate',
        tags: ['emergency', 'procedures', 'safety']
      }
    })
  ])

  // Create training completions
  for (const content of trainingContent) {
    const users = [adminUser, operatorUser, analystUser, maintenanceUser]
    for (const user of users) {
      if (Math.random() > 0.3) { // 70% chance of completion
        await prisma.trainingCompletion.create({
          data: {
            userId: user.id,
            contentId: content.id,
            completedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            score: Math.floor(Math.random() * 40) + 60 // 60-100 score
          }
        })
      }
    }
  }

  // Create system configuration
  console.log('⚙️ Creating system configuration...')
  await Promise.all([
    prisma.systemConfig.create({
      data: {
        key: 'TEMP_ALERT_THRESHOLD_HIGH',
        value: '30',
        description: 'High temperature alert threshold in Celsius',
        category: 'Environmental'
      }
    }),
    prisma.systemConfig.create({
      data: {
        key: 'TEMP_ALERT_THRESHOLD_LOW',
        value: '15',
        description: 'Low temperature alert threshold in Celsius',
        category: 'Environmental'
      }
    }),
    prisma.systemConfig.create({
      data: {
        key: 'MOISTURE_ALERT_THRESHOLD_HIGH',
        value: '80',
        description: 'High moisture alert threshold in percentage',
        category: 'Environmental'
      }
    }),
    prisma.systemConfig.create({
      data: {
        key: 'MOISTURE_ALERT_THRESHOLD_LOW',
        value: '40',
        description: 'Low moisture alert threshold in percentage',
        category: 'Environmental'
      }
    }),
    prisma.systemConfig.create({
      data: {
        key: 'PH_ALERT_THRESHOLD_HIGH',
        value: '8.0',
        description: 'High pH alert threshold',
        category: 'Environmental'
      }
    }),
    prisma.systemConfig.create({
      data: {
        key: 'PH_ALERT_THRESHOLD_LOW',
        value: '6.0',
        description: 'Low pH alert threshold',
        category: 'Environmental'
      }
    }),
    prisma.systemConfig.create({
      data: {
        key: 'DATA_REFRESH_INTERVAL',
        value: '30',
        description: 'Data refresh interval in seconds',
        category: 'System'
      }
    }),
    prisma.systemConfig.create({
      data: {
        key: 'MAX_CONCURRENT_USERS',
        value: '1000',
        description: 'Maximum concurrent users supported',
        category: 'System'
      }
    })
  ])

  console.log('✅ Seeding completed successfully!')
  console.log(`📊 Created:
    - ${await prisma.user.count()} users
    - ${await prisma.device.count()} devices
    - ${await prisma.sensorReading.count()} sensor readings
    - ${await prisma.vermicultureSystem.count()} vermiculture systems
    - ${await prisma.vermicultureProduction.count()} production records
    - ${await prisma.plantSystem.count()} plant systems
    - ${await prisma.alert.count()} alerts
    - ${await prisma.maintenanceLog.count()} maintenance logs
    - ${await prisma.trainingContent.count()} training content items
    - ${await prisma.systemConfig.count()} configuration entries`)
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
