import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["hooks/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
});
