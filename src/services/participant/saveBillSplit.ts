import { prisma } from '@/lib/db/prisma';
import { verifyBillOwnership } from '@/services/bill/verifyBillOwnership';
import { BillNotFoundError, BillNotOpenForEditingError } from '@/lib/errors/billErrors';
import { DisplayNameAlreadyInUseError } from '@/lib/errors/participantErrors';

export async function saveBillSplit({
  billId,
  currentUserId,
  participants,
  claims,
  payerDisplayName,
}: {
  billId: string;
  currentUserId: string;
  participants: { displayName: string }[];
  claims: { billItemId: string; participantDisplayName: string; splitCount: number }[];
  payerDisplayName: string | null;
}): Promise<void> {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });

  if (!bill) throw new BillNotFoundError();

  verifyBillOwnership({ billOwnerId: bill.userId, currentUserId });

  const isOpen = bill.status === 'open';

  if (!isOpen) throw new BillNotOpenForEditingError();

  const hasDuplicateNames = new Set(participants.map((p) => p.displayName)).size !== participants.length;

  if (hasDuplicateNames) throw new DisplayNameAlreadyInUseError();

  await prisma.$transaction(async (tx) => {
    await tx.bill.update({ where: { id: billId }, data: { paidByParticipantId: null } });
    await tx.participant.deleteMany({ where: { billId } });

    const displayNameToId = new Map<string, string>();

    for (const participant of participants) {
      const created = await tx.participant.create({ data: { billId, displayName: participant.displayName } });
      displayNameToId.set(participant.displayName, created.id);
    }

    for (const claim of claims) {
      const participantId = displayNameToId.get(claim.participantDisplayName);

      if (!participantId) continue;

      await tx.itemClaim.create({
        data: { billItemId: claim.billItemId, participantId, splitCount: claim.splitCount },
      });
    }

    const payerId = payerDisplayName ? displayNameToId.get(payerDisplayName) ?? null : null;

    await tx.bill.update({ where: { id: billId }, data: { paidByParticipantId: payerId } });
  });
}