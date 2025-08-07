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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
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