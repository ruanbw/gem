<script setup lang="ts">
import type { ProductPageResponse } from '@/types/product'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  title: string
  description: string
  products: ProductPageResponse[]
  class?: string
  layout?: 'default' | 'editorial'
}>(), {
  class: '',
  layout: 'default',
})

const sectionRef = ref<HTMLElement>()

const { stop } = useIntersectionObserver(
  sectionRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      stop()
    }
  },
  { threshold: 0.1 },
)
</script>

<template>
  <section
    ref="sectionRef"
    :class="cn(layout === 'editorial' ? 'py-24 md:py-36 lg:py-44' : 'py-20 md:py-28 lg:py-36', props.class)"
  >
    <div class="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
      <!-- Section Header -->
      <div class="flex flex-col items-start gap-2 mb-12 md:mb-16">
        <span class="font-body text-[10px] font-medium uppercase tracking-[0.25em] text-foreground/40">
          {{ description }}
        </span>
        <h2 class="font-display text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl">
          {{ title }}
        </h2>
        <div class="mt-3 h-px w-12 bg-foreground/20" />
      </div>

      <!-- Products Grid -->
      <div
        v-if="products.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14"
      >
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
      <ProductEmpty v-else />
    </div>
  </section>
</template>
