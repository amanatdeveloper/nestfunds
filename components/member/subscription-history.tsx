'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface SubscriptionHistoryProps {
  subscriptions: any[]
  memberId: string
}

export function SubscriptionHistory({
  subscriptions,
}: SubscriptionHistoryProps) {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  if (subscriptions.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8 text-sm">
        No subscription history yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month
            </th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paid Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-gray-50">
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {monthNames[sub.month - 1]} {sub.year}
              </td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatCurrency(sub.amount)}
              </td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                    sub.isPaid
                      ? 'bg-green-100 text-green-800'
                      : sub.paymentProof
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {sub.isPaid ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : sub.paymentProof ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {sub.isPaid
                    ? 'Paid'
                    : sub.paymentProof
                    ? 'Pending'
                    : 'Unpaid'}
                </span>
              </td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {sub.paidAt ? formatDate(sub.paidAt) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

