'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createDependentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  age: z.number().int().positive('Age must be positive'),
  nic: z.string().optional(),
})

const createPayoutSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  receiverName: z.string().min(1, 'Receiver name is required'),
  receiverRelation: z.string().min(1, 'Receiver relation is required'),
  notes: z.string().optional(),
  dependentId: z.string().optional(),
})

const updateSubscriptionFeeSchema = z.object({
  subscriptionFee: z.number().positive('Subscription fee must be positive'),
})

/**
 * Get or create Death Committee member record
 */
export async function getOrCreateDeathCommitteeMember(userId: string) {
  try {
    let member = await prisma.deathCommitteeMember.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
        dependents: true,
        payouts: {
          orderBy: { payoutDate: 'desc' },
        },
      },
    })

    if (!member) {
      member = await prisma.deathCommitteeMember.create({
        data: {
          userId,
          monthlySubscriptionFee: 500,
          status: 'UNPAID',
        },
        include: {
          subscriptions: true,
          dependents: true,
          payouts: true,
        },
      })
    }

    return {
      success: true,
      data: member,
    }
  } catch (error) {
    console.error('Error getting death committee member:', error)
    return {
      success: false,
      error: 'Failed to fetch member data.',
    }
  }
}

/**
 * Update subscription fee for a member (Admin)
 */
export async function updateSubscriptionFee(
  memberId: string,
  subscriptionFee: number
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const validatedData = updateSubscriptionFeeSchema.parse({
      subscriptionFee,
    })

    const member = await prisma.deathCommitteeMember.update({
      where: { id: memberId },
      data: {
        monthlySubscriptionFee: validatedData.subscriptionFee,
      },
    })

    revalidatePath('/admin/death-committee')
    revalidatePath('/member/death-committee')

    return {
      success: true,
      data: member,
      message: 'Subscription fee updated successfully.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error updating subscription fee:', error)
    return {
      success: false,
      error: 'Failed to update subscription fee.',
    }
  }
}

/**
 * Calculate member's outstanding balance
 */
export async function calculateOutstandingBalance(memberId: string) {
  try {
    const member = await prisma.deathCommitteeMember.findUnique({
      where: { id: memberId },
      include: {
        subscriptions: {
          where: { isPaid: false },
        },
      },
    })

    if (!member) {
      return {
        success: false,
        error: 'Member not found.',
      }
    }

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Calculate overdue months
    const overdueSubscriptions = member.subscriptions.filter((sub: any) => {
      const subDate = new Date(sub.year, sub.month - 1)
      const current = new Date(currentYear, currentMonth - 1)
      return subDate < current && !sub.isPaid
    })

    const totalOutstanding = overdueSubscriptions.reduce(
      (sum: number, sub: any) => sum + sub.amount,
      0
    )

    // Calculate months that should have been paid
    const monthsToCheck: { month: number; year: number }[] = []
    const startDate = new Date(member.createdAt)
    const startMonth = startDate.getMonth() + 1
    const startYear = startDate.getFullYear()

    for (let year = startYear; year <= currentYear; year++) {
      const startM = year === startYear ? startMonth : 1
      const endM = year === currentYear ? currentMonth : 12

      for (let month = startM; month <= endM; month++) {
        const exists = member.subscriptions.some(
          (s: any) => s.month === month && s.year === year
        )
        if (!exists) {
          monthsToCheck.push({ month, year })
        }
      }
    }

    return {
      success: true,
      data: {
        totalOutstanding,
        overdueCount: overdueSubscriptions.length,
        missingMonths: monthsToCheck,
        monthlyFee: member.monthlySubscriptionFee,
      },
    }
  } catch (error) {
    console.error('Error calculating balance:', error)
    return {
      success: false,
      error: 'Failed to calculate balance.',
    }
  }
}

/**
 * Upload payment proof for subscription
 */
export async function uploadSubscriptionPayment(
  memberId: string,
  month: number,
  year: number,
  paymentProof: string
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    // Get or create subscription
    let subscription = await prisma.deathCommitteeSubscription.findUnique({
      where: {
        memberId_month_year: {
          memberId,
          month,
          year,
        },
      },
    })

    const member = await prisma.deathCommitteeMember.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return {
        success: false,
        error: 'Member not found.',
      }
    }

    if (!subscription) {
      subscription = await prisma.deathCommitteeSubscription.create({
        data: {
          memberId,
          month,
          year,
          amount: member.monthlySubscriptionFee,
          isPaid: false,
          paymentProof,
        },
      })
    } else {
      subscription = await prisma.deathCommitteeSubscription.update({
        where: { id: subscription.id },
        data: { paymentProof },
      })
    }

    revalidatePath('/member/death-committee')
    revalidatePath('/admin/death-committee')

    return {
      success: true,
      data: subscription,
      message: 'Payment proof uploaded. Waiting for approval.',
    }
  } catch (error) {
    console.error('Error uploading payment:', error)
    return {
      success: false,
      error: 'Failed to upload payment proof.',
    }
  }
}

/**
 * Approve subscription payment (Admin)
 */
