-- Complete database setup for college courses platform
-- This script creates all necessary tables and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    department VARCHAR(100),
    prerequisites TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollments table (user course enrollments)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'in_progress')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    grade VARCHAR(5),
    UNIQUE(user_id, course_id)
);

-- Create saved_courses table (user saved courses for later)
CREATE TABLE IF NOT EXISTS saved_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own enrollments" ON enrollments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_courses
CREATE POLICY "Users can view own saved courses" ON saved_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved courses" ON saved_courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved courses" ON saved_courses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policy for courses (public read)
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can view courses" ON courses FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample courses
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_saved_courses_user_id ON saved_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;