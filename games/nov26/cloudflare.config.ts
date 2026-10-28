import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "shelfgames-nov26",
    compatibilityDate: "2026-10-23",
    domains: ["nov26.shelfgames.party"],
    observability: {
      enabled: true,
    },
    assets: {
      notFoundHandling: "single-page-application",
    },
  },
});
