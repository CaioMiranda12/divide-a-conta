import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { loginSchema } from '@/schemas/auth';
import { loginUser } from '@/services/auth/loginUser';
import { InvalidCredentialsError } from '@/lib/errors/authErrors';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const user = await loginUser(parsedBody.data);

    return NextResponse.json({ user }, { status: StatusCodes.OK });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { error: 'invalid_credentials' },
        { status: StatusCodes.UNAUTHORIZED },
      );
    }

    throw error;
  }
}