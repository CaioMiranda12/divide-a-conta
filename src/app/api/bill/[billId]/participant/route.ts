import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { joinBill } from '@/services/participant/joinBill';
import { isValidUuid } from '@/utils/uuid';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError, BillNotOpenError } from '@/lib/errors/billErrors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  if (!isValidUuid({ value: billId })) {
    return NextResponse.json({ error: 'invalid_bill_id' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();
    const { participant, wasCreated } = await joinBill({ billId, userId: currentUser.id });

    return NextResponse.json(
      { participant },
      { status: wasCreated ? StatusCodes.CREATED : StatusCodes.OK },
    );
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
    }

    if (error instanceof BillNotFoundError) {
      return NextResponse.json({ error: 'bill_not_found' }, { status: StatusCodes.NOT_FOUND });
    }

    if (error instanceof BillNotOpenError) {
      return NextResponse.json({ error: 'bill_not_open' }, { status: StatusCodes.CONFLICT });
    }

    throw error;
  }
}