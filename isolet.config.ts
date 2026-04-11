import fs from "node:fs";
import { dirname, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "isolet-js";
import { build } from "vite";

const CSS_TEXT_PREFIX = "\0isolet-css-text:";

const isoletConfig = defineConfig({
  name: "roundtable-events-widget",
  entry: "./src/main.tsx",
  styles: "./src/styles.css",
  format: ["iife"],
  isolation: "shadow-dom",
});

const fallbackCssTextPlugin = () => ({
  name: "isolet-css-text-fallback",
  enforce: "pre" as const,
  async resolveId(
    this: {
      resolve: (
        source: string,
        importer?: string,
      ) => Promise<{ id: string } | null>;
    },
    source: string,
    importer: string | undefined,
  ) {
    if (!source.endsWith(".css")) {
      return;
    }

    if (source.startsWith(".") || source.startsWith("/")) {
      const resolved = importer ? resolve(dirname(importer), source) : source;
      return CSS_TEXT_PREFIX + encodeURIComponent(resolved);
    }

    const resolved = await this.resolve(source, importer);
    return resolved ? CSS_TEXT_PREFIX + encodeURIComponent(resolved.id) : undefined;
  },
  load(id: string) {
    if (!id.startsWith(CSS_TEXT_PREFIX)) {
      return;
    }

    const filePath = decodeURIComponent(id.slice(CSS_TEXT_PREFIX.length));
    return `export default ${JSON.stringify(fs.readFileSync(filePath, "utf8"))};`;
  },
});

const shadowWidgetStylesPlugin = () => ({
  name: "shadow-widget-styles",
  transform(code: string, id: string) {
    if (!id.endsWith("/src/events-widget.tsx")) {
      return;
    }

    return code.replace('import "./styles.css";\n', "");
  },
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

  const { cssTextPlugin } = await import("isolet-js/plugins/css-text").catch(
    () => ({
      cssTextPlugin: fallbackCssTextPlugin,
    }),
  );

  await build({
    configFile: false,
    plugins: [
      react(),
      tailwindcss(),
      cssTextPlugin(),
      shadowWidgetStylesPlugin(),
    ],
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
