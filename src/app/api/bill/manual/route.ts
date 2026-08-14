import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { createManualBill } from '@/services/bill/createManualBill';
import { UnauthenticatedError } from '@/lib/errors/authErrors';

export async function POST() {
  try {
    const currentUser = await requireCurrentUser();

    const { billId } = await createManualBill({ userId: currentUser.id });

    return NextResponse.json({ billId }, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
    }

    throw error;
  }
}