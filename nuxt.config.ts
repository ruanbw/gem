import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

/**
 * 是否为开发环境
 */
const isDev = process.env.NODE_ENV === 'development'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  plugins: ['~/plugins/model-viewer.client'],
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-og-image',
    'shadcn-nuxt',
  ],
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'model-viewer',
    },
  },
  // shadcn: {
  //   /**
  //    * Prefix for all the imported component.
  //    * @default "Ui"
  //    */
  //   prefix: '',
  //   /**
  //    * Directory that the component lives in.
  //    * Will respect the Nuxt aliases.
  //    * @link https://nuxt.com/docs/api/nuxt-config#alias
  //    * @default "@/components/ui"
  //    */
  //   componentDir: '@/components/ui',
  // },
  icon: {
    serverBundle: {
      collections: ['carbon', 'mdi', 'simple-icons'],
    },
  },
  css: ['~/assets/css/main.css', '~/assets/css/tailwindcss.css'],
  site: {
    url: 'https://example.com',
    name: 'Site Name',
  },
  app: {
    head: {
      title: 'Site Name',
      meta: [
        { name: 'description', content: 'Site Description' },

      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://example.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://example.com' },
      ],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },
  runtimeConfig: {
    apiSecret: '',
    public: {
      apiBase: '',
      apiBaseServer: '',
      fileUrl: '',
      siteTitle: '',
      siteDescription: '',
      siteKeywords: '',
      siteUrl: '',
    },
  },
  sourcemap: isDev ? { client: true, server: true } : false,
  vite: {
    server: {
      proxy: {
        '/api': {
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          // mock代理目标地址
          target: 'http://localhost:18000',
          ws: true,
        },
      },
    },
    optimizeDeps: {
      exclude: ['remark-gfm'],
    },
    esbuild: {
      drop: isDev ? undefined : ['console', 'debugger'],
    },
    build: {
      sourcemap: isDev,
    },
    plugins: [
      tailwindcss(),
    ],
    ssr: {
      noExternal: ['@google/model-viewer'],
    },
  },
})
