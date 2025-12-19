import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  // Don't bundle dependencies - keep them external
  skipNodeModulesBundle: true,
  // Ensure all node_modules are external
  external: [/node_modules/],
});
