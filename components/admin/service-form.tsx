'use client'

import { useState } from 'react'
import { createService, updateService } from '@/app/actions/services'
import { showToast } from '@/components/ui/toast'
import { Plus, X, Save } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  type: string
  targetAmount: number | null
  isActive: boolean
}

interface ServiceFormProps {
  service?: Service
}

export function ServiceForm({ service }: ServiceFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!service

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Set default type to OTHER if not provided
      if (!formData.get('type')) {
        formData.set('type', 'OTHER')
      }

      // Handle isActive checkbox for edit mode (checkboxes don't send value when unchecked)
      if (isEdit) {
        const isActiveCheckbox = document.getElementById('isActive') as HTMLInputElement
        formData.set('isActive', isActiveCheckbox?.checked ? 'true' : 'false')
      }

      let result
      if (isEdit) {
        result = await updateService(service.id, formData)
      } else {
        result = await createService(formData)
      }

      if (result.success) {
        setIsOpen(false)
        showToast(result.message || 'Service saved successfully!', 'success')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError(result.error || 'Failed to save service')
        showToast(result.error || 'Failed to save service', 'error')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        {isEdit ? (
          <>
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Service</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? 'Edit Service' : 'Create New Service'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Service Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={service?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Masjid Fund"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={service?.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the service..."
                />
              </div>


              <div>
                <label
                  htmlFor="targetAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Target Amount (Optional)
                </label>
                <input
                  type="number"
                  id="targetAmount"
                  name="targetAmount"
                  step="0.01"
                  min="0"
                  defaultValue={service?.targetAmount || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>

              {isEdit && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked={service?.isActive}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Active
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

