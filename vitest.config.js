import { defineConfig } from "vitest/config";

// Runs each game's tests as its own project: `bun run test` from the root runs them all.
export default defineConfig({
  test: {
    projects: ["games/*"],
  },
});
