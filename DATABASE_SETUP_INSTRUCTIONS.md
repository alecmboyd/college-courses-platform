# Database Setup Instructions

## Current Status ✅
- ✅ Supabase project connected (ifhpogurtmvmfwxwhlkp)
- ✅ Environment variables configured in .env.local
- ✅ Next.js application configured with Supabase
- ❌ Database tables need to be created with proper schema

## Required Action: Create Database Tables

**The application code is ready, but the database tables need to be created with the correct schema.**

### Step 1: Access Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ifhpogurtmvmfwxwhlkp)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Create the Database Schema
Copy and paste the contents of `supabase/schema.sql` into the SQL Editor and run it:

```sql
-- Course Management Schema for UD Courses

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'waitlisted')),
  grade VARCHAR(2),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Courses policies (everyone can view, only admins can modify)
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update enrolled count
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

-- Trigger for enrollment count
CREATE TRIGGER update_enrolled_count
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_course_enrolled_count();

-- Indexes for performance
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_semester_year ON courses(semester, year);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
```

### Step 3: Add Sample Data (Optional)
If you want test data to explore the platform, run the contents of `supabase/sample-data.sql`:

```sql
-- Sample course data for testing
INSERT INTO courses (code, title, description, instructor, credits, semester, year, department, prerequisites, capacity, schedule) VALUES
('CS 101', 'Introduction to Computer Science', 'An introduction to the field of computer science, covering basic programming concepts, algorithms, and data structures.', 'Dr. Jane Smith', 3, 'Fall', 2024, 'Computer Science', '{}', 150, '{"Monday": "10:00 AM - 11:30 AM", "Wednesday": "10:00 AM - 11:30 AM"}'),
('CS 201', 'Data Structures and Algorithms', 'Advanced study of data structures and algorithms, including trees, graphs, sorting, and searching algorithms.', 'Dr. John Doe', 4, 'Fall', 2024, 'Computer Science', '{"CS 101"}', 100, '{"Tuesday": "2:00 PM - 3:30 PM", "Thursday": "2:00 PM - 3:30 PM"}'),
('MATH 101', 'Calculus I', 'Introduction to differential and integral calculus, including limits, derivatives, and applications.', 'Prof. Alice Johnson', 4, 'Fall', 2024, 'Mathematics', '{}', 200, '{"Monday": "9:00 AM - 10:30 AM", "Wednesday": "9:00 AM - 10:30 AM", "Friday": "9:00 AM - 10:00 AM"}'),
('MATH 201', 'Linear Algebra', 'Study of vector spaces, linear transformations, matrices, and systems of linear equations.', 'Prof. Bob Williams', 3, 'Fall', 2024, 'Mathematics', '{"MATH 101"}', 80, '{"Tuesday": "11:00 AM - 12:30 PM", "Thursday": "11:00 AM - 12:30 PM"}'),
('ENG 101', 'English Composition', 'Development of writing skills through practice in various forms of composition.', 'Dr. Sarah Brown', 3, 'Fall', 2024, 'English', '{}', 30, '{"Monday": "1:00 PM - 2:30 PM", "Wednesday": "1:00 PM - 2:30 PM"}'),
('PHYS 101', 'Physics I', 'Introduction to mechanics, including motion, forces, energy, and momentum.', 'Dr. Michael Green', 4, 'Fall', 2024, 'Physics', '{"MATH 101"}', 120, '{"Monday": "3:00 PM - 4:30 PM", "Wednesday": "3:00 PM - 4:30 PM", "Friday": "3:00 PM - 4:00 PM"}'),
('BIO 101', 'Introduction to Biology', 'Survey of biological concepts including cell structure, genetics, evolution, and ecology.', 'Dr. Emily White', 4, 'Fall', 2024, 'Biology', '{}', 150, '{"Tuesday": "9:00 AM - 10:30 AM", "Thursday": "9:00 AM - 10:30 AM", "Friday": "1:00 PM - 2:00 PM"}'),
('HIST 101', 'World History I', 'Survey of world history from ancient civilizations to 1500 CE.', 'Prof. David Lee', 3, 'Fall', 2024, 'History', '{}', 75, '{"Monday": "11:00 AM - 12:30 PM", "Wednesday": "11:00 AM - 12:30 PM"}'),
('PSYC 101', 'Introduction to Psychology', 'Overview of psychological principles, theories, and research methods.', 'Dr. Maria Garcia', 3, 'Fall', 2024, 'Psychology', '{}', 200, '{"Tuesday": "1:00 PM - 2:30 PM", "Thursday": "1:00 PM - 2:30 PM"}'),
('CHEM 101', 'General Chemistry I', 'Introduction to chemical principles including atomic structure, bonding, and reactions.', 'Dr. Robert Davis', 4, 'Fall', 2024, 'Chemistry', '{}', 100, '{"Monday": "8:00 AM - 9:30 AM", "Wednesday": "8:00 AM - 9:30 AM", "Friday": "11:00 AM - 12:00 PM"}');
```

## After Database Setup

### Test the Application
1. The development server is already running at http://localhost:3000
2. Go to `/signup` to create a new account
3. After email verification, log in
4. You should see the dashboard with course enrollment functionality

### Features Available After Setup
- ✅ User authentication (signup/login)
- ✅ Course catalog browsing and search
- ✅ Course enrollment/dropping
- ✅ Personal dashboard with enrolled courses
- ✅ Schedule view
- ✅ User profile management
- ✅ Real-time enrollment tracking

## Current Application Status
- **Environment**: ✅ Configured
- **Authentication**: ✅ Working  
- **Database Schema**: ❌ Needs to be created (instructions above)
- **Sample Data**: ⚠️  Optional (instructions above)
- **Frontend**: ✅ Fully built and responsive
- **Deployment Ready**: ✅ After database setup

## Next Steps
1. **REQUIRED**: Create database tables using the SQL above
2. **Optional**: Add sample data for testing
3. **Test**: Create a user account and test enrollment
4. **Deploy**: Connect to Vercel for production deployment

## Deployment to Vercel
Once database is set up:
```bash
# Login to Vercel (if needed)
vercel login

# Deploy the project
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY  
# SUPABASE_SERVICE_ROLE_KEY
```

## Support
- Supabase Dashboard: https://supabase.com/dashboard/project/ifhpogurtmvmfwxwhlkp
- GitHub Repository: https://github.com/alecmboyd/college-courses-platform
- Local Development: http://localhost:3000 (currently running)