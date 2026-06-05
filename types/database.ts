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
          group_session_id: string
          id: string
          painted_at: string
          piece_name: string | null
          piece_price: number | null
          queued_at: string | null
          ready_at: string | null
          status: string
          token: string
        }
        Insert: {
          client_id: string
          collected_at?: string | null
          created_at?: string
          fired_at?: string | null
          firing_batch_id?: string | null
          group_session_id: string
          id?: string
          painted_at?: string
          piece_name?: string | null
          piece_price?: number | null
          queued_at?: string | null
          ready_at?: string | null
          status?: string
          token: string
        }
        Update: {
          client_id?: string
          collected_at?: string | null
          created_at?: string
          fired_at?: string | null
          firing_batch_id?: string | null
          group_session_id?: string
          id?: string
          painted_at?: string
          piece_name?: string | null
          piece_price?: number | null
          queued_at?: string | null
          ready_at?: string | null
          status?: string
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
            foreignKeyName: "ceramic_pieces_group_session_id_fkey"
            columns: ["group_session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
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
          last_name: string | null
          phone: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      closed_dates: {
        Row: {
          date: string
          id: string
          reason: string | null
        }
        Insert: {
          date: string
          id?: string
          reason?: string | null
        }
        Update: {
          date?: string
          id?: string
          reason?: string | null
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
      group_session_reservations: {
        Row: {
          group_session_id: string
          reservation_id: string
        }
        Insert: {
          group_session_id: string
          reservation_id: string
        }
        Update: {
          group_session_id?: string
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_session_reservations_group_session_id_fkey"
            columns: ["group_session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_session_reservations_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_session_tables: {
        Row: {
          group_session_id: string
          physical_table_id: number
        }
        Insert: {
          group_session_id: string
          physical_table_id: number
        }
        Update: {
          group_session_id?: string
          physical_table_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_session_tables_group_session_id_fkey"
            columns: ["group_session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_session_tables_physical_table_id_fkey"
            columns: ["physical_table_id"]
            isOneToOne: false
            referencedRelation: "physical_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      group_sessions: {
        Row: {
          closed_at: string | null
          created_at: string
          ends_at: string | null
          id: string
          nb_participants: number
          notes: string | null
          qr_token: string
          starts_at: string
          status: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          nb_participants?: number
          notes?: string | null
          qr_token?: string
          starts_at: string
          status?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          nb_participants?: number
          notes?: string | null
          qr_token?: string
          starts_at?: string
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
      opening_hours: {
        Row: {
          closes_at: string
          day_of_week: number
          id: string
          is_active: boolean
          opens_at: string
        }
        Insert: {
          closes_at: string
          day_of_week: number
          id?: string
          is_active?: boolean
          opens_at: string
        }
        Update: {
          closes_at?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          opens_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client_id: string
          group_session_id: string
          id: string
          items: Json
          notes: string | null
          ordered_at: string
          served_at: string | null
          status: string
          total: number
        }
        Insert: {
          client_id: string
          group_session_id: string
          id?: string
          items?: Json
          notes?: string | null
          ordered_at?: string
          served_at?: string | null
          status?: string
          total?: number
        }
        Update: {
          client_id?: string
          group_session_id?: string
          id?: string
          items?: Json
          notes?: string | null
          ordered_at?: string
          served_at?: string | null
          status?: string
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
            foreignKeyName: "orders_group_session_id_fkey"
            columns: ["group_session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
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
          seats: number
        }
        Insert: {
          id: number
          is_active?: boolean
          label: string
          pos_x?: number | null
          pos_y?: number | null
          seats?: number
        }
        Update: {
          id?: number
          is_active?: boolean
          label?: string
          pos_x?: number | null
          pos_y?: number | null
          seats?: number
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancel_token: string
          cancellation_fee_charged: boolean
          cancelled_at: string | null
          client_id: string
          created_at: string
          ends_at: string | null
          id: string
          nb_participants: number
          notes: string | null
          starts_at: string
          status: string
          stripe_payment_method_id: string | null
        }
        Insert: {
          cancel_token?: string
          cancellation_fee_charged?: boolean
          cancelled_at?: string | null
          client_id: string
          created_at?: string
          ends_at?: string | null
          id?: string
          nb_participants: number
          notes?: string | null
          starts_at: string
          status?: string
          stripe_payment_method_id?: string | null
        }
        Update: {
          cancel_token?: string
          cancellation_fee_charged?: boolean
          cancelled_at?: string | null
          client_id?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          nb_participants?: number
          notes?: string | null
          starts_at?: string
          status?: string
          stripe_payment_method_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_reservation: { Args: { p_cancel_token: string }; Returns: Json }
      create_reservation: {
        Args: {
          p_client_id: string
          p_nb_participants: number
          p_notes?: string
          p_starts_at: string
        }
        Returns: {
          cancel_token: string
          cancellation_fee_charged: boolean
          cancelled_at: string | null
          client_id: string
          created_at: string
          ends_at: string | null
          id: string
          nb_participants: number
          notes: string | null
          starts_at: string
          status: string
          stripe_payment_method_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "reservations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_available_slots: {
        Args: { p_date: string }
        Returns: {
          available_seats: number
          is_available: boolean
          slot_start: string
          slot_time_label: string
        }[]
      }
      get_group_session_by_token: { Args: { p_token: string }; Returns: Json }
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
// npm exec -- supabase gen types typescript --local 2>/dev/null | grep -v "^Connecting\|^A new\|^We recommend" > types/database.ts
// ============================================================

export type Client         = Database['public']['Tables']['clients']['Row']
export type PhysicalTable  = Database['public']['Tables']['physical_tables']['Row']
export type OpeningHours   = Database['public']['Tables']['opening_hours']['Row']
export type ClosedDate     = Database['public']['Tables']['closed_dates']['Row']
export type Reservation    = Database['public']['Tables']['reservations']['Row']
export type GroupSession   = Database['public']['Tables']['group_sessions']['Row']
export type CeramicPiece   = Database['public']['Tables']['ceramic_pieces']['Row']
export type FiringBatch    = Database['public']['Tables']['firing_batches']['Row']
export type Order          = Database['public']['Tables']['orders']['Row']

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show'
export type GroupSessionStatus = 'active' | 'closed'
export type PieceStatus = 'painted' | 'queued' | 'firing' | 'ready' | 'collected'
export type OrderStatus = 'pending' | 'served' | 'cancelled'

export interface OrderItem {
  name: string
  price: number
  qty: number
}

export interface AvailableSlot {
  slot_start: string
  slot_time_label: string
  available_seats: number
  is_available: boolean
}

export interface GroupSessionWithTables {
  found: boolean
  expired?: boolean
  session?: GroupSession
  tables?: Array<{ id: number; label: string; seats: number }>
}
