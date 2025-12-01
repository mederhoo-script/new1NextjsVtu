import { NextRequest, NextResponse } from 'next/server';
import inlomaxService from '@/lib/inlomax';

export async function POST(request: NextRequest) {
  try {
    const { disco, meterNumber, meterType } = await request.json();

    if (!disco || !meterNumber || !meterType) {
      return NextResponse.json(
        { error: 'Disco, meter number, and meter type are required' },
        { status: 400 }
      );
    }

    const response = await inlomaxService.verifyMeterNumber({
      disco_name: disco,
      meter_number: meterNumber,
      MeterType: meterType,
    });

    if (response.status) {
      return NextResponse.json({
        customerName: response.Customer_Name,
        customerAddress: response.Customer_Address,
        meterNumber: response.Meter_Number,
      });
    } else {
      return NextResponse.json(
        { error: response.message || 'Meter verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify meter error:', error);
    return NextResponse.json(
      { error: 'Failed to verify meter number' },
      { status: 500 }
    );
  }
}
