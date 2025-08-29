'use client'

import { useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface Course {
  code: string
  title: string
  credits: number
  semester: string
  year: number
}

interface Enrollment {
  id: string
  status: string
  grade: string | null
  enrolled_at: string
  completed_at: string | null
  courses: Course
}

interface ProfileContentProps {
  user: User
  profile: Profile | null
  enrollments: Enrollment[]
}

export default function ProfileContent({ user, profile, enrollments }: ProfileContentProps) {
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 })
  const [showPositionControls, setShowPositionControls] = useState(false)
  const [emailChangeRequested, setEmailChangeRequested] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('saving')
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      setError('Failed to update profile. Please try again.')
      console.error('Profile update error:', error)
      setSaveStatus('idle')
    } else {
      setSaveStatus('saved')
      setHasChanges(false)
      
      // Show "Saved" for 2 seconds, then reset
      setTimeout(() => {
        setSaveStatus('idle')
        setEditing(false)
      }, 2000)
      
      router.refresh()
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      router.refresh()
      setShowPositionControls(true)
    } catch (error) {
      console.error('Avatar upload error:', error)
      setError('Failed to upload avatar. Please try again.')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleEmailChangeRequest = async () => {
    if (!newEmail || newEmail === user.email) {
      setError('Please enter a different email address')
      return
    }

    setSaveStatus('saving')
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}/auth/callback` }
      )

      if (error) {
        throw error
      }

      setVerificationSent(true)
      setEmailChangeRequested(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error: any) {
      console.error('Email change error:', error)
      setError(error.message || 'Failed to send verification email')
      setSaveStatus('idle')
    }
  }

  // Handle input changes to detect modifications
  const handleFullNameChange = (value: string) => {
    setFullName(value)
    setHasChanges(value !== (profile?.full_name || ''))
  }

  const handleEmailChange = (value: string) => {
    setNewEmail(value)
    setHasChanges(value !== user.email && value.length > 0)
  }

  // Calculate statistics
  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter(e => e.status === 'completed').length,
    enrolledCourses: enrollments.filter(e => e.status === 'enrolled').length,
    totalCredits: enrollments
      .filter(e => e.status === 'completed' || e.status === 'enrolled')
      .reduce((sum, e) => sum + (e.courses?.credits || 0), 0),
    completedCredits: enrollments
      .filter(e => e.status === 'completed')
      .reduce((sum, e) => sum + (e.courses?.credits || 0), 0)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        </div>
        <div className="p-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile picture"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${avatarPosition.x}% ${avatarPosition.y}%`
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Direct edit icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                title="Change profile picture"
              >
                {avatarLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            {/* Image positioning controls */}
            {showPositionControls && profile?.avatar_url && (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-gray-700">Adjust Position:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">X:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={avatarPosition.x}
                    onChange={(e) => setAvatarPosition(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Y:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={avatarPosition.y}
                    onChange={(e) => setAvatarPosition(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="w-20"
                  />
                </div>
                <button
                  onClick={() => setShowPositionControls(false)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {emailChangeRequested ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="Enter new email address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleEmailChangeRequest}
                          disabled={saveStatus === 'saving'}
                          className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                            saveStatus === 'saved'
                              ? 'bg-green-600 text-white'
                              : saveStatus === 'saving'
                              ? 'bg-primary/80 text-white cursor-not-allowed'
                              : 'bg-primary text-white hover:bg-primary/90'
                          }`}
                        >
                          {saveStatus === 'saving' && (
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {saveStatus === 'saved' && (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {saveStatus === 'saving' 
                            ? 'Sending...' 
                            : saveStatus === 'saved' 
                            ? 'Sent!' 
                            : 'Send Verification'
                          }
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailChangeRequested(false)
                            setNewEmail('')
                            setHasChanges(false)
                            setError(null)
                          }}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-gray-600">
                        A verification email will be sent to the new address. You must verify it to complete the change.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setEmailChangeRequested(true)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded"
                        title="Change email (requires verification)"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                
                {verificationSent && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      📧 Verification email sent! Check your inbox and click the link to confirm your new email address.
                    </p>
                  </div>
                )}

                {/* Dynamic Save Button - Only show when there are changes */}
                {hasChanges && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saveStatus === 'saving'}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        saveStatus === 'saved'
                          ? 'bg-green-600 text-white'
                          : saveStatus === 'saving'
                          ? 'bg-primary/80 text-white cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md transform hover:scale-105'
                      }`}
                    >
                      {saveStatus === 'saving' && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {saveStatus === 'saved' && (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {saveStatus === 'saving' 
                        ? 'Saving...' 
                        : saveStatus === 'saved' 
                        ? 'Saved!' 
                        : 'Save Changes'
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setFullName(profile?.full_name || '')
                        setNewEmail('')
                        setEmailChangeRequested(false)
                        setHasChanges(false)
                        setError(null)
                        setSaveStatus('idle')
                      }}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{profile?.full_name || 'Not set'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{user.email}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true)
                      setEmailChangeRequested(true)
                    }}
                    className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded"
                    title="Change email (requires verification)"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 hover:shadow-md transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Academic Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Academic Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
              <p className="text-sm text-gray-600 mt-1">Total Courses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.totalCredits}</p>
              <p className="text-sm text-gray-600 mt-1">Total Credits</p>
            </div>
          </div>

          {/* Course History */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course History</h3>
            {enrollments.length === 0 ? (
              <p className="text-gray-500">No course history yet.</p>
            ) : (
              <div className="space-y-3">
                {enrollments.map(enrollment => (
                  <div key={enrollment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {enrollment.courses.code} - {enrollment.courses.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {enrollment.courses.semester} {enrollment.courses.year} • {enrollment.courses.credits} credits
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                        enrollment.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'enrolled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status}
                      </span>
                      {enrollment.grade && (
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          Grade: {enrollment.grade}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}