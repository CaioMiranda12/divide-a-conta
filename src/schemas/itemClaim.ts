import { z } from 'zod';

export const claimItemSchema = z.object({
  billItemId: z.string(),
  splitCount: z.number().int().positive(),
});

export const unclaimItemSchema = z.object({
  billItemId: z.string(),
});