import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { getTransactions, getTransactionStats } from '@/app/actions/transactions'
import { getAllServices } from '@/app/actions/services'
import { TransactionActions } from '@/components/admin/transaction-actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AlertCircle, CheckCircle, Clock, XCircle, Filter } from 'lucide-react'

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { status?: string; serviceId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const filters: any = {}
  if (searchParams.status) {
    filters.status = searchParams.status.toUpperCase()
  }
  if (searchParams.serviceId) {
    filters.serviceId = searchParams.serviceId
  }

  const transactionsResult = await getTransactions(filters)
  const statsResult = await getTransactionStats()
  const servicesResult = await getAllServices()

  const transactions = transactionsResult.success
    ? transactionsResult.data || []
    : []
  const stats = statsResult.success ? statsResult.data : null
  const services = servicesResult.success ? servicesResult.data || [] : []

  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING')

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-2 text-gray-600">
            Review and approve donation transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats?.pending.count || 0}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(stats?.pending.amount || 0)}
                </p>
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
                  Approved
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats?.approved.count || 0}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(stats?.approved.amount || 0)}
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
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats?.rejected.count || 0}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(stats?.rejected.amount || 0)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <a
              href="/admin/transactions"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !searchParams.status
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </a>
            <a
              href="/admin/transactions?status=PENDING"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchParams.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats?.pending.count || 0})
            </a>
            <a
              href="/admin/transactions?status=APPROVED"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchParams.status === 'APPROVED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({stats?.approved.count || 0})
            </a>
            <a
              href="/admin/transactions?status=REJECTED"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchParams.status === 'REJECTED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({stats?.rejected.count || 0})
            </a>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Transactions ({transactions.length})
            </h2>
          </div>
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No transactions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchParams.status
                    ? `No ${searchParams.status.toLowerCase()} transactions found.`
                    : 'No transactions found yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
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
                        Payment Proof
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.user.email}
                            </div>
                          </div>
                        </td>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.paymentProof ? (
                            <a
                              href={transaction.paymentProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 text-sm"
                            >
                              View Proof
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <TransactionActions
                            transactionId={transaction.id}
                            status={transaction.status}
                          />
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

