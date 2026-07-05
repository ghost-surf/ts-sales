import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@hydrostock.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrador";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: { name: adminName, email: adminEmail, passwordHash, role: "admin" },
    });
    console.log(`Utilizador admin criado: ${adminEmail}`);
  } else {
    console.log(`Utilizador admin já existe: ${adminEmail}`);
  }

  const categoryDefs = [
    { name: "Tubos Alta Pressão", unit: "metros" as const },
    { name: "Conexões", unit: "pcs" as const },
    { name: "Serviços Técnicos", unit: "pcs" as const },
  ];

  const categories: Record<string, string> = {};
  for (const def of categoryDefs) {
    const existing = await prisma.category.findFirst({ where: { name: def.name } });
    const category = existing ?? (await prisma.category.create({ data: def }));
    categories[def.name] = category.id;
  }

  const productDefs = [
    {
      categoryName: "Tubos Alta Pressão",
      name: 'Tubo 1/2" Alta Pressão',
      description: "Tubo hidráulico de alta pressão 1/2 polegada",
      price: 12.5,
      stockQty: 100,
      lowStockThreshold: 10,
      unit: "metros" as const,
    },
    {
      categoryName: "Conexões",
      name: 'Curva 90º 3/4"',
      description: "Curva de 90 graus para tubo de 3/4 polegada",
      price: 8.75,
      stockQty: 50,
      lowStockThreshold: 5,
      unit: "pcs" as const,
    },
    {
      categoryName: "Conexões",
      name: 'Válvula de Esfera 1"',
      description: "Válvula de esfera para tubo de 1 polegada",
      price: 25.9,
      stockQty: 15,
      lowStockThreshold: 3,
      unit: "pcs" as const,
    },
  ];

  for (const def of productDefs) {
    const existing = await prisma.product.findFirst({ where: { name: def.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: def.name,
          description: def.description,
          price: def.price,
          stockQty: def.stockQty,
          lowStockThreshold: def.lowStockThreshold,
          unit: def.unit,
          categoryId: categories[def.categoryName],
        },
      });
    }
  }

  const serviceDefs = [
    { categoryName: "Serviços Técnicos", name: "Montagem de Linha", price: 50.0 },
    { categoryName: "Serviços Técnicos", name: "Aperto de Junções", price: 25.0 },
    { categoryName: "Serviços Técnicos", name: "Teste de Pressão", price: 35.0 },
  ];

  for (const def of serviceDefs) {
    const existing = await prisma.service.findFirst({ where: { name: def.name } });
    if (!existing) {
      await prisma.service.create({
        data: { name: def.name, price: def.price, categoryId: categories[def.categoryName] },
      });
    }
  }

  const existingTax = await prisma.tax.findFirst({ where: { name: "IVA" } });
  if (!existingTax) {
    await prisma.tax.create({ data: { name: "IVA", percentage: 17 } });
  }

  const year = new Date().getFullYear();
  for (const type of ["FACT", "COT", "REC"] as const) {
    const existing = await prisma.counter.findUnique({ where: { year_type: { year, type } } });
    if (!existing) {
      await prisma.counter.create({ data: { year, type, lastNumber: 0 } });
    }
  }

  console.log("Seed concluído.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
