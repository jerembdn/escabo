import { createEnv } from "@t3-oss/env-core";
import "dotenv-flow/config";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_ENV: z.enum(["development", "production"]),

    API_URL: z.string().url(),
  },
  client: {},
  clientPrefix: "",
  runtimeEnv: process.env,
  skipValidation: !!process.env.CI,
  emptyStringAsUndefined: true,
});
