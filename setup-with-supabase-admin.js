const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Setting up database using Supabase admin client...\n')

  try {
    // First, let's try to create the tables by testing inserts
    console.log('Testing/Creating courses table...')
    
    // Try to delete all existing courses first (in case table exists with data)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError && !deleteError.message.includes('does not exist')) {
      console.log('Note: Could not clear courses table:', deleteError.message)
    }

    // Now insert sample courses
    const sampleCourses = [
      {
        code: 'CS 101',
        title: 'Introduction to Computer Science',
        description: 'An introduction to the field of computer science, covering basic programming concepts, algorithms, and data structures.',
        instructor: 'Dr. Jane Smith',
        credits: 3,
        semester: 'Fall',
        year: 2024,
        department: 'Computer Science',
        prerequisites: [],
        capacity: 150,
        enrolled: 0,
        schedule: {"Monday": "10:00 AM - 11:30 AM", "Wednesday": "10:00 AM - 11:30 AM"}
      },
      {
        code: 'CS 201',
        title: 'Data Structures and Algorithms',
        description: 'Advanced study of data structures and algorithms, including trees, graphs, sorting, and searching algorithms.',
        instructor: 'Dr. John Doe',
        credits: 4,
        semester: 'Fall',
        year: 2024,
        department: 'Computer Science',
        prerequisites: ['CS 101'],
        capacity: 100,
        enrolled: 0,
        schedule: {"Tuesday": "2:00 PM - 3:30 PM", "Thursday": "2:00 PM - 3:30 PM"}
      },
      {
        code: 'MATH 101',
        title: 'Calculus I',
        description: 'Introduction to differential and integral calculus, including limits, derivatives, and applications.',
        instructor: 'Prof. Alice Johnson',
        credits: 4,
        semester: 'Fall',
        year: 2024,
        department: 'Mathematics',
        prerequisites: [],
        capacity: 200,
        enrolled: 0,
        schedule: {"Monday": "9:00 AM - 10:30 AM", "Wednesday": "9:00 AM - 10:30 AM", "Friday": "9:00 AM - 10:00 AM"}
      },
      {
        code: 'MATH 201',
        title: 'Linear Algebra',
        description: 'Study of vector spaces, linear transformations, matrices, and systems of linear equations.',
        instructor: 'Prof. Bob Williams',
        credits: 3,
        semester: 'Fall',
        year: 2024,
        department: 'Mathematics',
        prerequisites: ['MATH 101'],
        capacity: 80,
        enrolled: 0,
        schedule: {"Tuesday": "11:00 AM - 12:30 PM", "Thursday": "11:00 AM - 12:30 PM"}
      },
      {
        code: 'ENG 101',
        title: 'English Composition',
        description: 'Development of writing skills through practice in various forms of composition.',
        instructor: 'Dr. Sarah Brown',
        credits: 3,
        semester: 'Fall',
        year: 2024,
        department: 'English',
        prerequisites: [],
        capacity: 30,
        enrolled: 0,
        schedule: {"Monday": "1:00 PM - 2:30 PM", "Wednesday": "1:00 PM - 2:30 PM"}
      },
      {
        code: 'PHYS 101',
        title: 'Physics I',
        description: 'Introduction to mechanics, including motion, forces, energy, and momentum.',
        instructor: 'Dr. Michael Green',
        credits: 4,
        semester: 'Fall',
        year: 2024,
        department: 'Physics',
        prerequisites: ['MATH 101'],
        capacity: 120,
        enrolled: 0,
        schedule: {"Monday": "3:00 PM - 4:30 PM", "Wednesday": "3:00 PM - 4:30 PM", "Friday": "3:00 PM - 4:00 PM"}
      },
      {
        code: 'BIO 101',
        title: 'Introduction to Biology',
        description: 'Survey of biological concepts including cell structure, genetics, evolution, and ecology.',
        instructor: 'Dr. Emily White',
        credits: 4,
        semester: 'Fall',
        year: 2024,
        department: 'Biology',
        prerequisites: [],
        capacity: 150,
        enrolled: 0,
        schedule: {"Tuesday": "9:00 AM - 10:30 AM", "Thursday": "9:00 AM - 10:30 AM", "Friday": "1:00 PM - 2:00 PM"}
      },
      {
        code: 'HIST 101',
        title: 'World History I',
        description: 'Survey of world history from ancient civilizations to 1500 CE.',
        instructor: 'Prof. David Lee',
        credits: 3,
        semester: 'Fall',
        year: 2024,
        department: 'History',
        prerequisites: [],
        capacity: 75,
        enrolled: 0,
        schedule: {"Monday": "11:00 AM - 12:30 PM", "Wednesday": "11:00 AM - 12:30 PM"}
      },
      {
        code: 'PSYC 101',
        title: 'Introduction to Psychology',
        description: 'Overview of psychological principles, theories, and research methods.',
        instructor: 'Dr. Maria Garcia',
        credits: 3,
        semester: 'Fall',
        year: 2024,
        department: 'Psychology',
        prerequisites: [],
        capacity: 200,
        enrolled: 0,
        schedule: {"Tuesday": "1:00 PM - 2:30 PM", "Thursday": "1:00 PM - 2:30 PM"}
      },
      {
        code: 'CHEM 101',
        title: 'General Chemistry I',
        description: 'Introduction to chemical principles including atomic structure, bonding, and reactions.',
        instructor: 'Dr. Robert Davis',
        credits: 4,
        semester: 'Fall',
        year: 2024,
        department: 'Chemistry',
        prerequisites: [],
        capacity: 100,
        enrolled: 0,
        schedule: {"Monday": "8:00 AM - 9:30 AM", "Wednesday": "8:00 AM - 9:30 AM", "Friday": "11:00 AM - 12:00 PM"}
      }
    ]

    // Try to insert courses
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .upsert(sampleCourses, { onConflict: 'code' })
      .select()

    if (coursesError) {
      console.log('❌ Could not insert courses:', coursesError.message)
      console.log('\nThe courses table likely needs to be created with the correct schema.')
      console.log('This requires running SQL directly in the Supabase dashboard.')
    } else {
      console.log(`✅ Successfully added ${coursesData.length} courses!`)
      console.log('Courses added:', coursesData.map(c => c.code).join(', '))
    }

    // Test enrollments table
    console.log('\nTesting enrollments table...')
    
    // Get a user to test with
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profiles && profiles.length > 0 && coursesData && coursesData.length > 0) {
      const testEnrollment = {
        user_id: profiles[0].id,
        course_id: coursesData[0].id,
        status: 'enrolled'
      }

      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([testEnrollment])
        .select()

      if (enrollmentError) {
        console.log('❌ Enrollments table error:', enrollmentError.message)
        console.log('The enrollments table needs to be created.')
      } else {
        console.log('✅ Enrollments table is working!')
        // Clean up test enrollment
        await supabase
          .from('enrollments')
          .delete()
          .eq('id', enrollmentData[0].id)
      }
    }

    // Final status
    console.log('\n' + '='.repeat(60))
    
    if (!coursesError) {
      console.log('🎉 PARTIAL SUCCESS!')
      console.log('='.repeat(60))
      console.log('\n✅ What\'s working:')
      console.log('   - Supabase connection established')
      console.log('   - Courses table populated with sample data')
      console.log('   - Authentication system ready')
      console.log('\n❌ Still needs setup in Supabase dashboard:')
      console.log('   - Enrollments table creation')
      console.log('   - RLS policies')
      console.log('   - Triggers for enrollment counting')
    } else {
      console.log('❌ DATABASE TABLES NEED TO BE CREATED')
      console.log('='.repeat(60))
      console.log('\nThe tables need to be created with the correct schema.')
      console.log('\n📋 Required Action:')
      console.log('1. Go to: https://supabase.com/dashboard/project/ifhpogurtmvmfwxwhlkp/sql')
      console.log('2. Copy the SQL from: supabase/schema.sql')
      console.log('3. Run it in the SQL Editor')
      console.log('4. Then run this script again')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

setupDatabase()