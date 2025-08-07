'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

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

interface Enrollment {
  id: string
  status: string
  enrolled_at: string
}

interface CourseDetailContentProps {
  course: Course
  enrollment: Enrollment | null
  enrollmentCount: number
  user: User
}

export default function CourseDetailContent({ 
  course, 
  enrollment, 
  enrollmentCount,
  user 
}: CourseDetailContentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const isEnrolled = enrollment?.status === 'enrolled'
  const isFull = course.capacity ? enrollmentCount >= course.capacity : false
  const canEnroll = !isEnrolled && !isFull

  const handleEnroll = async () => {
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
    if (!enrollment) return
    
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'dropped' })
      .eq('id', enrollment.id)

    if (error) {
      setError('Failed to drop course. Please try again.')
      console.error('Drop error:', error)
    } else {
      router.refresh()
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link href="/courses" className="text-gray-500 hover:text-gray-700">
              Courses
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900">{course.code}</li>
        </ol>
      </nav>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.code}</h1>
            <h2 className="text-xl text-gray-700 mt-2">{course.title}</h2>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {course.credits} credits
            </span>
            {isEnrolled && (
              <span className="inline-block ml-2 px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                Enrolled
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Instructor</span>
              <p className="text-gray-900">{course.instructor || 'TBA'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Department</span>
              <p className="text-gray-900">{course.department || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Semester</span>
              <p className="text-gray-900">{course.semester} {course.year}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Enrollment</span>
              <p className={`text-lg font-semibold ${isFull ? 'text-red-600' : 'text-gray-900'}`}>
                {enrollmentCount} / {course.capacity || '∞'} students
              </p>
              {isFull && <p className="text-sm text-red-600">This course is full</p>}
            </div>
            
            {course.schedule && (
              <div>
                <span className="text-sm text-gray-500">Schedule</span>
                <div className="mt-1">
                  {Object.entries(course.schedule).map(([day, time]) => (
                    <p key={day} className="text-gray-900">
                      {day}: {time as string}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-4">
          {isEnrolled ? (
            <button
              onClick={handleDrop}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Drop Course'}
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={loading || !canEnroll}
              className={`px-6 py-2 rounded-md ${
                canEnroll
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {loading ? 'Processing...' : isFull ? 'Course Full' : 'Enroll in Course'}
            </button>
          )}
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
        
        {course.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600">{course.description}</p>
          </div>
        )}

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prerequisites</h4>
            <ul className="list-disc list-inside space-y-1">
              {course.prerequisites.map((prereq, index) => (
                <li key={index} className="text-gray-600">{prereq}</li>
              ))}
            </ul>
          </div>
        )}

        {!course.description && !course.prerequisites?.length && (
          <p className="text-gray-500">No additional course information available.</p>
        )}
      </div>
    </div>
  )
}