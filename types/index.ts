
// Global types for the Peoria platform
// import { UserRole, DeviceType, DeviceStatus, SensorType, VermicultureStatus, AlertType, AlertSeverity, AlertStatus } from '@prisma/client'

// Define types locally for now
export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER'
export type DeviceType = 'SENSOR' | 'ACTUATOR' | 'CONTROLLER' | 'CAMERA'
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR' | 'ACTIVE' | 'INACTIVE'
export type SensorType = 'TEMPERATURE' | 'HUMIDITY' | 'PH' | 'MOISTURE' | 'LIGHT' | 'CO2'
export type VermicultureStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'HARVESTING'
export type AlertType = 'ENVIRONMENTAL' | 'EQUIPMENT' | 'CROP' | 'MARKET' | 'WEATHER'
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'OPEN'

export interface DashboardMetrics {
  totalDevices: number
  activeDevices: number
  totalAlerts: number
  criticalAlerts: number
  vermicultureSystems: number
  plantSystems: number
  productionYield: number
  systemHealth: number
}

export interface EnvironmentalData {
  temperature: number
  moisture: number
  ph: number
  timestamp: Date
  location?: string
}

export interface SensorReading {
  id: string
  deviceId: string
  sensorType: SensorType
  value: number
  unit: string
  location?: string
  timestamp: Date
}

export interface DeviceInfo {
  id: string
  name: string
  deviceType: DeviceType
  status: DeviceStatus
  location?: string
  lastSeen?: Date
  sensorReadings?: SensorReading[]
}

export interface AlertInfo {
  id: string
  title: string
  description: string
  alertType: AlertType
  severity: AlertSeverity
  status: AlertStatus
  createdAt: Date
  deviceId?: string
  device?: {
    name: string
    location?: string
    deviceType: string
  }
  assignedUser?: {
    firstName?: string
    lastName?: string
    email: string
  }
}

export interface VermicultureSystemInfo {
  id: string
  name: string
  location: string
  capacity: number
  currentLoad: number
  loadPercentage: number
  temperature?: number
  moisture?: number
  ph?: number
  status: VermicultureStatus
  lastFeedTime?: Date
  lastHarvestTime?: Date
  recentProductions?: any[]
  recentMaintenance?: any[]
}

export interface ProductionMetrics {
  totalProduction: number
  weeklyGrowth: number
  efficiency: number
  qualityScore: number
}

export interface ChartDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface PerformanceMetrics {
  uptime: number
  responseTime: number
  throughput: number
  errorRate: number
}

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  organization?: string
  phone?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FilterOptions {
  startDate?: Date
  endDate?: Date
  location?: string
  deviceType?: DeviceType
  status?: string
}

export interface RealTimeData {
  environmental: EnvironmentalData[]
  alerts: AlertInfo[]
  devices: DeviceInfo[]
  timestamp: Date
}
