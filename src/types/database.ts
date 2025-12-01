export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          service_id: string | null;
          amount: number;
          charged_amount: number | null;
          reference: string;
          status: 'pending' | 'processing' | 'success' | 'failed';
          meta: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          service_id?: string | null;
          amount: number;
          charged_amount?: number | null;
          reference: string;
          status?: 'pending' | 'processing' | 'success' | 'failed';
          meta?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          service_id?: string | null;
          amount?: number;
          charged_amount?: number | null;
          reference?: string;
          status?: 'pending' | 'processing' | 'success' | 'failed';
          meta?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      topups: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: 'pending' | 'processing' | 'success' | 'failed';
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status?: 'pending' | 'processing' | 'success' | 'failed';
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          status?: 'pending' | 'processing' | 'success' | 'failed';
          meta?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Topup = Database['public']['Tables']['topups']['Row'];
export type TransactionStatus = Transaction['status'];
export type TopupStatus = Topup['status'];
