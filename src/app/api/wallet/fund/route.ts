import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateReference } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, paymentReference } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    const reference = generateReference();
    const newBalance = wallet.balance + amount;

    // Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update wallet' },
        { status: 500 }
      );
    }

    // Record transaction
    const { error: transactionError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'wallet_fund',
      amount: amount,
      status: 'success',
      reference: reference,
      description: 'Wallet funding',
      metadata: { payment_reference: paymentReference },
    });

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
    }

    return NextResponse.json({
      message: 'Wallet funded successfully',
      balance: newBalance,
      reference: reference,
    });
  } catch (error) {
    console.error('Wallet fund error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
