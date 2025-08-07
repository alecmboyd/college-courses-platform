import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Layout from '@/components/ui/Layout'
import ScheduleContent from '@/components/ScheduleContent'

export default async function SchedulePage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's enrolled courses with schedule info
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'enrolled')

  return (
    <Layout>
      <ScheduleContent enrollments={enrollments || []} />
    </Layout>
  )
}