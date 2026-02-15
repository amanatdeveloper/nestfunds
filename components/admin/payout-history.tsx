import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign } from 'lucide-react'

interface PayoutHistoryProps {
  payouts: any[]
}

export function PayoutHistory({ payouts }: PayoutHistoryProps) {

  if (payouts.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No payouts yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member
            </th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Receiver
            </th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payouts.map((payout) => (
            <tr key={payout.id} className="hover:bg-gray-50">
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(payout.payoutDate)}
              </td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {payout.member?.user?.name || 'N/A'}
              </td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>{payout.receiverName}</div>
                <div className="text-xs text-gray-500">
                  {payout.receiverRelation}
                </div>
              </td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatCurrency(payout.amount)}
              </td>
              <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">
                {payout.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

