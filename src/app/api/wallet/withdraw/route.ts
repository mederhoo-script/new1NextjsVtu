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

    const { amount, bankAccount, bankName } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!bankAccount || !bankName) {
      return NextResponse.json(
        { error: 'Bank details are required' },
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

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    const reference = generateReference();
    const newBalance = wallet.balance - amount;

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
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'wallet_transfer',
      amount: -amount,
      status: 'pending',
      reference: reference,
      description: `Withdrawal to ${bankName}`,
      metadata: { bank_account: bankAccount, bank_name: bankName },
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted',
      balance: newBalance,
      reference: reference,
    });
  } catch (error) {
    console.error('Wallet withdraw error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
