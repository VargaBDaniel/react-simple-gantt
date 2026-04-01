import babelPlugin from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // babelPlugin returns a Promise — Vite resolves plugin promises internally
    babelPlugin({
      presets: [reactCompilerPreset({ target: "19" })],
    }) as never,
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReactSimpleGantt",
      formats: ["es", "cjs"],
      fileName: (format: string) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom", "date-fns"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "date-fns": "dateFns",
        },
      },
    },
  },
});
