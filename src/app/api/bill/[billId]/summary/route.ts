import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { getBillSummary } from '@/services/bill/getBillSummary';
import { checkBillSummaryRateLimit } from '@/lib/ratelimit';
import { isValidUuid } from '@/utils/uuid';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError } from '@/lib/errors/billErrors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  if (!isValidUuid({ value: billId })) {
    return NextResponse.json({ error: 'invalid_bill_id' }, { status: StatusCodes.BAD_REQUEST });
  }

  const isRateLimited = checkBillSummaryRateLimit({ billId });

  if (isRateLimited) {
    return NextResponse.json({ error: 'rate_limited' }, { status: StatusCodes.TOO_MANY_REQUESTS });
  }

  try {
    await requireCurrentUser();

    const summary = await getBillSummary({ billId });

    return NextResponse.json(summary, { status: StatusCodes.OK });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
    }

    if (error instanceof BillNotFoundError) {
      return NextResponse.json({ error: 'bill_not_found' }, { status: StatusCodes.NOT_FOUND });
    }

    throw error;
  }
}