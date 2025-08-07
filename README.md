# Alec Boyd Platform - Migrated to Supabase

This platform has been migrated from Base44 to Supabase for better control and extensibility.

## Quick Start

1. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Follow the instructions in `SETUP_GUIDE.md`

2. **Configure environment:**
   - Copy your Supabase credentials to `.env.local`
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```

4. **Access the app:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Create an account or sign in

## Project Structure

- `/app` - Next.js 14 app directory with pages and routes
- `/components` - React components
- `/lib/supabase` - Supabase client configuration
- `/types` - TypeScript type definitions
- `/utils` - Utility functions

## Features

- User authentication (signup/login)
- Protected routes
- Server-side rendering with Supabase
- Responsive UI with Tailwind CSS

## Deployment

This app can be deployed to:
- Vercel (recommended)
- Netlify
- Any Node.js hosting provider

## Migration from Base44

To migrate your data from Base44:
1. Export your data from Base44 (check their documentation)
2. Transform the data to match Supabase schema
3. Import using Supabase Dashboard or API