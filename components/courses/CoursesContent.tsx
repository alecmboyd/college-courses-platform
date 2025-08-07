'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CourseCard from './CourseCard'

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

interface CoursesContentProps {
  courses: Course[]
  departments: string[]
  enrollmentMap: Map<string, string>
  searchParams: {
    search?: string
    department?: string
    semester?: string
  }
}

export default function CoursesContent({ 
  courses, 
  departments, 
  enrollmentMap,
  searchParams 
}: CoursesContentProps) {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.search || '')

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParamsHook.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/courses?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams('search', searchInput)
  }

  const clearFilters = () => {
    router.push('/courses')
    setSearchInput('')
  }

  const hasActiveFilters = searchParams.search || searchParams.department || searchParams.semester

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
        <p className="text-gray-600 mt-2">Browse and enroll in available courses</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={searchParams.department || ''}
              onChange={(e) => updateSearchParams('department', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              value={searchParams.semester || ''}
              onChange={(e) => updateSearchParams('semester', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Semesters</option>
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {courses.length} courses
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No courses found matching your criteria.</p>
          </div>
        ) : (
          courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              enrollmentStatus={enrollmentMap.get(course.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}