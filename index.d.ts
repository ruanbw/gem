declare module 'nuxt/schema' {
  interface RuntimeConfig {
    /**
     * 运行时配置项，只有服务端可以访问
     */
    apiSecret: string
  }
  interface PublicRuntimeConfig {
    /**
     * 公开的配置项，客户端和服务端都可以访问
     */
    apiBase: string
    /**
     * 服务端API地址
     */
    apiBaseServer: string
  }
}

declare module '#app' {
  interface NuxtApp {
    $api: typeof $fetch
  }
}

// It is always important to ensure you import/export something when augmenting a type
export {}
