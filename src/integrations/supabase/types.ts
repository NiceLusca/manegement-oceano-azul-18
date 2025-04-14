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
      customers: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          email: string | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          origem: string | null
          phone: string | null
          status: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          origem?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          origem?: string | null
          phone?: string | null
          status?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          departamento_id: string | null
          id: string
          nivel_acesso: string | null
          nome: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          departamento_id?: string | null
          id?: string
          nivel_acesso?: string | null
          nome?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          departamento_id?: string | null
          id?: string
          nivel_acesso?: string | null
          nome?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_tasks: {
        Row: {
          assignee_id: string
          created_at: string
          custom_days: number[] | null
          custom_months: number[] | null
          description: string | null
          end_date: string | null
          id: string
          last_generated: string | null
          recurrence_type: string
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id: string
          created_at?: string
          custom_days?: number[] | null
          custom_months?: number[] | null
          description?: string | null
          end_date?: string | null
          id?: string
          last_generated?: string | null
          recurrence_type: string
          start_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string
          created_at?: string
          custom_days?: number[] | null
          custom_months?: number[] | null
          description?: string | null
          end_date?: string | null
          id?: string
          last_generated?: string | null
          recurrence_type?: string
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_instances: {
        Row: {
          assignee_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          priority: string
          recurring_task_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          recurring_task_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          recurring_task_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_instances_recurring_task_id_fkey"
            columns: ["recurring_task_id"]
            isOneToOne: false
            referencedRelation: "recurring_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_department: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_nivel_acesso: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_or_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_supervisor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
