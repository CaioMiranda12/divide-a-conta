import { z } from 'zod';

export const createParticipantSchema = z.object({
  displayName: z.string().min(1).max(100),
});