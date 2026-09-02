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
    };

    const onBindError = (err: Error): void => {
      detachStartupListeners();
      reject(err);
    };
  });
