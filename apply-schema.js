const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function applySchema() {
  console.log('Applying database schema...')

  try {
    // Read the schema SQL file
    const schemaSQL = fs.readFileSync('./supabase/schema.sql', 'utf8')
    console.log('Schema SQL loaded successfully.')

    // Since we can't execute arbitrary SQL through Supabase client easily,
    // let's manually create the tables using the client API
    
    // First, try to drop existing tables if they have wrong structure
    console.log('Checking existing tables...')
    
    // Test if courses table has correct structure by trying a select with expected columns
    const { data: testCourses, error: testError } = await supabase
      .from('courses')
      .select('id, code, title, instructor, credits, semester, department, capacity, enrolled')
      .limit(1)

    if (testError && testError.message.includes('could not find')) {
      console.log('Courses table has incorrect structure, it needs to be recreated with proper schema.')
      console.log('Error details:', testError.message)
      
      // Since we can't alter table structure easily, let's at least create the enrollments table
      console.log('Creating a test enrollment to see if enrollments table exists...')
      
      // Get a user ID from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (profiles && profiles.length > 0) {
        const testEnrollment = {
          user_id: profiles[0].id,
          course_id: 'test-course-id',
          status: 'enrolled'
        }

        const { data: enrollmentTest, error: enrollmentError } = await supabase
          .from('enrollments')
          .insert([testEnrollment])
          .select()

        if (enrollmentError) {
          console.log('Enrollments table does not exist or has wrong structure:', enrollmentError.message)
        } else {
          console.log('Enrollments table exists and works:', enrollmentTest)
          // Clean up test data
          await supabase
            .from('enrollments')
            .delete()
            .eq('course_id', 'test-course-id')
        }
      }
    } else if (testError) {
      console.error('Unexpected error testing courses table:', testError)
    } else {
      console.log('Courses table has correct structure!')
      if (testCourses) {
        console.log('Sample courses data:', testCourses)
      }
    }

    console.log('\n=== IMPORTANT ===')
    console.log('The database schema needs to be applied manually using Supabase SQL Editor.')
    console.log('Steps:')
    console.log('1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0])
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy the contents of supabase/schema.sql')
    console.log('4. Run the SQL to create the proper table structure')
    console.log('5. Then run the sample-data.sql if you want test data')

  } catch (error) {
    console.error('Error:', error)
  }
}

applySchema()