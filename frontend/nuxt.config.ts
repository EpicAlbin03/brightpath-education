import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 5173,
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    optimizeDeps: {
      include: [
        '@vueuse/core',
      ]
    },
    plugins: [
      tailwindcss(),
    ],
  },
  modules: [
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/color-mode',
  ],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/lib/components/ui'
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    },
  },
})