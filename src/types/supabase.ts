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
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: number
          title: string
          description: string | null
          category_id: number | null
          order_index: number
          cover_url: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          category_id?: number | null
          order_index: number
          cover_url?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          category_id?: number | null
          order_index?: number
          cover_url?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          description: string | null
          module_id: number | null
          youtube_url: string
          order_index: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          module_id?: number | null
          youtube_url: string
          order_index: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          module_id?: number | null
          youtube_url?: string
          order_index?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'member' | 'support'
          created_at: string
        }
        Insert: {
          id: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member' | 'support'
          created_at?: string
        }
        Update: {
          id?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member' | 'support'
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string | null
          lesson_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          lesson_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
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