'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'

interface Course {
  id: string
  code: string
  title: string
  instructor: string
  credits: number
  schedule: any
}

interface Enrollment {
  id: string
  status: string
  courses: Course
}

interface Profile {
  full_name: string | null
  email: string | null
}

interface DashboardContentProps {
  enrollments: Enrollment[]
  profile: Profile | null
  user: User
}

export default function DashboardContent({ enrollments, profile, user }: DashboardContentProps) {
  const totalCredits = enrollments.reduce((sum, enrollment) => 
    sum + (enrollment.courses?.credits || 0), 0
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || user.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600 mt-2">Here&apos;s your course overview for this semester</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{enrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCredits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Current Semester</p>
              <p className="text-2xl font-semibold text-gray-900">Spring 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Courses */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Current Courses</h2>
            <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-500">
              Browse all courses →
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {enrollments.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">You&apos;re not enrolled in any courses yet.</p>
              <Link href="/courses" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                Browse available courses
              </Link>
            </div>
          ) : (
            enrollments.map((enrollment) => (
              <div key={enrollment.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {enrollment.courses.code}
                      </h3>
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {enrollment.courses.credits} credits
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{enrollment.courses.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Instructor: {enrollment.courses.instructor}
                    </p>
                    {enrollment.courses.schedule && (
                      <div className="mt-2 text-sm text-gray-600">
                        {Object.entries(enrollment.courses.schedule).map(([day, time]) => (
                          <span key={day} className="mr-4">
                            {day}: {time as string}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/courses/${enrollment.courses.id}`}
                    className="ml-4 text-blue-600 hover:text-blue-500 text-sm"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/courses" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Browse Courses</h3>
            <p className="text-gray-600">Explore available courses and add them to your schedule</p>
          </div>
        </Link>
        
        <Link href="/schedule" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">View Schedule</h3>
            <p className="text-gray-600">See your weekly class schedule and upcoming sessions</p>
          </div>
        </Link>
      </div>
    </div>
  )
}