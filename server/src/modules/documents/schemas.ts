import { z } from "zod";

export const documentItemSchema = z.object({
  itemType: z.enum(["product", "service"]),
  itemId: z.string().min(1),
  quantity: z.number().positive("Quantidade deve ser maior que zero"),
});

export const createDocumentSchema = z.object({
  type: z.enum(["FACT", "COT"]),
  clientId: z.string().min(1),
  items: z.array(documentItemSchema).min(1, "O documento precisa de pelo menos um item"),
  vatApplied: z.boolean().default(true),
  taxPercentage: z.number().min(0).max(100).default(0),
  discountValue: z.number().min(0).default(0),
  dueDate: z.coerce.date().optional(),
  status: z.enum(["draft", "issued"]).default("issued"),
});

export const listDocumentsQuerySchema = z.object({
  type: z.enum(["FACT", "COT"]).optional(),
  status: z.enum(["draft", "issued", "paid", "canceled", "accepted", "rejected"]).optional(),
  clientId: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["draft", "issued", "canceled", "accepted", "rejected"]),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
