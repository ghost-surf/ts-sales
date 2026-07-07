import { Request, Response } from "express";
import * as service from "./service";

export async function list(_req: Request, res: Response) {
  res.json(await service.list());
}
