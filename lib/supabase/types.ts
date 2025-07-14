export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          github_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          user_id?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          avatar_url: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          avatar_url?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          avatar_url?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          role: 'member' | 'admin' | 'owner'
          joined_at: string
        }
        Insert: {
          team_id: string
          user_id: string
          role?: 'member' | 'admin' | 'owner'
          joined_at?: string
        }
        Update: {
          team_id?: string
          user_id?: string
          role?: 'member' | 'admin' | 'owner'
          joined_at?: string
        }
      }
      snippets: {
        Row: {
          id: string
          user_id: string
          team_id: string | null
          title: string
          description: string | null
          code: string
          language: string
          tags: string[]
          visibility: 'private' | 'public' | 'team'
          views_count: number
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id?: string | null
          title: string
          description?: string | null
          code: string
          language: string
          tags?: string[]
          visibility?: 'private' | 'public' | 'team'
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string | null
          title?: string
          description?: string | null
          code?: string
          language?: string
          tags?: string[]
          visibility?: 'private' | 'public' | 'team'
          views_count?: number
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      snippet_versions: {
        Row: {
          id: string
          snippet_id: string
          user_id: string
          title: string
          description: string | null
          code: string
          language: string
          tags: string[]
          version_number: number
          commit_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          snippet_id: string
          user_id: string
          title: string
          description?: string | null
          code: string
          language: string
          tags?: string[]
          version_number: number
          commit_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          snippet_id?: string
          user_id?: string
          title?: string
          description?: string | null
          code?: string
          language?: string
          tags?: string[]
          version_number?: number
          commit_message?: string | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          user_id: string
          snippet_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          snippet_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          snippet_id?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          plan: 'free' | 'pro' | 'team' | 'individual'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          plan?: 'free' | 'pro' | 'team' | 'individual'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
          plan?: 'free' | 'pro' | 'team' | 'individual'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_records: {
        Row: {
          id: string
          user_id: string
          feature: 'ai_generation' | 'api_call'
          count: number
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature: 'ai_generation' | 'api_call'
          count?: number
          period_start: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature?: 'ai_generation' | 'api_call'
          count?: number
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role: 'member' | 'admin' | 'owner'
          token: string
          invited_by: string
          accepted: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role?: 'member' | 'admin' | 'owner'
          token: string
          invited_by: string
          accepted?: boolean
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: 'member' | 'admin' | 'owner'
          token?: string
          invited_by?: string
          accepted?: boolean
          expires_at?: string
          created_at?: string
        }
      }
      team_activities: {
        Row: {
          id: string
          team_id: string
          user_id: string | null
          activity_type: 'member_joined' | 'member_left' | 'member_invited' | 'member_role_changed' | 'snippet_created' | 'snippet_updated' | 'snippet_deleted' | 'team_created' | 'team_updated'
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id?: string | null
          activity_type: 'member_joined' | 'member_left' | 'member_invited' | 'member_role_changed' | 'snippet_created' | 'snippet_updated' | 'snippet_deleted' | 'team_created' | 'team_updated'
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string | null
          activity_type?: 'member_joined' | 'member_left' | 'member_invited' | 'member_role_changed' | 'snippet_created' | 'snippet_updated' | 'snippet_deleted' | 'team_created' | 'team_updated'
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
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
      user_role: 'member' | 'admin' | 'owner'
      snippet_visibility: 'private' | 'public' | 'team'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
      subscription_plan: 'free' | 'pro' | 'team' | 'individual'
      usage_feature: 'ai_generation' | 'api_call'
      activity_type: 'member_joined' | 'member_left' | 'member_invited' | 'member_role_changed' | 'snippet_created' | 'snippet_updated' | 'snippet_deleted' | 'team_created' | 'team_updated'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific type exports
export type User = Tables<'users'>
export type Tag = Tables<'tags'>
export type Team = Tables<'teams'>
export type TeamMember = Tables<'team_members'>
export type Snippet = Tables<'snippets'>
export type SnippetVersion = Tables<'snippet_versions'>
export type Favorite = Tables<'favorites'>
export type Subscription = Tables<'subscriptions'>
export type UsageRecord = Tables<'usage_records'>
export type TeamInvitation = Tables<'team_invitations'>
export type TeamActivity = Tables<'team_activities'>

export type UserRole = Enums<'user_role'>
export type SnippetVisibility = Enums<'snippet_visibility'>
export type SubscriptionStatus = Enums<'subscription_status'>
export type SubscriptionPlan = Enums<'subscription_plan'>
export type UsageFeature = Enums<'usage_feature'>
export type ActivityType = Enums<'activity_type'>