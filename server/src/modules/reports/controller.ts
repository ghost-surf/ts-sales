import { Request, Response } from "express";
import * as service from "./service";
import { dateRangeQuerySchema, topClientsQuerySchema } from "./schemas";

export async function sales(req: Request, res: Response) {
  const { from, to } = dateRangeQuerySchema.parse(req.query);
  res.json(await service.salesReport(from, to));
}

export async function stock(_req: Request, res: Response) {
  res.json(await service.stockReport());
}

export async function topClients(req: Request, res: Response) {
  const { from, to, limit } = topClientsQuerySchema.parse(req.query);
  res.json(await service.topClients(from, to, limit));
}

export async function dashboard(_req: Request, res: Response) {
  res.json(await service.dashboard());
}
