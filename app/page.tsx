import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomePage from '@/components/HomePage'

export default async function Home() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is not authenticated, redirect to login
  if (!user) {
    redirect('/login')
  }
  
  return <HomePage />
}