<script setup lang="ts">
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { useFilePath } from '@/composables/useFilePath'
import 'swiper/css'
import 'swiper/css/pagination'

interface ProductImageSwiperProps {
  images: string[]
  productName: string
}

defineProps<ProductImageSwiperProps>()
</script>

<template>
  <div class="w-full">
    <Swiper
      :slides-per-view="1"
      :space-between="0"
      :pagination="{
        clickable: true,
      }"
      :simulate-touch="true"
      :touch-ratio="1"
      :touch-angle="45"
      :allow-touch-move="true"
      :modules="[Pagination]"
      class="product-image-swiper"
    >
      <SwiperSlide
        v-for="(image, index) in images"
        :key="`${image}-${index}`"
        class="flex items-center justify-center"
      >
        <NuxtImg
          :src="useFilePath(image)"
          :alt="`${productName} - 图片 ${index + 1}`"
          class="w-full object-cover"
        />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.product-image-swiper {
  width: 100%;
}

.product-image-swiper :deep(.swiper-pagination) {
  bottom: 10px;
}

.product-image-swiper :deep(.swiper-pagination-bullet) {
  background-color: rgba(255, 255, 255, 0.8);
  opacity: 1;
}

.product-image-swiper :deep(.swiper-pagination-bullet-active) {
  background-color: #fff;
}
</style>
