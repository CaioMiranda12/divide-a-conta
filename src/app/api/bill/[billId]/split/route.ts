import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { saveBillSplit } from '@/services/participant/saveBillSplit';
import { saveBillSplitSchema } from '@/schemas/billSplit';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { BillNotFoundError, BillOwnershipError, BillNotOpenForEditingError } from '@/lib/errors/billErrors';
import { DisplayNameAlreadyInUseError } from '@/lib/errors/participantErrors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  const body = await request.json();
  const parsedBody = saveBillSplitSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const currentUser = await requireCurrentUser();

    await saveBillSplit({ billId, currentUserId: currentUser.id, ...parsedBody.data });

    return NextResponse.json({ status: 'saved' }, { status: StatusCodes.OK });
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

    if (error instanceof BillNotOpenForEditingError) {
      return NextResponse.json({ error: 'bill_not_open' }, { status: StatusCodes.CONFLICT });
    }

    if (error instanceof DisplayNameAlreadyInUseError) {
      return NextResponse.json({ error: 'display_name_already_in_use' }, { status: StatusCodes.CONFLICT });
    }

    throw error;
  }
}