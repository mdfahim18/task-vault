import mongoose from "mongoose";
import { env } from "@config/env.js";

let closingPromise: Promise<void> | null = null;
let connectionPromise: Promise<void> | null = null;
let hasEstablishedClient = false;

const isDbConnected = (): boolean =>
  mongoose.connection.readyState === mongoose.ConnectionStates.connected;

const openConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
  } catch {
    throw new Error("faild to establish mongodb connection");
  }
};

export const connectDb = async (): Promise<void> => {
  if (closingPromise) {
    throw new Error("Mongodb connection is closing");
  }
  if (connectionPromise) return;
  if (isDbConnected()) return;
  if (hasEstablishedClient) {
    throw new Error("mangodb connection is temporarily unavailable");
  }
};
