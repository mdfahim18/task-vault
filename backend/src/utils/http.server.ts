import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

type ServerErrorHandler = (err: Error) => void;

export const listenServer = (
  httpServer: Server,
  port: number,
  onRumTimeError?: ServerErrorHandler
): Promise<AddressInfo> =>
  new Promise<AddressInfo>((resolve, reject) => {
    const onError = (err: Error): void => {
      httpServer.removeListener("listening", onListening);
      reject(err);
    };
    const onListening = (err: Error): void => {
      httpServer.removeListener("error", onError);
      resolve();
    };
    httpServer.once("error", onError);
    httpServer.once("listening", onListening);
    httpServer.listen(port);
  });
