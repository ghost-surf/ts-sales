import { prisma } from "../../lib/prisma";

export function list() {
  return prisma.stockMovement.findMany({
    include: {
      product: { select: { id: true, name: true, unit: true } },
      operator: { select: { id: true, name: true, email: true } },
      document: { select: { id: true, code: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
