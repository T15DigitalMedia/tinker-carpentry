export type Database = {
  __InternalSupabase: {
    PostgrestVersion: string;
  };
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          is_active: boolean;
          sale_price: number | null;
          made_to_order: boolean;
          lead_time_days: number | null;
          weight_g: number | null;
          sales_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          is_active?: boolean;
          sale_price?: number | null;
          made_to_order?: boolean;
          lead_time_days?: number | null;
          weight_g?: number | null;
          sales_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
        Relationships: [];
      };
      product_tags: {
        Row: {
          product_id: string;
          tag_id: string;
        };
        Insert: {
          product_id: string;
          tag_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_tags"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      admins: {
        Row: {
          user_id: string;
        };
        Insert: {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: "percent" | "fixed";
          discount_value: number;
          min_subtotal: number;
          usage_limit: number | null;
          times_used: number;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: "percent" | "fixed";
          discount_value: number;
          min_subtotal?: number;
          usage_limit?: number | null;
          times_used?: number;
          is_active?: boolean;
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          stripe_checkout_session_id: string;
          stripe_payment_intent_id: string | null;
          customer_email: string;
          customer_phone: string | null;
          subtotal: number;
          discount_cents: number;
          tax_cents: number;
          total: number;
          coupon_code: string | null;
          status: "paid" | "preparing" | "ready_for_pickup" | "collected" | "cancelled" | "refunded";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stripe_checkout_session_id: string;
          stripe_payment_intent_id?: string | null;
          customer_email: string;
          customer_phone?: string | null;
          subtotal: number;
          discount_cents?: number;
          tax_cents?: number;
          total: number;
          coupon_code?: string | null;
          status?: "paid" | "preparing" | "ready_for_pickup" | "collected" | "cancelled" | "refunded";
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          order_id: string;
          reviewer_email: string;
          rating: number;
          body: string;
          status: "pending" | "approved" | "hidden";
          admin_response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          order_id: string;
          reviewer_email: string;
          rating: number;
          body: string;
          status?: "pending" | "approved" | "hidden";
          admin_response?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      validate_coupon: {
        Args: { p_code: string; p_subtotal: number };
        Returns: {
          valid: boolean;
          reason: string | null;
          discount_cents: number;
          coupon_id: string | null;
        }[];
      };
      create_order_from_checkout_session: {
        Args: {
          p_stripe_checkout_session_id: string;
          p_stripe_payment_intent_id: string | null;
          p_customer_email: string;
          p_customer_phone: string | null;
          p_subtotal: number;
          p_discount_cents: number;
          p_tax_cents: number;
          p_total: number;
          p_coupon_code: string | null;
          p_items: {
            product_id: string | null;
            product_name: string;
            unit_price: number;
            quantity: number;
          }[];
        };
        Returns: { order_id: string; is_new: boolean }[];
      };
      get_order_for_tracking: {
        Args: { p_order_ref: string; p_email: string };
        Returns: {
          order_id: string;
          status: string;
          created_at: string;
          subtotal: number;
          discount_cents: number;
          tax_cents: number;
          total: number;
          coupon_code: string | null;
          items: { product_name: string; quantity: number; unit_price: number }[];
        }[];
      };
      cancel_order_and_restock: {
        Args: { p_order_id: string };
        Returns: { order_id: string; transitioned: boolean }[];
      };
      refund_order_and_restock: {
        Args: { p_stripe_payment_intent_id: string };
        Returns: { order_id: string; transitioned: boolean }[];
      };
      submit_review: {
        Args: {
          p_order_ref: string;
          p_email: string;
          p_product_id: string;
          p_rating: number;
          p_body: string;
        };
        Returns: { id: string }[];
      };
    };
  };
};
