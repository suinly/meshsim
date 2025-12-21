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
      title: "MeshSim - Симулятор Mesh-сети",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon-96x96.png",
          sizes: "96x96",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      meta: [
        { name: "apple-mobile-web-app-title", content: "MeshSim" },
        {
          name: "description",
          content:
            "Интерактивный симулятор mesh-сети с реалистичной моделью распространения радиосигнала (SNR, path loss, CSMA). Визуализация принципов работы Meshtastic и LoRa mesh-networking.",
        },
        // Open Graph
        { property: "og:title", content: "MeshSim - Симулятор Mesh-сети" },
        {
          property: "og:description",
          content:
            "Интерактивный симулятор mesh-сети с реалистичной моделью распространения радиосигнала (SNR, path loss, CSMA). Визуализация принципов работы Meshtastic и LoRa mesh-networking.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://meshsim.suinly.com" },
        {
          property: "og:image",
          content: "https://meshsim.suinly.com/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: "ru_RU" },
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "MeshSim - Симулятор Mesh-сети" },
        {
          name: "twitter:description",
          content:
            "Интерактивный симулятор mesh-сети с реалистичной моделью распространения радиосигнала (SNR, path loss, CSMA).",
        },
        {
          name: "twitter:image",
          content: "https://meshsim.suinly.com/og-image.png",
        },
      ],
    },
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
