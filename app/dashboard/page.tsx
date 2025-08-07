import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Layout from '@/components/ui/Layout'
import DashboardContent from '@/components/DashboardContent'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's enrolled courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'enrolled')

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <Layout>
      <DashboardContent 
        enrollments={enrollments || []} 
        profile={profile}
        user={user}
      />
    </Layout>
  )
}