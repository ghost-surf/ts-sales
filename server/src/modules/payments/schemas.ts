import { z } from "zod";

export const createPaymentSchema = z
  .object({
    method: z.enum(["numerario", "cheque"]),
    chequeNumber: z.string().optional(),
    allocations: z
      .array(
        z.object({
          documentId: z.string().min(1),
          amount: z.number().positive("O valor da alocação deve ser maior que zero"),
        })
      )
      .min(1, "É necessário alocar o pagamento a pelo menos um documento"),
  })
  .refine((data) => data.method !== "cheque" || !!data.chequeNumber, {
    message: "Número de cheque é obrigatório para pagamentos por cheque",
    path: ["chequeNumber"],
  });

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
