const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleCourses = [
  {
    code: 'CS 101',
    title: 'Introduction to Computer Science',
    description: 'An introduction to computer science concepts including programming fundamentals, algorithms, and data structures.',
    credits: 3,
    department: 'Computer Science',
    semester: 'Fall 2024',
    instructor: 'Dr. Sarah Johnson',
    schedule: 'MW 10:00-11:15 AM',
    capacity: 30,
    enrolled: 15
  },
  {
    code: 'MATH 201',
    title: 'Calculus I',
    description: 'Limits, derivatives, and applications of differential calculus.',
    credits: 4,
    department: 'Mathematics',
    semester: 'Fall 2024',
    instructor: 'Prof. Michael Chen',
    schedule: 'MWF 9:00-9:50 AM',
    capacity: 25,
    enrolled: 20
  },
  {
    code: 'ENG 102',
    title: 'Composition and Literature',
    description: 'Development of writing skills through the study of literary works.',
    credits: 3,
    department: 'English',
    semester: 'Fall 2024',
    instructor: 'Dr. Emily Rodriguez',
    schedule: 'TTh 2:00-3:15 PM',
    capacity: 20,
    enrolled: 12
  },
  {
    code: 'BIO 110',
    title: 'General Biology',
    description: 'Introduction to biological principles including cell structure, genetics, and ecology.',
    credits: 4,
    department: 'Biology',
    semester: 'Fall 2024',
    instructor: 'Dr. James Wilson',
    schedule: 'MWF 11:00-11:50 AM, Lab: T 2:00-4:00 PM',
    capacity: 24,
    enrolled: 18
  },
  {
    code: 'HIST 150',
    title: 'World History',
    description: 'Survey of world civilizations from ancient times to the present.',
    credits: 3,
    department: 'History',
    semester: 'Fall 2024',
    instructor: 'Prof. Maria Garcia',
    schedule: 'TTh 11:00-12:15 PM',
    capacity: 35,
    enrolled: 25
  },
  {
    code: 'CS 201',
    title: 'Data Structures and Algorithms',
    description: 'Advanced programming concepts including data structures, algorithms, and complexity analysis.',
    credits: 3,
    department: 'Computer Science',
    semester: 'Spring 2025',
    instructor: 'Dr. Robert Kim',
    schedule: 'MW 1:00-2:15 PM',
    capacity: 28,
    enrolled: 8
  }
]

async function seedCourses() {
  console.log('Seeding courses database...')

  try {
    // First, check if courses already exist
    const { data: existingCourses } = await supabase
      .from('courses')
      .select('code')

    if (existingCourses && existingCourses.length > 0) {
      console.log(`Found ${existingCourses.length} existing courses. Skipping seed.`)
      return
    }

    // Insert sample courses
    const { data, error } = await supabase
      .from('courses')
      .insert(sampleCourses)
      .select()

    if (error) {
      console.error('Error seeding courses:', error)
    } else {
      console.log(`Successfully seeded ${data.length} courses!`)
      console.log('Courses created:', data.map(c => c.code).join(', '))
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

seedCourses()