import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { registerSchema } from '@/schemas/auth';
import { registerUser } from '@/services/auth/registerUser';
import { EmailAlreadyInUseError } from '@/lib/errors/authErrors';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const user = await registerUser(parsedBody.data);

    return NextResponse.json({ user }, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      return NextResponse.json(
        { error: 'email_already_in_use' },
        { status: StatusCodes.CONFLICT },
      );
    }

    throw error;
  }
}