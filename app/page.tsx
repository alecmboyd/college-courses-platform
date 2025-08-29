import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Layout from '@/components/ui/Layout'
import DashboardContent from '@/components/DashboardContent'

export default async function Home() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is not authenticated, redirect to login
  if (!user) {
    redirect('/login')
  }
  
  // Fetch user's enrolled courses (with error handling)
  let enrollments = []
  let profile = null
  
  try {
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'enrolled')
    
    enrollments = enrollmentData || []
  } catch (error: any) {
    console.log('Enrollments table may not exist yet:', error.message)
  }

  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    profile = profileData
  } catch (error: any) {
    console.log('Profile may not exist yet, will create:', error.message)
    // Create profile if it doesn't exist
    try {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || '',
          last_name: user.user_metadata?.last_name || ''
        })
        .select()
        .single()
      profile = newProfile
    } catch (createError: any) {
      console.log('Could not create profile:', createError.message)
    }
  }
  
  return (
    <Layout>
      <DashboardContent 
        enrollments={enrollments} 
        profile={profile}
        user={user}
      />
    </Layout>
  )
}