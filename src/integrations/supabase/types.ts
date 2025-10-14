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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bulk_order_requests: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          product_interest: string
          quantity: number
          requirements: string | null
          status: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          product_interest: string
          quantity: number
          requirements?: string | null
          status?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          product_interest?: string
          quantity?: number
          requirements?: string | null
          status?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          created_at: string | null
          full_name: string
          id: string
          is_default: boolean | null
          phone: string
          pincode: string
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          created_at?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          phone: string
          pincode: string
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_1: string
          address_2: string | null
          alt_phone: string | null
          city: string
          company_name: string
          country: string
          created_at: string
          email: string
          gst_number: string | null
          id: string
          is_active: boolean
          phone: string
          pincode: string
          state: string
        }
        Insert: {
          address_1: string
          address_2?: string | null
          alt_phone?: string | null
          city: string
          company_name: string
          country?: string
          created_at?: string
          email: string
          gst_number?: string | null
          id?: string
          is_active?: boolean
          phone: string
          pincode: string
          state: string
        }
        Update: {
          address_1?: string
          address_2?: string | null
          alt_phone?: string | null
          city?: string
          company_name?: string
          country?: string
          created_at?: string
          email?: string
          gst_number?: string | null
          id?: string
          is_active?: boolean
          phone?: string
          pincode?: string
          state?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          hsn_code: string
          id: string
          invoice_id: string
          price: number
          product_code: string
          product_id: string
          quantity: number
        }
        Insert: {
          amount: number
          hsn_code: string
          id?: string
          invoice_id: string
          price: number
          product_code: string
          product_id: string
          quantity: number
        }
        Update: {
          amount?: number
          hsn_code?: string
          id?: string
          invoice_id?: string
          price?: number
          product_code?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_settings: {
        Row: {
          current_invoice_number: number
          id: string
          updated_at: string
        }
        Insert: {
          current_invoice_number?: number
          id?: string
          updated_at?: string
        }
        Update: {
          current_invoice_number?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          cgst_amount: number
          cgst_rate: number
          created_at: string
          customer_id: string
          delivery_address: string
          id: string
          igst_amount: number
          igst_rate: number
          invoice_date: string
          invoice_number: number
          invoice_type: string
          number_of_packages: number
          purchase_order_no: string | null
          sgst_amount: number
          sgst_rate: number
          status: string
          subtotal: number
          terms_and_conditions: string[] | null
          total_amount: number
        }
        Insert: {
          cgst_amount?: number
          cgst_rate?: number
          created_at?: string
          customer_id: string
          delivery_address: string
          id?: string
          igst_amount?: number
          igst_rate?: number
          invoice_date: string
          invoice_number: number
          invoice_type: string
          number_of_packages: number
          purchase_order_no?: string | null
          sgst_amount?: number
          sgst_rate?: number
          status?: string
          subtotal: number
          terms_and_conditions?: string[] | null
          total_amount: number
        }
        Update: {
          cgst_amount?: number
          cgst_rate?: number
          created_at?: string
          customer_id?: string
          delivery_address?: string
          id?: string
          igst_amount?: number
          igst_rate?: number
          invoice_date?: string
          invoice_number?: number
          invoice_type?: string
          number_of_packages?: number
          purchase_order_no?: string | null
          sgst_amount?: number
          sgst_rate?: number
          status?: string
          subtotal?: number
          terms_and_conditions?: string[] | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_code: string | null
          product_id: string
          product_image_url: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_code?: string | null
          product_id: string
          product_image_url: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_code?: string | null
          product_id?: string
          product_image_url?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_notes: string | null
          delivered_at: string | null
          delivery_address_line_1: string
          delivery_address_line_2: string | null
          delivery_city: string
          delivery_name: string
          delivery_phone: string
          delivery_pincode: string
          delivery_state: string
          id: string
          order_number: string
          payment_method: string
          shipped_at: string | null
          shipping_charges: number | null
          status: string
          subtotal: number
          total_amount: number
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_address_line_1: string
          delivery_address_line_2?: string | null
          delivery_city: string
          delivery_name: string
          delivery_phone: string
          delivery_pincode: string
          delivery_state: string
          id?: string
          order_number?: string
          payment_method?: string
          shipped_at?: string | null
          shipping_charges?: number | null
          status?: string
          subtotal: number
          total_amount: number
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_address_line_1?: string
          delivery_address_line_2?: string | null
          delivery_city?: string
          delivery_name?: string
          delivery_phone?: string
          delivery_pincode?: string
          delivery_state?: string
          id?: string
          order_number?: string
          payment_method?: string
          shipped_at?: string | null
          shipping_charges?: number | null
          status?: string
          subtotal?: number
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_images: Json | null
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          fabric: string
          hsn_code: string | null
          id: string
          image_url: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          is_signature: boolean | null
          name: string
          price: number | null
          product_code: string | null
        }
        Insert: {
          additional_images?: Json | null
          category: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          fabric: string
          hsn_code?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_signature?: boolean | null
          name: string
          price?: number | null
          product_code?: string | null
        }
        Update: {
          additional_images?: Json | null
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          fabric?: string
          hsn_code?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_signature?: boolean | null
          name?: string
          price?: number | null
          product_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
