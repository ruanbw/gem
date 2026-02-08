/**
 * 加载钩子
 * 在页面加载时执行
 * 设置网站标题、描述、关键词、favicon、preconnect、dns-prefetch
 */
export function useLoadHook() {
  const { siteTitle, siteDescription, siteKeywords, siteUrl } = useRuntimeConfig().public

  // 设置网站标题、描述、关键词、favicon、preconnect、dns-prefetch
  useHead({
    title: siteTitle,
    meta: [
      { name: 'description', content: siteDescription },
      { name: 'keywords', content: siteKeywords },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.ico' },
      { rel: 'preconnect', href: siteUrl, crossorigin: '' },
      { rel: 'dns-prefetch', href: siteUrl },
    ],
  })
}
