<script setup lang="ts">
import type { ProductResponse, ProductSkuResponse } from '@/types/product'

interface Props {
  product: ProductResponse
  currentSku: ProductSkuResponse | null
}

defineProps<Props>()
</script>

<template>
  <div>
    <!-- 品牌标签 -->
    <div class="text-[10px] tracking-[3px] text-[#8A8986] uppercase mb-5">
      GEM Collection
    </div>

    <!-- 商品名称 -->
    <h1 class="font-display text-[28px] font-light text-[#1A1A1A] tracking-wide mb-3">
      {{ product.name }}
    </h1>

    <!-- 描述 -->
    <p class="text-[11px] text-[#8A8986] leading-relaxed mb-6">
      {{ product.description || '' }}
    </p>

    <!-- 分割线 -->
    <div class="h-px bg-[#D5D4D0] mb-6" />

    <!-- 价格 -->
    <div class="text-[24px] font-light text-[#1A1A1A] mb-6">
      <span v-if="currentSku">¥ {{ currentSku.price }}</span>
      <span v-else class="text-[#8A8986] text-base">请选择规格查看价格</span>
    </div>
  </div>
</template>
