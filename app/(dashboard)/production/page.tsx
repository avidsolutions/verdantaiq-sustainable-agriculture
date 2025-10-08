
import { ProductionAnalytics } from '@/components/production/production-analytics'

export const metadata = {
  title: 'Production Analytics - Peoria Platform',
  description: 'Production yield analysis and optimization metrics'
}

export default function ProductionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Production Analytics</h1>
        <p className="text-gray-600">Yield optimization and production performance metrics</p>
      </div>
      
      <ProductionAnalytics />
    </div>
  )
}
