import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { getTransactionStats } from '@/app/actions/transactions'
import { getAllServices } from '@/app/actions/services'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const statsResult = await getTransactionStats()
  const servicesResult = await getAllServices()

  const stats = statsResult.success ? statsResult.data : null
  const services = servicesResult.success && servicesResult.data ? servicesResult.data : []

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of community service management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Amount
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  £{stats?.pending.amount.toFixed(2) || '0.00'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {stats?.pending.count || 0} transactions
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
                  Approved Amount
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  £{stats?.approved.amount.toFixed(2) || '0.00'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {stats?.approved.count || 0} transactions
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
                  Total Collected
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  £{stats?.approved.amount.toFixed(2) || '0.00'}
                </p>
                <p className="mt-1 text-sm text-gray-500">All time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
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
                  {services.filter((s) => s.isActive).length}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {services.length} total
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Services Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
          </div>
          <div className="p-6">
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No services created yet. Create your first service to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">{service.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        £{service.currentAmount.toFixed(2)}
                      </p>
                      {service.targetAmount && (
                        <p className="text-sm text-gray-500">
                          of £{service.targetAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        service.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
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

