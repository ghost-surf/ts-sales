import { NextFunction, Request, Response } from "express";
import { serializeDecimals } from "../utils/serialize";

/** Ensures every res.json() call transparently converts Prisma Decimal fields to numbers. */
export function serializeResponse(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => originalJson(serializeDecimals(body));
  next();
}
