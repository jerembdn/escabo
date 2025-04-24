import { defineConfig } from "tsup";
import { env } from "./env";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs"],
	dts: true,
	clean: true,
	sourcemap: true,
	outDir: "dist",
	onSuccess: env.APP_ENV === "development" ? "node dist/index.js" : undefined,
});
