import type { RegisterInput } from "./auth.services.js";
import * as authService from "@modules/auth/auth.services.js";

import type { Request, Response } from "express";
import { success } from "zod";

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response
): Promise<void> => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({ success: true, ...result });
};
