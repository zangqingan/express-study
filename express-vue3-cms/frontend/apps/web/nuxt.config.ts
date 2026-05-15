// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },

  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/device',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080/api/v1',
    },
  },

  app: {
    head: {
      title: 'ArtiCMS — 通用内容管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '面向未来的内容管理平台' },
        { name: 'keywords', content: 'CMS,内容管理,博客' },
      ],
    },
  },

  image: {
    provider: 'ipx',
  },

  nitro: {
    preset: 'node-server',
  },
})
