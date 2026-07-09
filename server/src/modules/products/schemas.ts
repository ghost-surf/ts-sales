import { z } from "zod";

export const createProductSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  stockQty: z.number().nonnegative().default(0),
  lowStockThreshold: z.number().nonnegative().default(0),
  unit: z.enum(["metros", "pcs", "kg", "litros"]),
});

export const updateProductSchema = createProductSchema.partial();

export const adjustStockSchema = z.object({
  quantity: z.number().refine((v) => v !== 0, "Quantidade não pode ser zero"),
  note: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
