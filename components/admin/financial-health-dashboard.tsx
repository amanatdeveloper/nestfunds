'use client'

import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface FinancialHealthDashboardProps {
  financial: {
    totalCollected: number
    totalPaidOut: number
    netBalance: number
    subscriptionCount: number
    payoutCount: number
  }
}

export function FinancialHealthDashboard({
  financial,
}: FinancialHealthDashboardProps) {
  const isHealthy = financial.netBalance > 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              Total Collected
            </p>
            <p className="mt-2 text-xl lg:text-2xl font-bold text-gray-900">
              {formatCurrency(financial.totalCollected)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {financial.subscriptionCount} subscriptions
            </p>
          </div>
          <div className="p-2 lg:p-3 bg-green-100 rounded-full">
            <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              Total Paid Out
            </p>
            <p className="mt-2 text-xl lg:text-2xl font-bold text-gray-900">
              {formatCurrency(financial.totalPaidOut)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {financial.payoutCount} payouts
            </p>
          </div>
          <div className="p-2 lg:p-3 bg-red-100 rounded-full">
            <TrendingDown className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              Net Balance
            </p>
            <p
              className={`mt-2 text-xl lg:text-2xl font-bold ${
                isHealthy ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(financial.netBalance)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isHealthy ? 'Positive' : 'Negative'}
            </p>
          </div>
          <div
            className={`p-2 lg:p-3 rounded-full ${
              isHealthy ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <TrendingUp
              className={`w-5 h-5 lg:w-6 lg:h-6 ${
                isHealthy ? 'text-green-600' : 'text-red-600'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              Health Status
            </p>
            <p className="mt-2 text-xl lg:text-2xl font-bold text-gray-900">
              {isHealthy ? 'Healthy' : 'At Risk'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isHealthy
                ? 'Funds available'
                : 'Insufficient funds'}
            </p>
          </div>
          <div
            className={`p-2 lg:p-3 rounded-full ${
              isHealthy ? 'bg-green-100' : 'bg-yellow-100'
            }`}
          >
            <AlertCircle
              className={`w-5 h-5 lg:w-6 lg:h-6 ${
                isHealthy ? 'text-green-600' : 'text-yellow-600'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

