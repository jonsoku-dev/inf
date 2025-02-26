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
      applications: {
        Row: {
          application_id: string
          application_status:
            | Database["public"]["Enums"]["application_status"]
            | null
          applied_at: string
          campaign_id: string
          influencer_id: string
          message: string
          updated_at: string
        }
        Insert: {
          application_id?: string
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          applied_at?: string
          campaign_id: string
          influencer_id: string
          message: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
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
          campaign_status: Database["public"]["Enums"]["campaign_status"] | null
          created_at: string
          description: string
          period_end: string
          period_start: string
          requirements: string
          target_market: string
          title: string
          updated_at: string
        }
        Insert: {
          advertiser_id: string
          budget: number
          campaign_id?: string
          campaign_status?:
            | Database["public"]["Enums"]["campaign_status"]
            | null
          created_at?: string
          description: string
          period_end: string
          period_start: string
          requirements: string
          target_market: string
          title: string
          updated_at?: string
        }
        Update: {
          advertiser_id?: string
          budget?: number
          campaign_id?: string
          campaign_status?:
            | Database["public"]["Enums"]["campaign_status"]
            | null
          created_at?: string
          description?: string
          period_end?: string
          period_start?: string
          requirements?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: "approved" | "rejected" | "completed" | "pending"
      campaign_status:
        | "draft"
        | "published"
        | "closed"
        | "cancelled"
        | "completed"
      role: "advertiser" | "influencer" | "admin"
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
