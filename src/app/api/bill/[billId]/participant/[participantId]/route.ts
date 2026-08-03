import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { claimItem } from '@/services/itemClaim/claimItem';
import { unclaimItem } from '@/services/itemClaim/unclaimItem';
import { claimItemSchema, unclaimItemSchema } from '@/schemas/itemClaim';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError, BillOwnershipError } from '@/lib/errors/billErrors';
import { BillItemNotFoundError } from '@/lib/errors/itemClaimErrors';
import { ParticipantNotFoundError } from '@/lib/errors/participantErrors';

function toErrorResponse(error: unknown) {
  if (error instanceof UnauthenticatedError) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
  }

  if (error instanceof BillNotFoundError) {
    return NextResponse.json({ error: 'bill_not_found' }, { status: StatusCodes.NOT_FOUND });
  }

  if (error instanceof BillItemNotFoundError) {
    return NextResponse.json({ error: 'item_not_found' }, { status: StatusCodes.NOT_FOUND });
  }

  if (error instanceof ParticipantNotFoundError) {
    return NextResponse.json({ error: 'participant_not_found' }, { status: StatusCodes.NOT_FOUND });
  }

  if (error instanceof BillOwnershipError) {
    return NextResponse.json({ error: 'forbidden' }, { status: StatusCodes.FORBIDDEN });
  }

  throw error;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  const body = await request.json();
  const parsedBody = claimItemSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();

    await claimItem({ billId, currentUserId: currentUser.id, ...parsedBody.data });

    return NextResponse.json({ status: 'claimed' }, { status: StatusCodes.OK });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  const body = await request.json();
  const parsedBody = unclaimItemSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();

    await unclaimItem({ billId, currentUserId: currentUser.id, ...parsedBody.data });

    return NextResponse.json({ status: 'unclaimed' }, { status: StatusCodes.OK });
  } catch (error) {
    return toErrorResponse(error);
  }
}