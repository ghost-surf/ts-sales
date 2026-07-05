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

export function create(data: CreateProductInput) {
  return prisma.product.create({ data, include });
}

export async function update(id: string, data: UpdateProductInput) {
  await get(id);
  return prisma.product.update({ where: { id }, data, include });
}

export async function remove(id: string) {
  await get(id);
  await prisma.product.delete({ where: { id } });
}

export async function adjustStock(id: string, { quantity, note }: AdjustStockInput) {
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
        type: quantity < 0 ? "debit" : "credit",
        quantity: Math.abs(quantity),
        unit: product.unit,
        note: note ?? "Ajuste manual de stock",
      },
    });

    return updated;
  });
}
