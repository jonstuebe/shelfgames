import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "shelfgames-site",
    compatibilityDate: "2026-10-23",
    domains: ["shelfgames.party"],
    observability: {
      enabled: true,
    },
    assets: {
      notFoundHandling: "single-page-application",
    },
  },
});
