export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          platform: string
          category: string
          description: string | null
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          platform: string
          category: string
          description?: string | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          platform?: string
          category?: string
          description?: string | null
          cover_image_url?: string | null
          updated_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          project_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          status: string
          created_at?: string
        }
        Update: {
          status?: string
        }
      }
      screens: {
        Row: {
          id: string
          project_id: string
          batch_id: string | null
          name: string
          image_url: string
          thumbnail_url: string
          file_size: number | null
          width: number | null
          height: number | null
          status: string
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          batch_id?: string | null
          name: string
          image_url: string
          thumbnail_url: string
          file_size?: number | null
          width?: number | null
          height?: number | null
          status?: string
          source?: string
          created_at?: string
        }
        Update: {
          name?: string
          status?: string
          width?: number | null
          height?: number | null
        }
      }
      clusters: {
        Row: {
          id: string
          project_id: string
          title: string
          status: string
          confidence: number
          tags: string[] | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          status?: string
          confidence?: number
          tags?: string[] | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          status?: string
          confidence?: number
          tags?: string[] | null
          note?: string | null
          updated_at?: string
        }
      }
      cluster_screens: {
        Row: {
          cluster_id: string
          screen_id: string
          created_at: string
        }
        Insert: {
          cluster_id: string
          screen_id: string
          created_at?: string
        }
        Update: {
          cluster_id?: string
          screen_id?: string
        }
      }
      shortlist_items: {
        Row: {
          id: string
          project_id: string
          screen_id: string
          label: string | null
          group_name: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          screen_id: string
          label?: string | null
          group_name: string
          position: number
          created_at?: string
        }
        Update: {
          label?: string | null
          group_name?: string
          position?: number
        }
      }
    }
  }
}
