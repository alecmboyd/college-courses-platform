# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: "alec-boyd-platform"
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Click "Create new project"

## 2. Get Your Project Credentials

Once your project is created:
1. Go to Settings > API
2. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Update your `.env.local` file with these values

## 3. Set Up Database Tables

Go to the SQL Editor in your Supabase dashboard and run these queries:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policy
CREATE POLICY "Users can view own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add any additional tables based on your Base44 schema here
```

## 4. Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider (should be enabled by default)
3. Configure email templates if needed

## 5. Install Dependencies and Run

```bash
cd ~/alec-boyd-platform
npm install
npm run dev
```

## 6. Test Your Application

1. Open http://localhost:3000
2. Try creating an account
3. Sign in with your credentials
4. You should see the homepage

## Next Steps

1. Analyze your Base44 database schema and recreate it in Supabase
2. Implement data migration scripts
3. Add your specific features and functionality
4. Deploy to Vercel or your preferred hosting provider