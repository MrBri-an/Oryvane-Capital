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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      account_restrictions: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          reason: string
          removed_at: string | null
          removed_by: string | null
          starts_at: string
          type: Database["public"]["Enums"]["restriction_type"]
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          reason: string
          removed_at?: string | null
          removed_by?: string | null
          starts_at?: string
          type: Database["public"]["Enums"]["restriction_type"]
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          reason?: string
          removed_at?: string | null
          removed_by?: string | null
          starts_at?: string
          type?: Database["public"]["Enums"]["restriction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_restrictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_restrictions_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_restrictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          affected_user_id: string | null
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          new_state: Json | null
          previous_state: Json | null
          reason: string
          reference: string | null
          resource_id: string | null
          resource_type: string
          session_metadata: Json
        }
        Insert: {
          action: string
          admin_id: string
          affected_user_id?: string | null
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          reason: string
          reference?: string | null
          resource_id?: string | null
          resource_type: string
          session_metadata?: Json
        }
        Update: {
          action?: string
          admin_id?: string
          affected_user_id?: string | null
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          reason?: string
          reference?: string | null
          resource_id?: string | null
          resource_type?: string
          session_metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_logs_affected_user_id_fkey"
            columns: ["affected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          created_at: string
          description: string
          id: string
          key: string
          sensitive: boolean
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          key: string
          sensitive?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key?: string
          sensitive?: boolean
        }
        Relationships: []
      }
      admin_role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          activated_at: string | null
          created_at: string
          disabled_at: string | null
          id: string
          invited_by: string | null
          role_id: string
          status: Database["public"]["Enums"]["admin_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          invited_by?: string | null
          role_id: string
          status?: Database["public"]["Enums"]["admin_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          invited_by?: string | null
          role_id?: string
          status?: Database["public"]["Enums"]["admin_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_plans: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string
          created_by: string | null
          currency: string
          duration_days: number
          featured: boolean
          full_description: string
          id: string
          image_path: string | null
          maximum_amount: number | null
          minimum_amount: number
          name: string
          participant_limit: number | null
          return_description: string
          risk_level: string
          short_description: string
          slug: string
          status: Database["public"]["Enums"]["plan_status"]
          terms: string
          updated_at: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          created_by?: string | null
          currency: string
          duration_days: number
          featured?: boolean
          full_description: string
          id?: string
          image_path?: string | null
          maximum_amount?: number | null
          minimum_amount: number
          name: string
          participant_limit?: number | null
          return_description: string
          risk_level: string
          short_description: string
          slug: string
          status?: Database["public"]["Enums"]["plan_status"]
          terms: string
          updated_at?: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          duration_days?: number
          featured?: boolean
          full_description?: string
          id?: string
          image_path?: string | null
          maximum_amount?: number | null
          minimum_amount?: number
          name?: string
          participant_limit?: number | null
          return_description?: string
          risk_level?: string
          short_description?: string
          slug?: string
          status?: Database["public"]["Enums"]["plan_status"]
          terms?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_updates: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string
          currency: string | null
          description: string
          id: string
          investment_id: string
          period_end: string | null
          period_start: string | null
          update_type: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by: string
          currency?: string | null
          description: string
          id?: string
          investment_id: string
          period_end?: string | null
          period_start?: string | null
          update_type: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string
          currency?: string | null
          description?: string
          id?: string
          investment_id?: string
          period_end?: string | null
          period_start?: string | null
          update_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_updates_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_updates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          read_at: string | null
          related_resource_id: string | null
          related_resource_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          read_at?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          read_at?: string | null
          related_resource_id?: string | null
          related_resource_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_submissions: {
        Row: {
          confirmed_amount: number | null
          created_at: string
          credited_at: string | null
          currency: string
          external_reference: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          receipt_path: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sender_name: string | null
          status: Database["public"]["Enums"]["payment_status"]
          submitted_amount: number
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmed_amount?: number | null
          created_at?: string
          credited_at?: string | null
          currency: string
          external_reference?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          receipt_path?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          submitted_amount: number
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmed_amount?: number | null
          created_at?: string
          credited_at?: string | null
          currency?: string
          external_reference?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          receipt_path?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          submitted_amount?: number
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          country: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          privacy_accepted_at: string | null
          risk_accepted_at: string | null
          status: Database["public"]["Enums"]["account_status"]
          terms_accepted_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          country?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          privacy_accepted_at?: string | null
          risk_accepted_at?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          country?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          privacy_accepted_at?: string | null
          risk_accepted_at?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_investments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          matures_at: string | null
          plan_id: string
          reviewed_by: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["investment_status"]
          updated_at: string
          user_id: string
          wallet_account_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency: string
          id?: string
          matures_at?: string | null
          plan_id: string
          reviewed_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          updated_at?: string
          user_id: string
          wallet_account_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          matures_at?: string | null
          plan_id?: string
          reviewed_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          updated_at?: string
          user_id?: string
          wallet_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_investments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_investments_wallet_account_id_fkey"
            columns: ["wallet_account_id"]
            isOneToOne: false
            referencedRelation: "wallet_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_accounts: {
        Row: {
          available_balance: number
          created_at: string
          currency: string
          id: string
          invested_amount: number
          total_balance: number
          total_earnings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          currency: string
          id?: string
          invested_amount?: number
          total_balance?: number
          total_earnings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          currency?: string
          id?: string
          invested_amount?: number
          total_balance?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          admin_id: string | null
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          direction: Database["public"]["Enums"]["transaction_direction"]
          id: string
          payment_submission_id: string | null
          previous_value: number
          reason: string
          reference: string
          resulting_value: number
          reversal_of: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          user_investment_id: string | null
          wallet_account_id: string
          withdrawal_request_id: string | null
        }
        Insert: {
          admin_id?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string
          currency: string
          direction: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          payment_submission_id?: string | null
          previous_value: number
          reason: string
          reference: string
          resulting_value: number
          reversal_of?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          user_investment_id?: string | null
          wallet_account_id: string
          withdrawal_request_id?: string | null
        }
        Update: {
          admin_id?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          direction?: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          payment_submission_id?: string | null
          previous_value?: number
          reason?: string
          reference?: string
          resulting_value?: number
          reversal_of?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
          user_investment_id?: string | null
          wallet_account_id?: string
          withdrawal_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_payment_submission_id_fkey"
            columns: ["payment_submission_id"]
            isOneToOne: false
            referencedRelation: "payment_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: true
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_investment_id_fkey"
            columns: ["user_investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_account_id_fkey"
            columns: ["wallet_account_id"]
            isOneToOne: false
            referencedRelation: "wallet_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_withdrawal_request_id_fkey"
            columns: ["withdrawal_request_id"]
            isOneToOne: false
            referencedRelation: "withdrawal_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          destination: Json
          id: string
          method: Database["public"]["Enums"]["withdrawal_method"]
          paid_at: string | null
          payment_reference: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          submitted_at: string
          updated_at: string
          user_id: string
          wallet_account_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          destination: Json
          id?: string
          method: Database["public"]["Enums"]["withdrawal_method"]
          paid_at?: string | null
          payment_reference?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          submitted_at?: string
          updated_at?: string
          user_id: string
          wallet_account_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          destination?: Json
          id?: string
          method?: Database["public"]["Enums"]["withdrawal_method"]
          paid_at?: string | null
          payment_reference?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          submitted_at?: string
          updated_at?: string
          user_id?: string
          wallet_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_wallet_account_id_fkey"
            columns: ["wallet_account_id"]
            isOneToOne: false
            referencedRelation: "wallet_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_user_has_permission: {
        Args: { admin_auth_user_id: string; permission_key: string }
        Returns: boolean
      }
      has_admin_permission: {
        Args: { permission_key: string; require_aal2?: boolean }
        Returns: boolean
      }
      perform_wallet_adjustment: {
        Args: {
          p_adjustment_amount: number
          p_adjustment_currency: string
          p_adjustment_direction: Database["public"]["Enums"]["transaction_direction"]
          p_adjustment_reason: string
          p_adjustment_reference: string
          p_adjustment_type: Database["public"]["Enums"]["transaction_type"]
          p_admin_auth_user_id: string
          p_original_transaction_id?: string
          p_wallet_account_id: string
        }
        Returns: string
      }
    }
    Enums: {
      account_status:
        | "pending_verification"
        | "active"
        | "restricted"
        | "suspended"
        | "blocked"
        | "closed"
      admin_status: "invited" | "active" | "disabled"
      investment_status:
        | "pending"
        | "awaiting_funding"
        | "under_review"
        | "active"
        | "matured"
        | "completed"
        | "cancelled"
        | "rejected"
        | "suspended"
      notification_type: "general" | "financial" | "security" | "account"
      payment_method: "bank_transfer" | "bitcoin"
      payment_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "awaiting_confirmation"
        | "approved"
        | "rejected"
        | "credited"
        | "cancelled"
      plan_status: "draft" | "active" | "paused" | "closed" | "archived"
      restriction_type:
        | "deposit"
        | "withdrawal"
        | "investment"
        | "login"
        | "account"
      transaction_direction: "credit" | "debit"
      transaction_status: "pending" | "completed" | "reversed" | "failed"
      transaction_type:
        | "bank_deposit"
        | "bitcoin_deposit"
        | "investment_allocation"
        | "investment_return"
        | "bonus"
        | "withdrawal"
        | "fee"
        | "refund"
        | "correction"
        | "reversal"
        | "promotional_credit"
        | "administrative_debit"
      withdrawal_method: "bank_transfer" | "bitcoin"
      withdrawal_status:
        | "submitted"
        | "under_review"
        | "approved"
        | "processing"
        | "paid"
        | "rejected"
        | "cancelled"
        | "reversed"
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
      account_status: [
        "pending_verification",
        "active",
        "restricted",
        "suspended",
        "blocked",
        "closed",
      ],
      admin_status: ["invited", "active", "disabled"],
      investment_status: [
        "pending",
        "awaiting_funding",
        "under_review",
        "active",
        "matured",
        "completed",
        "cancelled",
        "rejected",
        "suspended",
      ],
      notification_type: ["general", "financial", "security", "account"],
      payment_method: ["bank_transfer", "bitcoin"],
      payment_status: [
        "draft",
        "submitted",
        "under_review",
        "awaiting_confirmation",
        "approved",
        "rejected",
        "credited",
        "cancelled",
      ],
      plan_status: ["draft", "active", "paused", "closed", "archived"],
      restriction_type: [
        "deposit",
        "withdrawal",
        "investment",
        "login",
        "account",
      ],
      transaction_direction: ["credit", "debit"],
      transaction_status: ["pending", "completed", "reversed", "failed"],
      transaction_type: [
        "bank_deposit",
        "bitcoin_deposit",
        "investment_allocation",
        "investment_return",
        "bonus",
        "withdrawal",
        "fee",
        "refund",
        "correction",
        "reversal",
        "promotional_credit",
        "administrative_debit",
      ],
      withdrawal_method: ["bank_transfer", "bitcoin"],
      withdrawal_status: [
        "submitted",
        "under_review",
        "approved",
        "processing",
        "paid",
        "rejected",
        "cancelled",
        "reversed",
      ],
    },
  },
} as const
