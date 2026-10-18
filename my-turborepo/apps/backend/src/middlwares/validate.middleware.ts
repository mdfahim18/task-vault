import { z } from "zod";
import type { RequestHandler } from "express";
import { toFieldErrors, type FieldError } from "@task-vault/shared/validation";

type Schema = z.ZodType;
type Validated = {
  body?: Schema;
};

const parseOrThrow = (schema: Schema, value: unknown): unknown => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const errors: readonly FieldError[] = toFieldErrors();
  }
};

export const validate = (schemas: Validated): RequestHandler => {
  return (req, _res, next) => {
    if (schemas.body) req.body = parseOrThrow();
  };
};
