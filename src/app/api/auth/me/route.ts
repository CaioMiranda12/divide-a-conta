import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { getCurrentUser } from '@/services/auth/getCurrentUser';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: StatusCodes.OK });
  }

  return NextResponse.json({ user }, { status: StatusCodes.OK });
}