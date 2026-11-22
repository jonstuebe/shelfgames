import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "shelfgames-nov26-produce",
    compatibilityDate: "2026-10-23",
    domains: ["nov26-produce.shelfgames.party"],
    observability: {
      enabled: true,
    },
    assets: {
      notFoundHandling: "single-page-application",
    },
  },
});
