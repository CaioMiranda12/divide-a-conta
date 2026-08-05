import type { BillStatus } from '@/generated/prisma/client';

export type ApiUser = { id: string; name: string; email: string };

export type ApiBillListItem = {
  id: string;
  restaurantName: string | null;
  status: BillStatus;
  createdAt: string;
};

export type ApiBillDetail = {
  id: string;
  userId: string;
  imageUrl: string;
  restaurantName: string | null;
  totalAmountInCents: number;
  serviceFeePercent: number;
  status: BillStatus;
  paidByParticipantId: string | null;
  createdAt: string;
};

export type ApiBillItemClaim = { participantId: string; splitCount: number };

export type ApiBillItem = {
  id: string;
  billId: string;
  description: string;
  priceInCents: number;
  quantity: number;
  claims: ApiBillItemClaim[];
};

export type ApiBillParticipant = { id: string; displayName: string };

export type ApiBillSummaryParticipant = {
  participantId: string;
  displayName: string;
  amountInCents: number;
  items: { billItemId: string; description: string; amountInCents: number }[];
};

export type ApiBillDebt = {
  participantId: string;
  displayName: string;
  amountOwedInCents: number;
};

export type ApiBillPayer = { participantId: string; displayName: string };

export type ApiBillClaimStats = { claimedItemsCount: number; totalItemsCount: number };

export type ApiBillSummary = {
  bill: { id: string; restaurantName: string | null; totalAmountInCents: number };
  participants: ApiBillSummaryParticipant[];
  hasUnclaimedItems: boolean;
  payer: ApiBillPayer | null;
  debts: ApiBillDebt[];
  claimStats: ApiBillClaimStats;
};

