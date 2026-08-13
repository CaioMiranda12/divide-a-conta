import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { getMergedBillSummary } from '@/services/bill/getMergedBillSummary';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError, BillOwnershipError } from '@/lib/errors/billErrors';

const MIN_BILLS_TO_MERGE = 2;

export async function GET(request: NextRequest) {
  const billIds = (request.nextUrl.searchParams.get('billIds') ?? '').split(',').filter(Boolean);

  const hasEnoughBills = billIds.length >= MIN_BILLS_TO_MERGE;

  if (!hasEnoughBills) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();

    const summary = await getMergedBillSummary({ billIds, currentUserId: currentUser.id });

    return NextResponse.json(summary, { status: StatusCodes.OK });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
    }

    if (error instanceof BillNotFoundError) {
      return NextResponse.json({ error: 'bill_not_found' }, { status: StatusCodes.NOT_FOUND });
    }

    if (error instanceof BillOwnershipError) {
      return NextResponse.json({ error: 'forbidden' }, { status: StatusCodes.FORBIDDEN });
    }

    throw error;
  }
}