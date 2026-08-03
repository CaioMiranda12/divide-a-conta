import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { requireCurrentUser } from '@/services/auth/getCurrentUser';
import { createBill } from '@/services/bill/createBill';
import { listBillsForUser } from '@/services/bill/listBillsForUser';
import { checkBillUploadRateLimit } from '@/lib/ratelimit';
import { UnauthenticatedError } from '@/lib/errors/authErrors';
import { ImageRequiredError, OcrFailedError } from '@/lib/errors/billErrors';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireCurrentUser();

    const isRateLimited = await checkBillUploadRateLimit({ userId: currentUser.id });

    if (isRateLimited) {
      return NextResponse.json({ error: 'rate_limited' }, { status: StatusCodes.TOO_MANY_REQUESTS });
    }

    const formData = await request.formData();
    const image = formData.get('image');

    const { billId } = await createBill({ userId: currentUser.id, image });

    return NextResponse.json({ billId }, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
    }

    if (error instanceof ImageRequiredError) {
      return NextResponse.json({ error: 'image_required' }, { status: StatusCodes.BAD_REQUEST });
    }

    if (error instanceof OcrFailedError) {
      return NextResponse.json({ error: 'ocr_failed' }, { status: StatusCodes.UNPROCESSABLE_ENTITY });
    }

    throw error;
  }
}

export async function GET() {
  try {
    const currentUser = await requireCurrentUser();
    const bills = await listBillsForUser({ userId: currentUser.id });

    return NextResponse.json({ bills }, { status: StatusCodes.OK });
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
    }

    throw error;
  }
}