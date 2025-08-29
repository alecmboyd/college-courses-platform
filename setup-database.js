const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Service Role Key:', supabaseKey ? 'Found' : 'Not found')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('Setting up database schema...')

  try {
    // Create profiles table
    console.log('Creating profiles table...')
    const profilesResult = await supabase.rpc('create_profiles_table')
    console.log('Profiles table result:', profilesResult)

    // Create courses table
    console.log('Creating courses table...')
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(1)
    
    if (coursesError && coursesError.code === 'PGRST116') {
      console.log('Courses table does not exist, need to create it via SQL')
    } else {
      console.log('Courses table exists')
    }

    // Create enrollments table
    console.log('Creating enrollments table...')
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*')
      .limit(1)

    if (enrollmentsError && enrollmentsError.code === 'PGRST116') {
      console.log('Enrollments table does not exist, need to create it via SQL')
    } else {
      console.log('Enrollments table exists')
    }

    console.log('Database setup completed')
  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

// Run the setup
setupDatabase()