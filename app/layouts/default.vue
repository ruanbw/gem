<script lang="ts" setup>
// 注释的代码可基于 nuxt-i18n 生成 SEO 友好的 HTML 结构，用于优化搜索引擎优化（SEO）。
// https://i18n.nuxtjs.org/docs/guide/seo
// const route = useRoute()
// const { t } = useI18n()
// const head = useLocaleHead()
// const title = computed(() => t(route.meta.title ?? 'TBD', t('layouts.title')));
</script>

<template>
  <!-- <div>
    <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
      <Head>
        <Title>{{ title }}</Title>
        <template v-for="link in head.link" :key="link.key">
          <Link :id="link.key" :rel="link.rel" :href="link.href" :hreflang="link.hreflang" />
        </template>
        <template v-for="meta in head.meta" :key="meta.key">
          <Meta :id="meta.key" :property="meta.property" :content="meta.content" />
        </template>
      </Head>
      <Body>
        <NuxtPage />
      </Body>
    </Html>
  </div> -->
  <section class="flex flex-col min-h-screen text-xs">
    <Header />
    <main class="flex-1 flex flex-col">
      <NuxtPage />
    </main>
    <Footer />
  </section>
</template>

<style>

</style>
