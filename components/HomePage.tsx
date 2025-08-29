'use client'

import { useAuth } from './AuthProvider'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Course Cut
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your college course management platform
          </p>
        </div>
        
        {user ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Welcome back, {user.email}!</p>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-gray-600">Saved Courses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Active Courses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Please log in to access your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  )
}