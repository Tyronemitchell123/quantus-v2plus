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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      anomaly_alerts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          metric_name: string | null
          metric_value: number | null
          severity: string
          threshold: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          metric_name?: string | null
          metric_value?: number | null
          severity?: string
          threshold?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          metric_name?: string | null
          metric_value?: number | null
          severity?: string
          threshold?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          auto_reply_sent: boolean
          classification: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: number | null
          sentiment: string | null
          suggested_response: string | null
        }
        Insert: {
          auto_reply_sent?: boolean
          classification?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: number | null
          sentiment?: string | null
          suggested_response?: string | null
        }
        Update: {
          auto_reply_sent?: boolean
          classification?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: number | null
          sentiment?: string | null
          suggested_response?: string | null
        }
        Relationships: []
      }
      marketing_ads: {
        Row: {
          body_text: string
          campaign_name: string
          created_at: string
          cta: string | null
          headline: string
          id: string
          platform: string | null
          status: string
          target_audience: string | null
          user_id: string
        }
        Insert: {
          body_text: string
          campaign_name: string
          created_at?: string
          cta?: string | null
          headline: string
          id?: string
          platform?: string | null
          status?: string
          target_audience?: string | null
          user_id: string
        }
        Update: {
          body_text?: string
          campaign_name?: string
          created_at?: string
          cta?: string | null
          headline?: string
          id?: string
          platform?: string | null
          status?: string
          target_audience?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketing_posts: {
        Row: {
          content: string
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image_prompt: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_prompt?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_prompt?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_seo: {
        Row: {
          id: string
          json_ld: Json | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          page_path: string
          score: number | null
          suggestions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          json_ld?: Json | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          page_path: string
          score?: number | null
          suggestions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          json_ld?: Json | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          page_path?: string
          score?: number | null
          suggestions?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_social: {
        Row: {
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          platform: string
          post_url: string | null
          scheduled_at: string | null
          status: string
          tone: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          platform: string
          post_url?: string | null
          scheduled_at?: string | null
          status?: string
          tone?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          platform?: string
          post_url?: string | null
          scheduled_at?: string | null
          status?: string
          tone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nlp_analyses: {
        Row: {
          created_at: string
          id: string
          input_text: string
          mode: string
          prompt: string | null
          result: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_text: string
          mode: string
          prompt?: string | null
          result: Json
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_text?: string
          mode?: string
          prompt?: string | null
          result?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          truelayer_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          truelayer_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          truelayer_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quantum_job_results: {
        Row: {
          created_at: string
          id: string
          quantum_job_id: string
          raw_result_json: Json | null
          result_counts_json: Json
        }
        Insert: {
          created_at?: string
          id?: string
          quantum_job_id: string
          raw_result_json?: Json | null
          result_counts_json?: Json
        }
        Update: {
          created_at?: string
          id?: string
          quantum_job_id?: string
          raw_result_json?: Json | null
          result_counts_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quantum_job_results_quantum_job_id_fkey"
            columns: ["quantum_job_id"]
            isOneToOne: false
            referencedRelation: "quantum_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_jobs: {
        Row: {
          circuit_format: string
          circuit_text: string
          completed_at: string | null
          cost_estimate_usd: number | null
          created_at: string
          device_arn: string
          error_message: string | null
          id: string
          provider: string
          provider_job_id: string | null
          shots: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          circuit_format?: string
          circuit_text: string
          completed_at?: string | null
          cost_estimate_usd?: number | null
          created_at?: string
          device_arn: string
          error_message?: string | null
          id?: string
          provider?: string
          provider_job_id?: string | null
          shots?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          circuit_format?: string
          circuit_text?: string
          completed_at?: string | null
          cost_estimate_usd?: number | null
          created_at?: string
          device_arn?: string
          error_message?: string | null
          id?: string
          provider?: string
          provider_job_id?: string | null
          shots?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          feature: string
          id: string
          quantity: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          feature: string
          id?: string
          quantity?: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          feature?: string
          id?: string
          quantity?: number
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          last_triggered_at: string | null
          secret: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payment_status:
        | "pending"
        | "authorized"
        | "executed"
        | "settled"
        | "failed"
        | "canceled"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "inactive"
      subscription_tier:
        | "free"
        | "starter"
        | "professional"
        | "teams"
        | "enterprise"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      payment_status: [
        "pending",
        "authorized",
        "executed",
        "settled",
        "failed",
        "canceled",
      ],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "inactive",
      ],
      subscription_tier: [
        "free",
        "starter",
        "professional",
        "teams",
        "enterprise",
      ],
    },
  },
} as const
