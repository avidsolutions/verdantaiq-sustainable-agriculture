
// Performance and monitoring constants
export const PERFORMANCE_THRESHOLDS = {
  DASHBOARD_LOAD_TIME: 3000, // 3 seconds
  REAL_TIME_UPDATE: 1000,    // 1 second
  API_RESPONSE: 500          // 500ms
} as const

// Environmental monitoring thresholds
export const ENVIRONMENTAL_THRESHOLDS = {
  TEMPERATURE: { MIN: 15, MAX: 35, OPTIMAL: { MIN: 20, MAX: 25 } },
  MOISTURE: { MIN: 40, MAX: 80, OPTIMAL: { MIN: 50, MAX: 70 } },
  PH: { MIN: 6.0, MAX: 8.0, OPTIMAL: { MIN: 6.5, MAX: 7.5 } }
} as const

// Alert severity colors and priorities
export const ALERT_CONFIG = {
  LOW: { color: '#10B981', priority: 1 },
  MEDIUM: { color: '#F59E0B', priority: 2 },
  HIGH: { color: '#EF4444', priority: 3 },
  CRITICAL: { color: '#DC2626', priority: 4 }
} as const

// Chart colors for consistent visualization
export const CHART_COLORS = [
  '#60B5FF', '#FF9149', '#FF9898', '#FF90BB', 
  '#FF6363', '#80D8C3', '#A19AD3', '#72BF78'
] as const

// Data refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  REAL_TIME: 1000,     // 1 second
  FAST: 5000,          // 5 seconds
  NORMAL: 30000,       // 30 seconds
  SLOW: 300000         // 5 minutes
} as const

// User roles and permissions
export const USER_PERMISSIONS = {
  ADMIN: ['read', 'write', 'delete', 'manage'],
  OPERATOR: ['read', 'write'],
  ANALYST: ['read'],
  VIEWER: ['read'],
  MAINTENANCE: ['read', 'write', 'maintenance']
} as const
