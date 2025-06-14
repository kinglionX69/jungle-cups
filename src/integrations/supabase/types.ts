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
      game_transactions: {
        Row: {
          amount: number
          created_at: string
          game_id: string
          id: string
          player_address: string
          status: string
          token_type: string
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          game_id: string
          id?: string
          player_address: string
          status?: string
          token_type: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          game_id?: string
          id?: string
          player_address?: string
          status?: string
          token_type?: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          apt_won: number
          created_at: string
          emoji_won: number
          games_played: number
          id: string
          losses: number
          referrals: number
          updated_at: string
          wallet_address: string
          win_rate: number
          wins: number
        }
        Insert: {
          apt_won?: number
          created_at?: string
          emoji_won?: number
          games_played?: number
          id?: string
          losses?: number
          referrals?: number
          updated_at?: string
          wallet_address: string
          win_rate?: number
          wins?: number
        }
        Update: {
          apt_won?: number
          created_at?: string
          emoji_won?: number
          games_played?: number
          id?: string
          losses?: number
          referrals?: number
          updated_at?: string
          wallet_address?: string
          win_rate?: number
          wins?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          is_activated: boolean | null
          referred_address: string
          referrer_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_activated?: boolean | null
          referred_address: string
          referrer_address: string
        }
        Update: {
          created_at?: string
          id?: string
          is_activated?: boolean | null
          referred_address?: string
          referrer_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_referred"
            columns: ["referred_address"]
            isOneToOne: true
            referencedRelation: "player_stats"
            referencedColumns: ["wallet_address"]
          },
          {
            foreignKeyName: "fk_referrer"
            columns: ["referrer_address"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_referral: {
        Args: { referred_wallet: string }
        Returns: undefined
      }
      count_activated_referrals: {
        Args: { player_wallet: string }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
