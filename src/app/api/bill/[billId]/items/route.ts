import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { updateBillItems } from '@/services/bill/updateBillItems';
import { updateBillSchema } from '@/schemas/bill';
import { isValidUuid } from '@/utils/uuid';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError, BillOwnershipError, BillNotEditableError } from '@/lib/errors/billErrors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  if (!isValidUuid({ value: billId })) {
    return NextResponse.json({ error: 'invalid_bill_id' }, { status: StatusCodes.BAD_REQUEST });
  }

  const body = await request.json();
  const parsedBody = updateBillSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();
    const items = await updateBillItems({ billId, currentUserId: currentUser.id, ...parsedBody.data });

    return NextResponse.json({ items }, { status: StatusCodes.OK });
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

    if (error instanceof BillNotEditableError) {
      return NextResponse.json({ error: 'bill_not_editable' }, { status: StatusCodes.CONFLICT });
    }

    throw error;
  }
}