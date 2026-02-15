'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  serviceId: z.string().min(1, 'Service is required'),
  notes: z.string().optional(),
  paymentProof: z.string().url().optional().or(z.literal('')),
})

const updateTransactionStatusSchema = z.object({
  transactionId: z.string().min(1),
  status: z.enum(['APPROVED', 'REJECTED']),
  approvedBy: z.string().min(1),
})

/**
 * Create a new donation transaction (Member action)
 */
export async function createTransaction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'MEMBER') {
      return {
        success: false,
        error: 'Unauthorized. Only members can create transactions.',
      }
    }

    const rawData = {
      amount: parseFloat(formData.get('amount') as string),
      serviceId: formData.get('serviceId') as string,
      notes: formData.get('notes') as string,
      paymentProof: formData.get('paymentProof') as string,
    }

    // Validate input
    const validatedData = createTransactionSchema.parse(rawData)

    // Verify service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    })

    if (!service) {
      return {
        success: false,
        error: 'Service not found.',
      }
    }

    if (!service.isActive) {
      return {
        success: false,
        error: 'This service is currently inactive.',
      }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        serviceId: validatedData.serviceId,
        userId: session.user.id,
        notes: validatedData.notes || null,
        paymentProof: validatedData.paymentProof || null,
        status: 'PENDING',
      },
      include: {
        service: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath('/member/donations')
    revalidatePath('/admin/transactions')

    return {
      success: true,
      data: transaction,
      message: 'Donation submitted successfully. Waiting for approval.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error creating transaction:', error)
    return {
      success: false,
      error: 'Failed to create transaction. Please try again.',
    }
  }
}

/**
 * Update transaction status (Admin action)
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'APPROVED' | 'REJECTED'
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized. Only admins can approve transactions.',
      }
    }

    // Validate input
    const validatedData = updateTransactionStatusSchema.parse({
      transactionId,
      status,
      approvedBy: session.user.id,
    })

    // Get current transaction to update service amount
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: validatedData.transactionId },
      include: { service: true },
    })

    if (!currentTransaction) {
      return {
        success: false,
        error: 'Transaction not found.',
      }
    }

    // Update transaction status
    const transaction = await prisma.transaction.update({
      where: { id: validatedData.transactionId },
      data: {
        status: validatedData.status,
        approvedBy: validatedData.approvedBy,
        approvedAt: validatedData.status === 'APPROVED' ? new Date() : null,
      },
    })

    // Update service current amount if approved
    if (validatedData.status === 'APPROVED' && currentTransaction.status === 'PENDING') {
      await prisma.service.update({
        where: { id: currentTransaction.serviceId },
        data: {
          currentAmount: {
            increment: currentTransaction.amount,
          },
        },
      })
    }

    // Revert service amount if rejecting a previously approved transaction
    if (
      validatedData.status === 'REJECTED' &&
      currentTransaction.status === 'APPROVED'
    ) {
      await prisma.service.update({
        where: { id: currentTransaction.serviceId },
        data: {
          currentAmount: {
            decrement: currentTransaction.amount,
          },
        },
      })
    }

    revalidatePath('/admin/transactions')
    revalidatePath('/member/donations')
    revalidatePath('/admin/dashboard')

    return {
      success: true,
      data: transaction,
      message: `Transaction ${validatedData.status.toLowerCase()} successfully.`,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error updating transaction status:', error)
    return {
      success: false,
      error: 'Failed to update transaction status. Please try again.',
    }
  }
}

/**
 * Get all transactions with filters (Admin)
 */
export async function getTransactions(filters?: {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  serviceId?: string
  userId?: string
}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId
    }

    if (filters?.userId) {
      where.userId = filters.userId
    }

    // Members can only see their own transactions
    if (session.user.role === 'MEMBER') {
      where.userId = session.user.id
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: transactions,
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return {
      success: false,
      error: 'Failed to fetch transactions.',
    }
  }
}

/**
 * Get transaction statistics (Admin)
 */
export async function getTransactionStats() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const [totalPending, totalApproved, totalRejected] = await Promise.all([
      prisma.transaction.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { status: 'REJECTED' },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    return {
      success: true,
      data: {
        pending: {
          amount: totalPending._sum.amount || 0,
          count: totalPending._count,
        },
        approved: {
          amount: totalApproved._sum.amount || 0,
          count: totalApproved._count,
        },
        rejected: {
          amount: totalRejected._sum.amount || 0,
          count: totalRejected._count,
        },
      },
    }
  } catch (error) {
    console.error('Error fetching transaction stats:', error)
    return {
      success: false,
      error: 'Failed to fetch transaction statistics.',
    }
  }
}

