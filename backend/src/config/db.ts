import mongoose, { type ConnectOptions } from "mongoose";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "mongodb connection error");
});
mongoose.connection.on("disconnected", () => {
  logger.warn("mongodb disconnected");
});
mongoose.connection.on("reconnected", () => {
  logger.info("mongodb reconnected");
});

const isProduction = env.NODE_ENV === "production";

const connection_options: ConnectOptions = {
  maxPoolSize: isProduction ? 100 : 10,
  minPoolSize: isProduction ? 10 : 2,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
  heartbeatFrequencyMS: 10_000,
  retryWrites: true,
  compressors: ["snappy", "zstd"],
  ...(isProduction && {
    w: "majority",
    readPreference: "secondaryPreferred" as const,
  }),
};
export const connectDb = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  const connectionDb = await mongoose.connect(
    env.MONGODB_URI,
    connection_options
  );
  logger.info(
    {
      host: connectionDb.connection.host,
      name: connectionDb.connection.name,
    },
    "mongodb connected"
  );
};

export const disconnectDb = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.connection.close();
  logger.info("mondodb connection closed");
};
