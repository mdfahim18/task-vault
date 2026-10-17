import { Router } from "express";
import { register } from "./auth.controllers.js";

const authRoutes = Router();

authRoutes.post("/register", register);
