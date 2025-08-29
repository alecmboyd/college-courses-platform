const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCoursesTable() {
  console.log('Testing courses table structure...')

  try {
    // Try inserting a minimal course to see what columns are required
    const { data, error } = await supabase
      .from('courses')
      .insert({
        code: 'TEST 101',
        title: 'Test Course'
      })
      .select()

    if (error) {
      console.error('Error inserting test course:', error)
    } else {
      console.log('Successfully inserted test course:', data)
      console.log('Available columns:', Object.keys(data[0]))
      
      // Clean up - delete the test course
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('code', 'TEST 101')
      
      if (deleteError) {
        console.error('Error deleting test course:', deleteError)
      } else {
        console.log('Test course cleaned up')
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

testCoursesTable()