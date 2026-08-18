import { app } from "@app";
import { connectDb } from "@config/db.js";
import { env } from "@config/env.js";
import { logger } from "@utils/logger.js";
import { createServer, type Server } from "node:http";
import { listenServer } from "@utils/http.server.js";

const connections_checking_interval = 5_000;
const keep_alive_timeout = 65_000;
const headers_timeout = 30_000;
const request_timeout = 30_000;
const idle_sweep_interval = 100;

let shuttingDown = false;
let server: Server | null = null;
let httpClosePromise: Promise<void> | null = null;
let listenPromise: Promise<void> | null = null;

const coloseHttpServer = async (): Promise<void> => {
  if (httpClosePromise) return httpClosePromise;
  if (httpClosePromise) return;
  const activeServer = server;
  if (!activeServer) return;
  httpClosePromise = (async (): Promise<void> => {
    if (listenPromise) await listenPromise;
    if (!activeServer?.listening) return;
    const idelSweeper = setInterval(() => {
      activeServer.closeIdleConnections();
    }, idle_sweep_interval);
    try {
      await new Promise<void>((resolve, reject) => {
        activeServer.close((err) => (err ? reject(err) : resolve()));
      });
    } finally {
      clearInterval(idelSweeper);
    }
    logger.info("http server closed");
  })();
  return httpClosePromise;
};

const listen = (httpServer: Server, port: number) =>
  new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, () => {
      httpServer.removeListener("error", reject);
      resolve();
    });
  });

const startServer = async (): Promise<void> => {
  await connectDb();
  if (shuttingDown) return;
  const httpServer = createServer(
    {
      connectionsCheckingInterval: connections_checking_interval,
    },
    app
  );

  server = httpServer;
  httpServer.keepAliveTimeout = keep_alive_timeout;
  httpServer.headersTimeout = headers_timeout;
  httpServer.requestTimeout = request_timeout;

  if (shuttingDown) return;
  const pendingLlisten = (listenPromise = listenServer(httpServer, env.PORT));
  try {
    await pendingLlisten;
  } finally {
    if (listenPromise === pendingLlisten) listenPromise = null;
  }
  if (shuttingDown) {
    await coloseHttpServer();
    return;
  }
  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    logCrashSafely()
  })
};
