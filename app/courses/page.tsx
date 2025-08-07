import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Layout from '@/components/ui/Layout'
import CoursesContent from '@/components/courses/CoursesContent'

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { search?: string; department?: string; semester?: string }
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Build query
  let query = supabase.from('courses').select('*')

  // Apply filters
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,code.ilike.%${searchParams.search}%`)
  }
  
  if (searchParams.department) {
    query = query.eq('department', searchParams.department)
  }
  
  if (searchParams.semester) {
    query = query.eq('semester', searchParams.semester)
  }

  const { data: courses } = await query.order('code')

  // Get unique departments for filter
  const { data: departments } = await supabase
    .from('courses')
    .select('department')
    .not('department', 'is', null)
    .order('department')

  const uniqueDepartments = Array.from(new Set(departments?.map(d => d.department) || []))

  // Get user's enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id, status')
    .eq('user_id', user.id)

  const enrollmentMap = new Map(
    enrollments?.map(e => [e.course_id, e.status]) || []
  )

  return (
    <Layout>
      <CoursesContent 
        courses={courses || []}
        departments={uniqueDepartments}
        enrollmentMap={enrollmentMap}
        searchParams={searchParams}
      />
    </Layout>
  )
}