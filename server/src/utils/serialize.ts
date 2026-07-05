import { Prisma } from "@prisma/client";

/** Recursively converts Prisma Decimal instances to plain numbers so they serialize cleanly as JSON. */
export function serializeDecimals<T>(value: T): T {
  if (value instanceof Prisma.Decimal) {
    return value.toNumber() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeDecimals(item)) as unknown as T;
  }
  if (value instanceof Date) {
    return value as unknown as T;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = serializeDecimals(val);
    }
    return result as unknown as T;
  }
  return value;
}
