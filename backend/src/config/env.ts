import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("invalid environment variables", z.treeifyError(parsed.error));
  process.exit(1)
}
