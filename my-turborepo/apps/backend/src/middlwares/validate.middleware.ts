import { z } from "zod";
import type { RequestHandler } from "express";

type Schema = z.ZodType;
type Validated = {
  body?: Schema;
};
type RequestPart = keyof Validated;

const part_order: readonly RequestPart[] = ["body"];

export const validate = (schemas: Validated): RequestHandler => {
  const jobs = part_order;
};
