<script setup lang="ts">
import type { ProductSkuResponse } from '@/types/product'
import { useFilePath } from '@/composables/useFilePath'
import RhinoModelViewer from '@/components/RhinoModelViewer.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

interface ModelSkuItem {
  coverImage: string
  modelUrl: string
  sku: ProductSkuResponse
  format: 'glb' | 'gltf'
}

interface Props {
  images: string[]
  modelSkus: ModelSkuItem[]
  currentModelUrl: string | null
  productName: string
}

const props = defineProps<Props>()

const activeView = ref<'image' | '3d'>('image')
const activeImageIndex = ref(0)
const modelLoading = ref(false)
const modelError = ref(false)

const displayModelUrl = computed(() => {
  if (props.currentModelUrl) return props.currentModelUrl
  if (props.modelSkus.length > 0) return props.modelSkus[0].modelUrl
  return null
})

const has3D = computed(() => props.modelSkus.length > 0)

function selectImage(index: number) {
  activeView.value = 'image'
  activeImageIndex.value = index
}

function select3D() {
  if (!has3D.value) return
  activeView.value = '3d'
  modelLoading.value = true
  modelError.value = false
}

function handleModelLoad() {
  modelLoading.value = false
  modelError.value = false
}

function handleModelError() {
  modelLoading.value = false
  modelError.value = true
}

watch(() => props.currentModelUrl, (newUrl) => {
  if (newUrl && activeView.value === '3d') {
    modelLoading.value = true
    modelError.value = false
  }
})

const imageCounterText = computed(() => {
  if (activeView.value === '3d') return '3D'
  return `${activeImageIndex.value + 1}/${props.images.length}`
})
</script>

