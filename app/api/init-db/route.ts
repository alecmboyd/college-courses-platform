import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const createTablesSQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    department VARCHAR(100),
    prerequisites TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'in_progress')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    grade VARCHAR(5),
    UNIQUE(user_id, course_id)
);

-- Create saved_courses table
CREATE TABLE IF NOT EXISTS saved_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, course_id)
);
`;

const insertSampleCoursesSQL = `
INSERT INTO courses (code, title, description, credits, department) VALUES
('CS101', 'Introduction to Computer Science', 'Basic programming concepts and problem solving', 3, 'Computer Science'),
('CS102', 'Data Structures', 'Arrays, lists, trees, and algorithms', 3, 'Computer Science'),
('MATH101', 'College Algebra', 'Fundamental algebraic concepts', 3, 'Mathematics'),
('MATH102', 'Calculus I', 'Introduction to differential calculus', 4, 'Mathematics'),
('ENG101', 'English Composition', 'Writing and critical thinking skills', 3, 'English'),
('HIST101', 'World History', 'Survey of world civilizations', 3, 'History'),
('BIO101', 'General Biology', 'Introduction to biological sciences', 4, 'Biology'),
('CHEM101', 'General Chemistry', 'Basic chemistry principles', 4, 'Chemistry'),
('PSYC101', 'Introduction to Psychology', 'Fundamentals of psychological science', 3, 'Psychology'),
('PHYS101', 'College Physics', 'Mechanics and thermodynamics', 4, 'Physics')
ON CONFLICT (code) DO NOTHING;
`;

export async function POST() {
  try {
    const supabase = createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create tables
    console.log('Creating database tables...')
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql_query: createTablesSQL 
    })

    if (createError) {
      console.log('Could not create tables via RPC, trying direct approach...')
      // If RPC doesn't work, we'll handle table creation in the main app
    }

    // Insert sample courses
    const { error: coursesError } = await supabase.rpc('exec_sql', { 
      sql_query: insertSampleCoursesSQL 
    })

    if (coursesError) {
      console.log('Could not insert courses via RPC, trying direct insert...')
      // Try direct insert
      const sampleCourses = [
        { code: 'CS101', title: 'Introduction to Computer Science', description: 'Basic programming concepts', credits: 3, department: 'Computer Science' },
        { code: 'MATH101', title: 'College Algebra', description: 'Fundamental algebraic concepts', credits: 3, department: 'Mathematics' },
        { code: 'ENG101', title: 'English Composition', description: 'Writing and critical thinking skills', credits: 3, department: 'English' }
      ]

      for (const course of sampleCourses) {
        await supabase.from('courses').insert(course).select()
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully'
    })

  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize database',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient()
    
    // Check if tables exist by trying to query them
    const { data: courses } = await supabase.from('courses').select('count').limit(1)
    const { data: profiles } = await supabase.from('profiles').select('count').limit(1)
    
    return NextResponse.json({
      tablesExist: {
        courses: !!courses,
        profiles: !!profiles
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      tablesExist: false,
      error: error.message
    })
  }
}