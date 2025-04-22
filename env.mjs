import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_ENV: z.enum(["development", "production", "test"]),
    RG_TFT_API_KEY: z.string(),
    RG_LOL_API_KEY: z.string(),
    PORT: z.string().optional(),

    DATABASE_URL: z.string().optional(),

    CRON_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://escabo.jeremybdn.fr",
    RG_TFT_API_KEY: process.env.RG_TFT_API_KEY,
    RG_LOL_API_KEY: process.env.RG_LOL_API_KEY,
    APP_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    CRON_SECRET: process.env.CRON_SECRET,
  },
  skipValidation: !!process.env.CI,
  emptyStringAsUndefined: true,
});
