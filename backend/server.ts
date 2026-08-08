import { createServer } from "node:http";
import { logger } from "./src/utils/logger.ts";
import { connectDb, disconnectDb } from "./src/config/db.ts";
import { app } from "./src/app.ts";
import { env } from "./src/config/env.ts";

const listen_errors: Readonly<Record<string, string>> = {
  EDDRINUSE: "is already in use",
  EACCESS: "requires elevated privileges",
};
const shutdown_timeout = 10_000;
const keepAlive_timeout = 65_000;
const request_timeout = 30_000;
const headers_timeout = keepAlive_timeout + 5_000;

let isShuttingDown = false;
let server: ReturnType<typeof createServer> | null = null;

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
  shutdown("unhandledRejection");
});
process.once("uncaughtException", (err: Error) => {
  logger.fatal({ err }, "uncaught exception shutdown");
  shutdown("uncaughtException");
});

const attachProcessHandlers = (): void => {
  const onFatal = (reason: string, level: 'fatal' | 'error') => {
    (err: unknown):void => {
      logger[level]({err}, `${reason} - initiating shutdown`)
    }
  }
}

const startServer = async (): Promise<void> => {
  await connectDb();

  const httpServer = createServer(app);

  httpServer.keepAliveTimeout = keepAlive_timeout;
  httpServer.headersTimeout = headers_timeout;
  httpServer.requestTimeout = request_timeout;

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    const listenError = listen_errors[err.code ?? ""];
    logger.fatal(
      { err, ...(listenError && { port: env.PORT }) },
      listenError
        ? `port ${env.PORT} ${listenError}`
        : "server encountered a fatal error"
    );
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(env.PORT, resolve);
  });
};

try {
  startServer();
} catch (error) {
  logger.fatal({ error }, "faild to start server");
  process.exit(1);
}
