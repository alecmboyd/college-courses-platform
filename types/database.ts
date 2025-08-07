export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          title: string
          description: string | null
          instructor: string | null
          credits: number | null
          semester: string | null
          year: number | null
          department: string | null
          prerequisites: string[] | null
          capacity: number | null
          enrolled: number | null
          schedule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description?: string | null
          instructor?: string | null
          credits?: number | null
          semester?: string | null
          year?: number | null
          department?: string | null
          prerequisites?: string[] | null
          capacity?: number | null
          enrolled?: number | null
          schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string | null
          instructor?: string | null
          credits?: number | null
          semester?: string | null
          year?: number | null
          department?: string | null
          prerequisites?: string[] | null
          capacity?: number | null
          enrolled?: number | null
          schedule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: 'enrolled' | 'completed' | 'dropped' | 'waitlisted'
          grade: string | null
          enrolled_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: 'enrolled' | 'completed' | 'dropped' | 'waitlisted'
          grade?: string | null
          enrolled_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: 'enrolled' | 'completed' | 'dropped' | 'waitlisted'
          grade?: string | null
          enrolled_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}