import type { Server } from "node:http";
import { logger } from "./src/utils/logger.ts";

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
    if(server){
      server.closeIdleConnection();
      await new Promise<void>((resolve, reject) => {
        server!.close(err => reject(err) : resolve())
      })
      logger.info('https server closed')
    }
  } catch (error) {
    console.log('error', error);

  }
};
