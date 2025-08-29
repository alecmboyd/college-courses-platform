const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  console.log('Creating tables using Supabase client...')

  try {
    // First, let's try creating the enrollments table by inserting a test record
    // This will help us understand if the table exists and what structure it needs
    
    console.log('Testing courses table structure...')
    
    // Try creating a sample course to test the table structure
    const sampleCourse = {
      code: 'CS 101',
      title: 'Introduction to Computer Science',
      description: 'Learn the basics of computer science.',
      instructor: 'Dr. Smith',
      credits: 3,
      semester: 'Fall 2024',
      department: 'Computer Science',
      capacity: 30,
      enrolled: 0
    }

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert([sampleCourse])
      .select()

    if (courseError) {
      console.error('Course creation error:', courseError)
      console.log('This helps us understand what columns are missing or incorrect.')
    } else {
      console.log('Successfully created course:', courseData)
      
      // Now try creating an enrollment
      console.log('Testing enrollments table...')
      
      // Get the first user from profiles to test with
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (profiles && profiles.length > 0) {
        const testEnrollment = {
          user_id: profiles[0].id,
          course_id: courseData[0].id,
          status: 'enrolled'
        }

        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .insert([testEnrollment])
          .select()

        if (enrollmentError) {
          console.error('Enrollment creation error:', enrollmentError)
          console.log('This tells us about the enrollments table structure.')
        } else {
          console.log('Successfully created enrollment:', enrollmentData)
        }
      }
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

createTables()