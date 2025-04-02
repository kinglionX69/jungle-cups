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
        Args: {
          referred_wallet: string
        }
        Returns: undefined
      }
      count_activated_referrals: {
        Args: {
          player_wallet: string
        }
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
