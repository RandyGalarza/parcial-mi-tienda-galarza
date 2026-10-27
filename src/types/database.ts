export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          user_id: string;
          client_id: string;
          name: string;
          quantity: number;
          price: number;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id?: string;
          client_id: string;
          name: string;
          quantity: number;
          price: number;
          updated_at: string;
          created_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string;
          client_id?: string;
          name?: string;
          quantity?: number;
          price?: number;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
