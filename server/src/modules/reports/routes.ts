import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth } from "../../middleware/auth";

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

reportsRouter.get("/sales", asyncHandler(controller.sales));
reportsRouter.get("/stock", asyncHandler(controller.stock));
reportsRouter.get("/top-clients", asyncHandler(controller.topClients));
reportsRouter.get("/dashboard", asyncHandler(controller.dashboard));
