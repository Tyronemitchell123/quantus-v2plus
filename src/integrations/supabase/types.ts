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
      addon_purchases: {
        Row: {
          addon_id: string
          amount_cents: number
          created_at: string
          expires_at: string | null
          id: string
          quantity: number
          status: string
          user_id: string
        }
        Insert: {
          addon_id: string
          amount_cents: number
          created_at?: string
          expires_at?: string | null
          id?: string
          quantity?: number
          status?: string
          user_id: string
        }
        Update: {
          addon_id?: string
          amount_cents?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          quantity?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_purchases_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
        ]
      }
      addons: {
        Row: {
          billing_type: string
          category: string
          created_at: string
          currency: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price_cents: number
          sort_order: number
        }
        Insert: {
          billing_type?: string
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price_cents: number
          sort_order?: number
        }
        Update: {
          billing_type?: string
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          sort_order?: number
        }
        Relationships: []
      }
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
      chat_messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          deal_id: string | null
          id: string
          metadata: Json | null
          sender_type: string
          user_id: string
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          sender_type?: string
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          metadata?: Json | null
          sender_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_logs: {
        Row: {
          category: string
          commission_cents: number
          commission_rate: number | null
          created_at: string
          deal_id: string
          deal_value_cents: number | null
          id: string
          invoice_id: string | null
          notes: string | null
          paid_at: string | null
          status: string
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          category: string
          commission_cents?: number
          commission_rate?: number | null
          created_at?: string
          deal_id: string
          deal_value_cents?: number | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          category?: string
          commission_cents?: number
          commission_rate?: number | null
          created_at?: string
          deal_id?: string
          deal_value_cents?: number | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_logs_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          payout_status: string
          quantus_cut: number
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          payout_status?: string
          quantus_cut?: number
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          payout_status?: string
          quantus_cut?: number
          total_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      deal_documents: {
        Row: {
          content: string | null
          created_at: string
          deal_id: string
          document_type: string
          fields: Json | null
          id: string
          metadata: Json | null
          signed_at: string | null
          signed_by: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          deal_id: string
          document_type: string
          fields?: Json | null
          id?: string
          metadata?: Json | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          deal_id?: string
          document_type?: string
          fields?: Json | null
          id?: string
          metadata?: Json | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          ai_classification_raw: Json | null
          ai_confirmation: string | null
          budget_currency: string | null
          budget_max: number | null
          budget_min: number | null
          category: Database["public"]["Enums"]["deal_category"]
          completed_at: string | null
          complexity_score: number | null
          constraints: Json | null
          created_at: string
          custom_commission_rate: number | null
          deal_number: string
          deal_value_estimate: number | null
          id: string
          input_channel: string
          intent: string | null
          is_priority: boolean
          location: string | null
          preferences: Json | null
          priority_score: number
          priority_surcharge_cents: number | null
          probability_score: number | null
          raw_input: string
          requirements: Json | null
          routed_engine: string | null
          status: Database["public"]["Enums"]["deal_status"]
          sub_category: string | null
          timeline_days: number | null
          updated_at: string
          urgency_score: number | null
          user_id: string
        }
        Insert: {
          ai_classification_raw?: Json | null
          ai_confirmation?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category: Database["public"]["Enums"]["deal_category"]
          completed_at?: string | null
          complexity_score?: number | null
          constraints?: Json | null
          created_at?: string
          custom_commission_rate?: number | null
          deal_number?: string
          deal_value_estimate?: number | null
          id?: string
          input_channel?: string
          intent?: string | null
          is_priority?: boolean
          location?: string | null
          preferences?: Json | null
          priority_score?: number
          priority_surcharge_cents?: number | null
          probability_score?: number | null
          raw_input: string
          requirements?: Json | null
          routed_engine?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          sub_category?: string | null
          timeline_days?: number | null
          updated_at?: string
          urgency_score?: number | null
          user_id: string
        }
        Update: {
          ai_classification_raw?: Json | null
          ai_confirmation?: string | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: Database["public"]["Enums"]["deal_category"]
          completed_at?: string | null
          complexity_score?: number | null
          constraints?: Json | null
          created_at?: string
          custom_commission_rate?: number | null
          deal_number?: string
          deal_value_estimate?: number | null
          id?: string
          input_channel?: string
          intent?: string | null
          is_priority?: boolean
          location?: string | null
          preferences?: Json | null
          priority_score?: number
          priority_surcharge_cents?: number | null
          probability_score?: number | null
          raw_input?: string
          requirements?: Json | null
          routed_engine?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          sub_category?: string | null
          timeline_days?: number | null
          updated_at?: string
          urgency_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      encrypted_secrets: {
        Row: {
          category: string
          created_at: string
          encrypted_value: string
          encryption_method: string
          id: string
          key_name: string
          last_rotated_at: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          encrypted_value: string
          encryption_method?: string
          id?: string
          key_name: string
          last_rotated_at?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          encrypted_value?: string
          encryption_method?: string
          id?: string
          key_name?: string
          last_rotated_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          deal_id: string
          due_date: string | null
          id: string
          invoice_number: string
          invoice_type: string
          last_reminder_at: string | null
          line_items: Json | null
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          recipient_address: string | null
          recipient_email: string | null
          recipient_name: string | null
          reminder_count: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          deal_id: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string
          last_reminder_at?: string | null
          line_items?: Json | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reminder_count?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          deal_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string
          last_reminder_at?: string | null
          line_items?: Json | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reminder_count?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_summary: string | null
          created_at: string
          id: string
          potential_value: number
          source_url: string | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          id?: string
          potential_value?: number
          source_url?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          id?: string
          potential_value?: number
          source_url?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      longevity_providers: {
        Row: {
          avg_price_cents: number
          city: string
          clinic_name: string
          country: string
          created_at: string
          firecrawl_target_url: string | null
          iata_codes: string[]
          id: string
          is_active: boolean
          metadata: Json | null
          specialties: string[]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avg_price_cents?: number
          city: string
          clinic_name: string
          country?: string
          created_at?: string
          firecrawl_target_url?: string | null
          iata_codes?: string[]
          id?: string
          is_active?: boolean
          metadata?: Json | null
          specialties?: string[]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avg_price_cents?: number
          city?: string
          clinic_name?: string
          country?: string
          created_at?: string
          firecrawl_target_url?: string | null
          iata_codes?: string[]
          id?: string
          is_active?: boolean
          metadata?: Json | null
          specialties?: string[]
          updated_at?: string
          website_url?: string | null
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
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          category: string
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_vault: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          metadata: Json | null
          patient_uuid: string
          procedure_intent: string | null
          real_name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          patient_uuid?: string
          procedure_intent?: string | null
          real_name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          patient_uuid?: string
          procedure_intent?: string | null
          real_name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_vault_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      pilot_arbitrage_results: {
        Row: {
          aircraft_type: string | null
          competitor_price_cents: number
          competitor_source: string | null
          created_at: string
          delta_pct: number | null
          expires_at: string | null
          id: string
          internal_price_cents: number
          is_perishing: boolean | null
          route_destination: string
          route_origin: string
          scanned_at: string
          tail_number: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          aircraft_type?: string | null
          competitor_price_cents?: number
          competitor_source?: string | null
          created_at?: string
          delta_pct?: number | null
          expires_at?: string | null
          id?: string
          internal_price_cents?: number
          is_perishing?: boolean | null
          route_destination: string
          route_origin: string
          scanned_at?: string
          tail_number?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          aircraft_type?: string | null
          competitor_price_cents?: number
          competitor_source?: string | null
          created_at?: string
          delta_pct?: number | null
          expires_at?: string | null
          id?: string
          internal_price_cents?: number
          is_perishing?: boolean | null
          route_destination?: string
          route_origin?: string
          scanned_at?: string
          tail_number?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilot_arbitrage_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "pilot_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_outreach_drafts: {
        Row: {
          approved_at: string | null
          created_at: string
          draft_message: string
          id: string
          lead_name: string
          savings_amount_cents: number | null
          sent_via: string | null
          status: string
          tail_number: string | null
          tenant_id: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          draft_message: string
          id?: string
          lead_name: string
          savings_amount_cents?: number | null
          sent_via?: string | null
          status?: string
          tail_number?: string | null
          tenant_id: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          draft_message?: string
          id?: string
          lead_name?: string
          savings_amount_cents?: number | null
          sent_via?: string | null
          status?: string
          tail_number?: string | null
          tenant_id?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilot_outreach_drafts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "pilot_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_tenants: {
        Row: {
          company_name: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          sector: string
          tenant_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          sector?: string
          tenant_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          sector?: string
          tenant_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_assets: {
        Row: {
          allocation_pct: number
          asset_class: string
          change_pct: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          name: string
          updated_at: string
          user_id: string
          value_cents: number
        }
        Insert: {
          allocation_pct?: number
          asset_class?: string
          change_pct?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string
          user_id: string
          value_cents?: number
        }
        Update: {
          allocation_pct?: number
          asset_class?: string
          change_pct?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
          value_cents?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarding_completed_at: string | null
          onboarding_modules: string[] | null
          onboarding_preferences: Json | null
          onboarding_role: string | null
          onboarding_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_modules?: string[] | null
          onboarding_preferences?: Json | null
          onboarding_role?: string | null
          onboarding_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_modules?: string[] | null
          onboarding_preferences?: Json | null
          onboarding_role?: string | null
          onboarding_tier?: string | null
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          max_uses: number | null
          reward_credits: number
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          reward_credits?: number
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          reward_credits?: number
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referral_redemptions: {
        Row: {
          created_at: string
          credits_awarded: number
          id: string
          referral_code_id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          credits_awarded?: number
          id?: string
          referral_code_id: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          credits_awarded?: number
          id?: string
          referral_code_id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_redemptions_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          agent_id: string | null
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
          agent_id?: string | null
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
          agent_id?: string | null
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
      sourcing_results: {
        Row: {
          ai_notes: string | null
          availability: string | null
          category: string
          cons: Json | null
          cost_currency: string | null
          created_at: string
          deal_id: string
          description: string | null
          estimated_cost: number | null
          id: string
          location: string | null
          name: string
          overall_score: number
          pros: Json | null
          recommended_next_step: string | null
          risk_level: string | null
          score_breakdown: Json | null
          specifications: Json | null
          tier: string
          user_id: string
          vendor_contact: Json | null
          vendor_prep: Json | null
        }
        Insert: {
          ai_notes?: string | null
          availability?: string | null
          category: string
          cons?: Json | null
          cost_currency?: string | null
          created_at?: string
          deal_id: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          name: string
          overall_score?: number
          pros?: Json | null
          recommended_next_step?: string | null
          risk_level?: string | null
          score_breakdown?: Json | null
          specifications?: Json | null
          tier?: string
          user_id: string
          vendor_contact?: Json | null
          vendor_prep?: Json | null
        }
        Update: {
          ai_notes?: string | null
          availability?: string | null
          category?: string
          cons?: Json | null
          cost_currency?: string | null
          created_at?: string
          deal_id?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          name?: string
          overall_score?: number
          pros?: Json | null
          recommended_next_step?: string | null
          risk_level?: string | null
          score_breakdown?: Json | null
          specifications?: Json | null
          tier?: string
          user_id?: string
          vendor_contact?: Json | null
          vendor_prep?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sourcing_results_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_connect_products: {
        Row: {
          connected_account_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          price_cents: number
          stripe_price_id: string | null
          stripe_product_id: string
        }
        Insert: {
          connected_account_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          price_cents: number
          stripe_price_id?: string | null
          stripe_product_id: string
        }
        Update: {
          connected_account_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          stripe_product_id?: string
        }
        Relationships: []
      }
      stripe_connected_accounts: {
        Row: {
          contact_email: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarding_complete: boolean
          stripe_account_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_complete?: boolean
          stripe_account_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_complete?: boolean
          stripe_account_id?: string
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      system_health: {
        Row: {
          created_at: string
          event_type: string
          fallback_used: string | null
          function_name: string
          id: string
          metadata: Json | null
          resolved: boolean
          severity: string
          source_url: string | null
          success_rate: number | null
        }
        Insert: {
          created_at?: string
          event_type: string
          fallback_used?: string | null
          function_name: string
          id?: string
          metadata?: Json | null
          resolved?: boolean
          severity?: string
          source_url?: string | null
          success_rate?: number | null
        }
        Update: {
          created_at?: string
          event_type?: string
          fallback_used?: string | null
          function_name?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean
          severity?: string
          source_url?: string | null
          success_rate?: number | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          tenant_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          sector: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sector: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sector?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_overages: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          created_at: string
          feature: string
          id: string
          overage_quantity: number
          rate_cents: number
          status: string
          total_cents: number
          user_id: string
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          feature: string
          id?: string
          overage_quantity: number
          rate_cents: number
          status?: string
          total_cents: number
          user_id: string
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          feature?: string
          id?: string
          overage_quantity?: number
          rate_cents?: number
          status?: string
          total_cents?: number
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
      user_credits: {
        Row: {
          balance: number
          id: string
          lifetime_earned: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
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
      vanguard_clients: {
        Row: {
          bio_recovery_threshold: number
          calendar_provider: string | null
          client_code: string
          client_name: string
          consecutive_days: number
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          preferred_airports: string[] | null
          preferred_destinations: string[] | null
          retainer_cents: number
          stress_index_threshold: number
          success_fee_rate: number
          updated_at: string
          user_id: string
          wearable_api_token: string | null
          wearable_provider: string
        }
        Insert: {
          bio_recovery_threshold?: number
          calendar_provider?: string | null
          client_code?: string
          client_name: string
          consecutive_days?: number
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          preferred_airports?: string[] | null
          preferred_destinations?: string[] | null
          retainer_cents?: number
          stress_index_threshold?: number
          success_fee_rate?: number
          updated_at?: string
          user_id: string
          wearable_api_token?: string | null
          wearable_provider?: string
        }
        Update: {
          bio_recovery_threshold?: number
          calendar_provider?: string | null
          client_code?: string
          client_name?: string
          consecutive_days?: number
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          preferred_airports?: string[] | null
          preferred_destinations?: string[] | null
          retainer_cents?: number
          stress_index_threshold?: number
          success_fee_rate?: number
          updated_at?: string
          user_id?: string
          wearable_api_token?: string | null
          wearable_provider?: string
        }
        Relationships: []
      }
      vanguard_triggers: {
        Row: {
          ai_generated: boolean
          calendar_stress_index: number
          client_id: string
          commission_cents: number | null
          created_at: string
          escape_manifest: Json | null
          executed_at: string | null
          id: string
          outreach_draft: string | null
          recovery_scores: number[]
          status: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          calendar_stress_index?: number
          client_id: string
          commission_cents?: number | null
          created_at?: string
          escape_manifest?: Json | null
          executed_at?: string | null
          id?: string
          outreach_draft?: string | null
          recovery_scores?: number[]
          status?: string
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          calendar_stress_index?: number
          client_id?: string
          commission_cents?: number | null
          created_at?: string
          escape_manifest?: Json | null
          executed_at?: string | null
          id?: string
          outreach_draft?: string | null
          recovery_scores?: number[]
          status?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vanguard_triggers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "vanguard_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_messages: {
        Row: {
          ai_generated: boolean | null
          body: string
          channel: string
          created_at: string
          direction: string
          id: string
          metadata: Json | null
          outreach_id: string
          sent_at: string | null
          subject: string | null
          tone: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          body: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json | null
          outreach_id: string
          sent_at?: string | null
          subject?: string | null
          tone?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          body?: string
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json | null
          outreach_id?: string
          sent_at?: string | null
          subject?: string | null
          tone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_messages_outreach_id_fkey"
            columns: ["outreach_id"]
            isOneToOne: false
            referencedRelation: "vendor_outreach"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_outreach: {
        Row: {
          category: string
          created_at: string
          custom_commission_rate: number | null
          deal_id: string
          documents_received: Json | null
          documents_requested: Json | null
          follow_up_count: number | null
          id: string
          negotiation_prep: Json | null
          negotiation_ready: boolean | null
          next_follow_up_at: string | null
          outreach_strategy: Json | null
          response_time_hours: number | null
          sourcing_result_id: string
          status: string
          updated_at: string
          user_id: string
          vendor_company: string | null
          vendor_email: string | null
          vendor_name: string
          vendor_phone: string | null
          vendor_score: number | null
        }
        Insert: {
          category: string
          created_at?: string
          custom_commission_rate?: number | null
          deal_id: string
          documents_received?: Json | null
          documents_requested?: Json | null
          follow_up_count?: number | null
          id?: string
          negotiation_prep?: Json | null
          negotiation_ready?: boolean | null
          next_follow_up_at?: string | null
          outreach_strategy?: Json | null
          response_time_hours?: number | null
          sourcing_result_id: string
          status?: string
          updated_at?: string
          user_id: string
          vendor_company?: string | null
          vendor_email?: string | null
          vendor_name: string
          vendor_phone?: string | null
          vendor_score?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          custom_commission_rate?: number | null
          deal_id?: string
          documents_received?: Json | null
          documents_requested?: Json | null
          follow_up_count?: number | null
          id?: string
          negotiation_prep?: Json | null
          negotiation_ready?: boolean | null
          next_follow_up_at?: string | null
          outreach_strategy?: Json | null
          response_time_hours?: number | null
          sourcing_result_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          vendor_company?: string | null
          vendor_email?: string | null
          vendor_name?: string
          vendor_phone?: string | null
          vendor_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_outreach_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_outreach_sourcing_result_id_fkey"
            columns: ["sourcing_result_id"]
            isOneToOne: false
            referencedRelation: "sourcing_results"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: string
          company: string
          created_at: string | null
          credentials: Json | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          phone: string | null
          specialties: string[] | null
          tier: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          category: string
          company: string
          created_at?: string | null
          credentials?: Json | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          specialties?: string[] | null
          tier?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          category?: string
          company?: string
          created_at?: string | null
          credentials?: Json | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          specialties?: string[] | null
          tier?: string | null
          updated_at?: string | null
          website?: string | null
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
      workflow_communications: {
        Row: {
          ai_generated: boolean | null
          body: string
          channel: string
          created_at: string
          deal_id: string
          direction: string
          id: string
          recipient: string
          sent_at: string | null
          subject: string | null
          tone: string | null
          user_id: string
          workflow_task_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          body: string
          channel?: string
          created_at?: string
          deal_id: string
          direction?: string
          id?: string
          recipient: string
          sent_at?: string | null
          subject?: string | null
          tone?: string | null
          user_id: string
          workflow_task_id: string
        }
        Update: {
          ai_generated?: boolean | null
          body?: string
          channel?: string
          created_at?: string
          deal_id?: string
          direction?: string
          id?: string
          recipient?: string
          sent_at?: string | null
          subject?: string | null
          tone?: string | null
          user_id?: string
          workflow_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_communications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_communications_workflow_task_id_fkey"
            columns: ["workflow_task_id"]
            isOneToOne: false
            referencedRelation: "workflow_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          deal_id: string
          dependencies: Json | null
          description: string | null
          due_at: string | null
          id: string
          metadata: Json | null
          phase: string
          priority: number
          risk_level: string | null
          risk_notes: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
          user_id: string
          vendor_outreach_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          deal_id: string
          dependencies?: Json | null
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json | null
          phase?: string
          priority?: number
          risk_level?: string | null
          risk_notes?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string
          user_id: string
          vendor_outreach_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          deal_id?: string
          dependencies?: Json | null
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json | null
          phase?: string
          priority?: number
          risk_level?: string | null
          risk_notes?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
          user_id?: string
          vendor_outreach_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_tasks_vendor_outreach_id_fkey"
            columns: ["vendor_outreach_id"]
            isOneToOne: false
            referencedRelation: "vendor_outreach"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      storefront_products: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string | null
          name: string | null
          price_cents: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          price_cents?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          price_cents?: number | null
        }
        Relationships: []
      }
      webhooks_safe: {
        Row: {
          created_at: string | null
          events: string[] | null
          id: string | null
          is_active: boolean | null
          last_triggered_at: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      deactivate_expired_api_keys: { Args: never; Returns: number }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "partner"
      deal_category:
        | "aviation"
        | "medical"
        | "staffing"
        | "lifestyle"
        | "logistics"
        | "partnerships"
        | "marine"
        | "legal"
        | "finance"
      deal_status:
        | "intake"
        | "sourcing"
        | "matching"
        | "negotiation"
        | "execution"
        | "completed"
        | "cancelled"
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
      app_role: ["admin", "moderator", "user", "partner"],
      deal_category: [
        "aviation",
        "medical",
        "staffing",
        "lifestyle",
        "logistics",
        "partnerships",
        "marine",
        "legal",
        "finance",
      ],
      deal_status: [
        "intake",
        "sourcing",
        "matching",
        "negotiation",
        "execution",
        "completed",
        "cancelled",
      ],
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
