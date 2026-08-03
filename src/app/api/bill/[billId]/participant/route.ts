import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { createParticipant } from '@/services/participant/createParticipant';
import { createParticipantSchema } from '@/schemas/participant';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError, BillOwnershipError } from '@/lib/errors/billErrors';
import { DisplayNameAlreadyInUseError } from '@/lib/errors/participantErrors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  const body = await request.json();
  const parsedBody = createParticipantSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();

    const participant = await createParticipant({
      billId,
      currentUserId: currentUser.id,
      displayName: parsedBody.data.displayName,
    });

    return NextResponse.json({ participant }, { status: StatusCodes.CREATED });
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

    if (error instanceof DisplayNameAlreadyInUseError) {
      return NextResponse.json({ error: 'display_name_already_in_use' }, { status: StatusCodes.CONFLICT });
    }

    throw error;
  }
}