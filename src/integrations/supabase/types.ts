export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_logs: {
        Row: {
          action: string
          id: string
          input_data: Json | null
          output_data: Json | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_rate_limits: {
        Row: {
          created_at: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_count?: number
          user_id: string
          window_start: string
        }
        Update: {
          created_at?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          course_data: Json
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          course_data?: Json
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          course_data?: Json
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      infobank: {
        Row: {
          content: Json
          created_at: string
          id: string
          tags: string[] | null
          title: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      intake_forms: {
        Row: {
          background: string | null
          commitment_level: string
          constraints: string | null
          created_at: string
          experience_level: string
          goals: string
          id: string
          idea: string
          interests: string | null
          learning_style: string
          user_id: string
        }
        Insert: {
          background?: string | null
          commitment_level?: string
          constraints?: string | null
          created_at?: string
          experience_level?: string
          goals: string
          id?: string
          idea: string
          interests?: string | null
          learning_style?: string
          user_id: string
        }
        Update: {
          background?: string | null
          commitment_level?: string
          constraints?: string | null
          created_at?: string
          experience_level?: string
          goals?: string
          id?: string
          idea?: string
          interests?: string | null
          learning_style?: string
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          domain: string
          id: string
          progress: Json
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          description?: string | null
          domain: string
          id?: string
          progress?: Json
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          progress?: Json
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pdf_exports: {
        Row: {
          created_at: string
          file_path: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          experience_level: string | null
          full_name: string | null
          id: string
          learning_style: string | null
          time_commitment: string | null
        }
        Insert: {
          created_at?: string | null
          experience_level?: string | null
          full_name?: string | null
          id: string
          learning_style?: string | null
          time_commitment?: string | null
        }
        Update: {
          created_at?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          learning_style?: string | null
          time_commitment?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_ai_quota: {
        Args: { _limit: number; _user_id: string }
        Returns: {
          allowed: boolean
          retry_after: number
          used: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
