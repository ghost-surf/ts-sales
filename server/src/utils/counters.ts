import { Prisma, CounterType } from "@prisma/client";

const PREFIX: Record<CounterType, string> = {
  FACT: "FACT",
  COT: "COT",
  REC: "REC",
  NC: "NC",
  EST: "EST",
};

export async function nextDocumentCode(
  tx: Prisma.TransactionClient,
  type: CounterType,
  date: Date = new Date()
): Promise<string> {
  const year = date.getFullYear();
  const counter = await tx.counter.upsert({
    where: { year_type: { year, type } },
    create: { year, type, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  const yearSuffix = String(year).slice(-2);
  const number = String(counter.lastNumber).padStart(4, "0");
  return `${PREFIX[type]}-${number}/${yearSuffix}`;
}
