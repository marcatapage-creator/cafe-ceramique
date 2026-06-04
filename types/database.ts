// Types générés manuellement — à remplacer par `supabase gen types typescript`
// après avoir branché le projet Supabase.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type PieceStatus = 'painted' | 'queued' | 'firing' | 'ready' | 'collected'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show'
export type OrderStatus = 'pending' | 'served' | 'cancelled'
export type FiringBatchStatus = 'open' | 'firing' | 'done'
export type NotificationChannel = 'email' | 'sms' | 'admin'

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          email: string
          first_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          capacity: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      physical_tables: {
        Row: {
          id: number
          label: string
          seats: number
          pos_x: number | null
          pos_y: number | null
          is_active: boolean
        }
        Insert: Database['public']['Tables']['physical_tables']['Row']
        Update: Partial<Database['public']['Tables']['physical_tables']['Row']>
      }
      table_groups: {
        Row: {
          id: string
          session_id: string
          reference_table: number
          label: string
          qr_code_url: string | null
          qr_code_slug: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['table_groups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['table_groups']['Insert']>
      }
      table_group_members: {
        Row: {
          table_group_id: string
          physical_table_id: number
        }
        Insert: Database['public']['Tables']['table_group_members']['Row']
        Update: never
      }
      reservations: {
        Row: {
          id: string
          session_id: string
          client_id: string
          table_group_id: string | null
          nb_participants: number
          status: ReservationStatus
          notes: string | null
          confirmed_at: string | null
          cancelled_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reservations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reservations']['Insert']>
      }
      firing_batches: {
        Row: {
          id: string
          label: string
          planned_date: string | null
          fired_at: string | null
          status: FiringBatchStatus
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['firing_batches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['firing_batches']['Insert']>
      }
      ceramic_pieces: {
        Row: {
          id: string
          token: string
          client_id: string
          session_id: string
          table_group_id: string | null
          firing_batch_id: string | null
          piece_name: string | null
          piece_price: number | null
          status: PieceStatus
          painted_at: string
          queued_at: string | null
          fired_at: string | null
          ready_at: string | null
          collected_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ceramic_pieces']['Row'], 'id' | 'created_at' | 'painted_at'>
        Update: Partial<Database['public']['Tables']['ceramic_pieces']['Insert']>
      }
      orders: {
        Row: {
          id: string
          client_id: string
          session_id: string
          table_group_id: string | null
          items: OrderItem[]
          total: number
          status: OrderStatus
          notes: string | null
          ordered_at: string
          served_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'ordered_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      notifications_log: {
        Row: {
          id: string
          client_id: string | null
          type: string
          channel: NotificationChannel
          payload: Json | null
          sent_at: string
          error: string | null
        }
        Insert: Omit<Database['public']['Tables']['notifications_log']['Row'], 'id' | 'sent_at'>
        Update: never
      }
    }
    Functions: {
      get_piece_by_token: {
        Args: { p_token: string }
        Returns: {
          token: string
          piece_name: string | null
          status: PieceStatus
          painted_at: string
          queued_at: string | null
          fired_at: string | null
          ready_at: string | null
          collected_at: string | null
          client_first_name: string
        }[]
      }
      get_session_available_seats: {
        Args: { p_session_id: string }
        Returns: number
      }
      create_reservation: {
        Args: {
          p_session_id: string
          p_client_id: string
          p_nb_participants: number
          p_notes?: string
        }
        Returns: Database['public']['Tables']['reservations']['Row']
      }
    }
  }
}

export interface OrderItem {
  name: string
  price: number
  qty: number
}

// Types utilitaires
export type Client = Database['public']['Tables']['clients']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type PhysicalTable = Database['public']['Tables']['physical_tables']['Row']
export type TableGroup = Database['public']['Tables']['table_groups']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type CeramicPiece = Database['public']['Tables']['ceramic_pieces']['Row']
export type FiringBatch = Database['public']['Tables']['firing_batches']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
