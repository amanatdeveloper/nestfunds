'use client'

import { useState } from 'react'
import { uploadSubscriptionPayment } from '@/app/actions/death-committee'
import { formatCurrency } from '@/lib/utils'
import { showToast } from '@/components/ui/toast'
import { CheckCircle, Clock, Upload, X } from 'lucide-react'

interface SubscriptionCardProps {
  memberId: string
  currentSubscription: any
  currentMonth: number
  currentYear: number
  monthlyFee: number
}

export function SubscriptionCard({
  memberId,
  currentSubscription,
  currentMonth,
  currentYear,
  monthlyFee,
}: SubscriptionCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const isPaid = currentSubscription?.isPaid || false
  const hasPaymentProof = !!currentSubscription?.paymentProof

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const paymentProof = formData.get('paymentProof') as string

      if (!paymentProof) {
        setError('Payment proof URL is required')
        setLoading(false)
        return
      }

      const result = await uploadSubscriptionPayment(
        memberId,
        currentMonth,
        currentYear,
        paymentProof
      )

      if (result.success) {
        setIsOpen(false)
        showToast('Payment proof uploaded successfully! Waiting for admin approval.', 'success')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError(result.error || 'Failed to upload payment proof')
        showToast(result.error || 'Failed to upload payment proof', 'error')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth - 1]} {currentYear}
          </h3>
          <p className="text-sm text-gray-600">
            Amount: {formatCurrency(monthlyFee)}
          </p>
        </div>
        <div>
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Paid
            </span>
          ) : hasPaymentProof ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              Pending Approval
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Unpaid
            </span>
          )}
        </div>
      </div>

      {!isPaid && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Payment Proof</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Upload Payment Proof
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="paymentProof"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Proof URL *
                </label>
                <input
                  type="url"
                  id="paymentProof"
                  name="paymentProof"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="https://example.com/payment-proof.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload your payment screenshot to a hosting service and paste
                  the URL here
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

