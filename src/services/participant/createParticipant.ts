import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError } from '@/lib/errors/billErrors';
import { DisplayNameAlreadyInUseError } from '@/lib/errors/participantErrors';

const UNIQUE_CONSTRAINT_VIOLATION_CODE = 'P2002';

export async function createParticipant({
  billId,
  currentUserId,
  displayName,
}: {
  billId: string;
  currentUserId: string;
  displayName: string;
}) {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  try {
    return await prisma.participant.create({ data: { billId, displayName } });
  } catch (error) {
    const isUniqueConstraintViolation =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE;

    if (isUniqueConstraintViolation) throw new DisplayNameAlreadyInUseError();

    throw error;
  }
}