// Supabase generated types placeholder.
// Regenerate with: pnpm supabase:types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: "active" | "trialing" | "past_due" | "canceled" | "incomplete"
          plan_tier: "free" | "starter" | "pro" | "business"
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status: "active" | "trialing" | "past_due" | "canceled" | "incomplete"
          plan_tier: "free" | "starter" | "pro" | "business"
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: "active" | "trialing" | "past_due" | "canceled" | "incomplete"
          plan_tier?: "free" | "starter" | "pro" | "business"
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: "user" | "assistant" | "system"
          content: string
          tokens_used: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: "user" | "assistant" | "system"
          content: string
          tokens_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: "user" | "assistant" | "system"
          content?: string
          tokens_used?: number
          created_at?: string
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          id: string
          user_id: string
          event_type: string
          tokens_used: number
          month_year: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          tokens_used?: number
          month_year: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          tokens_used?: number
          month_year?: string
          created_at?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          id: string
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          id?: string
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
