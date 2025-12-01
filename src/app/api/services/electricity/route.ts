import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateReference } from '@/lib/utils';
import inlomaxService from '@/lib/inlomax';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { disco, meterNumber, amount, meterType } = await request.json();

    // Validate inputs
    if (!disco || !meterNumber || !amount || !meterType) {
      return NextResponse.json(
        { error: 'Disco, meter number, amount, and meter type are required' },
        { status: 400 }
      );
    }

    if (amount < 1000) {
      return NextResponse.json(
        { error: 'Minimum amount is ₦1,000' },
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
        type: 'electricity',
        amount: amount,
        status: 'pending',
        reference: reference,
        meta: { disco, meter_number: meterNumber, meter_type: meterType },
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
      const inlomaxResponse = await inlomaxService.payElectricityBill({
        disco_name: disco,
        meter_number: meterNumber,
        amount: amount,
        MeterType: meterType,
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
            meta: { 
              ...transaction.meta, 
              inlomax_request_id: inlomaxResponse.request_id,
              token: inlomaxResponse.token,
              units: inlomaxResponse.units,
            } 
          })
          .eq('id', transaction.id);

        return NextResponse.json({
          message: 'Electricity payment successful',
          reference: reference,
          amount: amount,
          meterNumber: meterNumber,
          token: inlomaxResponse.token,
          units: inlomaxResponse.units,
          customerName: inlomaxResponse.customer_name,
        });
      } else {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id);

        return NextResponse.json(
          { error: inlomaxResponse.message || 'Electricity payment failed' },
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
    console.error('Electricity payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
