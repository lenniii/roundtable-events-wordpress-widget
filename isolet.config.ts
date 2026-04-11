import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "isolet-js";
import { build } from "vite";

const isoletConfig = defineConfig({
  name: "roundtable-events-widget",
  entry: "./src/main.tsx",
  styles: "./src/styles.css",
  format: ["iife"],
  isolation: "shadow-dom",
});

const shouldRunIsoletBuild =
  process.argv.includes("build") &&
  process.argv.some(
    (arg) =>
      arg.endsWith("/cli.mjs") ||
      arg.endsWith("/isolet") ||
      arg === "isolet" ||
      arg.includes("isolet-js-cli"),
  );

if (shouldRunIsoletBuild && process.env.RTW_ISOLET_BUILD_RAN !== "1") {
  process.env.RTW_ISOLET_BUILD_RAN = "1";

  await build({
    configFile: false,
    mode: "production",
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env": "{}",
    },
    plugins: [react(), tailwindcss()],
    build: {
      emptyOutDir: true,
      cssCodeSplit: false,
      lib: {
        entry: isoletConfig.entry,
        formats: isoletConfig.format,
        fileName: () => `${isoletConfig.name}.js`,
        name: "RoundtableEventsWidget",
      },
      outDir: "dist",
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  });
}

export default isoletConfig;
