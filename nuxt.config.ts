// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: "/favicon.png" },
        { rel: 'icon', sizes: '192x192', href: "/favicon.png" },
        { rel: 'apple-touch-icon', type: 'image/png', href: "/favicon.png" }
      ],
      meta: [
        { name: 'msapplication-square310x310logo', content: '/favicon.png'},
      ]
    }
  },
  image: {
    contentful: {
      baseURL: "//images.ctfassets.net/",
    },
  },
  typescript: {
    shim: false,
  },
  runtimeConfig: {
    CTF_SPACE_ID: process.env.CTF_SPACE_ID,
    CTF_CDA_ACCESS_TOKEN: process.env.CTF_CDA_ACCESS_TOKEN
  },
  modules: [
    "@nuxt/image-edge",
    "@nuxtjs/tailwindcss",
    "nuxt-runtime-compiler",
    "nuxt-icon",
  ],
});
