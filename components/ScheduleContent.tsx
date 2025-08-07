'use client'

import { useState } from 'react'

interface Course {
  id: string
  code: string
  title: string
  instructor: string
  schedule: any
}

interface Enrollment {
  id: string
  courses: Course
}

interface ScheduleContentProps {
  enrollments: Enrollment[]
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
]

export default function ScheduleContent({ enrollments }: ScheduleContentProps) {
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week')

  // Parse schedule data into a structured format
  const scheduleGrid: { [key: string]: { [key: string]: Course[] } } = {}
  
  DAYS_OF_WEEK.forEach(day => {
    scheduleGrid[day] = {}
    TIME_SLOTS.forEach(time => {
      scheduleGrid[day][time] = []
    })
  })

  // Populate the schedule grid
  enrollments.forEach(enrollment => {
    const course = enrollment.courses
    if (course.schedule) {
      Object.entries(course.schedule).forEach(([day, timeStr]) => {
        const time = timeStr as string
        // Find the closest time slot
        const timeSlot = TIME_SLOTS.find(slot => 
          time.toLowerCase().includes(slot.toLowerCase().replace(' ', ''))
        ) || TIME_SLOTS[0]
        
        if (scheduleGrid[day] && scheduleGrid[day][timeSlot]) {
          scheduleGrid[day][timeSlot].push(course)
        }
      })
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600 mt-2">Your weekly class schedule</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        // Week View
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-6 border-b">
            <div className="p-4 font-semibold text-gray-700 border-r">Time</div>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="p-4 font-semibold text-gray-700 text-center border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          {TIME_SLOTS.map(time => (
            <div key={time} className="grid grid-cols-6 border-b last:border-b-0">
              <div className="p-4 text-sm text-gray-600 border-r">
                {time}
              </div>
              {DAYS_OF_WEEK.map(day => {
                const courses = scheduleGrid[day][time]
                return (
                  <div key={`${day}-${time}`} className="p-2 border-r last:border-r-0 min-h-[80px]">
                    {courses.map(course => (
                      <div
                        key={course.id}
                        className="bg-blue-100 text-blue-800 p-2 rounded text-xs mb-1"
                      >
                        <div className="font-semibold">{course.code}</div>
                        <div className="truncate">{course.title}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">You have no scheduled courses.</p>
            </div>
          ) : (
            enrollments.map(enrollment => {
              const course = enrollment.courses
              return (
                <div key={enrollment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.code} - {course.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Instructor: {course.instructor}
                      </p>
                      {course.schedule && (
                        <div className="mt-3 space-y-1">
                          <p className="text-sm font-medium text-gray-700">Schedule:</p>
                          {Object.entries(course.schedule).map(([day, time]) => (
                            <p key={day} className="text-sm text-gray-600 ml-4">
                              {day}: {time as string}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}