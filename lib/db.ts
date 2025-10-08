// Mock Prisma client for build purposes with demo user
export const prisma = {
  user: {
    findMany: () => Promise.resolve([
      {
        id: 'demo-user-1',
        email: 'demo@verdantaiq.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'ADMIN',
        organization: 'VerdantaIQ Demo',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxQ7u', // "demo123"
        lastLogin: new Date()
      }
    ]),
    findUnique: ({ where }: any) => {
      if (where.email === 'demo@verdantaiq.com') {
        return Promise.resolve({
          id: 'demo-user-1',
          email: 'demo@verdantaiq.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN',
          organization: 'VerdantaIQ Demo',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxQ7u', // "demo123"
          lastLogin: new Date()
        });
      }
      return Promise.resolve(null);
    },
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({})
  },
  device: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({})
  },
  sensorReading: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({})
  },
  vermicultureSystem: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({})
  },
  plantSystem: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({})
  },
  alert: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({})
  },
  maintenanceLog: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({})
  },
  vermicultureProduction: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({})
  },
  plantYield: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({})
  }
} as any;
