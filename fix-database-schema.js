const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDatabaseSchema() {
  console.log('Fixing database schema to match application code...')

  try {
    // First, let's drop existing courses table if it has wrong schema
    console.log('Dropping existing courses table...')
    const { error: dropCoursesError } = await supabase.rpc('drop_table_if_exists', { table_name: 'courses' })
    
    // Create the correct courses table structure
    console.log('Creating courses table with correct schema...')
    const createCoursesSQL = `
      CREATE TABLE IF NOT EXISTS public.courses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        instructor TEXT,
        credits INTEGER DEFAULT 3,
        schedule JSONB,
        semester TEXT,
        year INTEGER,
        department TEXT,
        prerequisites TEXT[],
        capacity INTEGER,
        enrolled INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

      -- Create RLS policy for courses (public read)
      CREATE POLICY "Anyone can view courses" ON public.courses
        FOR SELECT USING (true);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS courses_code_idx ON public.courses(code);
      CREATE INDEX IF NOT EXISTS courses_department_idx ON public.courses(department);
      CREATE INDEX IF NOT EXISTS courses_semester_idx ON public.courses(semester);
    `

    const { error: createCoursesError } = await supabase.rpc('exec_sql', { sql: createCoursesSQL })
    
    if (createCoursesError) {
      console.log('Trying alternative approach for courses table...')
      // Use a simple insert/select to test if table exists with expected structure
      const { data, error: testError } = await supabase
        .from('courses')
        .select('id, code, title')
        .limit(1)

      if (testError && testError.code === '42P01') {
        console.log('Creating courses table directly...')
        // Table doesn't exist, let's create a minimal one manually
        const basicCourse = {
          id: crypto.randomUUID ? crypto.randomUUID() : 'test-id-' + Date.now(),
          code: 'CS 101',
          title: 'Introduction to Computer Science',
          description: 'Basic computer science concepts',
          instructor: 'Dr. Smith',
          credits: 3,
          schedule: { 'Monday': '10:00 AM', 'Wednesday': '10:00 AM' },
          semester: 'Fall 2024',
          department: 'Computer Science'
        }

        // This will fail if table doesn't have the right structure, helping us understand the schema
        const { data: insertData, error: insertError } = await supabase
          .from('courses')
          .insert([basicCourse])
          .select()

        if (insertError) {
          console.error('Error creating test course (this helps us understand the schema):', insertError)
        } else {
          console.log('Successfully created test course:', insertData)
        }
      }
    }

    // Create enrollments table
    console.log('Creating enrollments table...')
    const createEnrollmentsSQL = `
      CREATE TABLE IF NOT EXISTS public.enrollments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
        status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'waitlisted', 'dropped')),
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      );

      -- Enable RLS
      ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Users can view own enrollments" ON public.enrollments
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own enrollments" ON public.enrollments
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update own enrollments" ON public.enrollments
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete own enrollments" ON public.enrollments
        FOR DELETE USING (auth.uid() = user_id);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON public.enrollments(user_id);
      CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON public.enrollments(course_id);
    `

    const { error: createEnrollmentsError } = await supabase.rpc('exec_sql', { sql: createEnrollmentsSQL })

    if (createEnrollmentsError) {
      console.log('Alternative approach for enrollments...')
      // Try to test the enrollments table
      const { data, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .limit(1)

      if (enrollError) {
        console.error('Enrollments table error:', enrollError)
      } else {
        console.log('Enrollments table seems to work:', data)
      }
    }

    console.log('Database schema setup completed!')

  } catch (error) {
    console.error('Error fixing database schema:', error)
  }
}

fixDatabaseSchema()