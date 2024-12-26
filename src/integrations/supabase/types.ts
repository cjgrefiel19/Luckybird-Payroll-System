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
      client_invoices: {
        Row: {
          client_name: string | null
          created_at: string
          date: string
          id: string
          link: string | null
          payroll_record_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          date: string
          id?: string
          link?: string | null
          payroll_record_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          date?: string
          id?: string
          link?: string | null
          payroll_record_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invoices_payroll_record_id_fkey"
            columns: ["payroll_record_id"]
            isOneToOne: false
            referencedRelation: "payroll_records"
            referencedColumns: ["id"]
          },
        ]
      }
      deductions: {
        Row: {
          agent_name: string
          amount: number
          created_at: string
          date: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          agent_name: string
          amount: number
          created_at?: string
          date: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          agent_name?: string
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_acceptance: {
        Row: {
          accepted_at: string | null
          agent_name: string
          created_at: string
          id: string
          payroll_record_id: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          agent_name: string
          created_at?: string
          id?: string
          payroll_record_id?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          agent_name?: string
          created_at?: string
          id?: string
          payroll_record_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_acceptance_payroll_record_id_fkey"
            columns: ["payroll_record_id"]
            isOneToOne: false
            referencedRelation: "payroll_records"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          created_at: string
          end_date: string
          id: string
          notes: string | null
          pay_date: string
          start_date: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          pay_date: string
          start_date: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          pay_date?: string
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reimbursements: {
        Row: {
          agent_name: string
          amount: number
          created_at: string
          date: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          agent_name: string
          amount: number
          created_at?: string
          date: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          agent_name?: string
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_schedules: {
        Row: {
          agent_name: string
          created_at: string
          hourly_rate: number
          id: string
          monthly_rate: number
          restdays: string
          time_in: string
          time_out: string
          updated_at: string
          workdays: string
        }
        Insert: {
          agent_name: string
          created_at?: string
          hourly_rate: number
          id?: string
          monthly_rate: number
          restdays: string
          time_in: string
          time_out: string
          updated_at?: string
          workdays: string
        }
        Update: {
          agent_name?: string
          created_at?: string
          hourly_rate?: number
          id?: string
          monthly_rate?: number
          restdays?: string
          time_in?: string
          time_out?: string
          updated_at?: string
          workdays?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          agent_name: string
          created_at: string
          daily_earnings: number
          date: string
          hourly_rate: number
          id: string
          ot_pay: number
          shift_type: string
          time_in: string
          time_out: string
          total_working_hours: number
          updated_at: string
        }
        Insert: {
          agent_name: string
          created_at?: string
          daily_earnings: number
          date: string
          hourly_rate: number
          id?: string
          ot_pay?: number
          shift_type: string
          time_in: string
          time_out: string
          total_working_hours: number
          updated_at?: string
        }
        Update: {
          agent_name?: string
          created_at?: string
          daily_earnings?: number
          date?: string
          hourly_rate?: number
          id?: string
          ot_pay?: number
          shift_type?: string
          time_in?: string
          time_out?: string
          total_working_hours?: number
          updated_at?: string
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