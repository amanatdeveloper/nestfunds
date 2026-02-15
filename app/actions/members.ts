'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  subscriptionFee: z.string().optional(),
})

/**
 * Create a new member/user (Admin action)
 */
export async function createMember(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized. Only admins can create members.',
      }
    }

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      role: (formData.get('role') as string) || 'MEMBER',
      subscriptionFee: formData.get('subscriptionFee') as string,
    }

    const validatedData = createMemberSchema.parse(rawData)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists.',
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
      },
    })

    // Create Death Committee member record if subscription fee is provided
    if (validatedData.subscriptionFee) {
      const subscriptionFee = parseFloat(validatedData.subscriptionFee)
      if (!isNaN(subscriptionFee) && subscriptionFee > 0) {
        await prisma.deathCommitteeMember.create({
          data: {
            userId: user.id,
            monthlySubscriptionFee: subscriptionFee,
            status: 'UNPAID',
          },
        })
      }
    }

    revalidatePath('/admin/members')
    revalidatePath('/admin/death-committee')

    return {
      success: true,
      data: user,
      message: `${validatedData.role === 'ADMIN' ? 'Admin' : 'Member'} created successfully.`,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error creating member:', error)
    return {
      success: false,
      error: 'Failed to create member. Please try again.',
    }
  }
}

