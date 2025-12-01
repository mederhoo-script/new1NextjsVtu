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

    const { amount, recipientEmail } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      );
    }

    // Get sender's wallet
    const { data: senderWallet, error: senderError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (senderError) {
      return NextResponse.json(
        { error: 'Sender wallet not found' },
        { status: 404 }
      );
    }

    if (senderWallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Find recipient by email
    const { data: recipient, error: recipientFindError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', recipientEmail)
      .single();

    if (recipientFindError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    if (recipient.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot transfer to yourself' },
        { status: 400 }
      );
    }

    // Get recipient's wallet
    const { data: recipientWallet, error: recipientWalletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', recipient.id)
      .single();

    if (recipientWalletError) {
      return NextResponse.json(
        { error: 'Recipient wallet not found' },
        { status: 404 }
      );
    }

    const reference = generateReference();

    // Update sender's wallet
    const { error: senderUpdateError } = await supabase
      .from('wallets')
      .update({ 
        balance: senderWallet.balance - amount, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', user.id);

    if (senderUpdateError) {
      return NextResponse.json(
        { error: 'Failed to update sender wallet' },
        { status: 500 }
      );
    }

    // Update recipient's wallet
    const { error: recipientUpdateError } = await supabase
      .from('wallets')
      .update({ 
        balance: recipientWallet.balance + amount, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', recipient.id);

    if (recipientUpdateError) {
      // Rollback sender's wallet
      await supabase
        .from('wallets')
        .update({ balance: senderWallet.balance })
        .eq('user_id', user.id);
        
      return NextResponse.json(
        { error: 'Failed to update recipient wallet' },
        { status: 500 }
      );
    }

    // Record sender's transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'wallet_transfer',
      amount: -amount,
      status: 'success',
      reference: reference,
      description: `Transfer to ${recipientEmail}`,
      metadata: { recipient_id: recipient.id, recipient_email: recipientEmail },
    });

    // Record recipient's transaction
    await supabase.from('transactions').insert({
      user_id: recipient.id,
      type: 'wallet_transfer',
      amount: amount,
      status: 'success',
      reference: reference,
      description: `Transfer from ${user.email}`,
      metadata: { sender_id: user.id, sender_email: user.email },
    });

    return NextResponse.json({
      message: 'Transfer successful',
      balance: senderWallet.balance - amount,
      reference: reference,
    });
  } catch (error) {
    console.error('Wallet transfer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
