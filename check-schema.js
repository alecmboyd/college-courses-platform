const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking database schema...')

  try {
    // Try to select with a limit to see what columns exist
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error querying courses:', error)
    } else {
      console.log('Courses table structure:', courses)
      if (courses.length > 0) {
        console.log('Available columns:', Object.keys(courses[0]))
      } else {
        console.log('Courses table is empty')
      }
    }

    // Check enrollments table
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .limit(1)

    if (enrollError) {
      console.error('Error querying enrollments:', enrollError)
    } else {
      console.log('Enrollments table structure:', enrollments)
      if (enrollments.length > 0) {
        console.log('Available enrollment columns:', Object.keys(enrollments[0]))
      } else {
        console.log('Enrollments table is empty')
      }
    }

    // Check profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profileError) {
      console.error('Error querying profiles:', profileError)
    } else {
      console.log('Profiles table structure:', profiles)
      if (profiles.length > 0) {
        console.log('Available profile columns:', Object.keys(profiles[0]))
      } else {
        console.log('Profiles table is empty')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkSchema()