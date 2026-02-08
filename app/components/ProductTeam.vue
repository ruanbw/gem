<script setup lang="ts">
import type { ProductPageResponse } from '@/types/product'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  title: string
  description: string
  products: ProductPageResponse[]
  class?: string
}>(), {
  class: '',
})
</script>

<template>
  <section :class="cn('py-20 ', props.class)">
    <h2 class="text-2xl font-bold text-center">
      {{ title }}
    </h2>
    <p class="text-sm text-gray-500 text-center mb-4">
      {{ description }}
    </p>
    <div v-if="products.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
    <ProductEmpty v-else />
  </section>
</template>
