import { Request, Response } from "express";
import * as service from "./service";
import { updateSettingsSchema } from "./schemas";

export async function get(_req: Request, res: Response) {
  res.json(await service.get());
}

export async function update(req: Request, res: Response) {
  const data = updateSettingsSchema.parse(req.body);
  res.json(await service.update(data));
}
