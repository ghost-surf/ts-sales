import { prisma } from "../../lib/prisma";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { CreateProductInput, UpdateProductInput, AdjustStockInput } from "./schemas";

const include = { category: true } as const;

export function list() {
  return prisma.product.findMany({ include, orderBy: { name: "asc" } });
}

export async function get(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include });
  if (!product) throw new NotFoundError("Produto não encontrado");
  return product;
}

export async function create(operatorId: string, data: CreateProductInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data, include });

    if (Number(product.stockQty) > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          operatorId,
          type: "credit",
          quantity: product.stockQty,
          unit: product.unit,
          note: "Stock inicial do produto",
        },
      });
    }

    return product;
  });
}

export async function update(id: string, operatorId: string, data: UpdateProductInput) {
  const existing = await get(id);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({ where: { id }, data, include });

    if (data.stockQty !== undefined) {
      const diff = Number(data.stockQty) - Number(existing.stockQty);
      if (diff !== 0) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            operatorId,
            type: diff > 0 ? "credit" : "debit",
            quantity: Math.abs(diff),
            unit: updated.unit,
            note: "Ajuste de stock via edição do produto",
          },
        });
      }
    }

    return updated;
  });
}

export async function remove(id: string) {
  await get(id);
  await prisma.product.delete({ where: { id } });
}

export async function adjustStock(id: string, operatorId: string, { quantity, note }: AdjustStockInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError("Produto não encontrado");

    const newStock = Number(product.stockQty) + quantity;
    if (newStock < 0) throw new BadRequestError("Stock resultante não pode ser negativo");

    const updated = await tx.product.update({
      where: { id },
      data: { stockQty: newStock },
      include,
    });

    await tx.stockMovement.create({
      data: {
        productId: id,
        operatorId,
        type: quantity < 0 ? "debit" : "credit",
        quantity: Math.abs(quantity),
        unit: product.unit,
        note: note ?? "Ajuste manual de stock",
      },
    });

    return updated;
  });
}
