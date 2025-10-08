
import { VermicultureManagement } from '@/components/vermiculture/vermiculture-management'

export const metadata = {
  title: 'Vermiculture Management - Peoria Platform',
  description: 'Comprehensive vermiculture system management and monitoring'
}

export default function VermiculturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vermiculture Management</h1>
        <p className="text-gray-600">Automated worm farming system control and monitoring</p>
      </div>
      
      <VermicultureManagement />
    </div>
  )
}
