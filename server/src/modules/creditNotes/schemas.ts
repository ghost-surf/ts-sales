import { z } from "zod";

export const createCreditNoteSchema = z.object({
  documentId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export type CreateCreditNoteInput = z.infer<typeof createCreditNoteSchema>;
