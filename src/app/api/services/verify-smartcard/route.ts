import { NextRequest, NextResponse } from 'next/server';
import inlomaxService from '@/lib/inlomax';

export async function POST(request: NextRequest) {
  try {
    const { cableName, smartCardNumber } = await request.json();

    if (!cableName || !smartCardNumber) {
      return NextResponse.json(
        { error: 'Cable name and smart card number are required' },
        { status: 400 }
      );
    }

    const response = await inlomaxService.verifySmartCard({
      cablename: cableName,
      smart_card_number: smartCardNumber,
    });

    if (response.status) {
      return NextResponse.json({
        customerName: response.Customer_Name,
        status: response.Status,
        currentBouquet: response.Current_Bouquet,
        dueDate: response.Due_Date,
      });
    } else {
      return NextResponse.json(
        { error: response.message || 'Smart card verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify smart card error:', error);
    return NextResponse.json(
      { error: 'Failed to verify smart card' },
      { status: 500 }
    );
  }
}
