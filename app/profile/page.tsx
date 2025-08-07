import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Layout from '@/components/ui/Layout'
import ProfileContent from '@/components/ProfileContent'

export default async function ProfilePage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's enrollment statistics
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (
        code,
        title,
        credits,
        semester,
        year
      )
    `)
    .eq('user_id', user.id)

  return (
    <Layout>
      <ProfileContent 
        user={user}
        profile={profile}
        enrollments={enrollments || []}
      />
    </Layout>
  )
}