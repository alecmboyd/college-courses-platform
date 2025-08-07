import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Layout from '@/components/ui/Layout'
import CourseDetailContent from '@/components/courses/CourseDetailContent'

export default async function CourseDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch course details
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!course) {
    notFound()
  }

  // Check user's enrollment status
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', params.id)
    .single()

  // Get all enrollments for this course (to show enrolled students if needed)
  const { data: allEnrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .eq('course_id', params.id)
    .eq('status', 'enrolled')

  return (
    <Layout>
      <CourseDetailContent 
        course={course}
        enrollment={enrollment}
        enrollmentCount={allEnrollments?.length || 0}
        user={user}
      />
    </Layout>
  )
}