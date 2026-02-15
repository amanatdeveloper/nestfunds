import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { getActiveServices } from '@/app/actions/services'
import { DonationForm } from '@/components/member/donation-form'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, DollarSign } from 'lucide-react'

export default async function MemberServicesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'MEMBER') {
    redirect('/auth/signin')
  }

  const servicesResult = await getActiveServices()
  const services = servicesResult.success ? servicesResult.data || [] : []

  return (
    <DashboardLayout userRole="MEMBER">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="mt-2 text-gray-600">
            View active services and make donations
          </p>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No active services
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no active services available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-primary-100 rounded-full">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Amount:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(service.currentAmount)}
                    </span>
                  </div>
                  {service.targetAmount && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Target Amount:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(service.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (service.currentAmount / service.targetAmount) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {(
                          (service.currentAmount / service.targetAmount) *
                          100
                        ).toFixed(1)}
                        % funded
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <DonationForm serviceId={service.id} serviceName={service.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