export async function approveSubscriptionPayment(subscriptionId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const subscription = await prisma.deathCommitteeSubscription.update({
      where: { id: subscriptionId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
      include: {
        member: true,
      },
    })

    // Update member status
    await updateMemberPaymentStatus(subscription.memberId)

    revalidatePath('/admin/death-committee')
    revalidatePath('/member/death-committee')

    return {
      success: true,
      data: subscription,
      message: 'Payment approved successfully.',
    }
  } catch (error) {
    console.error('Error approving payment:', error)
    return {
      success: false,
      error: 'Failed to approve payment.',
    }
  }
}

/**
 * Add dependent (Member)
 */
export async function addDependent(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const rawData = {
      name: formData.get('name') as string,
      relation: formData.get('relation') as string,
      age: parseInt(formData.get('age') as string),
      nic: formData.get('nic') as string,
    }

    const validatedData = createDependentSchema.parse(rawData)

    const memberResult = await getOrCreateDeathCommitteeMember(session.user.id)
    if (!memberResult.success || !memberResult.data) {
      return {
        success: false,
        error: memberResult.error || 'Failed to get member record.',
      }
    }

    const dependent = await prisma.dependent.create({
      data: {
        memberId: memberResult.data.id,
        ...validatedData,
      },
    })

    revalidatePath('/member/death-committee')

    return {
      success: true,
      data: dependent,
      message: 'Dependent added successfully.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error adding dependent:', error)
    return {
      success: false,
      error: 'Failed to add dependent.',
    }
  }
}

/**
 * Mark member or dependent as deceased (Admin)
 */
export async function markAsDeceased(
  type: 'member' | 'dependent',
  id: string,
  formData: FormData
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const rawData = {
      amount: parseFloat(formData.get('amount') as string),
      receiverName: formData.get('receiverName') as string,
      receiverRelation: formData.get('receiverRelation') as string,
      notes: formData.get('notes') as string,
      dependentId: formData.get('dependentId') as string,
    }

    const validatedData = createPayoutSchema.parse(rawData)

    if (type === 'dependent') {
      const dependent = await prisma.dependent.update({
        where: { id },
        data: {
          deceasedStatus: 'DECEASED',
          deceasedDate: new Date(),
        },
        include: { member: true },
      })

      // Create payout
      await prisma.funeralPayout.create({
        data: {
          memberId: dependent.memberId,
          dependentId: id,
          ...validatedData,
        },
      })
    } else {
      // For member, we need to get their member record
      const user = await prisma.user.findUnique({
        where: { id },
        include: { deathCommitteeMember: true },
      })

      if (!user || !user.deathCommitteeMember) {
        return {
          success: false,
          error: 'Member not found.',
        }
      }

      // Create payout for member
      await prisma.funeralPayout.create({
        data: {
          memberId: user.deathCommitteeMember.id,
          ...validatedData,
        },
      })
    }

    revalidatePath('/admin/death-committee')

    return {
      success: true,
      message: 'Deceased status updated and payout created.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error marking as deceased:', error)
    return {
      success: false,
      error: 'Failed to update status.',
    }
  }
}

/**
 * Get all death committee members (Admin)
 */
export async function getAllDeathCommitteeMembers(filters?: {
  status?: 'PAID' | 'UNPAID' | 'OVERDUE'
}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const where: any = {}
    if (filters?.status) {
      where.status = filters.status
    }

    const members = await prisma.deathCommitteeMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        subscriptions: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
        dependents: true,
        payouts: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add payout count to each member
    const membersWithCount = members.map((member: any) => ({
      ...member,
      _count: {
        payouts: member.payouts.length,
      },
    }))

    return {
      success: true,
      data: membersWithCount,
    }
  } catch (error) {
    console.error('Error fetching members:', error)
    return {
      success: false,
      error: 'Failed to fetch members.',
    }
  }
}

/**
 * Get financial health summary (Admin)
 */
export async function getFinancialHealth() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const totalSubscriptions = await prisma.deathCommitteeSubscription.aggregate({
      where: { isPaid: true },
      _sum: { amount: true },
      _count: true,
    })

    const totalPayouts = await prisma.funeralPayout.aggregate({
      _sum: { amount: true },
      _count: true,
    })

    const totalCollected = totalSubscriptions._sum.amount || 0
    const totalPaidOut = totalPayouts._sum.amount || 0
    const netBalance = totalCollected - totalPaidOut

    return {
      success: true,
      data: {
        totalCollected,
        totalPaidOut,
        netBalance,
        subscriptionCount: totalSubscriptions._count,
        payoutCount: totalPayouts._count,
      },
    }
  } catch (error) {
    console.error('Error fetching financial health:', error)
    return {
      success: false,
      error: 'Failed to fetch financial data.',
    }
  }
}

/**
 * Helper function to update member payment status
 */
async function updateMemberPaymentStatus(memberId: string) {
  const balanceResult = await calculateOutstandingBalance(memberId)
  if (balanceResult.success && balanceResult.data) {
    const status =
      balanceResult.data.overdueCount > 0 ? 'OVERDUE' : 'PAID'
    await prisma.deathCommitteeMember.update({
      where: { id: memberId },
      data: { status },
    })
  }
}
