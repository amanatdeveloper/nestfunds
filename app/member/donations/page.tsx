import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { getTransactions } from '@/app/actions/transactions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

export default async function MemberDonationsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'MEMBER') {
    redirect('/auth/signin')
  }

  const transactionsResult = await getTransactions()
  const transactions = transactionsResult.success
    ? transactionsResult.data || []
    : []

  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING')
  const approvedTransactions = transactions.filter(
    (t) => t.status === 'APPROVED'
  )
  const rejectedTransactions = transactions.filter(
    (t) => t.status === 'REJECTED'
  )

  const totalDonated = approvedTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  )

  return (
    <DashboardLayout userRole="MEMBER">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
          <p className="mt-2 text-gray-600">View your donation history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Donated
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalDonated)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {approvedTransactions.length} approved
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {pendingTransactions.length}
                </p>
                <p className="mt-1 text-sm text-gray-500">Awaiting review</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Donations
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {transactions.length}
                </p>
                <p className="mt-1 text-sm text-gray-500">All time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Donation History ({transactions.length})
            </h2>
          </div>
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No donations yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start donating to see your history here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.service.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.status === 'APPROVED' && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {transaction.status === 'PENDING' && (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {transaction.status === 'REJECTED' && (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

