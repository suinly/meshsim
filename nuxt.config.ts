// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@nuxtjs/leaflet"],

  ssr: false,

  devtools: {
    enabled: true,
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
    head: {
      link: [
        { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" }
      ],
      meta: [
        { name: "apple-mobile-web-app-title", content: "MeshSim" }
      ]
    }
  },

  css: ["~/assets/css/main.css"],

  compatibilityDate: "2025-01-15",

  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 512,
    },
  },

  nitro: {
    prerender: {
      failOnError: false,
      crawlLinks: false,
      routes: ["/"],
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
