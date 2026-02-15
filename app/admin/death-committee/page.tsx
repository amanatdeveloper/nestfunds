import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import {
  getAllDeathCommitteeMembers,
  getFinancialHealth,
} from '@/app/actions/death-committee'
import { MembersList } from '@/components/admin/death-committee-members-list'
import { FinancialHealthDashboard } from '@/components/admin/financial-health-dashboard'
import { PayoutHistory } from '@/components/admin/payout-history'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, Users, DollarSign, TrendingUp } from 'lucide-react'

export default async function AdminDeathCommitteePage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const filters: any = {}
  if (searchParams.status) {
    filters.status = searchParams.status.toUpperCase()
  }

  const membersResult = await getAllDeathCommitteeMembers(filters)
  const financialResult = await getFinancialHealth()

  const members = membersResult.success ? membersResult.data || [] : []
  const financial = financialResult.success ? financialResult.data : null

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6 p-4 lg:p-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Death Committee Management
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            Manage subscriptions, dependents, and funeral payouts
          </p>
        </div>

        {/* Financial Health Dashboard */}
        {financial && <FinancialHealthDashboard financial={financial} />}

        {/* Members List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Members ({members.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/admin/death-committee"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !searchParams.status
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </a>
                <a
                  href="/admin/death-committee?status=PAID"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    searchParams.status === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Paid
                </a>
                <a
                  href="/admin/death-committee?status=UNPAID"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    searchParams.status === 'UNPAID'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unpaid
                </a>
                <a
                  href="/admin/death-committee?status=OVERDUE"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    searchParams.status === 'OVERDUE'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Overdue
                </a>
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <MembersList members={members} />
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Payout History
            </h2>
          </div>
          <div className="p-4 lg:p-6">
            <PayoutHistory payouts={await prisma.funeralPayout.findMany({
              include: {
                member: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
                dependent: {
                  select: {
                    name: true,
                    relation: true,
                  },
                },
              },
              orderBy: {
                payoutDate: 'desc',
              },
            })} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

