const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySetup() {
  console.log('🔍 Verifying College Courses Platform Setup...\n')

  let allGood = true

  try {
    // Test 1: Environment Variables
    console.log('1. Testing Environment Variables...')
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing environment variables')
      allGood = false
    } else {
      console.log('✅ Environment variables loaded')
    }

    // Test 2: Supabase Connection
    console.log('\n2. Testing Supabase Connection...')
    const { data: testAuth, error: authError } = await supabase.auth.getSession()
    if (authError && authError.status !== 401) {
      console.log('❌ Supabase connection failed:', authError.message)
      allGood = false
    } else {
      console.log('✅ Supabase connection successful')
    }

    // Test 3: Courses Table
    console.log('\n3. Testing Courses Table...')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, code, title, instructor, credits, department')
      .limit(1)

    if (coursesError) {
      console.log('❌ Courses table error:', coursesError.message)
      console.log('   🔧 Please run the database schema as described in DATABASE_SETUP_INSTRUCTIONS.md')
      allGood = false
    } else {
      console.log('✅ Courses table working')
      if (courses && courses.length > 0) {
        console.log(`   📚 Found ${courses.length} sample course(s)`)
      } else {
        console.log('   ⚠️  No courses found - consider adding sample data')
      }
    }

    // Test 4: Enrollments Table
    console.log('\n4. Testing Enrollments Table...')
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('id, user_id, course_id, status')
      .limit(1)

    if (enrollmentsError) {
      console.log('❌ Enrollments table error:', enrollmentsError.message)
      console.log('   🔧 Please run the database schema as described in DATABASE_SETUP_INSTRUCTIONS.md')
      allGood = false
    } else {
      console.log('✅ Enrollments table working')
    }

    // Test 5: Profiles Table
    console.log('\n5. Testing Profiles Table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)

    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message)
      allGood = false
    } else {
      console.log('✅ Profiles table working')
      if (profiles && profiles.length > 0) {
        console.log(`   👤 Found ${profiles.length} user profile(s)`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    if (allGood) {
      console.log('🎉 SETUP COMPLETE! College Courses Platform is ready to use!')
      console.log('\nNext steps:')
      console.log('1. Visit http://localhost:3000')
      console.log('2. Create a user account')
      console.log('3. Browse and enroll in courses')
      console.log('4. Deploy to Vercel when ready')
    } else {
      console.log('❌ Setup incomplete - please resolve the issues above')
      console.log('\nNext steps:')
      console.log('1. Check DATABASE_SETUP_INSTRUCTIONS.md')
      console.log('2. Run the SQL schema in Supabase dashboard')
      console.log('3. Run this verification script again')
    }
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Verification failed:', error)
  }
}

verifySetup()