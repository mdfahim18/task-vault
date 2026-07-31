import pino from "pino";
import { env } from "../config/env.js";

const defaultLevel = env.NODE_ENV === "development" ? "debug" : "info";

const logger = pino({
  name: "task-vault-api",
  level: env.LOG_LEVEL ?? defaultLevel,
});
