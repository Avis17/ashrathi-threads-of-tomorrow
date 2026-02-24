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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
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
      batch_cutting_logs: {
        Row: {
          batch_id: string
          color: string
          confirmed_pieces: number
          created_at: string
          id: string
          log_date: string
          notes: string | null
          pieces_cut: number
          style_id: string | null
          type_index: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          color: string
          confirmed_pieces?: number
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          pieces_cut?: number
          style_id?: string | null
          type_index: number
          updated_at?: string
        }
        Update: {
          batch_id?: string
          color?: string
          confirmed_pieces?: number
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          pieces_cut?: number
          style_id?: string | null
          type_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_cutting_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_cutting_logs_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "job_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_cutting_wastage: {
        Row: {
          actual_weight_kg: number | null
          batch_id: string
          color: string
          created_at: string
          id: string
          log_date: string
          notes: string | null
          type_index: number
          updated_at: string
          wastage_pieces: number
        }
        Insert: {
          actual_weight_kg?: number | null
          batch_id: string
          color: string
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          type_index: number
          updated_at?: string
          wastage_pieces?: number
        }
        Update: {
          actual_weight_kg?: number | null
          batch_id?: string
          color?: string
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          type_index?: number
          updated_at?: string
          wastage_pieces?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_cutting_wastage_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_job_work_operations: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          job_work_id: string
          notes: string | null
          operation: string
          quantity: number
          rate_per_piece: number
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          job_work_id: string
          notes?: string | null
          operation: string
          quantity?: number
          rate_per_piece?: number
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          job_work_id?: string
          notes?: string | null
          operation?: string
          quantity?: number
          rate_per_piece?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_job_work_operations_job_work_id_fkey"
            columns: ["job_work_id"]
            isOneToOne: false
            referencedRelation: "batch_job_works"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_job_works: {
        Row: {
          balance_amount: number
          batch_id: string
          color: string
          company_id: string | null
          company_name: string
          company_profit: number | null
          created_at: string
          id: string
          notes: string | null
          paid_amount: number
          payment_status: string
          pieces: number
          style_id: string
          total_amount: number
          type_index: number
          updated_at: string
          variations: Json | null
          work_status: string
        }
        Insert: {
          balance_amount?: number
          batch_id: string
          color: string
          company_id?: string | null
          company_name: string
          company_profit?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_status?: string
          pieces?: number
          style_id: string
          total_amount?: number
          type_index?: number
          updated_at?: string
          variations?: Json | null
          work_status?: string
        }
        Update: {
          balance_amount?: number
          batch_id?: string
          color?: string
          company_id?: string | null
          company_name?: string
          company_profit?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_status?: string
          pieces?: number
          style_id?: string
          total_amount?: number
          type_index?: number
          updated_at?: string
          variations?: Json | null
          work_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_job_works_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_job_works_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "external_job_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_job_works_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "job_styles"
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
      batch_operation_progress: {
        Row: {
          batch_id: string
          completed_pieces: number
          created_at: string
          id: string
          mistake_pieces: number
          notes: string | null
          operation: string
          type_index: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          completed_pieces?: number
          created_at?: string
          id?: string
          mistake_pieces?: number
          notes?: string | null
          operation: string
          type_index?: number
          updated_at?: string
        }
        Update: {
          batch_id?: string
          completed_pieces?: number
          created_at?: string
          id?: string
          mistake_pieces?: number
          notes?: string | null
          operation?: string
          type_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_operation_progress_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_payments: {
        Row: {
          amount: number
          batch_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_mode: string
          style_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          batch_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          style_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          batch_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          style_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_payments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_payments_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "job_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_salary_advances: {
        Row: {
          advance_date: string
          amount: number
          batch_id: string
          created_at: string
          description: string
          id: string
          notes: string | null
          operation: string
          style_id: string
          updated_at: string
        }
        Insert: {
          advance_date?: string
          amount: number
          batch_id: string
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          operation: string
          style_id: string
          updated_at?: string
        }
        Update: {
          advance_date?: string
          amount?: number
          batch_id?: string
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          operation?: string
          style_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      batch_salary_entries: {
        Row: {
          batch_id: string
          created_at: string
          description: string | null
          id: string
          notes: string | null
          operation: string
          paid_amount: number
          payment_status: string
          quantity: number
          rate_per_piece: number
          style_id: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          operation: string
          paid_amount?: number
          payment_status?: string
          quantity?: number
          rate_per_piece?: number
          style_id: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          operation?: string
          paid_amount?: number
          payment_status?: string
          quantity?: number
          rate_per_piece?: number
          style_id?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_salary_entries_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_salary_entries_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "job_styles"
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
      batch_type_confirmed: {
        Row: {
          actual_delivery_date: string | null
          batch_id: string
          confirmed_pieces: number
          created_at: string
          delivery_notes: string | null
          delivery_status: string
          id: string
          type_index: number
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          batch_id: string
          confirmed_pieces?: number
          created_at?: string
          delivery_notes?: string | null
          delivery_status?: string
          id?: string
          type_index?: number
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          batch_id?: string
          confirmed_pieces?: number
          created_at?: string
          delivery_notes?: string | null
          delivery_status?: string
          id?: string
          type_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_type_confirmed_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_weight_analysis: {
        Row: {
          actual_weight_grams: number | null
          batch_id: string
          bottom_wastage_percent: number | null
          bottom_weight_grams: number | null
          created_at: string
          id: string
          is_set_item: boolean
          notes: string | null
          style_id: string
          top_wastage_percent: number | null
          top_weight_grams: number | null
          updated_at: string
          wastage_percent: number | null
        }
        Insert: {
          actual_weight_grams?: number | null
          batch_id: string
          bottom_wastage_percent?: number | null
          bottom_weight_grams?: number | null
          created_at?: string
          id?: string
          is_set_item?: boolean
          notes?: string | null
          style_id: string
          top_wastage_percent?: number | null
          top_weight_grams?: number | null
          updated_at?: string
          wastage_percent?: number | null
        }
        Update: {
          actual_weight_grams?: number | null
          batch_id?: string
          bottom_wastage_percent?: number | null
          bottom_weight_grams?: number | null
          created_at?: string
          id?: string
          is_set_item?: boolean
          notes?: string | null
          style_id?: string
          top_wastage_percent?: number | null
          top_weight_grams?: number | null
          updated_at?: string
          wastage_percent?: number | null
        }
        Relationships: []
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
      brochure_leads: {
        Row: {
          company: string
          country: string
          downloaded_at: string
          email: string
          id: string
          ip_address: string | null
          name: string
          phone: string | null
          purpose: string
          user_agent: string | null
        }
        Insert: {
          company: string
          country: string
          downloaded_at?: string
          email: string
          id?: string
          ip_address?: string | null
          name: string
          phone?: string | null
          purpose: string
          user_agent?: string | null
        }
        Update: {
          company?: string
          country?: string
          downloaded_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          name?: string
          phone?: string | null
          purpose?: string
          user_agent?: string | null
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
      buyer_followup_messages: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      calculator_entries: {
        Row: {
          calculator_type: string
          created_at: string
          created_by: string | null
          id: string
          inputs: Json
          results: Json
        }
        Insert: {
          calculator_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          inputs?: Json
          results?: Json
        }
        Update: {
          calculator_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          inputs?: Json
          results?: Json
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
      cmt_quotations: {
        Row: {
          approved_rates: Json | null
          buyer_address: string | null
          buyer_name: string
          company_profit_percent: number | null
          contact_person_name: string | null
          contact_person_phone: string | null
          created_at: string
          created_by: string | null
          date: string
          fabric_type: string | null
          final_cmt_per_piece: number | null
          finishing_packing_cost: number | null
          fit_type: string | null
          gsm: string | null
          id: string
          operations: Json | null
          order_quantity: number | null
          overheads_cost: number | null
          quotation_no: string
          signatory_name: string | null
          size_range: string | null
          status: string | null
          style_code: string | null
          style_name: string
          terms_and_conditions: string | null
          total_order_value: number | null
          total_stitching_cost: number | null
          trims: Json | null
          updated_at: string
          valid_until: string
        }
        Insert: {
          approved_rates?: Json | null
          buyer_address?: string | null
          buyer_name: string
          company_profit_percent?: number | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          fabric_type?: string | null
          final_cmt_per_piece?: number | null
          finishing_packing_cost?: number | null
          fit_type?: string | null
          gsm?: string | null
          id?: string
          operations?: Json | null
          order_quantity?: number | null
          overheads_cost?: number | null
          quotation_no: string
          signatory_name?: string | null
          size_range?: string | null
          status?: string | null
          style_code?: string | null
          style_name: string
          terms_and_conditions?: string | null
          total_order_value?: number | null
          total_stitching_cost?: number | null
          trims?: Json | null
          updated_at?: string
          valid_until: string
        }
        Update: {
          approved_rates?: Json | null
          buyer_address?: string | null
          buyer_name?: string
          company_profit_percent?: number | null
          contact_person_name?: string | null
          contact_person_phone?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          fabric_type?: string | null
          final_cmt_per_piece?: number | null
          finishing_packing_cost?: number | null
          fit_type?: string | null
          gsm?: string | null
          id?: string
          operations?: Json | null
          order_quantity?: number | null
          overheads_cost?: number | null
          quotation_no?: string
          signatory_name?: string | null
          size_range?: string | null
          status?: string | null
          style_code?: string | null
          style_name?: string
          terms_and_conditions?: string | null
          total_order_value?: number | null
          total_stitching_cost?: number | null
          trims?: Json | null
          updated_at?: string
          valid_until?: string
        }
        Relationships: []
      }
      company_letterheads: {
        Row: {
          closing: string | null
          created_at: string
          id: string
          letter_body: string | null
          letter_date: string
          recipient_address: string | null
          recipient_name: string | null
          reference_no: string | null
          salutation: string | null
          seal_image: string | null
          show_seal: boolean | null
          show_signature: boolean | null
          signature_image: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          closing?: string | null
          created_at?: string
          id?: string
          letter_body?: string | null
          letter_date?: string
          recipient_address?: string | null
          recipient_name?: string | null
          reference_no?: string | null
          salutation?: string | null
          seal_image?: string | null
          show_seal?: boolean | null
          show_signature?: boolean | null
          signature_image?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          closing?: string | null
          created_at?: string
          id?: string
          letter_body?: string | null
          letter_date?: string
          recipient_address?: string | null
          recipient_name?: string | null
          reference_no?: string | null
          salutation?: string | null
          seal_image?: string | null
          show_seal?: boolean | null
          show_signature?: boolean | null
          signature_image?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          address: string | null
          aql_followed: boolean | null
          authorized_signatory_name: string | null
          boiler_available: boolean | null
          brand_name: string | null
          carton_packing_support: boolean | null
          checking_images: string[] | null
          checking_notes: string | null
          checking_staff: number | null
          checking_table_size: string | null
          checking_tables_count: number | null
          city: string | null
          company_code: string | null
          company_name: string
          compressor_available: boolean | null
          compressor_capacity: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          created_by: string | null
          cutting_images: string[] | null
          cutting_notes: string | null
          cutting_staff: number | null
          cutting_table_size: string | null
          cutting_tables_count: number | null
          daily_production_capacity: string | null
          eb_power_available: boolean | null
          email: string | null
          fabric_inspection_table_size: string | null
          fabric_inspection_tables_count: number | null
          final_checking: boolean | null
          general_remarks: string | null
          generator_available: boolean | null
          generator_capacity: string | null
          gst_number: string | null
          id: string
          inline_checking: boolean | null
          ironing_images: string[] | null
          ironing_notes: string | null
          ironing_staff: number | null
          ironing_tables_count: number | null
          is_active: boolean | null
          lead_time: string | null
          measurement_check: boolean | null
          measurement_tools: Json | null
          moq: string | null
          packing_images: string[] | null
          packing_notes: string | null
          packing_staff: number | null
          packing_tables_count: number | null
          phone: string | null
          polybag_sealing_available: boolean | null
          power_connection_type: string | null
          power_phase: string | null
          sample_lead_time: string | null
          signatory_designation: string | null
          staff_notes: string | null
          state: string | null
          steam_iron_count: number | null
          stitching_images: string[] | null
          stitching_machines: Json | null
          stitching_notes: string | null
          stitching_staff: number | null
          storage_racks_available: boolean | null
          tagging_barcode_support: boolean | null
          total_employees: number | null
          updated_at: string
          utilities_images: string[] | null
          utilities_notes: string | null
          vacuum_table_available: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          aql_followed?: boolean | null
          authorized_signatory_name?: string | null
          boiler_available?: boolean | null
          brand_name?: string | null
          carton_packing_support?: boolean | null
          checking_images?: string[] | null
          checking_notes?: string | null
          checking_staff?: number | null
          checking_table_size?: string | null
          checking_tables_count?: number | null
          city?: string | null
          company_code?: string | null
          company_name: string
          compressor_available?: boolean | null
          compressor_capacity?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          cutting_images?: string[] | null
          cutting_notes?: string | null
          cutting_staff?: number | null
          cutting_table_size?: string | null
          cutting_tables_count?: number | null
          daily_production_capacity?: string | null
          eb_power_available?: boolean | null
          email?: string | null
          fabric_inspection_table_size?: string | null
          fabric_inspection_tables_count?: number | null
          final_checking?: boolean | null
          general_remarks?: string | null
          generator_available?: boolean | null
          generator_capacity?: string | null
          gst_number?: string | null
          id?: string
          inline_checking?: boolean | null
          ironing_images?: string[] | null
          ironing_notes?: string | null
          ironing_staff?: number | null
          ironing_tables_count?: number | null
          is_active?: boolean | null
          lead_time?: string | null
          measurement_check?: boolean | null
          measurement_tools?: Json | null
          moq?: string | null
          packing_images?: string[] | null
          packing_notes?: string | null
          packing_staff?: number | null
          packing_tables_count?: number | null
          phone?: string | null
          polybag_sealing_available?: boolean | null
          power_connection_type?: string | null
          power_phase?: string | null
          sample_lead_time?: string | null
          signatory_designation?: string | null
          staff_notes?: string | null
          state?: string | null
          steam_iron_count?: number | null
          stitching_images?: string[] | null
          stitching_machines?: Json | null
          stitching_notes?: string | null
          stitching_staff?: number | null
          storage_racks_available?: boolean | null
          tagging_barcode_support?: boolean | null
          total_employees?: number | null
          updated_at?: string
          utilities_images?: string[] | null
          utilities_notes?: string | null
          vacuum_table_available?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          aql_followed?: boolean | null
          authorized_signatory_name?: string | null
          boiler_available?: boolean | null
          brand_name?: string | null
          carton_packing_support?: boolean | null
          checking_images?: string[] | null
          checking_notes?: string | null
          checking_staff?: number | null
          checking_table_size?: string | null
          checking_tables_count?: number | null
          city?: string | null
          company_code?: string | null
          company_name?: string
          compressor_available?: boolean | null
          compressor_capacity?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          cutting_images?: string[] | null
          cutting_notes?: string | null
          cutting_staff?: number | null
          cutting_table_size?: string | null
          cutting_tables_count?: number | null
          daily_production_capacity?: string | null
          eb_power_available?: boolean | null
          email?: string | null
          fabric_inspection_table_size?: string | null
          fabric_inspection_tables_count?: number | null
          final_checking?: boolean | null
          general_remarks?: string | null
          generator_available?: boolean | null
          generator_capacity?: string | null
          gst_number?: string | null
          id?: string
          inline_checking?: boolean | null
          ironing_images?: string[] | null
          ironing_notes?: string | null
          ironing_staff?: number | null
          ironing_tables_count?: number | null
          is_active?: boolean | null
          lead_time?: string | null
          measurement_check?: boolean | null
          measurement_tools?: Json | null
          moq?: string | null
          packing_images?: string[] | null
          packing_notes?: string | null
          packing_staff?: number | null
          packing_tables_count?: number | null
          phone?: string | null
          polybag_sealing_available?: boolean | null
          power_connection_type?: string | null
          power_phase?: string | null
          sample_lead_time?: string | null
          signatory_designation?: string | null
          staff_notes?: string | null
          state?: string | null
          steam_iron_count?: number | null
          stitching_images?: string[] | null
          stitching_machines?: Json | null
          stitching_notes?: string | null
          stitching_staff?: number | null
          storage_racks_available?: boolean | null
          tagging_barcode_support?: boolean | null
          total_employees?: number | null
          updated_at?: string
          utilities_images?: string[] | null
          utilities_notes?: string | null
          vacuum_table_available?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      company_vehicles: {
        Row: {
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          ownership_type: string
          updated_at: string
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          ownership_type: string
          updated_at?: string
          vehicle_number: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          ownership_type?: string
          updated_at?: string
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: []
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
      dc_eway_bills: {
        Row: {
          ack_date: string | null
          ack_no: string | null
          approx_distance: string | null
          cewb_no: string | null
          cgst_amount: number | null
          created_at: string
          delivery_challan_id: string
          dispatch_from: string | null
          doc_date: string | null
          doc_no: string | null
          eway_bill_date: string | null
          eway_bill_no: string | null
          from_address: string | null
          from_gstin: string | null
          from_name: string | null
          from_state: string | null
          generated_by_gstin: string | null
          hsn_code: string | null
          id: string
          irn: string | null
          mode: string | null
          notes: string | null
          other_amount: number | null
          product_description: string | null
          quantity: number | null
          sgst_amount: number | null
          ship_to: string | null
          supply_type: string | null
          tax_invoice_date: string | null
          tax_invoice_no: string | null
          tax_rate_cgst: number | null
          tax_rate_sgst: number | null
          taxable_amount: number | null
          to_address: string | null
          to_gstin: string | null
          to_name: string | null
          to_state: string | null
          total_invoice_amount: number | null
          transaction_type: string | null
          transporter_id: string | null
          transporter_name: string | null
          uom: string | null
          updated_at: string
          valid_upto: string | null
          vehicle_from: string | null
          vehicle_no: string | null
        }
        Insert: {
          ack_date?: string | null
          ack_no?: string | null
          approx_distance?: string | null
          cewb_no?: string | null
          cgst_amount?: number | null
          created_at?: string
          delivery_challan_id: string
          dispatch_from?: string | null
          doc_date?: string | null
          doc_no?: string | null
          eway_bill_date?: string | null
          eway_bill_no?: string | null
          from_address?: string | null
          from_gstin?: string | null
          from_name?: string | null
          from_state?: string | null
          generated_by_gstin?: string | null
          hsn_code?: string | null
          id?: string
          irn?: string | null
          mode?: string | null
          notes?: string | null
          other_amount?: number | null
          product_description?: string | null
          quantity?: number | null
          sgst_amount?: number | null
          ship_to?: string | null
          supply_type?: string | null
          tax_invoice_date?: string | null
          tax_invoice_no?: string | null
          tax_rate_cgst?: number | null
          tax_rate_sgst?: number | null
          taxable_amount?: number | null
          to_address?: string | null
          to_gstin?: string | null
          to_name?: string | null
          to_state?: string | null
          total_invoice_amount?: number | null
          transaction_type?: string | null
          transporter_id?: string | null
          transporter_name?: string | null
          uom?: string | null
          updated_at?: string
          valid_upto?: string | null
          vehicle_from?: string | null
          vehicle_no?: string | null
        }
        Update: {
          ack_date?: string | null
          ack_no?: string | null
          approx_distance?: string | null
          cewb_no?: string | null
          cgst_amount?: number | null
          created_at?: string
          delivery_challan_id?: string
          dispatch_from?: string | null
          doc_date?: string | null
          doc_no?: string | null
          eway_bill_date?: string | null
          eway_bill_no?: string | null
          from_address?: string | null
          from_gstin?: string | null
          from_name?: string | null
          from_state?: string | null
          generated_by_gstin?: string | null
          hsn_code?: string | null
          id?: string
          irn?: string | null
          mode?: string | null
          notes?: string | null
          other_amount?: number | null
          product_description?: string | null
          quantity?: number | null
          sgst_amount?: number | null
          ship_to?: string | null
          supply_type?: string | null
          tax_invoice_date?: string | null
          tax_invoice_no?: string | null
          tax_rate_cgst?: number | null
          tax_rate_sgst?: number | null
          taxable_amount?: number | null
          to_address?: string | null
          to_gstin?: string | null
          to_name?: string | null
          to_state?: string | null
          total_invoice_amount?: number | null
          transaction_type?: string | null
          transporter_id?: string | null
          transporter_name?: string | null
          uom?: string | null
          updated_at?: string
          valid_upto?: string | null
          vehicle_from?: string | null
          vehicle_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dc_eway_bills_delivery_challan_id_fkey"
            columns: ["delivery_challan_id"]
            isOneToOne: false
            referencedRelation: "delivery_challans"
            referencedColumns: ["id"]
          },
        ]
      }
      dc_production_plans: {
        Row: {
          atta: boolean | null
          authorised_sign_1: string | null
          authorised_sign_2: string | null
          box: boolean | null
          button: boolean | null
          care_label: boolean | null
          coin_detail: string | null
          created_at: string
          delivery_challan_id: string
          embroidery_detail: string | null
          fabric_details: string | null
          first_sample_approval: boolean | null
          flag_label: boolean | null
          follow_up_by: string | null
          follow_up_person: string | null
          fusing_detail: string | null
          fusing_sticker: boolean | null
          ic_no: string | null
          ic_original: boolean | null
          ic_traced: boolean | null
          id: string
          item_name: string | null
          main_label: boolean | null
          mchart_original: boolean | null
          mchart_traced: boolean | null
          metal_badges: boolean | null
          name_original: string | null
          name_traced: string | null
          notes: string | null
          original_pattern: boolean | null
          original_sample: boolean | null
          others_detail: string | null
          others_post_production: string | null
          packing_type: string | null
          pgm_no: string | null
          photo: boolean | null
          plan_date: string | null
          poly_bag: boolean | null
          print_detail: string | null
          qc_person: string | null
          rope: boolean | null
          seal_original: boolean | null
          seal_traced: boolean | null
          side_cut_style: string | null
          sign_original: string | null
          sign_traced: string | null
          sizes: string | null
          special_instructions: string | null
          stone_detail: string | null
          supplier: string | null
          tag: boolean | null
          traced_pattern: boolean | null
          updated_at: string
          zippers: boolean | null
        }
        Insert: {
          atta?: boolean | null
          authorised_sign_1?: string | null
          authorised_sign_2?: string | null
          box?: boolean | null
          button?: boolean | null
          care_label?: boolean | null
          coin_detail?: string | null
          created_at?: string
          delivery_challan_id: string
          embroidery_detail?: string | null
          fabric_details?: string | null
          first_sample_approval?: boolean | null
          flag_label?: boolean | null
          follow_up_by?: string | null
          follow_up_person?: string | null
          fusing_detail?: string | null
          fusing_sticker?: boolean | null
          ic_no?: string | null
          ic_original?: boolean | null
          ic_traced?: boolean | null
          id?: string
          item_name?: string | null
          main_label?: boolean | null
          mchart_original?: boolean | null
          mchart_traced?: boolean | null
          metal_badges?: boolean | null
          name_original?: string | null
          name_traced?: string | null
          notes?: string | null
          original_pattern?: boolean | null
          original_sample?: boolean | null
          others_detail?: string | null
          others_post_production?: string | null
          packing_type?: string | null
          pgm_no?: string | null
          photo?: boolean | null
          plan_date?: string | null
          poly_bag?: boolean | null
          print_detail?: string | null
          qc_person?: string | null
          rope?: boolean | null
          seal_original?: boolean | null
          seal_traced?: boolean | null
          side_cut_style?: string | null
          sign_original?: string | null
          sign_traced?: string | null
          sizes?: string | null
          special_instructions?: string | null
          stone_detail?: string | null
          supplier?: string | null
          tag?: boolean | null
          traced_pattern?: boolean | null
          updated_at?: string
          zippers?: boolean | null
        }
        Update: {
          atta?: boolean | null
          authorised_sign_1?: string | null
          authorised_sign_2?: string | null
          box?: boolean | null
          button?: boolean | null
          care_label?: boolean | null
          coin_detail?: string | null
          created_at?: string
          delivery_challan_id?: string
          embroidery_detail?: string | null
          fabric_details?: string | null
          first_sample_approval?: boolean | null
          flag_label?: boolean | null
          follow_up_by?: string | null
          follow_up_person?: string | null
          fusing_detail?: string | null
          fusing_sticker?: boolean | null
          ic_no?: string | null
          ic_original?: boolean | null
          ic_traced?: boolean | null
          id?: string
          item_name?: string | null
          main_label?: boolean | null
          mchart_original?: boolean | null
          mchart_traced?: boolean | null
          metal_badges?: boolean | null
          name_original?: string | null
          name_traced?: string | null
          notes?: string | null
          original_pattern?: boolean | null
          original_sample?: boolean | null
          others_detail?: string | null
          others_post_production?: string | null
          packing_type?: string | null
          pgm_no?: string | null
          photo?: boolean | null
          plan_date?: string | null
          poly_bag?: boolean | null
          print_detail?: string | null
          qc_person?: string | null
          rope?: boolean | null
          seal_original?: boolean | null
          seal_traced?: boolean | null
          side_cut_style?: string | null
          sign_original?: string | null
          sign_traced?: string | null
          sizes?: string | null
          special_instructions?: string | null
          stone_detail?: string | null
          supplier?: string | null
          tag?: boolean | null
          traced_pattern?: boolean | null
          updated_at?: string
          zippers?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "dc_production_plans_delivery_challan_id_fkey"
            columns: ["delivery_challan_id"]
            isOneToOne: false
            referencedRelation: "delivery_challans"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_challan_items: {
        Row: {
          color: string | null
          created_at: string
          delivery_challan_id: string
          id: string
          product_name: string
          quantity: number
          remarks: string | null
          size: string | null
          sku: string | null
          uom: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          delivery_challan_id: string
          id?: string
          product_name: string
          quantity: number
          remarks?: string | null
          size?: string | null
          sku?: string | null
          uom?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          delivery_challan_id?: string
          id?: string
          product_name?: string
          quantity?: number
          remarks?: string | null
          size?: string | null
          sku?: string | null
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_challan_items_delivery_challan_id_fkey"
            columns: ["delivery_challan_id"]
            isOneToOne: false
            referencedRelation: "delivery_challans"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_challans: {
        Row: {
          created_at: string
          created_by: string | null
          dc_date: string
          dc_number: string
          dc_type: string
          driver_mobile: string
          driver_name: string
          expected_return_date: string | null
          id: string
          job_work_direction: string
          job_worker_address: string | null
          job_worker_gstin: string | null
          job_worker_name: string
          notes: string | null
          purpose: string
          purposes: string[] | null
          status: string
          total_quantity: number
          updated_at: string
          vehicle_number: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dc_date?: string
          dc_number: string
          dc_type: string
          driver_mobile: string
          driver_name: string
          expected_return_date?: string | null
          id?: string
          job_work_direction?: string
          job_worker_address?: string | null
          job_worker_gstin?: string | null
          job_worker_name: string
          notes?: string | null
          purpose: string
          purposes?: string[] | null
          status?: string
          total_quantity?: number
          updated_at?: string
          vehicle_number: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dc_date?: string
          dc_number?: string
          dc_type?: string
          driver_mobile?: string
          driver_name?: string
          expected_return_date?: string | null
          id?: string
          job_work_direction?: string
          job_worker_address?: string | null
          job_worker_gstin?: string | null
          job_worker_name?: string
          notes?: string | null
          purpose?: string
          purposes?: string[] | null
          status?: string
          total_quantity?: number
          updated_at?: string
          vehicle_number?: string
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
      export_buyer_contacts: {
        Row: {
          buyer_name: string
          country: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          notes: string | null
          phone: string
          state: string | null
          updated_at: string
        }
        Insert: {
          buyer_name: string
          country: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          buyer_name?: string
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      exporters: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          export_markets: string | null
          hall_no: string | null
          id: string
          is_active: boolean | null
          landline_number: string | null
          mobile_number: string
          name: string
          notes: string | null
          products_on_display: string | null
          sl_no: number | null
          stall_no: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          export_markets?: string | null
          hall_no?: string | null
          id?: string
          is_active?: boolean | null
          landline_number?: string | null
          mobile_number: string
          name: string
          notes?: string | null
          products_on_display?: string | null
          sl_no?: number | null
          stall_no?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          export_markets?: string | null
          hall_no?: string | null
          id?: string
          is_active?: boolean | null
          landline_number?: string | null
          mobile_number?: string
          name?: string
          notes?: string | null
          products_on_display?: string | null
          sl_no?: number | null
          stall_no?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
      external_job_expenses: {
        Row: {
          amount: number
          bill_number: string | null
          created_at: string | null
          date: string
          expense_type: string
          id: string
          item_name: string
          job_order_id: string
          notes: string | null
          quantity: number | null
          rate_per_unit: number | null
          supplier_name: string | null
          unit: string | null
        }
        Insert: {
          amount: number
          bill_number?: string | null
          created_at?: string | null
          date?: string
          expense_type: string
          id?: string
          item_name: string
          job_order_id: string
          notes?: string | null
          quantity?: number | null
          rate_per_unit?: number | null
          supplier_name?: string | null
          unit?: string | null
        }
        Update: {
          amount?: number
          bill_number?: string | null
          created_at?: string | null
          date?: string
          expense_type?: string
          id?: string
          item_name?: string
          job_order_id?: string
          notes?: string | null
          quantity?: number | null
          rate_per_unit?: number | null
          supplier_name?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_job_expenses_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "external_job_orders"
            referencedColumns: ["id"]
          },
        ]
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
          adjustment: number | null
          commission_percent: number | null
          created_at: string | null
          id: string
          job_order_id: string
          operation_name: string
          round_off: number | null
          total_rate: number | null
        }
        Insert: {
          adjustment?: number | null
          commission_percent?: number | null
          created_at?: string | null
          id?: string
          job_order_id: string
          operation_name: string
          round_off?: number | null
          total_rate?: number | null
        }
        Update: {
          adjustment?: number | null
          commission_percent?: number | null
          created_at?: string | null
          id?: string
          job_order_id?: string
          operation_name?: string
          round_off?: number | null
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
          custom_products_data: Json | null
          delivery_charge: number | null
          delivery_date: string
          gst_amount: number | null
          gst_percentage: number | null
          id: string
          is_custom_job: boolean | null
          is_disabled: boolean | null
          job_id: string
          job_status: string | null
          notes: string | null
          number_of_pieces: number
          order_date: string | null
          paid_amount: number | null
          payment_status: string | null
          rate_per_piece: number
          style_name: string
          total_amount: number
          total_with_gst: number | null
          updated_at: string | null
        }
        Insert: {
          accessories_cost?: number | null
          balance_amount?: number | null
          company_id: string
          company_profit_type?: string | null
          company_profit_value?: number | null
          created_at?: string | null
          custom_products_data?: Json | null
          delivery_charge?: number | null
          delivery_date: string
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          is_custom_job?: boolean | null
          is_disabled?: boolean | null
          job_id: string
          job_status?: string | null
          notes?: string | null
          number_of_pieces: number
          order_date?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          rate_per_piece?: number
          style_name: string
          total_amount?: number
          total_with_gst?: number | null
          updated_at?: string | null
        }
        Update: {
          accessories_cost?: number | null
          balance_amount?: number | null
          company_id?: string
          company_profit_type?: string | null
          company_profit_value?: number | null
          created_at?: string | null
          custom_products_data?: Json | null
          delivery_charge?: number | null
          delivery_date?: string
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          is_custom_job?: boolean | null
          is_disabled?: boolean | null
          job_id?: string
          job_status?: string | null
          notes?: string | null
          number_of_pieces?: number
          order_date?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          rate_per_piece?: number
          style_name?: string
          total_amount?: number
          total_with_gst?: number | null
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
      external_job_products: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          product_name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_name?: string
        }
        Relationships: []
      }
      external_job_rate_cards: {
        Row: {
          accessories_cost: number
          adjustment: number | null
          category: string
          company_profit_type: string | null
          company_profit_value: number | null
          created_at: string
          delivery_charge: number
          id: string
          is_active: boolean
          notes: string | null
          operations_data: Json
          rate_per_piece: number
          style_id: string
          style_name: string
          updated_at: string
        }
        Insert: {
          accessories_cost?: number
          adjustment?: number | null
          category: string
          company_profit_type?: string | null
          company_profit_value?: number | null
          created_at?: string
          delivery_charge?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          operations_data?: Json
          rate_per_piece?: number
          style_id: string
          style_name: string
          updated_at?: string
        }
        Update: {
          accessories_cost?: number
          adjustment?: number | null
          category?: string
          company_profit_type?: string | null
          company_profit_value?: number | null
          created_at?: string
          delivery_charge?: number
          id?: string
          is_active?: boolean
          notes?: string | null
          operations_data?: Json
          rate_per_piece?: number
          style_id?: string
          style_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_job_salaries: {
        Row: {
          advance_deductions: Json | null
          calculation_details: string | null
          created_at: string | null
          deduction_amount: number | null
          employee_id: string
          gross_amount: number | null
          id: string
          job_order_id: string
          notes: string | null
          number_of_pieces: number
          operation: string
          payment_date: string
          payment_mode: string | null
          payment_status: string | null
          rate_per_piece: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          advance_deductions?: Json | null
          calculation_details?: string | null
          created_at?: string | null
          deduction_amount?: number | null
          employee_id: string
          gross_amount?: number | null
          id?: string
          job_order_id: string
          notes?: string | null
          number_of_pieces: number
          operation: string
          payment_date?: string
          payment_mode?: string | null
          payment_status?: string | null
          rate_per_piece: number
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          advance_deductions?: Json | null
          calculation_details?: string | null
          created_at?: string | null
          deduction_amount?: number | null
          employee_id?: string
          gross_amount?: number | null
          id?: string
          job_order_id?: string
          notes?: string | null
          number_of_pieces?: number
          operation?: string
          payment_date?: string
          payment_mode?: string | null
          payment_status?: string | null
          rate_per_piece?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_job_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "job_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_job_salaries_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "external_job_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      external_job_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_common: boolean | null
          product_id: string | null
          task_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_common?: boolean | null
          product_id?: string | null
          task_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_common?: boolean | null
          product_id?: string | null
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_job_tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "external_job_products"
            referencedColumns: ["id"]
          },
        ]
      }
      generic_job_expenses: {
        Row: {
          amount: number
          bill_number: string | null
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          subcategory: string | null
          supplier_name: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bill_number?: string | null
          category: string
          created_at?: string | null
          date?: string
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          subcategory?: string | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_number?: string | null
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          subcategory?: string | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      internal_app_access: {
        Row: {
          app_name: Database["public"]["Enums"]["internal_app"]
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          app_name: Database["public"]["Enums"]["internal_app"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          app_name?: Database["public"]["Enums"]["internal_app"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          custom_product_name: string | null
          hsn_code: string
          id: string
          invoice_id: string
          price: number
          product_code: string
          product_id: string | null
          quantity: number
        }
        Insert: {
          amount: number
          custom_product_name?: string | null
          hsn_code: string
          id?: string
          invoice_id: string
          price: number
          product_code: string
          product_id?: string | null
          quantity: number
        }
        Update: {
          amount?: number
          custom_product_name?: string | null
          hsn_code?: string
          id?: string
          invoice_id?: string
          price?: number
          product_code?: string
          product_id?: string | null
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
          customer_id: string | null
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
          customer_id?: string | null
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
          customer_id?: string | null
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
          company_name: string | null
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
          payment_status: string
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
          company_name?: string | null
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
          payment_status?: string
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
          company_name?: string | null
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
          payment_status?: string
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
          operations: string[] | null
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
          operations?: string[] | null
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
          operations?: string[] | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_employee_reviews: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          rating: number
          review_month: number
          review_year: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          rating: number
          review_month: number
          review_year: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          rating?: number
          review_month?: number
          review_year?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_employee_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "job_employees"
            referencedColumns: ["id"]
          },
        ]
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
          notes: string | null
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
          notes?: string | null
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
          notes?: string | null
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
      job_order_invoice_settings: {
        Row: {
          current_invoice_number: number
          id: string
          invoice_number_format: string
          updated_at: string | null
        }
        Insert: {
          current_invoice_number?: number
          id?: string
          invoice_number_format?: string
          updated_at?: string | null
        }
        Update: {
          current_invoice_number?: number
          id?: string
          invoice_number_format?: string
          updated_at?: string | null
        }
        Relationships: []
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
          gst_amount: number | null
          gst_percentage: number | null
          id: string
          job_type: string
          overall_progress: number
          product_name: string
          remarks: string | null
          start_date: string
          status: string
          total_pieces: number
          total_with_gst: number | null
          updated_at: string
        }
        Insert: {
          client_company: string
          contact_number?: string | null
          contact_person: string
          created_at?: string
          delivery_date: string
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          job_type: string
          overall_progress?: number
          product_name: string
          remarks?: string | null
          start_date: string
          status?: string
          total_pieces: number
          total_with_gst?: number | null
          updated_at?: string
        }
        Update: {
          client_company?: string
          contact_number?: string | null
          contact_person?: string
          created_at?: string
          delivery_date?: string
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          job_type?: string
          overall_progress?: number
          product_name?: string
          remarks?: string | null
          start_date?: string
          status?: string
          total_pieces?: number
          total_with_gst?: number | null
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
          linked_cmt_quotation_id: string | null
          measurement_sheet_url: string | null
          min_order_qty: number | null
          pattern_number: string
          process_rate_details: Json | null
          product_code: string | null
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
          style_images: Json | null
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
          linked_cmt_quotation_id?: string | null
          measurement_sheet_url?: string | null
          min_order_qty?: number | null
          pattern_number: string
          process_rate_details?: Json | null
          product_code?: string | null
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
          style_images?: Json | null
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
          linked_cmt_quotation_id?: string | null
          measurement_sheet_url?: string | null
          min_order_qty?: number | null
          pattern_number?: string
          process_rate_details?: Json | null
          product_code?: string | null
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
          style_images?: Json | null
          style_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_styles_linked_cmt_quotation_id_fkey"
            columns: ["linked_cmt_quotation_id"]
            isOneToOne: false
            referencedRelation: "cmt_quotations"
            referencedColumns: ["id"]
          },
        ]
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
      job_work_payments: {
        Row: {
          adjustment: number
          calculated_amount: number
          created_at: string
          id: string
          is_settled: boolean
          job_work_id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          payment_type: string
        }
        Insert: {
          adjustment?: number
          calculated_amount?: number
          created_at?: string
          id?: string
          is_settled?: boolean
          job_work_id: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_type?: string
        }
        Update: {
          adjustment?: number
          calculated_amount?: number
          created_at?: string
          id?: string
          is_settled?: boolean
          job_work_id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_work_payments_job_work_id_fkey"
            columns: ["job_work_id"]
            isOneToOne: false
            referencedRelation: "batch_job_works"
            referencedColumns: ["id"]
          },
        ]
      }
      job_workers: {
        Row: {
          account_details: string | null
          address: string | null
          alternate_number: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          account_details?: string | null
          address?: string | null
          alternate_number?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          account_details?: string | null
          address?: string | null
          alternate_number?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      label_templates: {
        Row: {
          canvas_data: Json
          created_at: string
          id: string
          include_logo: boolean | null
          label_height: number
          label_width: number
          logo_url: string | null
          name: string
          orientation: string
          updated_at: string
        }
        Insert: {
          canvas_data: Json
          created_at?: string
          id?: string
          include_logo?: boolean | null
          label_height: number
          label_width: number
          logo_url?: string | null
          name: string
          orientation?: string
          updated_at?: string
        }
        Update: {
          canvas_data?: Json
          created_at?: string
          id?: string
          include_logo?: boolean | null
          label_height?: number
          label_width?: number
          logo_url?: string | null
          name?: string
          orientation?: string
          updated_at?: string
        }
        Relationships: []
      }
      marker_piece_library: {
        Row: {
          created_at: string
          created_by: string | null
          dxf_file_url: string | null
          folder_path: string | null
          garment_type: string
          grain_line: string
          height_inches: number
          id: string
          metadata: Json | null
          name: string
          original_filename: string | null
          quantity_per_garment: number
          set_type: string
          size: string
          svg_path_data: string
          width_inches: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dxf_file_url?: string | null
          folder_path?: string | null
          garment_type?: string
          grain_line?: string
          height_inches?: number
          id?: string
          metadata?: Json | null
          name: string
          original_filename?: string | null
          quantity_per_garment?: number
          set_type?: string
          size?: string
          svg_path_data: string
          width_inches?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dxf_file_url?: string | null
          folder_path?: string | null
          garment_type?: string
          grain_line?: string
          height_inches?: number
          id?: string
          metadata?: Json | null
          name?: string
          original_filename?: string | null
          quantity_per_garment?: number
          set_type?: string
          size?: string
          svg_path_data?: string
          width_inches?: number
        }
        Relationships: []
      }
      market_intel_shops: {
        Row: {
          address: string
          alternate_phone: string | null
          city: string
          created_at: string | null
          created_by: string | null
          current_brands: string[] | null
          district: string | null
          email: string | null
          employee_count: string | null
          established_year: number | null
          gst_number: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          landmark: string | null
          monthly_purchase_volume: string | null
          owner_name: string | null
          phone: string
          pincode: string | null
          price_segment: string | null
          product_categories: string[] | null
          shop_name: string
          shop_size: string | null
          shop_type: Database["public"]["Enums"]["shop_type"]
          state: string
          updated_at: string | null
        }
        Insert: {
          address: string
          alternate_phone?: string | null
          city: string
          created_at?: string | null
          created_by?: string | null
          current_brands?: string[] | null
          district?: string | null
          email?: string | null
          employee_count?: string | null
          established_year?: number | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          landmark?: string | null
          monthly_purchase_volume?: string | null
          owner_name?: string | null
          phone: string
          pincode?: string | null
          price_segment?: string | null
          product_categories?: string[] | null
          shop_name: string
          shop_size?: string | null
          shop_type: Database["public"]["Enums"]["shop_type"]
          state?: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          alternate_phone?: string | null
          city?: string
          created_at?: string | null
          created_by?: string | null
          current_brands?: string[] | null
          district?: string | null
          email?: string | null
          employee_count?: string | null
          established_year?: number | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          landmark?: string | null
          monthly_purchase_volume?: string | null
          owner_name?: string | null
          phone?: string
          pincode?: string | null
          price_segment?: string | null
          product_categories?: string[] | null
          shop_name?: string
          shop_size?: string | null
          shop_type?: Database["public"]["Enums"]["shop_type"]
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      market_intel_staff: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string
          staff_code: string
          territory: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
          staff_code: string
          territory?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string
          staff_code?: string
          territory?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      market_intel_visits: {
        Row: {
          competitor_prices: Json | null
          competitor_products: string[] | null
          created_at: string | null
          id: string
          interest_level: Database["public"]["Enums"]["interest_level"] | null
          is_synced: boolean | null
          location_lat: number | null
          location_lng: number | null
          market_feedback: string | null
          next_action: string | null
          next_visit_date: string | null
          notes: string | null
          order_amount: number | null
          order_taken: boolean | null
          payment_amount: number | null
          payment_collected: boolean | null
          payment_terms_preferred:
            | Database["public"]["Enums"]["payment_terms"]
            | null
          photos: string[] | null
          products_interested: string[] | null
          products_shown: string[] | null
          sample_details: string | null
          sample_given: boolean | null
          shop_id: string
          visit_date: string
          visit_outcome: string | null
          visit_purpose: Database["public"]["Enums"]["visit_purpose"]
          visit_rating: number | null
          visit_time: string
          visited_by: string
        }
        Insert: {
          competitor_prices?: Json | null
          competitor_products?: string[] | null
          created_at?: string | null
          id?: string
          interest_level?: Database["public"]["Enums"]["interest_level"] | null
          is_synced?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          market_feedback?: string | null
          next_action?: string | null
          next_visit_date?: string | null
          notes?: string | null
          order_amount?: number | null
          order_taken?: boolean | null
          payment_amount?: number | null
          payment_collected?: boolean | null
          payment_terms_preferred?:
            | Database["public"]["Enums"]["payment_terms"]
            | null
          photos?: string[] | null
          products_interested?: string[] | null
          products_shown?: string[] | null
          sample_details?: string | null
          sample_given?: boolean | null
          shop_id: string
          visit_date?: string
          visit_outcome?: string | null
          visit_purpose: Database["public"]["Enums"]["visit_purpose"]
          visit_rating?: number | null
          visit_time?: string
          visited_by: string
        }
        Update: {
          competitor_prices?: Json | null
          competitor_products?: string[] | null
          created_at?: string | null
          id?: string
          interest_level?: Database["public"]["Enums"]["interest_level"] | null
          is_synced?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          market_feedback?: string | null
          next_action?: string | null
          next_visit_date?: string | null
          notes?: string | null
          order_amount?: number | null
          order_taken?: boolean | null
          payment_amount?: number | null
          payment_collected?: boolean | null
          payment_terms_preferred?:
            | Database["public"]["Enums"]["payment_terms"]
            | null
          photos?: string[] | null
          products_interested?: string[] | null
          products_shown?: string[] | null
          sample_details?: string | null
          sample_given?: boolean | null
          shop_id?: string
          visit_date?: string
          visit_outcome?: string | null
          visit_purpose?: Database["public"]["Enums"]["visit_purpose"]
          visit_rating?: number | null
          visit_time?: string
          visited_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_intel_visits_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "market_intel_shops"
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
          payment_status: string | null
          phonepe_order_id: string | null
          phonepe_transaction_id: string | null
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
          payment_status?: string | null
          phonepe_order_id?: string | null
          phonepe_transaction_id?: string | null
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
          payment_status?: string | null
          phonepe_order_id?: string | null
          phonepe_transaction_id?: string | null
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
      po_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          purchase_order_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          purchase_order_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          purchase_order_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "po_files_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      po_line_items: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          item_name: string
          purchase_order_id: string
          quantity: number
          rate: number
          unit: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          item_name: string
          purchase_order_id: string
          quantity?: number
          rate?: number
          unit?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          item_name?: string
          purchase_order_id?: string
          quantity?: number
          rate?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_line_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      po_suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          supplier_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          supplier_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          supplier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pp_approvals: {
        Row: {
          approval_type: string
          approved_at: string | null
          approver: string | null
          created_at: string
          id: string
          notes: string | null
          status: string
          style_id: string
        }
        Insert: {
          approval_type: string
          approved_at?: string | null
          approver?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          style_id: string
        }
        Update: {
          approval_type?: string
          approved_at?: string | null
          approver?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          style_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pp_approvals_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "pp_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      pp_diagrams: {
        Row: {
          ai_generated: boolean | null
          ai_prompt: string | null
          created_at: string
          diagram_type: string
          file_url: string | null
          id: string
          notes: string | null
          style_id: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          created_at?: string
          diagram_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          style_id: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_prompt?: string | null
          created_at?: string
          diagram_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          style_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pp_diagrams_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "pp_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      pp_measurements: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          rows: Json
          size_set: string[]
          style_id: string
          template_name: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          rows?: Json
          size_set?: string[]
          style_id: string
          template_name?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          rows?: Json
          size_set?: string[]
          style_id?: string
          template_name?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "pp_measurements_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "pp_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      pp_patterns: {
        Row: {
          created_at: string
          created_by: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_approved: boolean | null
          notes: string | null
          pattern_version: string
          size_set: string | null
          style_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          pattern_version?: string
          size_set?: string | null
          style_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_approved?: boolean | null
          notes?: string | null
          pattern_version?: string
          size_set?: string | null
          style_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pp_patterns_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "pp_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      pp_samples: {
        Row: {
          approval_status: string | null
          comments: string | null
          created_at: string
          factory: string | null
          id: string
          received_date: string | null
          sample_number: string | null
          sample_type: string
          sent_date: string | null
          status: string
          style_id: string
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          comments?: string | null
          created_at?: string
          factory?: string | null
          id?: string
          received_date?: string | null
          sample_number?: string | null
          sample_type?: string
          sent_date?: string | null
          status?: string
          style_id: string
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          comments?: string | null
          created_at?: string
          factory?: string | null
          id?: string
          received_date?: string | null
          sample_number?: string | null
          sample_type?: string
          sent_date?: string | null
          status?: string
          style_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pp_samples_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "pp_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      pp_style_versions: {
        Row: {
          ai_diff: string | null
          change_summary: string | null
          changed_by: string | null
          created_at: string
          id: string
          snapshot: Json
          style_id: string
          version: number
        }
        Insert: {
          ai_diff?: string | null
          change_summary?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          snapshot: Json
          style_id: string
          version: number
        }
        Update: {
          ai_diff?: string | null
          change_summary?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          snapshot?: Json
          style_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "pp_style_versions_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "pp_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      pp_styles: {
        Row: {
          buyer: string | null
          category: string
          color_palette: string[] | null
          construction_type: string | null
          created_at: string
          created_by: string | null
          description: string | null
          fabric_type: string | null
          gsm: string | null
          id: string
          season: string | null
          status: string
          stitch_type: string | null
          style_code: string
          style_name: string
          target_market: string | null
          updated_at: string
          version: number
        }
        Insert: {
          buyer?: string | null
          category?: string
          color_palette?: string[] | null
          construction_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fabric_type?: string | null
          gsm?: string | null
          id?: string
          season?: string | null
          status?: string
          stitch_type?: string | null
          style_code: string
          style_name: string
          target_market?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          buyer?: string | null
          category?: string
          color_palette?: string[] | null
          construction_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fabric_type?: string | null
          gsm?: string | null
          id?: string
          season?: string | null
          status?: string
          stitch_type?: string | null
          style_code?: string
          style_name?: string
          target_market?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      pp_tech_packs: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          includes: Json | null
          pdf_url: string | null
          status: string
          style_id: string
          version: number
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          includes?: Json | null
          pdf_url?: string | null
          status?: string
          style_id: string
          version?: number
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          includes?: Json | null
          pdf_url?: string | null
          status?: string
          style_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "pp_tech_packs_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "pp_styles"
            referencedColumns: ["id"]
          },
        ]
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
      purchase_orders: {
        Row: {
          category: string
          cgst_amount: number | null
          cgst_rate: number | null
          created_at: string | null
          discount: number | null
          grand_total: number
          gst_type: string
          id: string
          igst_amount: number | null
          igst_rate: number | null
          invoice_date: string | null
          invoice_number: string | null
          locked_at: string | null
          locked_by: string | null
          notes: string | null
          payment_type: string
          po_number: string
          purchase_date: string
          sgst_amount: number | null
          sgst_rate: number | null
          status: string
          subtotal: number
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          cgst_amount?: number | null
          cgst_rate?: number | null
          created_at?: string | null
          discount?: number | null
          grand_total?: number
          gst_type?: string
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          locked_at?: string | null
          locked_by?: string | null
          notes?: string | null
          payment_type?: string
          po_number: string
          purchase_date?: string
          sgst_amount?: number | null
          sgst_rate?: number | null
          status?: string
          subtotal?: number
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          cgst_amount?: number | null
          cgst_rate?: number | null
          created_at?: string | null
          discount?: number | null
          grand_total?: number
          gst_type?: string
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          locked_at?: string | null
          locked_by?: string | null
          notes?: string | null
          payment_type?: string
          po_number?: string
          purchase_date?: string
          sgst_amount?: number | null
          sgst_rate?: number | null
          status?: string
          subtotal?: number
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "po_suppliers"
            referencedColumns: ["id"]
          },
        ]
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
      returns_rejections: {
        Row: {
          action_taken: string | null
          batch_id: string | null
          cost_per_unit: number | null
          created_at: string | null
          customer_name: string | null
          id: string
          images: string[] | null
          job_order_id: string | null
          notes: string | null
          product_name: string
          quantity: number
          reason_category: string
          reason_details: string | null
          reference_id: string | null
          reference_type: string | null
          reported_by: string | null
          reported_date: string
          resolved_date: string | null
          return_type: string
          status: string
          total_cost_impact: number | null
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          batch_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          images?: string[] | null
          job_order_id?: string | null
          notes?: string | null
          product_name: string
          quantity?: number
          reason_category: string
          reason_details?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reported_by?: string | null
          reported_date?: string
          resolved_date?: string | null
          return_type: string
          status?: string
          total_cost_impact?: number | null
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          batch_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          customer_name?: string | null
          id?: string
          images?: string[] | null
          job_order_id?: string | null
          notes?: string | null
          product_name?: string
          quantity?: number
          reason_category?: string
          reason_details?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reported_by?: string | null
          reported_date?: string
          resolved_date?: string | null
          return_type?: string
          status?: string
          total_cost_impact?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_rejections_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "job_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_rejections_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "external_job_orders"
            referencedColumns: ["id"]
          },
        ]
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
      salary_advance_entries: {
        Row: {
          advance_date: string
          amount: number
          closed_at: string | null
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          operation: string
          salary_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          advance_date?: string
          amount?: number
          closed_at?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          operation: string
          salary_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          advance_date?: string
          amount?: number
          closed_at?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          operation?: string
          salary_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_advance_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "job_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_advance_entries_salary_id_fkey"
            columns: ["salary_id"]
            isOneToOne: false
            referencedRelation: "external_job_salaries"
            referencedColumns: ["id"]
          },
        ]
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
      staff_absences: {
        Row: {
          created_at: string
          from_date: string
          id: string
          reason: string | null
          staff_id: string
          to_date: string
        }
        Insert: {
          created_at?: string
          from_date: string
          id?: string
          reason?: string | null
          staff_id: string
          to_date: string
        }
        Update: {
          created_at?: string
          from_date?: string
          id?: string
          reason?: string | null
          staff_id?: string
          to_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_absences_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          is_active: boolean
          joined_date: string | null
          notes: string | null
          salary_amount: number | null
          salary_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          is_active?: boolean
          joined_date?: string | null
          notes?: string | null
          salary_amount?: number | null
          salary_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          is_active?: boolean
          joined_date?: string | null
          notes?: string | null
          salary_amount?: number | null
          salary_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "job_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salary_entries: {
        Row: {
          amount: number
          category: string
          created_at: string
          entry_date: string
          id: string
          notes: string | null
          staff_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          staff_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_salary_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
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
      generate_dc_number: { Args: never; Returns: string }
      generate_fy_invoice_number: {
        Args: { invoice_date: string; invoice_num: number }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      generate_po_number: { Args: never; Returns: string }
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
      has_app_access: {
        Args: {
          _app_name: Database["public"]["Enums"]["internal_app"]
          _user_id: string
        }
        Returns: boolean
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
      log_activity: {
        Args: {
          p_action: string
          p_description?: string
          p_entity_id?: string
          p_entity_name?: string
          p_entity_type: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: string
      }
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
      interest_level: "hot" | "warm" | "cold" | "not_interested"
      internal_app:
        | "market_intel"
        | "analytics_hub"
        | "production_tracker"
        | "inventory_scanner"
        | "admin_forms"
      payment_terms:
        | "advance"
        | "cod"
        | "credit_7"
        | "credit_15"
        | "credit_30"
        | "credit_45"
        | "credit_60"
      shop_type:
        | "retail_showroom"
        | "wholesale_dealer"
        | "distributor"
        | "boutique"
        | "department_store"
        | "online_seller"
        | "factory_outlet"
        | "other"
      visit_purpose:
        | "new_lead"
        | "follow_up"
        | "order_collection"
        | "payment_collection"
        | "complaint"
        | "market_survey"
        | "competitor_analysis"
        | "other"
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
      interest_level: ["hot", "warm", "cold", "not_interested"],
      internal_app: [
        "market_intel",
        "analytics_hub",
        "production_tracker",
        "inventory_scanner",
        "admin_forms",
      ],
      payment_terms: [
        "advance",
        "cod",
        "credit_7",
        "credit_15",
        "credit_30",
        "credit_45",
        "credit_60",
      ],
      shop_type: [
        "retail_showroom",
        "wholesale_dealer",
        "distributor",
        "boutique",
        "department_store",
        "online_seller",
        "factory_outlet",
        "other",
      ],
      visit_purpose: [
        "new_lead",
        "follow_up",
        "order_collection",
        "payment_collection",
        "complaint",
        "market_survey",
        "competitor_analysis",
        "other",
      ],
    },
  },
} as const
