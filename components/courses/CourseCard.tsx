'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

interface Course {
  id: string
  code: string
  title: string
  description: string | null
  instructor: string | null
  credits: number | null
  semester: string | null
  year: number | null
  department: string | null
  prerequisites: string[] | null
  capacity: number | null
  enrolled: number | null
  schedule: any
}

interface CourseCardProps {
  course: Course
  enrollmentStatus?: string
}

export default function CourseCard({ course, enrollmentStatus }: CourseCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const isEnrolled = enrollmentStatus === 'enrolled'
  const isFull = course.capacity && course.enrolled ? course.enrolled >= course.capacity : false
  const canEnroll = !isEnrolled && !isFull && user

  const handleEnroll = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: course.id,
        status: 'enrolled'
      })

    if (error) {
      setError('Failed to enroll. Please try again.')
      console.error('Enrollment error:', error)
    } else {
      router.refresh()
    }
    
    setLoading(false)
  }

  const handleDrop = async () => {
    if (!user || !enrollmentStatus) return
    
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'dropped' })
      .eq('user_id', user.id)
      .eq('course_id', course.id)

    if (error) {
      setError('Failed to drop course. Please try again.')
      console.error('Drop error:', error)
    } else {
      router.refresh()
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
            <p className="text-gray-700 mt-1">{course.title}</p>
          </div>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {course.credits} credits
          </span>
        </div>

        {course.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          {course.instructor && (
            <div className="flex justify-between">
              <span className="text-gray-500">Instructor:</span>
              <span className="text-gray-900">{course.instructor}</span>
            </div>
          )}
          
          {course.department && (
            <div className="flex justify-between">
              <span className="text-gray-500">Department:</span>
              <span className="text-gray-900">{course.department}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-500">Enrollment:</span>
            <span className={`font-medium ${isFull ? 'text-red-600' : 'text-gray-900'}`}>
              {course.enrolled || 0} / {course.capacity || '∞'}
            </span>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="pt-2 border-t">
              <span className="text-gray-500 text-xs">Prerequisites: {course.prerequisites.join(', ')}</span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex gap-2">
          <Link
            href={`/courses/${course.id}`}
            className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            View Details
          </Link>
          
          {isEnrolled ? (
            <button
              onClick={handleDrop}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Drop Course'}
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={loading || !canEnroll}
              className={`flex-1 px-4 py-2 rounded-md ${
                canEnroll
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {loading ? 'Processing...' : isFull ? 'Course Full' : 'Enroll'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}