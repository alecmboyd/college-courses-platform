const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCourses() {
  console.log('📚 Checking available courses...\n')

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('department')

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${courses.length} courses:\n`)
    
    const departments = [...new Set(courses.map(c => c.department))]
    
    departments.forEach(dept => {
      console.log(`\n${dept}:`)
      courses
        .filter(c => c.department === dept)
        .forEach(course => {
          console.log(`  • ${course.code}: ${course.title}`)
          console.log(`    Instructor: ${course.instructor} | Credits: ${course.credits} | Capacity: ${course.capacity}`)
        })
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ All courses loaded successfully!')
    console.log('Students can now browse and enroll in these courses.')
  }
}

checkCourses()