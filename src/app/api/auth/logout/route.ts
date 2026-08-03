import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { destroySession } from '@/lib/session/session';

export async function POST() {
  await destroySession();

  return NextResponse.json({ status: 'logged_out' }, { status: StatusCodes.OK });
}