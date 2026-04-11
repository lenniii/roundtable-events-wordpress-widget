import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/rt-events-api": {
        target: "https://events.roundtable.it",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rt-events-api/, ""),
      },
    },
  },
});
