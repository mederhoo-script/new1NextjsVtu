import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateReference, sanitizePhoneNumber, validatePhoneNumber } from '@/lib/utils';
import inlomaxService from '@/lib/inlomax';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { network, phoneNumber, planId, amount, portedNumber = true } = await request.json();

    // Validate inputs
    if (!network || !phoneNumber || !planId || !amount) {
      return NextResponse.json(
        { error: 'Network, phone number, plan ID, and amount are required' },
        { status: 400 }
      );
    }

    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
    if (!validatePhoneNumber(sanitizedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Check wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    const reference = generateReference();

    // Create pending transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'data',
        amount: amount,
        status: 'pending',
        reference: reference,
        description: `${network} data bundle to ${sanitizedPhone}`,
        metadata: { network, phone_number: sanitizedPhone, plan_id: planId },
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    try {
      // Call Inlomax API
      const inlomaxResponse = await inlomaxService.purchaseData({
        network: network,
        mobile_number: sanitizedPhone,
        plan: planId,
        Ported_number: portedNumber,
      });

      if (inlomaxResponse.status) {
        // Deduct from wallet
        await supabase
          .from('wallets')
          .update({ 
            balance: wallet.balance - amount, 
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', user.id);

        // Update transaction status
        await supabase
          .from('transactions')
          .update({ 
            status: 'success', 
            metadata: { 
              ...transaction.metadata, 
              inlomax_request_id: inlomaxResponse.request_id 
            } 
          })
          .eq('id', transaction.id);

        return NextResponse.json({
          message: 'Data purchase successful',
          reference: reference,
          amount: amount,
          phoneNumber: sanitizedPhone,
          network: network,
        });
      } else {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id);

        return NextResponse.json(
          { error: inlomaxResponse.message || 'Data purchase failed' },
          { status: 400 }
        );
      }
    } catch (apiError) {
      // Update transaction status to failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      console.error('Inlomax API error:', apiError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Data purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
