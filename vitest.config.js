import { defineConfig } from "vitest/config";

// Runs the site and each game as its own project: `bun run test` from the root runs them all.
export default defineConfig({
  test: {
    projects: ["games/*", "site"],
  },
});
