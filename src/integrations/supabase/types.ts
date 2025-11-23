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
      admin_settings: {
        Row: {
          created_at: string | null
          id: string
          low_stock_alerts_enabled: boolean
          low_stock_threshold: number
          notification_emails: string[]
          order_alerts_enabled: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          low_stock_alerts_enabled?: boolean
          low_stock_threshold?: number
          notification_emails?: string[]
          order_alerts_enabled?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          low_stock_alerts_enabled?: boolean
          low_stock_threshold?: number
          notification_emails?: string[]
          order_alerts_enabled?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      batch_costs: {
        Row: {
          amount: number
          batch_id: string
          cost_type: string
          created_at: string
          description: string
          id: string
          quantity: number | null
          rate_per_unit: number | null
          subcategory: string | null
          unit_type: string | null
        }
        Insert: {
          amount: number
          batch_id: string
          cost_type: string
          created_at?: string
          description: string
          id?: string
          quantity?: number | null
          rate_per_unit?: number | null
          subcategory?: string | null
          unit_type?: string | null
        }
        Update: {
          amount?: number
          batch_id?: string
          cost_type?: string
          created_at?: string
          description?: string
          id?: string
          quantity?: number | null
          rate_per_unit?: number | null
          subcategory?: string | null
          unit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_costs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_materials: {
        Row: {
          batch_id: string
          cost_per_unit: number
          created_at: string
          id: string
          material_id: string
          material_name: string
          quantity_used: number
          total_cost: number
        }
        Insert: {
          batch_id: string
          cost_per_unit: number
          created_at?: string
          id?: string
          material_id: string
          material_name: string
          quantity_used: number
          total_cost: number
        }
        Update: {
          batch_id?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          material_id?: string
          material_name?: string
          quantity_used?: number
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_materials_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_sales: {
        Row: {
          batch_id: string
          created_at: string
          customer_name: string
          id: string
          invoice_number: string | null
          notes: string | null
          price_per_piece: number
          quantity_sold: number
          sale_date: string
          total_amount: number
        }
        Insert: {
          batch_id: string
          created_at?: string
          customer_name: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          price_per_piece: number
          quantity_sold: number
          sale_date?: string
          total_amount: number
        }
        Update: {
          batch_id?: string
          created_at?: string
          customer_name?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          price_per_piece?: number
          quantity_sold?: number
          sale_date?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_sales_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
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
          selected_for_checkout: boolean
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
          selected_for_checkout?: boolean
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
          selected_for_checkout?: boolean
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
          district: string | null
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
          district?: string | null
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
          district?: string | null
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
      external_job_companies: {
        Row: {
          account_details: string | null
          address: string
          alternate_number: string | null
          company_name: string
          contact_number: string
          contact_person: string
          created_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          updated_at: string | null
          upi_id: string | null
        }
        Insert: {
          account_details?: string | null
          address: string
          alternate_number?: string | null
          company_name: string
          contact_number: string
          contact_person: string
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          upi_id?: string | null
        }
        Update: {
          account_details?: string | null
          address?: string
          alternate_number?: string | null
          company_name?: string
          contact_number?: string
          contact_person?: string
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          upi_id?: string | null
        }
        Relationships: []
      }
      external_job_invoices: {
        Row: {
          created_at: string | null
          id: string
          invoice_data: Json | null
          invoice_date: string | null
          invoice_number: string
          job_order_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_date?: string | null
          invoice_number: string
          job_order_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_date?: string | null
          invoice_number?: string
          job_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_job_invoices_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "external_job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      external_job_operation_categories: {
        Row: {
          category_name: string
          created_at: string | null
          id: string
          operation_id: string
          rate: number
        }
        Insert: {
          category_name: string
          created_at?: string | null
          id?: string
          operation_id: string
          rate: number
        }
        Update: {
          category_name?: string
          created_at?: string | null
          id?: string
          operation_id?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "external_job_operation_categories_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "external_job_operations"
            referencedColumns: ["id"]
          },
        ]
      }
      external_job_operations: {
        Row: {
          created_at: string | null
          id: string
          job_order_id: string
          operation_name: string
          total_rate: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_order_id: string
          operation_name: string
          total_rate?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_order_id?: string
          operation_name?: string
          total_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "external_job_operations_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "external_job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      external_job_orders: {
        Row: {
          accessories_cost: number | null
          balance_amount: number | null
          company_id: string
          company_profit_type: string | null
          company_profit_value: number | null
          created_at: string | null
          delivery_charge: number | null
          delivery_date: string
          id: string
          job_id: string
          job_status: string | null
          number_of_pieces: number
          paid_amount: number | null
          payment_status: string | null
          rate_per_piece: number
          style_name: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          accessories_cost?: number | null
          balance_amount?: number | null
          company_id: string
          company_profit_type?: string | null
          company_profit_value?: number | null
          created_at?: string | null
          delivery_charge?: number | null
          delivery_date: string
          id?: string
          job_id: string
          job_status?: string | null
          number_of_pieces: number
          paid_amount?: number | null
          payment_status?: string | null
          rate_per_piece?: number
          style_name: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          accessories_cost?: number | null
          balance_amount?: number | null
          company_id?: string
          company_profit_type?: string | null
          company_profit_value?: number | null
          created_at?: string | null
          delivery_charge?: number | null
          delivery_date?: string
          id?: string
          job_id?: string
          job_status?: string | null
          number_of_pieces?: number
          paid_amount?: number | null
          payment_status?: string | null
          rate_per_piece?: number
          style_name?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_job_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "external_job_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      external_job_payments: {
        Row: {
          created_at: string | null
          id: string
          job_order_id: string
          notes: string | null
          payment_amount: number
          payment_date: string | null
          payment_mode: string | null
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_order_id: string
          notes?: string | null
          payment_amount: number
          payment_date?: string | null
          payment_mode?: string | null
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_order_id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string | null
          payment_mode?: string | null
          recorded_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_job_payments_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "external_job_orders"
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
      invoice_payments: {
        Row: {
          amount_paid: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_mode: string
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
          balance_amount: number | null
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
          paid_amount: number | null
          payment_status: string | null
          purchase_order_no: string | null
          sgst_amount: number
          sgst_rate: number
          status: string
          subtotal: number
          terms_and_conditions: string[] | null
          total_amount: number
        }
        Insert: {
          balance_amount?: number | null
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
          paid_amount?: number | null
          payment_status?: string | null
          purchase_order_no?: string | null
          sgst_amount?: number
          sgst_rate?: number
          status?: string
          subtotal: number
          terms_and_conditions?: string[] | null
          total_amount: number
        }
        Update: {
          balance_amount?: number | null
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
          paid_amount?: number | null
          payment_status?: string | null
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
      job_batch_expenses: {
        Row: {
          amount: number
          batch_id: string | null
          bill_number: string | null
          created_at: string | null
          date: string
          expense_type: string
          id: string
          item_name: string
          note: string | null
          quantity: number | null
          rate_per_unit: number | null
          supplier_name: string | null
          unit: string | null
        }
        Insert: {
          amount: number
          batch_id?: string | null
          bill_number?: string | null
          created_at?: string | null
          date?: string
          expense_type: string
          id?: string
          item_name: string
          note?: string | null
          quantity?: number | null
          rate_per_unit?: number | null
          supplier_name?: string | null
          unit?: string | null
        }
        Update: {
          amount?: number
          batch_id?: string | null
          bill_number?: string | null
          created_at?: string | null
          date?: string
          expense_type?: string
          id?: string
          item_name?: string
          note?: string | null
          quantity?: number | null
          rate_per_unit?: number | null
          supplier_name?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_batch_expenses_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_batches: {
        Row: {
          batch_number: string
          checked_quantity: number | null
          color: string
          created_at: string | null
          cut_quantity: number | null
          cutting_completed: boolean | null
          cutting_data: Json | null
          date_created: string
          dye_test_result: string | null
          expected_pieces: number
          fabric_shrinkage_percent: number | null
          fabric_type: string
          fabric_width: string | null
          final_quantity: number | null
          gsm: string
          id: string
          ironing_quantity: number | null
          lot_number: string | null
          marker_efficiency: number | null
          number_of_rolls: number | null
          overall_progress: number | null
          packed_quantity: number | null
          remarks: string | null
          rolls_data: Json | null
          status: string | null
          stitched_quantity: number | null
          style_id: string | null
          supplier_name: string | null
          total_fabric_received_kg: number
          updated_at: string | null
          wastage_percent: number | null
        }
        Insert: {
          batch_number: string
          checked_quantity?: number | null
          color: string
          created_at?: string | null
          cut_quantity?: number | null
          cutting_completed?: boolean | null
          cutting_data?: Json | null
          date_created?: string
          dye_test_result?: string | null
          expected_pieces: number
          fabric_shrinkage_percent?: number | null
          fabric_type: string
          fabric_width?: string | null
          final_quantity?: number | null
          gsm: string
          id?: string
          ironing_quantity?: number | null
          lot_number?: string | null
          marker_efficiency?: number | null
          number_of_rolls?: number | null
          overall_progress?: number | null
          packed_quantity?: number | null
          remarks?: string | null
          rolls_data?: Json | null
          status?: string | null
          stitched_quantity?: number | null
          style_id?: string | null
          supplier_name?: string | null
          total_fabric_received_kg: number
          updated_at?: string | null
          wastage_percent?: number | null
        }
        Update: {
          batch_number?: string
          checked_quantity?: number | null
          color?: string
          created_at?: string | null
          cut_quantity?: number | null
          cutting_completed?: boolean | null
          cutting_data?: Json | null
          date_created?: string
          dye_test_result?: string | null
          expected_pieces?: number
          fabric_shrinkage_percent?: number | null
          fabric_type?: string
          fabric_width?: string | null
          final_quantity?: number | null
          gsm?: string
          id?: string
          ironing_quantity?: number | null
          lot_number?: string | null
          marker_efficiency?: number | null
          number_of_rolls?: number | null
          overall_progress?: number | null
          packed_quantity?: number | null
          remarks?: string | null
          rolls_data?: Json | null
          status?: string | null
          stitched_quantity?: number | null
          style_id?: string | null
          supplier_name?: string | null
          total_fabric_received_kg?: number
          updated_at?: string | null
          wastage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_batches_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "job_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_contractors: {
        Row: {
          address: string | null
          contact_person: string | null
          contractor_code: string
          contractor_name: string
          created_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean | null
          payment_terms: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          contractor_code: string
          contractor_name: string
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          contractor_code?: string
          contractor_name?: string
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_employees: {
        Row: {
          address: string | null
          contractor_id: string | null
          contractor_name: string | null
          created_at: string | null
          date_joined: string | null
          date_left: string | null
          departments: Json | null
          employee_code: string
          employee_type: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          rate_type: string | null
          salary_amount: number | null
          salary_type: string | null
        }
        Insert: {
          address?: string | null
          contractor_id?: string | null
          contractor_name?: string | null
          created_at?: string | null
          date_joined?: string | null
          date_left?: string | null
          departments?: Json | null
          employee_code: string
          employee_type: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          rate_type?: string | null
          salary_amount?: number | null
          salary_type?: string | null
        }
        Update: {
          address?: string | null
          contractor_id?: string | null
          contractor_name?: string | null
          created_at?: string | null
          date_joined?: string | null
          date_left?: string | null
          departments?: Json | null
          employee_code?: string
          employee_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          rate_type?: string | null
          salary_amount?: number | null
          salary_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_employees_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "job_contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      job_order_cost_summary: {
        Row: {
          created_at: string
          id: string
          job_order_id: string
          labour_cost: number
          material_cost: number
          misc_cost: number
          total_cost: number
          transport_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_order_id: string
          labour_cost?: number
          material_cost?: number
          misc_cost?: number
          total_cost?: number
          transport_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_order_id?: string
          labour_cost?: number
          material_cost?: number
          misc_cost?: number
          total_cost?: number
          transport_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_order_cost_summary_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: true
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      job_order_labours: {
        Row: {
          created_at: string
          id: string
          job_order_id: string
          name: string
          paid_amount: number
          payment_date: string | null
          payment_status: string
          process_assigned: string
          rate_per_piece: number
          role: string
          total_amount: number
          total_pieces: number
        }
        Insert: {
          created_at?: string
          id?: string
          job_order_id: string
          name: string
          paid_amount?: number
          payment_date?: string | null
          payment_status?: string
          process_assigned: string
          rate_per_piece?: number
          role: string
          total_amount?: number
          total_pieces?: number
        }
        Update: {
          created_at?: string
          id?: string
          job_order_id?: string
          name?: string
          paid_amount?: number
          payment_date?: string | null
          payment_status?: string
          process_assigned?: string
          rate_per_piece?: number
          role?: string
          total_amount?: number
          total_pieces?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_order_labours_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      job_order_processes: {
        Row: {
          assigned_labour: string[]
          completion_percent: number
          created_at: string
          ended_at: string | null
          id: string
          job_order_id: string
          process_name: string
          rate_per_piece: number
          started_at: string | null
          status: string
          total_cost: number
          total_pieces: number
        }
        Insert: {
          assigned_labour?: string[]
          completion_percent?: number
          created_at?: string
          ended_at?: string | null
          id?: string
          job_order_id: string
          process_name: string
          rate_per_piece?: number
          started_at?: string | null
          status?: string
          total_cost?: number
          total_pieces?: number
        }
        Update: {
          assigned_labour?: string[]
          completion_percent?: number
          created_at?: string
          ended_at?: string | null
          id?: string
          job_order_id?: string
          process_name?: string
          rate_per_piece?: number
          started_at?: string | null
          status?: string
          total_cost?: number
          total_pieces?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_order_processes_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      job_orders: {
        Row: {
          client_company: string
          contact_number: string | null
          contact_person: string
          created_at: string
          delivery_date: string
          id: string
          job_type: string
          overall_progress: number
          product_name: string
          remarks: string | null
          start_date: string
          status: string
          total_pieces: number
          updated_at: string
        }
        Insert: {
          client_company: string
          contact_number?: string | null
          contact_person: string
          created_at?: string
          delivery_date: string
          id?: string
          job_type: string
          overall_progress?: number
          product_name: string
          remarks?: string | null
          start_date: string
          status?: string
          total_pieces: number
          updated_at?: string
        }
        Update: {
          client_company?: string
          contact_number?: string | null
          contact_person?: string
          created_at?: string
          delivery_date?: string
          id?: string
          job_type?: string
          overall_progress?: number
          product_name?: string
          remarks?: string | null
          start_date?: string
          status?: string
          total_pieces?: number
          updated_at?: string
        }
        Relationships: []
      }
      job_part_payments: {
        Row: {
          amount: number
          batch_id: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          is_settled: boolean | null
          note: string | null
          payment_date: string
          payment_mode: string | null
          settlement_id: string | null
        }
        Insert: {
          amount: number
          batch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_settled?: boolean | null
          note?: string | null
          payment_date: string
          payment_mode?: string | null
          settlement_id?: string | null
        }
        Update: {
          amount?: number
          batch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_settled?: boolean | null
          note?: string | null
          payment_date?: string
          payment_mode?: string | null
          settlement_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_part_payments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_part_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "job_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_part_payments_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "job_weekly_settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      job_production_entries: {
        Row: {
          batch_id: string | null
          created_at: string | null
          date: string
          employee_id: string | null
          employee_name: string
          employee_type: string
          id: string
          quantity_completed: number
          rate_per_piece: number
          remarks: string | null
          section: string
          settlement_id: string | null
          total_amount: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string | null
          employee_name: string
          employee_type: string
          id?: string
          quantity_completed: number
          rate_per_piece: number
          remarks?: string | null
          section: string
          settlement_id?: string | null
          total_amount: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string | null
          employee_name?: string
          employee_type?: string
          id?: string
          quantity_completed?: number
          rate_per_piece?: number
          remarks?: string | null
          section?: string
          settlement_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_production_entries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_production_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "job_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_production_entries_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "job_weekly_settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      job_styles: {
        Row: {
          accessories: Json | null
          category: string | null
          created_at: string | null
          fabric_per_piece: number | null
          fabric_type: string | null
          fit: string | null
          garment_type: string | null
          gsm_range: string | null
          id: string
          is_active: boolean | null
          min_order_qty: number | null
          pattern_number: string
          rate_checking: number | null
          rate_cutting: number | null
          rate_ironing: number | null
          rate_packing: number | null
          rate_stitching_power_table: number | null
          rate_stitching_singer: number | null
          remarks: string | null
          season: string | null
          style_code: string
          style_image_url: string | null
          style_name: string
          updated_at: string | null
        }
        Insert: {
          accessories?: Json | null
          category?: string | null
          created_at?: string | null
          fabric_per_piece?: number | null
          fabric_type?: string | null
          fit?: string | null
          garment_type?: string | null
          gsm_range?: string | null
          id?: string
          is_active?: boolean | null
          min_order_qty?: number | null
          pattern_number: string
          rate_checking?: number | null
          rate_cutting?: number | null
          rate_ironing?: number | null
          rate_packing?: number | null
          rate_stitching_power_table?: number | null
          rate_stitching_singer?: number | null
          remarks?: string | null
          season?: string | null
          style_code: string
          style_image_url?: string | null
          style_name: string
          updated_at?: string | null
        }
        Update: {
          accessories?: Json | null
          category?: string | null
          created_at?: string | null
          fabric_per_piece?: number | null
          fabric_type?: string | null
          fit?: string | null
          garment_type?: string | null
          gsm_range?: string | null
          id?: string
          is_active?: boolean | null
          min_order_qty?: number | null
          pattern_number?: string
          rate_checking?: number | null
          rate_cutting?: number | null
          rate_ironing?: number | null
          rate_packing?: number | null
          rate_stitching_power_table?: number | null
          rate_stitching_singer?: number | null
          remarks?: string | null
          season?: string | null
          style_code?: string
          style_image_url?: string | null
          style_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_weekly_settlements: {
        Row: {
          advances_deducted: number | null
          batch_id: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          net_payable: number | null
          payment_date: string | null
          payment_mode: string | null
          payment_status: string | null
          remarks: string | null
          section: string | null
          settlement_date: string
          total_part_payments: number | null
          total_production_amount: number | null
          week_end_date: string | null
          week_start_date: string | null
        }
        Insert: {
          advances_deducted?: number | null
          batch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          net_payable?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          remarks?: string | null
          section?: string | null
          settlement_date?: string
          total_part_payments?: number | null
          total_production_amount?: number | null
          week_end_date?: string | null
          week_start_date?: string | null
        }
        Update: {
          advances_deducted?: number | null
          batch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          net_payable?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string | null
          remarks?: string | null
          section?: string | null
          settlement_date?: string
          total_part_payments?: number | null
          total_production_amount?: number | null
          week_end_date?: string | null
          week_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_weekly_settlements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_weekly_settlements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "job_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          available_stock: number
          created_at: string
          current_cost_per_unit: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          reorder_level: number
          unit: string
          updated_at: string
        }
        Insert: {
          available_stock?: number
          created_at?: string
          current_cost_per_unit?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          reorder_level?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          available_stock?: number
          created_at?: string
          current_cost_per_unit?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reorder_level?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
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
      product_inventory: {
        Row: {
          available_quantity: number
          color: string
          created_at: string | null
          id: string
          ordered_quantity: number
          original_quantity: number
          product_id: string
          reserved_quantity: number
          size: string
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number
          color: string
          created_at?: string | null
          id?: string
          ordered_quantity?: number
          original_quantity?: number
          product_id: string
          reserved_quantity?: number
          size: string
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number
          color?: string
          created_at?: string | null
          id?: string
          ordered_quantity?: number
          original_quantity?: number
          product_id?: string
          reserved_quantity?: number
          size?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          actual_quantity: number
          batch_code: string
          batch_date: string
          cost_per_piece: number
          created_at: string
          cut_quantity: number | null
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          status: string
          target_quantity: number
          total_cost: number
          total_labor_cost: number
          total_material_cost: number
          total_overhead_cost: number
          total_sales_amount: number
          total_sold_quantity: number
          updated_at: string
        }
        Insert: {
          actual_quantity?: number
          batch_code: string
          batch_date?: string
          cost_per_piece?: number
          created_at?: string
          cut_quantity?: number | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          status?: string
          target_quantity: number
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
          total_overhead_cost?: number
          total_sales_amount?: number
          total_sold_quantity?: number
          updated_at?: string
        }
        Update: {
          actual_quantity?: number
          batch_code?: string
          batch_date?: string
          cost_per_piece?: number
          created_at?: string
          cut_quantity?: number | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          status?: string
          target_quantity?: number
          total_cost?: number
          total_labor_cost?: number
          total_material_cost?: number
          total_overhead_cost?: number
          total_sales_amount?: number
          total_sold_quantity?: number
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
      products: {
        Row: {
          additional_images: Json | null
          available_colors: Json | null
          available_sizes: Json | null
          category: string
          combo_offers: Json | null
          created_at: string | null
          current_total_stock: number | null
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
          max_stock_level: number | null
          name: string
          offer_messages: Json | null
          price: number | null
          product_code: string | null
          quality_tier: string
          reorder_level: number | null
          should_remove: boolean | null
          weight_grams: number
        }
        Insert: {
          additional_images?: Json | null
          available_colors?: Json | null
          available_sizes?: Json | null
          category: string
          combo_offers?: Json | null
          created_at?: string | null
          current_total_stock?: number | null
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
          max_stock_level?: number | null
          name: string
          offer_messages?: Json | null
          price?: number | null
          product_code?: string | null
          quality_tier?: string
          reorder_level?: number | null
          should_remove?: boolean | null
          weight_grams?: number
        }
        Update: {
          additional_images?: Json | null
          available_colors?: Json | null
          available_sizes?: Json | null
          category?: string
          combo_offers?: Json | null
          created_at?: string | null
          current_total_stock?: number | null
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
          max_stock_level?: number | null
          name?: string
          offer_messages?: Json | null
          price?: number | null
          product_code?: string | null
          quality_tier?: string
          reorder_level?: number | null
          should_remove?: boolean | null
          weight_grams?: number
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
      purchases: {
        Row: {
          color: string
          created_at: string | null
          id: string
          material_id: string | null
          other_costs: number | null
          purchase_date: string
          quantity_kg: number
          rate_per_kg: number
          remarks: string | null
          supplier_name: string | null
          total_cost: number | null
          transport_cost: number | null
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          material_id?: string | null
          other_costs?: number | null
          purchase_date?: string
          quantity_kg?: number
          rate_per_kg?: number
          remarks?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          transport_cost?: number | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          material_id?: string | null
          other_costs?: number | null
          purchase_date?: string
          quantity_kg?: number
          rate_per_kg?: number
          remarks?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          transport_cost?: number | null
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
      shipping_config: {
        Row: {
          id: string
          min_items_for_free_delivery: number
          min_order_value: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          min_items_for_free_delivery?: number
          min_order_value?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          min_items_for_free_delivery?: number
          min_order_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_settings: {
        Row: {
          charge_amount: number
          created_at: string | null
          id: string
          states: string[]
          updated_at: string | null
          zone_name: string
        }
        Insert: {
          charge_amount?: number
          created_at?: string | null
          id?: string
          states: string[]
          updated_at?: string | null
          zone_name: string
        }
        Update: {
          charge_amount?: number
          created_at?: string | null
          id?: string
          states?: string[]
          updated_at?: string | null
          zone_name?: string
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
      check_inventory_available: {
        Args: {
          p_color: string
          p_product_id: string
          p_quantity: number
          p_size: string
        }
        Returns: boolean
      }
      convert_reserved_to_ordered: {
        Args: {
          p_color: string
          p_product_id: string
          p_quantity: number
          p_size: string
        }
        Returns: boolean
      }
      create_role: {
        Args: {
          _description?: string
          _display_name: string
          _name: string
          _permission_ids?: string[]
        }
        Returns: string
      }
      deduct_inventory: {
        Args: {
          p_color: string
          p_product_id: string
          p_quantity: number
          p_size: string
        }
        Returns: boolean
      }
      delete_role: { Args: { _role_name: string }; Returns: boolean }
      generate_batch_code: { Args: never; Returns: string }
      generate_batch_number: { Args: never; Returns: string }
      generate_custom_batch_number: {
        Args: { product_code: string; production_date?: string }
        Returns: string
      }
      generate_fy_invoice_number: {
        Args: { invoice_date: string; invoice_num: number }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      generate_production_run_code: { Args: never; Returns: string }
      generate_purchase_batch_code: { Args: never; Returns: string }
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
      recalc_job_order_progress: {
        Args: { p_job_order_id: string }
        Returns: undefined
      }
      refresh_cost_summary_labour: {
        Args: { p_job_order_id: string }
        Returns: undefined
      }
      release_inventory: {
        Args: {
          p_color: string
          p_product_id: string
          p_quantity: number
          p_size: string
        }
        Returns: boolean
      }
      reserve_inventory: {
        Args: {
          p_color: string
          p_product_id: string
          p_quantity: number
          p_size: string
        }
        Returns: boolean
      }
      restore_inventory_on_cancel: {
        Args: {
          p_color: string
          p_product_id: string
          p_quantity: number
          p_size: string
        }
        Returns: boolean
      }
      validate_batch_costs: {
        Args: { batch_id: string }
        Returns: {
          has_labor_costs: boolean
          has_material_costs: boolean
          has_overhead_costs: boolean
          labor_count: number
          material_count: number
          overhead_count: number
        }[]
      }
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
