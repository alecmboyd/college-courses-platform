const { Client } = require('pg')

require('dotenv').config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
})

async function createSchema() {
  console.log('Connecting to database...')
  
  try {
    await client.connect()
    console.log('Connected successfully!')

    // Drop existing tables if they exist with wrong schema
    console.log('Dropping existing tables if they exist...')
    await client.query('DROP TABLE IF EXISTS public.enrollments CASCADE;')
    await client.query('DROP TABLE IF EXISTS public.courses CASCADE;')
    
    // Create courses table
    console.log('Creating courses table...')
    const createCoursesTable = `
      CREATE TABLE public.courses (
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
    `
    await client.query(createCoursesTable)
    console.log('Courses table created successfully!')

    // Create enrollments table
    console.log('Creating enrollments table...')
    const createEnrollmentsTable = `
      CREATE TABLE public.enrollments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
        status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'waitlisted', 'dropped')),
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      );
    `
    await client.query(createEnrollmentsTable)
    console.log('Enrollments table created successfully!')

    // Enable RLS
    console.log('Enabling Row Level Security...')
    await client.query('ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;')
    await client.query('ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;')

    // Create RLS policies
    console.log('Creating RLS policies...')
    
    // Courses policies (public read)
    await client.query(`
      CREATE POLICY "Anyone can view courses" ON public.courses
        FOR SELECT USING (true);
    `)

    // Enrollments policies (user-specific)
    await client.query(`
      CREATE POLICY "Users can view own enrollments" ON public.enrollments
        FOR SELECT USING (auth.uid() = user_id);
    `)

    await client.query(`
      CREATE POLICY "Users can insert own enrollments" ON public.enrollments
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `)

    await client.query(`
      CREATE POLICY "Users can update own enrollments" ON public.enrollments
        FOR UPDATE USING (auth.uid() = user_id);
    `)

    await client.query(`
      CREATE POLICY "Users can delete own enrollments" ON public.enrollments
        FOR DELETE USING (auth.uid() = user_id);
    `)

    // Create indexes
    console.log('Creating indexes...')
    await client.query('CREATE INDEX courses_code_idx ON public.courses(code);')
    await client.query('CREATE INDEX courses_department_idx ON public.courses(department);')
    await client.query('CREATE INDEX courses_semester_idx ON public.courses(semester);')
    await client.query('CREATE INDEX enrollments_user_id_idx ON public.enrollments(user_id);')
    await client.query('CREATE INDEX enrollments_course_id_idx ON public.enrollments(course_id);')

    console.log('Schema creation completed successfully!')

  } catch (error) {
    console.error('Error creating schema:', error)
  } finally {
    await client.end()
    console.log('Database connection closed.')
  }
}

createSchema()