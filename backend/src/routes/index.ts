import { authRoutes } from "@modules/auth/auth.routes.js";
import { Router } from "express";

export const router = Router()

router.use('/auth', authRoutes)