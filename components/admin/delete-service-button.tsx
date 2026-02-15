'use client'

import { deleteService } from '@/app/actions/services'
import { showToast } from '@/components/ui/toast'
import { Trash2 } from 'lucide-react'

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete this service? This action cannot be undone.'
      )
    ) {
      return
    }

    const result = await deleteService(serviceId)
    if (result.success) {
      showToast('Service deleted successfully!', 'success')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      showToast(result.error || 'Failed to delete service', 'error')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900 p-2"
      title="Delete service"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

