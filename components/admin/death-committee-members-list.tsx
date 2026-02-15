'use client'

import { useState } from 'react'
import {
  approveSubscriptionPayment,
  markAsDeceased,
  updateSubscriptionFee,
} from '@/app/actions/death-committee'
import { formatCurrency, formatDate } from '@/lib/utils'
import { showToast } from '@/components/ui/toast'
import { CheckCircle, XCircle, AlertCircle, Users, Plus, X, Edit } from 'lucide-react'

interface MembersListProps {
  members: any[]
}

export function MembersList({ members }: MembersListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [showDeceasedForm, setShowDeceasedForm] = useState(false)
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)

  async function handleApprovePayment(subscriptionId: string) {
    if (!confirm('Approve this payment?')) return

    setLoading(`approve-${subscriptionId}`)
    try {
      const result = await approveSubscriptionPayment(subscriptionId)
      if (result.success) {
        showToast('Payment approved successfully!', 'success')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        showToast(result.error || 'Failed to approve payment', 'error')
        setLoading(null)
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      setLoading(null)
    }
  }

  async function handleMarkDeceased(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!confirm('Mark as deceased and create payout?')) return

    setLoading('deceased')
    try {
      const formData = new FormData(e.currentTarget)
      const type = formData.get('type') as 'member' | 'dependent'
      const id = formData.get('id') as string

      const result = await markAsDeceased(type, id, formData)
      if (result.success) {
        setShowDeceasedForm(false)
        setSelectedMember(null)
        showToast('Deceased status updated and payout created successfully!', 'success')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        showToast(result.error || 'Failed to update status', 'error')
        setLoading(null)
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      setLoading(null)
    }
  }

  async function handleUpdateFee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading('fee')
    try {
      const formData = new FormData(e.currentTarget)
      const fee = parseFloat(formData.get('fee') as string)

      if (!editingMemberId) return

      const result = await updateSubscriptionFee(editingMemberId, fee)
      if (result.success) {
        setShowFeeForm(false)
        setEditingMemberId(null)
        showToast('Subscription fee updated successfully!', 'success')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        showToast(result.error || 'Failed to update fee', 'error')
        setLoading(null)
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      setLoading(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No members found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {members.map((member) => {
        const pendingSubscriptions = member.subscriptions.filter(
          (s: any) => s.paymentProof && !s.isPaid
        )
        const unpaidSubscriptions = member.subscriptions.filter(
          (s: any) => !s.isPaid && !s.paymentProof
        )

        return (
          <div
            key={member.id}
            className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                  {member.user.name}
                </h3>
                <p className="text-sm text-gray-500">{member.user.email}</p>
                {member.user.phone && (
                  <p className="text-sm text-gray-500">{member.user.phone}</p>
                )}
                <p className="text-sm font-medium text-primary-600 mt-1">
                  Monthly Fee: {formatCurrency(member.monthlySubscriptionFee)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    member.status === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : member.status === 'OVERDUE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {member.status}
                </span>
                <button
                  onClick={() => {
                    setSelectedMember(member)
                    setShowDeceasedForm(true)
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                >
                  Mark Deceased
                </button>
              </div>
            </div>

            {/* Pending Payments */}
            {pendingSubscriptions.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Pending Approvals ({pendingSubscriptions.length})
                </p>
                <div className="space-y-2">
                  {pendingSubscriptions.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-yellow-700">
                        {new Date(sub.year, sub.month - 1).toLocaleDateString(
                          'en-GB',
                          { month: 'long', year: 'numeric' }
                        )}{' '}
                        - {formatCurrency(sub.amount)}
                      </span>
                      <div className="flex items-center gap-2">
                        {sub.paymentProof && (
                          <a
                            href={sub.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 text-xs"
                          >
                            View Proof
                          </a>
                        )}
                        <button
                          onClick={() => handleApprovePayment(sub.id)}
                          disabled={loading === `approve-${sub.id}`}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading === `approve-${sub.id}` ? '...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unpaid Subscriptions */}
            {unpaidSubscriptions.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Unpaid ({unpaidSubscriptions.length})
                </p>
                <div className="space-y-1">
                  {unpaidSubscriptions.slice(0, 3).map((sub: any) => (
                    <div
                      key={sub.id}
                      className="text-sm text-red-700"
                    >
                      {new Date(sub.year, sub.month - 1).toLocaleDateString(
                        'en-GB',
                        { month: 'long', year: 'numeric' }
                      )}
                    </div>
                  ))}
                  {unpaidSubscriptions.length > 3 && (
                    <p className="text-xs text-red-600">
                      +{unpaidSubscriptions.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Dependents */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Dependents ({member.dependents.length})
                </span>
              </div>
              {member.dependents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {member.dependents.map((dependent: any) => (
                    <div
                      key={dependent.id}
                      className="p-2 bg-gray-50 rounded text-xs"
                    >
                      <div className="font-medium">{dependent.name}</div>
                      <div className="text-gray-600">
                        {dependent.relation} - {dependent.age} years
                      </div>
                      <div
                        className={`mt-1 ${
                          dependent.deceasedStatus === 'DECEASED'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {dependent.deceasedStatus}
                      </div>
                      {dependent.deceasedStatus === 'ALIVE' && (
                        <button
                          onClick={() => {
                            setSelectedMember({ ...member, dependentId: dependent.id })
                            setShowDeceasedForm(true)
                          }}
                          className="mt-1 text-red-600 hover:text-red-800 text-xs"
                        >
                          Mark Deceased
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No dependents</p>
              )}
            </div>
          </div>
        )
      })}

      {/* Deceased Form Modal */}
      {showDeceasedForm && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Mark as Deceased
              </h2>
              <button
                onClick={() => {
                  setShowDeceasedForm(false)
                  setSelectedMember(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkDeceased} className="p-4 lg:p-6 space-y-4">
              <input
                type="hidden"
                name="type"
                value={selectedMember.dependentId ? 'dependent' : 'member'}
              />
              <input
                type="hidden"
                name="id"
                value={
                  selectedMember.dependentId || selectedMember.user?.id || ''
                }
              />
              {selectedMember.dependentId && (
                <input
                  type="hidden"
                  name="dependentId"
                  value={selectedMember.dependentId}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payout Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiver Name *
                </label>
                <input
                  type="text"
                  name="receiverName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiver Relation *
                </label>
                <select
                  name="receiverRelation"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">Select relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeceasedForm(false)
                    setSelectedMember(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading === 'deceased'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  {loading === 'deceased' ? 'Processing...' : 'Create Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Fee Edit Form Modal */}
      {showFeeForm && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Update Subscription Fee
              </h2>
              <button
                onClick={() => {
                  setShowFeeForm(false)
                  setSelectedMember(null)
                  setEditingMemberId(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFee} className="p-4 lg:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member
                </label>
                <input
                  type="text"
                  value={selectedMember.user?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Subscription Fee (£) *
                </label>
                <input
                  type="number"
                  name="fee"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={selectedMember.monthlySubscriptionFee || 500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeeForm(false)
                    setSelectedMember(null)
                    setEditingMemberId(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading === 'fee'}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
                >
                  {loading === 'fee' ? 'Updating...' : 'Update Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

