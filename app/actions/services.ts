'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  type: z.enum(['MASJID_FUND', 'DEATH_COMMITTEE', 'CHARITY', 'OTHER']).default('OTHER'),
  targetAmount: z.number().positive().optional(),
})

const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
})

/**
 * Get all active services (Public/Member action)
 */
export async function getActiveServices() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: services,
    }
  } catch (error) {
    console.error('Error fetching services:', error)
    return {
      success: false,
      error: 'Failed to fetch services.',
    }
  }
}

/**
 * Get all services (Admin action)
 */
export async function getAllServices() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized.',
      }
    }

    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: services,
    }
  } catch (error) {
    console.error('Error fetching services:', error)
    return {
      success: false,
      error: 'Failed to fetch services.',
    }
  }
}

/**
 * Create a new service (Admin action)
 */
export async function createService(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized. Only admins can create services.',
      }
    }

    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: (formData.get('type') as string) || 'OTHER',
      targetAmount: formData.get('targetAmount')
        ? parseFloat(formData.get('targetAmount') as string)
        : undefined,
    }

    const validatedData = createServiceSchema.parse(rawData)

    const service = await prisma.service.create({
      data: validatedData,
    })

    revalidatePath('/admin/services')
    revalidatePath('/member/services')

    return {
      success: true,
      data: service,
      message: 'Service created successfully.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error creating service:', error)
    return {
      success: false,
      error: 'Failed to create service. Please try again.',
    }
  }
}

/**
 * Update a service (Admin action)
 */
export async function updateService(serviceId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized. Only admins can update services.',
      }
    }

    const rawData: any = {}
    const name = formData.get('name')
    const description = formData.get('description')
    const type = formData.get('type')
    const targetAmount = formData.get('targetAmount')
    const isActive = formData.get('isActive')

    if (name) rawData.name = name
    if (description !== null) rawData.description = description
    if (type) rawData.type = type
    if (targetAmount) rawData.targetAmount = parseFloat(targetAmount as string)
    if (isActive !== null) rawData.isActive = isActive === 'true'

    const validatedData = updateServiceSchema.parse(rawData)

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: validatedData,
    })

    revalidatePath('/admin/services')
    revalidatePath('/member/services')

    return {
      success: true,
      data: service,
      message: 'Service updated successfully.',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    console.error('Error updating service:', error)
    return {
      success: false,
      error: 'Failed to update service. Please try again.',
    }
  }
}

/**
 * Delete a service (Admin action)
 */
export async function deleteService(serviceId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized. Only admins can delete services.',
      }
    }

    // Check if service has transactions
    const transactionCount = await prisma.transaction.count({
      where: { serviceId },
    })

    if (transactionCount > 0) {
      return {
        success: false,
        error: 'Cannot delete service with existing transactions. Deactivate it instead.',
      }
    }

    await prisma.service.delete({
      where: { id: serviceId },
    })

    revalidatePath('/admin/services')
    revalidatePath('/member/services')

    return {
      success: true,
      message: 'Service deleted successfully.',
    }
  } catch (error) {
    console.error('Error deleting service:', error)
    return {
      success: false,
      error: 'Failed to delete service. Please try again.',
    }
  }
}

