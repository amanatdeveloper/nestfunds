import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { getTransactions } from '@/app/actions/transactions'
import { getActiveServices } from '@/app/actions/services'
import Link from 'next/link'
import { ArrowRight, DollarSign, Clock, CheckCircle } from 'lucide-react'

export default async function MemberDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'MEMBER') {
    redirect('/auth/signin')
  }

  const transactionsResult = await getTransactions()
  const servicesResult = await getActiveServices()

  const transactions = transactionsResult.success
    ? transactionsResult.data || []
    : []
  const services = servicesResult.success ? servicesResult.data || [] : []

  const recentTransactions = transactions.slice(0, 5)
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length
  const approvedTotal = transactions
    .filter((t) => t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <DashboardLayout userRole="MEMBER">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {session.user.name}
          </p>
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
                  ${approvedTotal.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-500">Approved donations</p>
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
                  {pendingCount}
                </p>
                <p className="mt-1 text-sm text-gray-500">Transactions</p>
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
                  Active Services
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {services.length}
                </p>
                <p className="mt-1 text-sm text-gray-500">Available to donate</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/member/services"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">Make a Donation</h3>
                <p className="text-sm text-gray-500">
                  Submit a new donation to a service
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link
              href="/member/donations"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">View History</h3>
                <p className="text-sm text-gray-500">
                  Check your donation history
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Donations
            </h2>
            <Link
              href="/member/donations"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No donations yet. Make your first donation to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {transaction.service.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                          transaction.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

