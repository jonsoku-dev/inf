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
      advertiser_proposal_responses: {
        Row: {
          influencer_id: string
          message: string
          proposal_id: string
          responded_at: string
          response_id: string
          response_status:
            | Database["public"]["Enums"]["proposal_application_status"]
            | null
          updated_at: string
        }
        Insert: {
          influencer_id: string
          message: string
          proposal_id: string
          responded_at?: string
          response_id?: string
          response_status?:
            | Database["public"]["Enums"]["proposal_application_status"]
            | null
          updated_at?: string
        }
        Update: {
          influencer_id?: string
          message?: string
          proposal_id?: string
          responded_at?: string
          response_id?: string
          response_status?:
            | Database["public"]["Enums"]["proposal_application_status"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertiser_proposal_responses_influencer_id_profiles_profile_id"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "advertiser_proposal_responses_proposal_id_advertiser_proposals_"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "advertiser_proposals"
            referencedColumns: ["proposal_id"]
          },
        ]
      }
      advertiser_proposals: {
        Row: {
          advertiser_id: string
          budget: number
          campaign_end_date: string
          campaign_start_date: string
          categories: string[]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          description: string
          influencer_id: string
          is_negotiable: boolean | null
          keywords: string[] | null
          message: string | null
          proposal_id: string
          proposal_status:
            | Database["public"]["Enums"]["advertiser_proposal_status"]
            | null
          reference_urls: string[] | null
          requirements: string[]
          target_market: Database["public"]["Enums"]["target_market"]
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          budget: number
          campaign_end_date: string
          campaign_start_date: string
          categories: string[]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          description: string
          influencer_id: string
          is_negotiable?: boolean | null
          keywords?: string[] | null
          message?: string | null
          proposal_id?: string
          proposal_status?:
            | Database["public"]["Enums"]["advertiser_proposal_status"]
            | null
          reference_urls?: string[] | null
          requirements: string[]
          target_market: Database["public"]["Enums"]["target_market"]
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          budget?: number
          campaign_end_date?: string
          campaign_start_date?: string
          categories?: string[]
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          description?: string
          influencer_id?: string
          is_negotiable?: boolean | null
          keywords?: string[] | null
          message?: string | null
          proposal_id?: string
          proposal_status?:
            | Database["public"]["Enums"]["advertiser_proposal_status"]
            | null
          reference_urls?: string[] | null
          requirements?: string[]
          target_market?: Database["public"]["Enums"]["target_market"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertiser_proposals_advertiser_id_profiles_profile_id_fk"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "advertiser_proposals_influencer_id_profiles_profile_id_fk"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      applications: {
        Row: {
          application_id: string
          application_status: Database["public"]["Enums"]["application_status"]
          applied_at: string
          campaign_id: string
          influencer_id: string
          message: string
          updated_at: string
        }
        Insert: {
          application_id?: string
          application_status?: Database["public"]["Enums"]["application_status"]
          applied_at?: string
          campaign_id: string
          influencer_id: string
          message: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          application_status?: Database["public"]["Enums"]["application_status"]
          applied_at?: string
          campaign_id?: string
          influencer_id?: string
          message?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_campaign_id_campaigns_campaign_id_fk"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "applications_influencer_id_profiles_profile_id_fk"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      "auth.users": {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          advertiser_id: string
          budget: number
          campaign_id: string
          campaign_status: Database["public"]["Enums"]["campaign_status"]
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          categories: Json
          created_at: string
          current_applications: number | null
          description: string
          end_date: string
          is_negotiable: boolean | null
          is_urgent: boolean | null
          keywords: Json
          location_requirements: string | null
          max_applications: number | null
          min_followers: number | null
          preferred_age_range: Json | null
          preferred_gender: string | null
          requirements: string[] | null
          start_date: string
          target_market: string
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          budget: number
          campaign_id?: string
          campaign_status?: Database["public"]["Enums"]["campaign_status"]
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          categories: Json
          created_at?: string
          current_applications?: number | null
          description: string
          end_date: string
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          keywords: Json
          location_requirements?: string | null
          max_applications?: number | null
          min_followers?: number | null
          preferred_age_range?: Json | null
          preferred_gender?: string | null
          requirements?: string[] | null
          start_date: string
          target_market: string
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          budget?: number
          campaign_id?: string
          campaign_status?: Database["public"]["Enums"]["campaign_status"]
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          categories?: Json
          created_at?: string
          current_applications?: number | null
          description?: string
          end_date?: string
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          keywords?: Json
          location_requirements?: string | null
          max_applications?: number | null
          min_followers?: number | null
          preferred_age_range?: Json | null
          preferred_gender?: string | null
          requirements?: string[] | null
          start_date?: string
          target_market?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_advertiser_id_profiles_profile_id_fk"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      influencer_profiles: {
        Row: {
          birth_year: number | null
          blog_url: string | null
          categories: Database["public"]["Enums"]["influencer_category"][]
          created_at: string
          followers_count: Json
          gender: Database["public"]["Enums"]["gender"] | null
          instagram_handle: string | null
          introduction: string | null
          is_public: boolean
          location: string | null
          portfolio_urls: string[] | null
          profile_id: string
          tiktok_handle: string | null
          updated_at: string
          youtube_handle: string | null
        }
        Insert: {
          birth_year?: number | null
          blog_url?: string | null
          categories: Database["public"]["Enums"]["influencer_category"][]
          created_at?: string
          followers_count: Json
          gender?: Database["public"]["Enums"]["gender"] | null
          instagram_handle?: string | null
          introduction?: string | null
          is_public?: boolean
          location?: string | null
          portfolio_urls?: string[] | null
          profile_id: string
          tiktok_handle?: string | null
          updated_at?: string
          youtube_handle?: string | null
        }
        Update: {
          birth_year?: number | null
          blog_url?: string | null
          categories?: Database["public"]["Enums"]["influencer_category"][]
          created_at?: string
          followers_count?: Json
          gender?: Database["public"]["Enums"]["gender"] | null
          instagram_handle?: string | null
          introduction?: string | null
          is_public?: boolean
          location?: string | null
          portfolio_urls?: string[] | null
          profile_id?: string
          tiktok_handle?: string | null
          updated_at?: string
          youtube_handle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_profiles_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      influencer_proposals: {
        Row: {
          available_period_end: string
          available_period_start: string
          categories: string[]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          description: string
          desired_budget: number
          expected_deliverables: string[]
          influencer_id: string
          is_negotiable: boolean | null
          keywords: string[]
          portfolio_samples: string[] | null
          preferred_industry: string[] | null
          proposal_id: string
          proposal_status: Database["public"]["Enums"]["proposal_status"] | null
          target_market: Database["public"]["Enums"]["target_market"]
          title: string
          updated_at: string
        }
        Insert: {
          available_period_end: string
          available_period_start: string
          categories: string[]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          description: string
          desired_budget: number
          expected_deliverables: string[]
          influencer_id: string
          is_negotiable?: boolean | null
          keywords: string[]
          portfolio_samples?: string[] | null
          preferred_industry?: string[] | null
          proposal_id?: string
          proposal_status?:
            | Database["public"]["Enums"]["proposal_status"]
            | null
          target_market: Database["public"]["Enums"]["target_market"]
          title: string
          updated_at?: string
        }
        Update: {
          available_period_end?: string
          available_period_start?: string
          categories?: string[]
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          description?: string
          desired_budget?: number
          expected_deliverables?: string[]
          influencer_id?: string
          is_negotiable?: boolean | null
          keywords?: string[]
          portfolio_samples?: string[] | null
          preferred_industry?: string[] | null
          proposal_id?: string
          proposal_status?:
            | Database["public"]["Enums"]["proposal_status"]
            | null
          target_market?: Database["public"]["Enums"]["target_market"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_proposals_influencer_id_profiles_profile_id_fk"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      influencer_stats: {
        Row: {
          avg_comments: number | null
          avg_likes: number | null
          avg_views: number | null
          engagement_rate: number | null
          followers_count: number
          platform: Database["public"]["Enums"]["sns_type"]
          profile_id: string
          recorded_at: string
          stat_id: string
        }
        Insert: {
          avg_comments?: number | null
          avg_likes?: number | null
          avg_views?: number | null
          engagement_rate?: number | null
          followers_count: number
          platform: Database["public"]["Enums"]["sns_type"]
          profile_id: string
          recorded_at?: string
          stat_id?: string
        }
        Update: {
          avg_comments?: number | null
          avg_likes?: number | null
          avg_views?: number | null
          engagement_rate?: number | null
          followers_count?: number
          platform?: Database["public"]["Enums"]["sns_type"]
          profile_id?: string
          recorded_at?: string
          stat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_stats_profile_id_influencer_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      influencer_verifications: {
        Row: {
          engagement_rate: number | null
          followers_count: number
          is_valid: boolean
          next_verification_due: string
          platform: Database["public"]["Enums"]["sns_type"]
          profile_id: string
          verification_id: string
          verified_at: string
        }
        Insert: {
          engagement_rate?: number | null
          followers_count: number
          is_valid?: boolean
          next_verification_due: string
          platform: Database["public"]["Enums"]["sns_type"]
          profile_id: string
          verification_id?: string
          verified_at?: string
        }
        Update: {
          engagement_rate?: number | null
          followers_count?: number
          is_valid?: boolean
          next_verification_due?: string
          platform?: Database["public"]["Enums"]["sns_type"]
          profile_id?: string
          verification_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_verifications_profile_id_influencer_profiles_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      notifications: {
        Row: {
          campaign_id: string | null
          message: string
          notification_id: string
          read_at: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          message: string
          notification_id?: string
          read_at?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          message?: string
          notification_id?: string
          read_at?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_campaign_id_campaigns_campaign_id_fk"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "notifications_user_id_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          line_user_id: string | null
          name: string
          profile_id: string
          role: Database["public"]["Enums"]["role"] | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          line_user_id?: string | null
          name: string
          profile_id: string
          role?: Database["public"]["Enums"]["role"] | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          line_user_id?: string | null
          name?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["role"] | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      proposal_applications: {
        Row: {
          advertiser_id: string
          application_id: string
          applied_at: string
          message: string
          proposal_application_status:
            | Database["public"]["Enums"]["proposal_application_status"]
            | null
          proposal_id: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          application_id?: string
          applied_at?: string
          message: string
          proposal_application_status?:
            | Database["public"]["Enums"]["proposal_application_status"]
            | null
          proposal_id: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          application_id?: string
          applied_at?: string
          message?: string
          proposal_application_status?:
            | Database["public"]["Enums"]["proposal_application_status"]
            | null
          proposal_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_applications_advertiser_id_profiles_profile_id_fk"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "proposal_applications_proposal_id_influencer_proposals_proposal"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "influencer_proposals"
            referencedColumns: ["proposal_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      advertiser_proposal_status:
        | "DRAFT"
        | "SENT"
        | "ACCEPTED"
        | "REJECTED"
        | "COMPLETED"
        | "CANCELLED"
      application_status:
        | "PENDING"
        | "ACCEPTED"
        | "REJECTED"
        | "COMPLETED"
        | "CANCELLED"
      campaign_status:
        | "DRAFT"
        | "PUBLISHED"
        | "CLOSED"
        | "CANCELLED"
        | "COMPLETED"
      campaign_type: "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "BLOG"
      content_type:
        | "INSTAGRAM_POST"
        | "INSTAGRAM_REEL"
        | "INSTAGRAM_STORY"
        | "YOUTUBE_SHORT"
        | "YOUTUBE_VIDEO"
        | "TIKTOK_VIDEO"
        | "BLOG_POST"
      gender: "MALE" | "FEMALE" | "OTHER"
      influencer_category:
        | "FASHION"
        | "BEAUTY"
        | "FOOD"
        | "TRAVEL"
        | "TECH"
        | "GAME"
        | "ENTERTAINMENT"
        | "LIFESTYLE"
        | "PARENTING"
        | "PETS"
        | "OTHER"
      proposal_application_status:
        | "PENDING"
        | "ACCEPTED"
        | "REJECTED"
        | "COMPLETED"
        | "CANCELLED"
      proposal_status: "DRAFT" | "PUBLISHED" | "CLOSED" | "REJECTED"
      role: "ADVERTISER" | "INFLUENCER" | "ADMIN"
      sns_type: "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "BLOG"
      target_market: "KR" | "JP" | "BOTH"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
