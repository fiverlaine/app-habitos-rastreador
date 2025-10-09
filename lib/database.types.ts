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
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          type: 'boolean' | 'numeric'
          unit: string | null
          target_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          color: string
          type: 'boolean' | 'numeric'
          unit?: string | null
          target_value?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          type?: 'boolean' | 'numeric'
          unit?: string | null
          target_value?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      completions: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          date: string
          value?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string
          date?: string
          value?: number | null
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

