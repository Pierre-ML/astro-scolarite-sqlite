import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import auth from "auth-astro";

export default defineConfig({
  site: "https://scolariter.pierre-mouilleseaux-lhuillier.fr",
  output: "server",

  security: {
    checkOrigin: false,
  },

  adapter: node({
      mode: "standalone"
  }),

  integrations: [auth()]
});