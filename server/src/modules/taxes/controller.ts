import { Request, Response } from "express";
import * as service from "./service";
import { createTaxSchema, updateTaxSchema } from "./schemas";

export async function list(_req: Request, res: Response) {
  res.json(await service.list());
}

export async function create(req: Request, res: Response) {
  const data = createTaxSchema.parse(req.body);
  res.status(201).json(await service.create(data));
}

export async function update(req: Request, res: Response) {
  const data = updateTaxSchema.parse(req.body);
  res.json(await service.update(req.params.id, data));
}

export async function remove(req: Request, res: Response) {
  await service.remove(req.params.id);
  res.status(204).send();
}
