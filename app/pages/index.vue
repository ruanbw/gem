<script lang="ts" setup>
import { getBanner } from '@/api/banner'
import HotProducts from '@/components/HotProducts.vue'
import LatestProducts from '@/components/LatestProducts.vue'
import BrandStory from '@/components/BrandStory.vue'

const { data: bannerData } = await useAsyncData(
  'banner',
  () => getBanner(),
  {
    default: () => null,
  },
)

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
    <BrandStory />
    <LatestProducts />
  </section>
</template>
