import { Router } from "express";
import * as controller from "./controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole("admin"));

usersRouter.get("/", asyncHandler(controller.list));
usersRouter.get("/:id", asyncHandler(controller.get));
usersRouter.post("/", asyncHandler(controller.create));
usersRouter.patch("/:id", asyncHandler(controller.update));
usersRouter.delete("/:id", asyncHandler(controller.remove));
