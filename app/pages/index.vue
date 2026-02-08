<script lang="ts" setup>
import { getBanner } from '@/api/banner'
import HotProducts from '@/components/HotProducts.vue'
import LatestProducts from '@/components/LatestProducts.vue'

// 使用 useAsyncData 获取Banner数据，实现 SSR
const { data: bannerData } = await useAsyncData(
  'banner',
  () => getBanner(),
  {
    default: () => null,
  },
)

// 将 BannerItem[] 转换为 SwiperData[] 格式
const swiperData = computed(() => {
  if (!bannerData.value || !bannerData.value.items || bannerData.value.items.length === 0) {
    return []
  }
  return bannerData.value.items.map((item, index) => ({
    id: index,
    image: useFilePath(item.imageUrl),
    linkUrl: item.linkUrl,
  }))
})
</script>

<template>
  <section>
    <Swiper :data="swiperData" />
    <HotProducts />
    <LatestProducts />
  </section>
</template>
