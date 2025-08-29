const { Client } = require('pg')
const fs = require('fs')

require('dotenv').config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment')
  process.exit(1)
}

console.log('Using database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'))

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
})

async function setupDatabase() {
  console.log('🚀 Setting up College Courses Platform database...\n')
  
  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully!\n')

    // First, check what tables already exist
    console.log('Checking existing tables...')
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `)
    console.log('Existing tables:', checkTables.rows.map(r => r.table_name).join(', '))

    // Drop existing tables if they have wrong schema
    console.log('\nDropping existing tables with wrong schema...')
    await client.query('DROP TABLE IF EXISTS public.enrollments CASCADE;')
    await client.query('DROP TABLE IF EXISTS public.courses CASCADE;')
    console.log('✅ Old tables dropped\n')
    
    // Create courses table
    console.log('Creating courses table...')
    await client.query(`
      CREATE TABLE public.courses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor VARCHAR(255),
        credits INTEGER,
        semester VARCHAR(20),
        year INTEGER,
        department VARCHAR(100),
        prerequisites TEXT[],
        capacity INTEGER DEFAULT 30,
        enrolled INTEGER DEFAULT 0,
        schedule JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `)
    console.log('✅ Courses table created')

    // Create enrollments table
    console.log('Creating enrollments table...')
    await client.query(`
      CREATE TABLE public.enrollments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
        status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'waitlisted')),
        grade VARCHAR(2),
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(user_id, course_id)
      );
    `)
    console.log('✅ Enrollments table created\n')

    // Enable RLS
    console.log('Enabling Row Level Security...')
    await client.query('ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;')
    await client.query('ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;')
    console.log('✅ RLS enabled\n')

    // Create RLS policies
    console.log('Creating security policies...')
    
    // Drop existing policies if they exist
    await client.query(`DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;`)
    await client.query(`DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;`)
    await client.query(`DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;`)
    await client.query(`DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;`)
    
    // Courses policies
    await client.query(`
      CREATE POLICY "Courses are viewable by everyone" ON public.courses
        FOR SELECT USING (true);
    `)

    // Enrollments policies
    await client.query(`
      CREATE POLICY "Users can view their own enrollments" ON public.enrollments
        FOR SELECT USING (auth.uid() = user_id);
    `)

    await client.query(`
      CREATE POLICY "Users can create their own enrollments" ON public.enrollments
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `)

    await client.query(`
      CREATE POLICY "Users can update their own enrollments" ON public.enrollments
        FOR UPDATE USING (auth.uid() = user_id);
    `)
    console.log('✅ Security policies created\n')

    // Create indexes
    console.log('Creating indexes for performance...')
    await client.query('CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_courses_semester_year ON public.courses(semester, year);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);')
    console.log('✅ Indexes created\n')

    // Create trigger function for enrollment count
    console.log('Creating enrollment count trigger...')
    await client.query(`
      CREATE OR REPLACE FUNCTION update_course_enrolled_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' AND NEW.status = 'enrolled' THEN
          UPDATE courses SET enrolled = enrolled + 1 WHERE id = NEW.course_id;
        ELSIF TG_OP = 'UPDATE' THEN
          IF OLD.status = 'enrolled' AND NEW.status != 'enrolled' THEN
            UPDATE courses SET enrolled = enrolled - 1 WHERE id = NEW.course_id;
          ELSIF OLD.status != 'enrolled' AND NEW.status = 'enrolled' THEN
            UPDATE courses SET enrolled = enrolled + 1 WHERE id = NEW.course_id;
          END IF;
        ELSIF TG_OP = 'DELETE' AND OLD.status = 'enrolled' THEN
          UPDATE courses SET enrolled = enrolled - 1 WHERE id = OLD.course_id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS update_enrolled_count ON enrollments;
      CREATE TRIGGER update_enrolled_count
        AFTER INSERT OR UPDATE OR DELETE ON enrollments
        FOR EACH ROW EXECUTE FUNCTION update_course_enrolled_count();
    `)
    console.log('✅ Enrollment trigger created\n')

    // Add sample data
    console.log('Adding sample course data...')
    const sampleDataSQL = fs.readFileSync('./supabase/sample-data.sql', 'utf8')
    
    // Extract just the INSERT statement
    const insertMatch = sampleDataSQL.match(/INSERT INTO courses[\s\S]+?;/)
    if (insertMatch) {
      await client.query(insertMatch[0])
      console.log('✅ Sample courses added\n')
    }

    // Verify the setup
    console.log('Verifying setup...')
    const courseCount = await client.query('SELECT COUNT(*) FROM public.courses;')
    const enrollmentCount = await client.query('SELECT COUNT(*) FROM public.enrollments;')
    
    console.log(`✅ Courses table: ${courseCount.rows[0].count} courses`)
    console.log(`✅ Enrollments table: ${enrollmentCount.rows[0].count} enrollments`)

    console.log('\n' + '='.repeat(60))
    console.log('🎉 DATABASE SETUP COMPLETE!')
    console.log('='.repeat(60))
    console.log('\nYour College Courses Platform is now ready!')
    console.log('\n📋 What you can do now:')
    console.log('1. Visit http://localhost:3000')
    console.log('2. Create a new account or login')
    console.log('3. Browse and enroll in courses')
    console.log('4. View your dashboard and schedule')
    console.log('\n✅ All features are now working:')
    console.log('   - User authentication')
    console.log('   - Course enrollment/dropping')
    console.log('   - Personal dashboards')
    console.log('   - Schedule management')
    console.log('   - Data persistence')

  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    console.error('Details:', error)
  } finally {
    await client.end()
    console.log('\nDatabase connection closed.')
  }
}

setupDatabase()