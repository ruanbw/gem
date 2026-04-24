<script setup lang="ts">
import type { ProductPageResponse } from '@/types/product'
import { useFilePath } from '@/composables/useFilePath'

defineProps<{
  product: ProductPageResponse
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.id}`"
    class="group block cursor-pointer"
  >
    <!-- 封面图 -->
    <div class="relative w-full aspect-[4/5] overflow-hidden bg-[#F0EFED]">
      <NuxtImg
        v-if="product.coverImage"
        :src="useFilePath(product.coverImage)"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <Icon name="mdi:image-off" class="text-3xl text-[#C5C3BF]" />
      </div>
    </div>

    <!-- 商品名称 -->
    <div class="pt-4 pb-1">
      <h3 class="font-body text-[13px] font-normal tracking-wide text-[#4A4946] line-clamp-1 transition-colors duration-300 group-hover:text-[#1A1A1A]">
        {{ product.name }}
      </h3>
    </div>
  </NuxtLink>
</template>
