import type { Server } from "node:http";
import { logger } from "./src/utils/logger.ts";
import { connectDb, disconnectDb } from "./src/config/db.ts";
import { log } from "node:console";

const shutdown_timeout = 10_000;
let isShuttingDown = false;
let server: Server | null = null;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, "shutting down gracefully");

  const forceTimer = setTimeout(() => {
    logger.error({ timeOut: shutdown_timeout }, "gracefull shutdown timed out");
    process.exit(1);
  }, shutdown_timeout);
  forceTimer.unref();

  try {
    if (server) {
      server.closeIdleConnection();
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info("https server closed");
    }

    await disconnectDb();
  } catch (error) {
    logger.info({ error }, "error during shutdown clean up");
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.once("unhandledRejection", (reason: unknown) => {
  logger.error({ err: reason }, "unhandled rejection shutdown");
});
process.once("uncaughtException", (err: Error) => {
  logger.fatal({ err }, "uncaught exception shutdown");
  shutdown("uncaughtException");
});

const startServer = async (): Promise<void> => {
  await connectDb();
};

try {
  startServer();
} catch (error) {
  console.log(error);
}
