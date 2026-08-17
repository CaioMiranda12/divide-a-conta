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
  imageUrl: string | null;
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
  subtotalInCents: number;
  serviceFeeInCents: number;
  amountInCents: number;
  items: { billItemId: string; description: string; amountInCents: number }[];
};

export type ApiBillDebt = {
  participantId: string;
  displayName: string;
  amountOwedInCents: number;
  hasPaid: boolean;
};

export type ApiBillPayer = { participantId: string; displayName: string };

export type ApiBillClaimStats = { claimedItemsCount: number; totalItemsCount: number };

export type ApiBillSummary = {
  bill: { id: string; restaurantName: string | null; totalAmountInCents: number; serviceFeePercent: number };
  participants: ApiBillSummaryParticipant[];
  hasUnclaimedItems: boolean;
  payer: ApiBillPayer | null;
  debts: ApiBillDebt[];
  totalRemainingInCents: number;
  claimStats: ApiBillClaimStats;
};

export type ApiMergedBillEntry = {
  billId: string;
  restaurantName: string | null;
  totalAmountInCents: number;
  hasUnclaimedItems: boolean;
  payer: ApiBillPayer | null;
  debts: ApiBillDebt[];
};

export type ApiCombinedParticipant = {
  displayName: string;
  totalAmountInCents: number;
  bills: { billId: string; restaurantName: string | null; amountInCents: number }[];
};

export type ApiParticipantBalance = { displayName: string; balanceInCents: number };
export type ApiMinimalTransfer = { fromDisplayName: string; toDisplayName: string; amountInCents: number };

export type ApiMergedBillSummary = {
  bills: ApiMergedBillEntry[];
  combinedParticipants: ApiCombinedParticipant[];
  combinedTotalInCents: number;
  balances: ApiParticipantBalance[];
  minimalTransfers: ApiMinimalTransfer[];
};