<script setup lang="ts">
// core version + navigation, pagination modules:
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
// import Swiper and modules styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

interface SwiperData {
  id: number | string
  image: string
  title?: string
  description?: string
  linkUrl?: string
}
interface SwiperProps {
  data: SwiperData[]
}

const props = defineProps<SwiperProps>()

function onSwiper() {
  console.log('swiper')
}

function onSlideChange() {
  console.log('slide change')
}
</script>

<template>
  <section v-if="props.data && props.data.length > 0">
    <Swiper autoplay :speed="1000" :loop="true" :pagination="{
      clickable: true,
    }" :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }" :slides-per-view="1" :space-between="50" :modules="[Navigation, Pagination]" @swiper="onSwiper"
      @slide-change="onSlideChange">
      <SwiperSlide v-for="item in props.data" :key="item.id" class="relative">
        <NuxtLink v-if="item.linkUrl" :to="item.linkUrl" class="block">
          <NuxtImg :src="item.image" :alt="item.title || ''" class="w-full object-cover" />
        </NuxtLink>
        <NuxtImg v-else :src="item.image" :alt="item.title || ''" class="w-full h-[300px] object-cover" />
        <div v-if="item.title || item.description" class="absolute bottom-0 left-0 right-0 p-4">
          <h3 v-if="item.title" class="text-2xl font-bold">{{ item.title }}</h3>
          <p v-if="item.description" class="text-sm text-gray-500">{{ item.description }}</p>
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>
