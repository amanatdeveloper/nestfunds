import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import {
  getOrCreateDeathCommitteeMember,
  calculateOutstandingBalance,
} from '@/app/actions/death-committee'
import { SubscriptionCard } from '@/components/member/subscription-card'
import { SubscriptionHistory } from '@/components/member/subscription-history'
import { DependentsList } from '@/components/member/dependents-list'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, Users, Calendar } from 'lucide-react'

export default async function MemberDeathCommitteePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'MEMBER') {
    redirect('/auth/signin')
  }

  const memberResult = await getOrCreateDeathCommitteeMember(session.user.id)
  const member = memberResult.success ? memberResult.data : null

  const balanceResult = member
    ? await calculateOutstandingBalance(member.id)
    : null

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Get current month subscription
  const currentSubscription = member?.subscriptions.find(
    (s) => s.month === currentMonth && s.year === currentYear
  )

  if (!member) {
    return (
      <DashboardLayout userRole="MEMBER">
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Failed to load death committee data.
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="MEMBER">
      <div className="space-y-6 p-4 lg:p-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Death Committee
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            Manage your monthly subscriptions and dependents
          </p>
        </div>

        {/* Monthly Fee Info */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Monthly Subscription
              </h2>
              <p className="text-sm text-gray-600">
                Fee: {formatCurrency(member.monthlySubscriptionFee)} per month
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>

          {/* Outstanding Balance */}
          {balanceResult?.success && balanceResult.data && balanceResult.data.totalOutstanding > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">
                  Outstanding Balance
                </span>
              </div>
              <p className="text-lg font-bold text-yellow-900">
                {formatCurrency(balanceResult.data.totalOutstanding)}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {balanceResult.data.overdueCount} month(s) overdue
              </p>
            </div>
          )}
        </div>

        {/* Current Month Subscription Card */}
        <SubscriptionCard
          memberId={member.id}
          currentSubscription={currentSubscription}
          currentMonth={currentMonth}
          currentYear={currentYear}
          monthlyFee={member.monthlySubscriptionFee}
        />

        {/* Subscription History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              Subscription History
            </h2>
          </div>
          <div className="p-4 lg:p-6">
            <SubscriptionHistory
              subscriptions={member.subscriptions}
              memberId={member.id}
            />
          </div>
        </div>

        {/* Dependents */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Dependents ({member.dependents.length})
              </h2>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <DependentsList
              dependents={member.dependents}
              memberId={member.id}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

