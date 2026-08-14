import { z } from 'zod';

export const saveBillSplitSchema = z.object({
  participants: z.array(z.object({ displayName: z.string().min(1).max(100) })),
  claims: z.array(
    z.object({
      billItemId: z.string(),
      participantDisplayName: z.string(),
      splitCount: z.number().int().positive(),
    }),
  ),
  payerDisplayName: z.string().nullable(),
});