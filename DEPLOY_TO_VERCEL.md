# Deploy to Vercel - Quick Instructions

## Option 1: Import from GitHub (Recommended)

1. **Go to Vercel Dashboard**
   https://vercel.com/new

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Select: `alecmboyd/college-courses-platform`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Settings: (leave defaults)

4. **Add Environment Variables**
   Click "Add" for each of these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ifhpogurtmvmfwxwhlkp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaHBvZ3VydG12bWZ3eHdobGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTY5NTUsImV4cCI6MjA2ODg3Mjk1NX0.V929gzG08SMVtNpIgP7ebRhTYomddd3UXWVYd7CoKTg
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaHBvZ3VydG12bWZ3eHdobGtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI5Njk1NSwiZXhwIjoyMDY4ODcyOTU1fQ.8GBHERoedkG0Z-7fr5DL50_HZdnTWHGRnWOYA7gsyU8
   ```

5. **Click "Deploy"**
   - Deployment will start automatically
   - Takes 2-3 minutes

## Option 2: Using Vercel CLI

If you want to use CLI, first login:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (in project directory)
vercel --prod
```

When prompted for environment variables, use the values above.

## After Deployment

Your app will be available at:
- `https://college-courses-platform.vercel.app`
- Or your custom domain if configured

## What's Fixed in This Deployment:

✅ **User Login/Logout** - Authentication now works
✅ **Data Persistence** - All user data saves to Supabase
✅ **Course Enrollment** - Users can enroll/drop courses
✅ **User Isolation** - Each user sees only their data
✅ **Profile Management** - User profiles save correctly

## Verify Everything Works:

1. Visit your deployed URL
2. Create a new account
3. Login
4. Enroll in courses
5. Check that data persists after logout/login

## Support

- GitHub Repo: https://github.com/alecmboyd/college-courses-platform
- Supabase Dashboard: https://supabase.com/dashboard/project/ifhpogurtmvmfwxwhlkp
- Vercel Dashboard: https://vercel.com/dashboard