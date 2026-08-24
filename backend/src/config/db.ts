import mongoose from "mongoose";

let closingPromise: Promise<void> | null = null;
let connectionPromise: Promise<void> | null = null;

const isDbConnected = (): boolean =>
  mongoose.connection.readyState === mongoose.ConnectionStates.connected;

export const connectDb = async (): Promise<void> => {
  if (closingPromise) {
    throw new Error("Mongodb connection is closing");
  }
  if (connectionPromise) return;
  if (isDbConnected()) return;
};
