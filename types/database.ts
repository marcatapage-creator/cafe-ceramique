export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ceramic_pieces: {
        Row: {
          client_id: string
          collected_at: string | null
          created_at: string
          fired_at: string | null
          firing_batch_id: string | null
          id: string
          painted_at: string
          piece_name: string | null
          piece_price: number | null
          queued_at: string | null
          ready_at: string | null
          session_id: string
          status: string
          table_group_id: string | null
          token: string
        }
        Insert: {
          client_id: string
          collected_at?: string | null
          created_at?: string
          fired_at?: string | null
          firing_batch_id?: string | null
          id?: string
          painted_at?: string
          piece_name?: string | null
          piece_price?: number | null
          queued_at?: string | null
          ready_at?: string | null
          session_id: string
          status?: string
          table_group_id?: string | null
          token: string
        }
        Update: {
          client_id?: string
          collected_at?: string | null
          created_at?: string
          fired_at?: string | null
          firing_batch_id?: string | null
          id?: string
          painted_at?: string
          piece_name?: string | null
          piece_price?: number | null
          queued_at?: string | null
          ready_at?: string | null
          session_id?: string
          status?: string
          table_group_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "ceramic_pieces_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ceramic_pieces_firing_batch_id_fkey"
            columns: ["firing_batch_id"]
            isOneToOne: false
            referencedRelation: "firing_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ceramic_pieces_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ceramic_pieces_table_group_id_fkey"
            columns: ["table_group_id"]
            isOneToOne: false
            referencedRelation: "table_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      firing_batches: {
        Row: {
          created_at: string
          fired_at: string | null
          id: string
          label: string
          notes: string | null
          planned_date: string | null
          status: string
        }
        Insert: {
          created_at?: string
          fired_at?: string | null
          id?: string
          label: string
          notes?: string | null
          planned_date?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          fired_at?: string | null
          id?: string
          label?: string
          notes?: string | null
          planned_date?: string | null
          status?: string
        }
        Relationships: []
      }
      notifications_log: {
        Row: {
          channel: string
          client_id: string | null
          error: string | null
          id: string
          payload: Json | null
          sent_at: string
          type: string
        }
        Insert: {
          channel: string
          client_id?: string | null
          error?: string | null
          id?: string
          payload?: Json | null
          sent_at?: string
          type: string
        }
        Update: {
          channel?: string
          client_id?: string | null
          error?: string | null
          id?: string
          payload?: Json | null
          sent_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string
          id: string
          items: Json
          notes: string | null
          ordered_at: string
          served_at: string | null
          session_id: string
          status: string
          table_group_id: string | null
          total: number
        }
        Insert: {
          client_id: string
          id?: string
          items?: Json
          notes?: string | null
          ordered_at?: string
          served_at?: string | null
          session_id: string
          status?: string
          table_group_id?: string | null
          total?: number
        }
        Update: {
          client_id?: string
          id?: string
          items?: Json
          notes?: string | null
          ordered_at?: string
          served_at?: string | null
          session_id?: string
          status?: string
          table_group_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_group_id_fkey"
            columns: ["table_group_id"]
            isOneToOne: false
            referencedRelation: "table_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_tables: {
        Row: {
          id: number
          is_active: boolean
          label: string
          pos_x: number | null
          pos_y: number | null
          qr_url: string | null
          seats: number
        }
        Insert: {
          id: number
          is_active?: boolean
          label: string
          pos_x?: number | null
          pos_y?: number | null
          qr_url?: string | null
          seats?: number
        }
        Update: {
          id?: number
          is_active?: boolean
          label?: string
          pos_x?: number | null
          pos_y?: number | null
          qr_url?: string | null
          seats?: number
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancelled_at: string | null
          client_id: string
          confirmed_at: string | null
          created_at: string
          id: string
          nb_participants: number
          notes: string | null
          session_id: string
          status: string
          table_group_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          client_id: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          nb_participants: number
          notes?: string | null
          session_id: string
          status?: string
          table_group_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          client_id?: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          nb_participants?: number
          notes?: string | null
          session_id?: string
          status?: string
          table_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_group_id_fkey"
            columns: ["table_group_id"]
            isOneToOne: false
            referencedRelation: "table_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          capacity: number
          created_at: string
          date: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          status: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          status?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          status?: string
        }
        Relationships: []
      }
      table_group_members: {
        Row: {
          physical_table_id: number
          table_group_id: string
        }
        Insert: {
          physical_table_id: number
          table_group_id: string
        }
        Update: {
          physical_table_id?: number
          table_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_group_members_physical_table_id_fkey"
            columns: ["physical_table_id"]
            isOneToOne: false
            referencedRelation: "physical_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_group_members_table_group_id_fkey"
            columns: ["table_group_id"]
            isOneToOne: false
            referencedRelation: "table_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      table_groups: {
        Row: {
          created_at: string
          id: string
          label: string
          qr_code_slug: string | null
          qr_code_url: string | null
          reference_table: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          qr_code_slug?: string | null
          qr_code_url?: string | null
          reference_table: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          qr_code_slug?: string | null
          qr_code_url?: string | null
          reference_table?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_groups_reference_table_fkey"
            columns: ["reference_table"]
            isOneToOne: false
            referencedRelation: "physical_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_groups_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_reservation: {
        Args: {
          p_client_id: string
          p_nb_participants: number
          p_notes?: string
          p_session_id: string
        }
        Returns: {
          cancelled_at: string | null
          client_id: string
          confirmed_at: string | null
          created_at: string
          id: string
          nb_participants: number
          notes: string | null
          session_id: string
          status: string
          table_group_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_piece_by_token: {
        Args: { p_token: string }
        Returns: {
          client_first_name: string
          collected_at: string
          fired_at: string
          painted_at: string
          piece_name: string
          queued_at: string
          ready_at: string
          status: string
          token: string
        }[]
      }
      get_session_available_seats: {
        Args: { p_session_id: string }
        Returns: number
      }
      get_table_page_state: { Args: { p_table_id: number }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// ============================================================
// Types utilitaires — régénérer après chaque migration :
// npm exec -- supabase gen types typescript --local > types/database.ts
// ============================================================

export type Client      = Database['public']['Tables']['clients']['Row']
export type Session     = Database['public']['Tables']['sessions']['Row']
export type PhysicalTable = Database['public']['Tables']['physical_tables']['Row']
export type TableGroup  = Database['public']['Tables']['table_groups']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type CeramicPiece = Database['public']['Tables']['ceramic_pieces']['Row']
export type FiringBatch = Database['public']['Tables']['firing_batches']['Row']
export type Order       = Database['public']['Tables']['orders']['Row']

export type PieceStatus   = 'painted' | 'queued' | 'firing' | 'ready' | 'collected'
export type SessionStatus = 'scheduled' | 'active' | 'closed'
export type TablePageState = 'active' | 'waiting'

export interface OrderItem {
  name: string
  price: number
  qty: number
}

export interface TablePageStateResult {
  state: TablePageState
  session: Session | null
  next_session: Session | null
}
