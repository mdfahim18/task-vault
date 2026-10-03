import { Router } from "express";
import { register } from "./auth.controllers.js";

export const authRoutes = Router()

authRoutes.post('/register', register)