<script setup lang="ts">
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

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
const activeIndex = ref(0)

function onSlideChange(swiper: any) {
  activeIndex.value = swiper.realIndex
}
</script>

<template>
  <section
    v-if="props.data && props.data.length > 0"
    class="relative w-full h-[70vh] md:h-[85vh] lg:h-screen overflow-hidden"
  >
    <Swiper
      :speed="1200"
      :loop="true"
      :effect="'fade'"
      :fade-effect="{ crossFade: true }"
      :autoplay="{
        delay: 6000,
        disableOnInteraction: false,
      }"
      :pagination="{
        clickable: true,
        el: '.custom-pagination',
        bulletClass: 'custom-bullet',
        bulletActiveClass: 'custom-bullet-active',
      }"
      :modules="[Navigation, Pagination, Autoplay, EffectFade]"
      class="h-full w-full"
      @slide-change="onSlideChange"
    >
      <SwiperSlide
        v-for="(item, index) in props.data"
        :key="item.id"
        class="relative h-full w-full"
      >
        <!-- Background Image -->
        <div class="absolute inset-0">
          <NuxtImg
            :src="item.image"
            :alt="item.title || ''"
            class="h-full w-full object-cover"
            :class="activeIndex === index ? 'scale-100' : 'scale-105'"
            style="transition: transform 8s ease-out"
          />
          <!-- Subtle overlay for text readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-foreground/40 via-foreground/10 to-transparent" />
        </div>

        <!-- Content -->
        <div class="absolute inset-0 flex items-end">
          <div class="w-full px-6 pb-20 sm:px-10 lg:px-16 lg:pb-28">
            <div class="max-w-7xl mx-auto">
              <div
                v-if="item.title"
                class="overflow-hidden"
              >
                <h2
                  class="font-display text-4xl font-light tracking-wide text-white/90 sm:text-5xl md:text-6xl lg:text-7xl"
                  :class="activeIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
                  style="transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s"
                >
                  {{ item.title }}
                </h2>
              </div>
              <div
                v-if="item.description"
                class="mt-4 overflow-hidden"
              >
                <p
                  class="font-body text-sm font-light tracking-[0.1em] text-white/70 uppercase sm:text-base"
                  :class="activeIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
                  style="transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.5s"
                >
                  {{ item.description }}
                </p>
              </div>
              <div
                v-if="item.linkUrl"
                class="mt-8 overflow-hidden"
              >
                <NuxtLink
                  :to="item.linkUrl"
                  class="inline-flex items-center gap-3 font-body text-[11px] font-medium tracking-[0.2em] text-white/80 uppercase transition-all duration-500 hover:text-white group"
                  :class="activeIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
                  style="transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.7s"
                >
                  <span class="relative">
                    探索更多
                    <span class="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-transform duration-500 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Custom Pagination -->
    <div class="custom-pagination absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3" />
  </section>
</template>

<style scoped>
:deep(.custom-bullet) {
  display: block;
  width: 32px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

:deep(.custom-bullet-active) {
  background: rgba(255, 255, 255, 0.9);
  width: 48px;
}

:deep(.custom-bullet:hover) {
  background: rgba(255, 255, 255, 0.6);
}
</style>
