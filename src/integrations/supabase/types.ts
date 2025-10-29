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
      branches: {
        Row: {
          address: string
          building_name: string
          building_size: number
          building_type: string
          created_at: string
          electricity_sanctioned: string | null
          facilities: string[] | null
          id: string
          is_active: boolean
          is_main_building: boolean
          is_manufacturing_unit: boolean
          is_outlet: boolean
          monthly_rent: number
          notes: string | null
          owner_name: string
          owner_number: string
          updated_at: string
        }
        Insert: {
          address: string
          building_name: string
          building_size: number
          building_type: string
          created_at?: string
          electricity_sanctioned?: string | null
          facilities?: string[] | null
          id?: string
          is_active?: boolean
          is_main_building?: boolean
          is_manufacturing_unit?: boolean
          is_outlet?: boolean
          monthly_rent: number
          notes?: string | null
          owner_name: string
          owner_number: string
          updated_at?: string
        }
        Update: {
          address?: string
          building_name?: string
          building_size?: number
          building_type?: string
          created_at?: string
          electricity_sanctioned?: string | null
          facilities?: string[] | null
          id?: string
          is_active?: boolean
          is_main_building?: boolean
          is_manufacturing_unit?: boolean
          is_outlet?: boolean
          monthly_rent?: number
          notes?: string | null
          owner_name?: string
          owner_number?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          selected_color: string | null
          selected_size: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
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
      employee_contacts: {
        Row: {
          address: string
          alternative_contact: string
          created_at: string
          date_of_joining: string | null
          department: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string
          photo: string | null
          salary: number | null
          updated_at: string
        }
        Insert: {
          address: string
          alternative_contact: string
          created_at?: string
          date_of_joining?: string | null
          department: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone: string
          photo?: string | null
          salary?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          alternative_contact?: string
          created_at?: string
          date_of_joining?: string | null
          department?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string
          photo?: string | null
          salary?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string
          expense_date: string
          id: string
          is_approved: boolean
          notes: string | null
          payment_method: string
          receipt_number: string | null
          subcategory: string
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          is_approved?: boolean
          notes?: string | null
          payment_method?: string
          receipt_number?: string | null
          subcategory: string
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_approved?: boolean
          notes?: string | null
          payment_method?: string
          receipt_number?: string | null
          subcategory?: string
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
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
          bank_account_display: string | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          company_address: string | null
          company_email: string | null
          company_gst_number: string | null
          company_logo_path: string | null
          company_name: string | null
          company_phone: string | null
          company_tagline: string | null
          company_website: string | null
          current_invoice_number: number
          default_terms: Json | null
          id: string
          payment_modes: string | null
          place_of_supply: string | null
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          bank_account_display?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          company_address?: string | null
          company_email?: string | null
          company_gst_number?: string | null
          company_logo_path?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_tagline?: string | null
          company_website?: string | null
          current_invoice_number?: number
          default_terms?: Json | null
          id?: string
          payment_modes?: string | null
          place_of_supply?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          bank_account_display?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          company_address?: string | null
          company_email?: string | null
          company_gst_number?: string | null
          company_logo_path?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_tagline?: string | null
          company_website?: string | null
          current_invoice_number?: number
          default_terms?: Json | null
          id?: string
          payment_modes?: string | null
          place_of_supply?: string | null
          updated_at?: string
          upi_id?: string | null
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
          discount: number | null
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
          discount?: number | null
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
          discount?: number | null
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
          selected_color: string | null
          selected_size: string | null
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
          selected_color?: string | null
          selected_size?: string | null
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
          selected_color?: string | null
          selected_size?: string | null
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
      pending_user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          email: string
          id: string
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          category: string
          created_at: string | null
          description: string
          id: string
          name: string
          resource: string
        }
        Insert: {
          action: string
          category: string
          created_at?: string | null
          description: string
          id?: string
          name: string
          resource: string
        }
        Update: {
          action?: string
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      product_materials: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity_required: number
          raw_material_id: string
          updated_at: string
          wastage_percentage: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity_required?: number
          raw_material_id: string
          updated_at?: string
          wastage_percentage?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity_required?: number
          raw_material_id?: string
          updated_at?: string
          wastage_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          actual_quantity: number
          batch_number: string
          completed_at: string | null
          cost_per_piece: number
          created_at: string
          id: string
          notes: string | null
          product_id: string
          started_at: string
          status: string
          target_quantity: number
          total_cost: number
          total_labor_cost: number
          total_material_cost: number
          total_overhead_cost: number
          updated_at: string
        }
        Insert: {
          actual_quantity?: number
          batch_number?: string
          completed_at?: string | null
          cost_per_piece?: number
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          started_at?: string
          status?: string
          target_quantity?: number
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
          total_overhead_cost?: number
          updated_at?: string
        }
        Update: {
          actual_quantity?: number
          batch_number?: string
          completed_at?: string | null
          cost_per_piece?: number
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          started_at?: string
          status?: string
          target_quantity?: number
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
          total_overhead_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_labor_costs: {
        Row: {
          cost_per_hour: number
          hours_spent: number
          id: string
          labor_type: string
          notes: string | null
          production_batch_id: string
          recorded_at: string
          total_cost: number
          worker_name: string | null
        }
        Insert: {
          cost_per_hour?: number
          hours_spent?: number
          id?: string
          labor_type: string
          notes?: string | null
          production_batch_id: string
          recorded_at?: string
          total_cost?: number
          worker_name?: string | null
        }
        Update: {
          cost_per_hour?: number
          hours_spent?: number
          id?: string
          labor_type?: string
          notes?: string | null
          production_batch_id?: string
          recorded_at?: string
          total_cost?: number
          worker_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_labor_costs_production_batch_id_fkey"
            columns: ["production_batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      production_material_usage: {
        Row: {
          cost_at_time: number
          id: string
          notes: string | null
          production_batch_id: string
          quantity_used: number
          raw_material_id: string
          recorded_at: string
          total_cost: number
        }
        Insert: {
          cost_at_time?: number
          id?: string
          notes?: string | null
          production_batch_id: string
          quantity_used?: number
          raw_material_id: string
          recorded_at?: string
          total_cost?: number
        }
        Update: {
          cost_at_time?: number
          id?: string
          notes?: string | null
          production_batch_id?: string
          quantity_used?: number
          raw_material_id?: string
          recorded_at?: string
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_material_usage_production_batch_id_fkey"
            columns: ["production_batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_material_usage_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      production_overhead_costs: {
        Row: {
          amount: number
          cost_type: string
          description: string | null
          id: string
          production_batch_id: string
          recorded_at: string
        }
        Insert: {
          amount?: number
          cost_type: string
          description?: string | null
          id?: string
          production_batch_id: string
          recorded_at?: string
        }
        Update: {
          amount?: number
          cost_type?: string
          description?: string | null
          id?: string
          production_batch_id?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_overhead_costs_production_batch_id_fkey"
            columns: ["production_batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: Json | null
          available_colors: Json | null
          available_sizes: Json | null
          category: string
          created_at: string | null
          description: string | null
          discount_percentage: number | null
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
          offer_message: string | null
          price: number | null
          product_code: string | null
          should_remove: boolean | null
        }
        Insert: {
          additional_images?: Json | null
          available_colors?: Json | null
          available_sizes?: Json | null
          category: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
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
          offer_message?: string | null
          price?: number | null
          product_code?: string | null
          should_remove?: boolean | null
        }
        Update: {
          additional_images?: Json | null
          available_colors?: Json | null
          available_sizes?: Json | null
          category?: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
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
          offer_message?: string | null
          price?: number | null
          product_code?: string | null
          should_remove?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          marital_status: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id: string
          marital_status?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          marital_status?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      raw_materials: {
        Row: {
          cost_per_unit: number
          created_at: string
          current_stock: number
          id: string
          is_active: boolean
          name: string
          notes: string | null
          reorder_level: number
          supplier_contact: string | null
          supplier_name: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string
          current_stock?: number
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          reorder_level?: number
          supplier_contact?: string | null
          supplier_name?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          current_stock?: number
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          reorder_level?: number
          supplier_contact?: string | null
          supplier_name?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_system_role: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_system_role?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_system_role?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_batch_costs: { Args: { batch_id: string }; Returns: undefined }
      create_role: {
        Args: {
          _description?: string
          _display_name: string
          _name: string
          _permission_ids?: string[]
        }
        Returns: string
      }
      delete_role: { Args: { _role_name: string }; Returns: boolean }
      generate_batch_number: { Args: never; Returns: string }
      generate_fy_invoice_number: {
        Args: { invoice_date: string; invoice_num: number }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      get_all_roles: {
        Args: never
        Returns: {
          description: string
          display_name: string
          is_system_role: boolean
          name: string
          permission_count: number
          user_count: number
        }[]
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          action: string
          category: string
          description: string
          permission_name: string
          resource: string
        }[]
      }
      has_permission: {
        Args: { _permission_name: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      expense_category:
        | "branch_setup"
        | "electrical"
        | "plumbing"
        | "carpentry"
        | "painting"
        | "labour"
        | "materials"
        | "equipment"
        | "maintenance"
        | "utilities"
        | "travel"
        | "food"
        | "office_supplies"
        | "rent"
        | "other"
        | "security"
        | "machinery"
        | "raw_materials"
        | "materials_purchase"
        | "professional_fees"
        | "marketing"
        | "insurance"
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
      expense_category: [
        "branch_setup",
        "electrical",
        "plumbing",
        "carpentry",
        "painting",
        "labour",
        "materials",
        "equipment",
        "maintenance",
        "utilities",
        "travel",
        "food",
        "office_supplies",
        "rent",
        "other",
        "security",
        "machinery",
        "raw_materials",
        "materials_purchase",
        "professional_fees",
        "marketing",
        "insurance",
      ],
    },
  },
} as const
