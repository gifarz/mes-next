import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        main: "electron/main.ts",
        preload: "electron/preload.ts",
    },
    outDir: "dist-electron",
    sourcemap: true,
    clean: true,
    format: ["cjs"], // Electron main/preload need CJS
    target: "node18",
    minify: false,
    dts: false,
});
