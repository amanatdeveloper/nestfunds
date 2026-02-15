'use client'

import { useState } from 'react'
import { updateTransactionStatus } from '@/app/actions/transactions'
import { showToast } from '@/components/ui/toast'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface TransactionActionsProps {
  transactionId: string
  status: string
}

export function TransactionActions({
  transactionId,
  status,
}: TransactionActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function handleApprove() {
    if (
      !confirm('Are you sure you want to approve this transaction?')
    ) {
      return
    }

    setLoading('approve')
    try {
    const result = await updateTransactionStatus(transactionId, 'APPROVED')
    if (result.success) {
      showToast('Transaction approved successfully!', 'success')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      showToast(result.error || 'Failed to approve transaction', 'error')
      setLoading(null)
    }
  } catch (error) {
    showToast('An error occurred. Please try again.', 'error')
    setLoading(null)
  }
  }

  async function handleReject() {
    if (
      !confirm('Are you sure you want to reject this transaction?')
    ) {
      return
    }

    setLoading('reject')
    try {
    const result = await updateTransactionStatus(transactionId, 'REJECTED')
    if (result.success) {
      showToast('Transaction rejected successfully!', 'success')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      showToast(result.error || 'Failed to reject transaction', 'error')
      setLoading(null)
    }
  } catch (error) {
    showToast('An error occurred. Please try again.', 'error')
    setLoading(null)
  }
  }

  if (status === 'APPROVED') {
    return (
      <span className="text-green-600 text-sm font-medium">Approved</span>
    )
  }

  if (status === 'REJECTED') {
    return (
      <span className="text-red-600 text-sm font-medium">Rejected</span>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Approve transaction"
      >
        {loading === 'approve' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        <span>Approve</span>
      </button>
      <button
        onClick={handleReject}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Reject transaction"
      >
        {loading === 'reject' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        <span>Reject</span>
      </button>
    </div>
  )
}

