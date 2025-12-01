import { NextRequest, NextResponse } from 'next/server';
import inlomaxService from '@/lib/inlomax';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const network = searchParams.get('network');

    if (!network) {
      return NextResponse.json(
        { error: 'Network parameter is required' },
        { status: 400 }
      );
    }

    const response = await inlomaxService.getDataPlans(network);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Get data plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data plans' },
      { status: 500 }
    );
  }
}
