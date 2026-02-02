import { createFileRoute } from '@tanstack/react-router'
import { useGetXAccount, useSaveXAccount, useDeleteXAccount, useGetAuthStatus } from '../../generated/api'
import { useState } from 'react'

export const Route = createFileRoute('/demo/orval-example')({
  component: OrvalExample,
})

function OrvalExample() {
  const [authToken, setAuthToken] = useState('')
  const [ct0, setCt0] = useState('')

  // Queries
  const { data: authData, isLoading: authLoading } = useGetAuthStatus()
  const { data: accountData, isLoading: accountLoading, error: accountError } = useGetXAccount()

  // Mutations
  const saveMutation = useSaveXAccount({
    mutation: {
      onSuccess: () => {
        alert('X Account saved successfully!')
        setAuthToken('')
        setCt0('')
      },
      onError: (error) => {
        alert('Failed to save: ' + error)
      },
    },
  })

  const deleteMutation = useDeleteXAccount({
    mutation: {
      onSuccess: () => {
        alert('X Account deleted successfully!')
      },
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({ data: { authToken, ct0 } })
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 text-white"
      style={{
        backgroundColor: '#000',
        backgroundImage:
          'radial-gradient(ellipse 60% 60% at 0% 100%, #444 0%, #222 60%, #000 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-6">Orval + React Query Example</h1>
        
        {/* Auth Status */}
        <div className="mb-6 p-4 bg-white/10 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Auth Status</h2>
          {authLoading ? (
            <p>Loading...</p>
          ) : authData?.data.user ? (
            <div>
              <p>User ID: {authData.data.user.id}</p>
              <p>Email: {authData.data.user.email}</p>
            </div>
          ) : (
            <p className="text-yellow-400">Not authenticated</p>
          )}
        </div>

        {/* X Account Info */}
        <div className="mb-6 p-4 bg-white/10 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">X Account</h2>
          {accountLoading ? (
            <p>Loading...</p>
          ) : accountError ? (
            <p className="text-red-400">No X account found</p>
          ) : accountData?.data ? (
            <div className="space-y-2">
              <p>ID: {accountData.data.id}</p>
              <p>Created: {new Date(accountData.data.createdAt).toLocaleDateString()}</p>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          ) : (
            <p className="text-gray-400">No account data</p>
          )}
        </div>

        {/* Save X Account Form */}
        <div className="p-4 bg-white/10 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Save X Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Auth Token</label>
              <input
                type="text"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
                placeholder="Enter auth token"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">CT0</label>
              <input
                type="text"
                value={ct0}
                onChange={(e) => setCt0(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
                placeholder="Enter ct0"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save X Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
