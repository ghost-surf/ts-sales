import { z } from "zod";

export const createPaymentSchema = z
  .object({
    method: z.enum(["numerario", "cheque", "transferencia"]),
    chequeNumber: z.string().optional(),
    bankName: z.string().optional(),
    transferReference: z.string().optional(),
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
  })
  .refine((data) => data.method !== "transferencia" || !!data.bankName, {
    message: "Nome do banco é obrigatório para pagamentos por transferência",
    path: ["bankName"],
  })
  .refine((data) => data.method !== "transferencia" || !!data.transferReference, {
    message: "Referência da transferência é obrigatória para pagamentos por transferência",
    path: ["transferReference"],
  });

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
