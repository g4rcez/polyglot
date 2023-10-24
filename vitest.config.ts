import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "./",
  test: {
    root: "./tests",
    mockReset: true,
    globals: true,
    restoreMocks: true,
    typecheck: {
      checker: "tsc",
      allowJs: false,
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