<template>
  <div>
    <!-- === 桌面端布局 === -->
    <div class="hidden lg:block">
      <div class="space-y-3">
        <!-- 主图展示区域 -->
        <div class="relative bg-[#F0EFED] aspect-[4/5] overflow-hidden">
          <!-- 图片模式 -->
          <Transition name="fade" mode="out-in">
            <div v-if="activeView === 'image'" :key="'img-' + activeImageIndex" class="w-full h-full">
              <NuxtImg
                v-if="images[activeImageIndex]"
                :src="useFilePath(images[activeImageIndex])"
                :alt="`${productName} - 图片 ${activeImageIndex + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </Transition>

          <!-- 3D 模式 -->
          <Transition name="fade" mode="out-in">
            <div v-if="activeView === '3d'" :key="'3d-' + displayModelUrl" class="w-full h-full">
              <!-- 加载中 -->
              <div
                v-if="modelLoading"
                class="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EFED]/90 z-10"
              >
                <div class="w-8 h-8 border-2 border-[#D5D4D0] border-t-[#1A1A1A] rounded-full animate-spin" />
                <p class="mt-3 text-[10px] tracking-widest text-[#8A8986]">加载 3D 模型...</p>
              </div>

              <!-- 加载失败 -->
              <div
                v-if="modelError && !modelLoading"
                class="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EFED]/90 z-10"
              >
                <Icon name="mdi:alert-circle" class="text-4xl text-[#8A8986] mb-2" />
                <p class="text-xs text-[#8A8986]">模型加载失败</p>
              </div>

              <!-- Model Viewer -->
              <ClientOnly>
                <RhinoModelViewer
                  v-if="displayModelUrl"
                  :key="displayModelUrl"
                  :src="displayModelUrl"
                  :auto-rotate="true"
                  :camera-controls="true"
                  @load="handleModelLoad"
                  @error="handleModelError"
                />
              </ClientOnly>

              <!-- 浮动控制栏 -->
              <div
                v-if="!modelLoading && !modelError"
                class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20"
              >
                <button class="bg-white/95 px-3 py-1.5 text-[9px] text-[#1A1A1A] shadow-sm hover:bg-white transition-colors">
                  自动旋转 ↻
                </button>
              </div>
            </div>
          </Transition>

          <!-- 图片计数 -->
          <div class="absolute bottom-3 right-3 bg-black/40 text-white px-2 py-0.5 text-[9px] rounded-full z-20">
            {{ imageCounterText }}
          </div>

          <!-- 3D 入口按钮 -->
          <button
            v-if="activeView === 'image' && has3D"
            class="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 text-[9px] text-[#1A1A1A] shadow-sm z-20 hover:bg-white transition-colors"
            @click="select3D"
          >
            3D ↻
          </button>
        </div>

        <!-- 缩略图条 -->
        <div class="flex gap-2">
          <button
            v-for="(image, index) in images"
            :key="'thumb-' + index"
            class="w-14 h-[72px] bg-[#E8E7E4] overflow-hidden transition-all"
            :class="[
              activeView === 'image' && activeImageIndex === index
                ? 'border border-[#1A1A1A]'
                : 'border border-transparent hover:border-[#D5D4D0]',
            ]"
            @click="selectImage(index)"
          >
            <NuxtImg
              :src="useFilePath(image)"
              :alt="`${productName} - 缩略图 ${index + 1}`"
              class="w-full h-full object-cover"
            />
          </button>

          <!-- 3D 缩略图 -->
          <button
            v-if="has3D"
            class="w-14 h-[72px] bg-[#E8E7E4] flex items-center justify-center relative transition-all"
            :class="[
              activeView === '3d'
                ? 'border border-[#1A1A1A]'
                : 'border border-transparent hover:border-[#D5D4D0]',
            ]"
            @click="select3D"
          >
            <span class="text-[10px] text-[#8A8986]">3D</span>
            <div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#4CAF50] rounded-full" />
          </button>
        </div>
      </div>
    </div>

    <!-- === 移动端布局 === -->
    <div class="lg:hidden">
      <div class="relative">
        <!-- 图片 Swiper -->
        <div v-if="activeView === 'image'" class="relative">
          <Swiper
            :slides-per-view="1"
            :space-between="0"
            :pagination="{ clickable: true }"
            :modules="[Pagination]"
            class="product-gallery-swiper"
            @slide-change="(swiper: any) => activeImageIndex = swiper.activeIndex"
          >
            <SwiperSlide
              v-for="(image, index) in images"
              :key="'mobile-' + index"
            >
              <div class="bg-[#F0EFED] aspect-[3/4]">
                <NuxtImg
                  :src="useFilePath(image)"
                  :alt="`${productName} - 图片 ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          </Swiper>

          <!-- 图片计数 -->
          <div class="absolute bottom-10 right-3 bg-black/40 text-white px-2 py-0.5 text-[9px] rounded-full z-20">
            {{ imageCounterText }}
          </div>

          <!-- 3D 入口按钮 -->
          <button
            v-if="has3D"
            class="absolute bottom-10 left-3 bg-white/95 px-2.5 py-1 text-[9px] text-[#1A1A1A] shadow-sm z-20"
            @click="select3D"
          >
            3D ↻
          </button>
        </div>

        <!-- 3D 模式（移动端） -->
        <div v-else class="relative bg-[#F0EFED] aspect-[3/4]">
          <!-- 加载中 -->
          <div
            v-if="modelLoading"
            class="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EFED]/90 z-10"
          >
            <div class="w-8 h-8 border-2 border-[#D5D4D0] border-t-[#1A1A1A] rounded-full animate-spin" />
            <p class="mt-3 text-[10px] tracking-widest text-[#8A8986]">加载 3D 模型...</p>
          </div>

          <!-- 加载失败 -->
          <div
            v-if="modelError && !modelLoading"
            class="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EFED]/90 z-10"
          >
            <Icon name="mdi:alert-circle" class="text-4xl text-[#8A8986] mb-2" />
            <p class="text-xs text-[#8A8986]">模型加载失败</p>
          </div>

          <ClientOnly>
            <RhinoModelViewer
              v-if="displayModelUrl"
              :key="displayModelUrl"
              :src="displayModelUrl"
              :auto-rotate="true"
              :camera-controls="true"
              @load="handleModelLoad"
              @error="handleModelError"
            />
          </ClientOnly>

          <!-- 浮动控制栏 -->
          <div
            v-if="!modelLoading && !modelError"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20"
          >
            <button class="bg-white/95 px-3 py-1.5 text-[9px] text-[#1A1A1A] shadow-sm">
              自动旋转 ↻
            </button>
          </div>

          <!-- 3D 标识 -->
          <div class="absolute bottom-3 right-3 bg-black/40 text-white px-2 py-0.5 text-[9px] rounded-full z-20">
            3D
          </div>

          <!-- 返回图片按钮 -->
          <button
            class="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 text-[9px] text-[#1A1A1A] shadow-sm z-20"
            @click="activeView = 'image'"
          >
            ← 图片
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.product-gallery-swiper :deep(.swiper-pagination) {
  bottom: 30px;
}
.product-gallery-swiper :deep(.swiper-pagination-bullet) {
  background-color: rgba(255, 255, 255, 0.6);
  opacity: 1;
}
.product-gallery-swiper :deep(.swiper-pagination-bullet-active) {
  background-color: #1A1A1A;
}
</style>
