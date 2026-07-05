import { z } from "zod";

export const createTaxSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  percentage: z.number().min(0).max(100),
});

export const updateTaxSchema = createTaxSchema.partial();

export type CreateTaxInput = z.infer<typeof createTaxSchema>;
export type UpdateTaxInput = z.infer<typeof updateTaxSchema>;
