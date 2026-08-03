import type { Server } from "node:http";
import { logger } from "./src/utils/logger.ts";
import { connectDb, disconnectDb } from "./src/config/db.ts";
import { app } from "./src/app.ts";
import { env } from "./src/config/env.ts";
import { en } from "zod/v4/locales";

const shutdown_timeout = 10_000;
const keepAlive_timeout = 65_000;
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
      server.closeIdleConnections();
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
  server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        pid: process.pid,
        node: process.version,
      },
      "server started"
    );
    logger.info({ url: `http://localhost:${env.PORT}/api/v1` });
  });

  server.keepAliveTimeout = keepAlive_timeout;
  server.headersTimeout = keepAlive_timeout + 5_000;
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.fatal({ port: env.PORT }, `port ${env.PORT} is already in use`);
    } else if (err.code === "EACCES") {
      logger.fatal(
        { port: env.PORT },
        `port ${env.PORT} equires elevated priviledges`
      );
    } else {
      logger.fatal({ err }, "server encountered a fatal error");
    }
    process.exit(1);
  });
};

try {
  startServer();
} catch (error) {
  logger.fatal({ error }, "faild to start server");
  process.exit(1);
}
