# College Courses Platform

A modern course management system built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 User Authentication (Signup/Login)
- 📚 Browse Course Catalog
- ✅ Course Enrollment System
- 📅 Personal Schedule Management
- 👤 User Profile Management
- 💾 Persistent Data Storage
- 🔒 Secure User Data Isolation

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel
- **Database**: PostgreSQL (hosted on Supabase)

## Available Courses

The platform includes 10 sample courses across 8 departments:
- Computer Science
- Mathematics
- Biology
- Chemistry
- English
- History
- Physics
- Psychology

## Live Demo

Visit: https://college-courses.vercel.app

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

Required environment variables (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Deployment

This project is configured for automatic deployment on Vercel with GitHub integration.

---

Last updated: August 2024