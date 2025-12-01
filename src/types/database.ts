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
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'airtime' | 'data' | 'electricity' | 'cable' | 'education' | 'wallet_fund' | 'wallet_transfer';
          amount: number;
          status: 'pending' | 'success' | 'failed';
          reference: string;
          description: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'airtime' | 'data' | 'electricity' | 'cable' | 'education' | 'wallet_fund' | 'wallet_transfer';
          amount: number;
          status?: 'pending' | 'success' | 'failed';
          reference: string;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'airtime' | 'data' | 'electricity' | 'cable' | 'education' | 'wallet_fund' | 'wallet_transfer';
          amount?: number;
          status?: 'pending' | 'success' | 'failed';
          reference?: string;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
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
export type TransactionType = Transaction['type'];
export type TransactionStatus = Transaction['status'];
