import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateReference } from '@/lib/utils';
import inlomaxService from '@/lib/inlomax';

// Price per exam pin
const EXAM_PRICES: Record<string, number> = {
  WAEC: 3450,
  NECO: 1200,
  NABTEB: 1500,
  JAMB: 4700,
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examType, quantity = 1 } = await request.json();

    // Validate inputs
    if (!examType) {
      return NextResponse.json(
        { error: 'Exam type is required' },
        { status: 400 }
      );
    }

    if (!EXAM_PRICES[examType]) {
      return NextResponse.json(
        { error: 'Invalid exam type' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 10' },
        { status: 400 }
      );
    }

    const amount = EXAM_PRICES[examType] * quantity;

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
        type: 'education',
        amount: amount,
        status: 'pending',
        reference: reference,
        description: `${examType} Pin(s) x${quantity}`,
        metadata: { exam_type: examType, quantity },
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
      const inlomaxResponse = await inlomaxService.purchaseEducationPins({
        exam_name: examType,
        quantity: quantity,
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
              inlomax_request_id: inlomaxResponse.request_id,
              pins: inlomaxResponse.pins,
            } 
          })
          .eq('id', transaction.id);

        return NextResponse.json({
          message: 'Education pin purchase successful',
          reference: reference,
          amount: amount,
          examType: examType,
          quantity: quantity,
          pins: inlomaxResponse.pins,
        });
      } else {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id);

        return NextResponse.json(
          { error: inlomaxResponse.message || 'Education pin purchase failed' },
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
    console.error('Education pin purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    exams: Object.entries(EXAM_PRICES).map(([name, price]) => ({
      name,
      price,
    })),
  });
}
