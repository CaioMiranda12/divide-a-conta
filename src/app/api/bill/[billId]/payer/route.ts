import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { setBillPayer } from '@/services/bill/setBillPayer';
import { setBillPayerSchema } from '@/schemas/billPayer';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError, BillOwnershipError } from '@/lib/errors/billErrors';
import { ParticipantNotFoundError } from '@/lib/errors/participantErrors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  const body = await request.json();
  const parsedBody = setBillPayerSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();

    await setBillPayer({ billId, currentUserId: currentUser.id, participantId: parsedBody.data.participantId });

    return NextResponse.json({ status: 'updated' }, { status: StatusCodes.OK });
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

    if (error instanceof ParticipantNotFoundError) {
      return NextResponse.json({ error: 'participant_not_found' }, { status: StatusCodes.NOT_FOUND });
    }

    throw error;
  }
}