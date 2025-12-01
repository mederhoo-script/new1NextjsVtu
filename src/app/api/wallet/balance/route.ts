import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If wallet doesn't exist, create one
      if (error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single();

        if (createError) {
          return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
        }

        return NextResponse.json({ wallet: newWallet });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
