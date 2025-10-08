
import { EnvironmentalOverview } from '@/components/environmental/environmental-overview'

export const metadata = {
  title: 'Environmental Monitoring - Peoria Platform',
  description: 'Real-time environmental monitoring and sensor data analytics'
}

export default function EnvironmentalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Environmental Monitoring</h1>
        <p className="text-gray-600">Real-time sensor data and environmental analytics</p>
      </div>
      
      <EnvironmentalOverview />
    </div>
  )
}
