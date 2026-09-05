import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

type ServerErrorHandler = (err: Error) => void;

export const listenServer = (
  httpServer: Server,
  port: number,
  onRumTimeError?: ServerErrorHandler
): Promise<AddressInfo> =>
  new Promise<AddressInfo>((resolve, reject) => {
    const detachStartupListeners = (): void => {
      httpServer.off("error", onBindError);
      httpServer.off("listenting", onListening);
    };

    const onBindError = (err: Error): void => {
      detachStartupListeners();
      reject(err);
    };

    const onListening = (): void => {
      const address = httpServer.address();
      if (address === null || typeof address === "string") {
        const error = new Error(
          `expected a tcp address after binding port ${port}`
        );
        detachStartupListeners();
        if (!httpServer.listening) {
          reject(error);
          return;
        }
        try {
          httpServer.close(() => reject(error));
        } catch {
          reject(error);
        }
        return;
      }

      if (onRumTimeError) httpServer.on("error", onRumTimeError);
      detachStartupListeners();
      resolve(address);
    };

    httpServer.on("error", onBindError);
    httpServer.on("listening", onListening);
    try {
      httpServer.listen(port);
    } catch (err) {
      detachStartupListeners()
      reject(err)
    }
  });

  export const closeServer = () => {
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
  }
