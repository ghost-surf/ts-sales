export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          nuit: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          nuit?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          nuit?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      counters: {
        Row: {
          id: string
          last_number: number
          type: string
          year: number
        }
        Insert: {
          id?: string
          last_number?: number
          type: string
          year: number
        }
        Update: {
          id?: string
          last_number?: number
          type?: string
          year?: number
        }
        Relationships: []
      }
      document_items: {
        Row: {
          created_at: string
          description: string
          document_id: string
          id: string
          item_id: string
          item_type: string
          line_total: number
          quantity: number
          unit: Database["public"]["Enums"]["unit_type"] | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          document_id: string
          id?: string
          item_id: string
          item_type: string
          line_total: number
          quantity?: number
          unit?: Database["public"]["Enums"]["unit_type"] | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          document_id?: string
          id?: string
          item_id?: string
          item_type?: string
          line_total?: number
          quantity?: number
          unit?: Database["public"]["Enums"]["unit_type"] | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string
          code: string
          created_at: string
          discount_applied: boolean
          discount_value: number
          id: string
          operator_id: string
          status: Database["public"]["Enums"]["document_status"]
          subtotal_products: number
          subtotal_services: number
          total: number
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          vat_applied: boolean
          vat_value: number
        }
        Insert: {
          client_id: string
          code: string
          created_at?: string
          discount_applied?: boolean
          discount_value?: number
          id?: string
          operator_id: string
          status?: Database["public"]["Enums"]["document_status"]
          subtotal_products?: number
          subtotal_services?: number
          total?: number
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          vat_applied?: boolean
          vat_value?: number
        }
        Update: {
          client_id?: string
          code?: string
          created_at?: string
          discount_applied?: boolean
          discount_value?: number
          id?: string
          operator_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          subtotal_products?: number
          subtotal_services?: number
          total?: number
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          vat_applied?: boolean
          vat_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_documents: {
        Row: {
          amount: number
          document_id: string
          id: string
          payment_id: string
        }
        Insert: {
          amount: number
          document_id: string
          id?: string
          payment_id: string
        }
        Update: {
          amount?: number
          document_id?: string
          id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_documents_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          cheque_number: string | null
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          operator_id: string
          payment_date: string
          receipt_code: string
        }
        Insert: {
          amount: number
          cheque_number?: string | null
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          operator_id: string
          payment_date?: string
          receipt_code: string
        }
        Update: {
          amount?: number
          cheque_number?: string | null
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          operator_id?: string
          payment_date?: string
          receipt_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          low_stock_threshold: number
          name: string
          price: number
          stock_qty: number
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          low_stock_threshold?: number
          name: string
          price: number
          stock_qty?: number
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          low_stock_threshold?: number
          name?: string
          price?: number
          stock_qty?: number
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          note: string | null
          product_id: string
          quantity: number
          type: Database["public"]["Enums"]["movement_type"]
          unit: Database["public"]["Enums"]["unit_type"]
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          note?: string | null
          product_id: string
          quantity: number
          type: Database["public"]["Enums"]["movement_type"]
          unit: Database["public"]["Enums"]["unit_type"]
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          note?: string | null
          product_id?: string
          quantity?: number
          type?: Database["public"]["Enums"]["movement_type"]
          unit?: Database["public"]["Enums"]["unit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      document_status: "draft" | "issued" | "paid" | "canceled"
      document_type: "FACT" | "COT"
      movement_type: "debit" | "credit"
      payment_method: "numerario" | "cheque"
      unit_type: "metros" | "pcs"
      user_role: "admin" | "operador"
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
  public: {
    Enums: {
      document_status: ["draft", "issued", "paid", "canceled"],
      document_type: ["FACT", "COT"],
      movement_type: ["debit", "credit"],
      payment_method: ["numerario", "cheque"],
      unit_type: ["metros", "pcs"],
      user_role: ["admin", "operador"],
    },
  },
} as const
