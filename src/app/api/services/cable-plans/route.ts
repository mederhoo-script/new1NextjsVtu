import { NextRequest, NextResponse } from 'next/server';
import inlomaxService from '@/lib/inlomax';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cablename = searchParams.get('cablename');

    if (!cablename) {
      return NextResponse.json(
        { error: 'Cable name parameter is required' },
        { status: 400 }
      );
    }

    const response = await inlomaxService.getCablePlans(cablename);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Get cable plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cable plans' },
      { status: 500 }
    );
  }
}
