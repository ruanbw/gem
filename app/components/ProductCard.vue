<script setup lang="ts">
import type { ProductPageResponse } from '@/types/product'
import { useFilePath } from '@/composables/useFilePath'

defineProps<{
  product: ProductPageResponse
}>()
</script>

<template>
  <div
    class=" overflow-hidden cursor-pointer"
    @click="navigateTo(`/products/${product.id}`)"
  >
    <!-- 封面图 -->
    <div class="w-full aspect-square overflow-hidden bg-gray-200">
      <NuxtImg
        v-if="product.coverImage"
        :src="useFilePath(product.coverImage)"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
      >
        <Icon name="mdi:image-off" class="text-4xl text-gray-400" />
      </div>
    </div>

    <!-- 商品名称 -->
    <div class="p-4">
      <h3 class=" font-semibold text-gray-900 line-clamp-1">
        {{ product.name }}
      </h3>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
