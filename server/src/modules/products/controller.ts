import { Request, Response } from "express";
import * as service from "./service";
import { adjustStockSchema, createProductSchema, updateProductSchema } from "./schemas";

export async function list(_req: Request, res: Response) {
  res.json(await service.list());
}

export async function get(req: Request, res: Response) {
  res.json(await service.get(req.params.id));
}

export async function create(req: Request, res: Response) {
  const data = createProductSchema.parse(req.body);
  res.status(201).json(await service.create(req.user!.id, data));
}

export async function update(req: Request, res: Response) {
  const data = updateProductSchema.parse(req.body);
  res.json(await service.update(req.params.id, req.user!.id, data));
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.params.id);
  res.status(204).send();
}

export async function adjustStock(req: Request, res: Response) {
  const data = adjustStockSchema.parse(req.body);
  res.json(await service.adjustStock(req.params.id, req.user!.id, data));
}
