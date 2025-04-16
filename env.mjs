import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_ENV: z.enum(["development", "production", "test"]),
    RG_API_KEY: z.string(),
    PORT: z.string().optional(),

    DB_METHOD: z.enum(["mongodb", "mongodb+srv"]),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_SERVER_URI: z.string(),
    DB_NAME: z.string(),
    DB_PARAMS: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://onruntime.com",
    RG_API_KEY: process.env.RG_API_KEY,
    APP_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_METHOD: process.env.DB_METHOD,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER_URI: process.env.DB_SERVER_URI,
    DB_NAME: process.env.DB_NAME,
    DB_PARAMS: process.env.DB_PARAMS,
  },
  skipValidation: !!process.env.CI,
  emptyStringAsUndefined: true,
});
