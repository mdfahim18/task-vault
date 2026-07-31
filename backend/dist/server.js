import { logger } from "./src/utils/logger.js";
const shutdown_timeout = 10_000;
let isShuttingDown = false;
let server = null;
const shutdown = async (signal) => {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    logger.info({ signal }, 'shutting down gracefully');
    const forceTimer = setTimeout(() => {
        logger.error({ timeOut: shutdown_timeout }, 'graceful shutdown timed out');
        process.exit(1);
    }, shutdown_timeout);
    forceTimer.unref();
    try {
        if (server) {
            server.closeAllConnections();
            await new Promise((resolve, reject) => {
                server.close((err) => (err ? reject(err) : resolve()));
            });
            logger.info('HTTP server closed');
        }
        process.exit(0);
    }
    catch (err) {
        logger.error({ err }, 'Error during shutdown cleanup');
        process.exit(1);
    }
};
//# sourceMappingURL=server.js.map