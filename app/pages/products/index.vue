<script setup lang="ts">
import type { ProductListParams } from '@/api/product'
import type { ProductPageResponse } from '@/types/product'
import { getProductList } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import ProductSearch from './_components/ProductSearch.vue'

// 搜索参数
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(12)

const { pending, data, refresh } = useAsyncData('products', () => getProductList({
  current: currentPage.value,
  size: pageSize.value,
  name: searchName.value,
}))

// 搜索处理
function handleSearch() {
  currentPage.value = 1
  refresh()
}

// 清空搜索
function handleClear() {
  searchName.value = ''
  currentPage.value = 1
  refresh()
}

// 页码变化
function handlePageChange(page: number) {
  currentPage.value = page
  refresh()
}

// 监听路由查询参数（支持从URL参数初始化搜索）
const route = useRoute()
watch(() => route.query, (query) => {
  if (query.name && typeof query.name === 'string') {
    searchName.value = query.name
  }
  if (query.page && typeof query.page === 'string') {
    currentPage.value = Number.parseInt(query.page) || 1
  }
  refresh()
}, { immediate: false })

// 用于 staggered animation 的延迟计算
function getStaggerDelay(index: number): string {
  const baseDelay = 0.05
  const maxDelay = 0.6
  const delay = Math.min(index * baseDelay, maxDelay)
  return `${delay}s`
}
</script>

<template>
  <div class="flex-1">
    <!-- 顶部标题与搜索 -->
    <section class="pb-12 md:pb-16 px-6 md:px-12">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12 md:mb-16">
          <h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-[#1A1A1A] mb-6">
            所有作品
          </h1>
          <p class="font-body text-sm text-[#8A8986] tracking-wider uppercase">
            All Pieces
          </p>
        </div>
        <ProductSearch v-model:search-name="searchName" :loading="pending" @search="handleSearch" @clear="handleClear" />
      </div>
    </section>

    <!-- 内容区域 -->
    <section class="px-6 md:px-12 pb-24">
      <div class="max-w-7xl mx-auto">
        <!-- 加载状态 -->
        <div v-if="pending" class="flex flex-col items-center justify-center py-32">
          <div class="w-px h-12 bg-[#1A1A1A] animate-pulse" />
          <p class="mt-8 font-body text-xs tracking-widest text-[#8A8986] uppercase">
            Loading
          </p>
        </div>

        <!-- 结果计数与列表 -->
        <template v-else-if="data?.records?.length">
          <div class="flex items-center justify-between mb-12 md:mb-16">
            <p class="font-body text-xs tracking-widest text-[#8A8986] uppercase">
              {{ data?.total || 0 }} Pieces
            </p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14 md:gap-x-8 md:gap-y-20">
            <ProductCard
              v-for="(product, index) in data?.records || []"
              :key="product.id"
              :product="product"
              class="opacity-0 animate-fade-in-up"
              :style="{ animationDelay: getStaggerDelay(index), animationFillMode: 'forwards' }"
            />
          </div>

          <!-- 分页 -->
          <div v-if="data?.total && data.total > pageSize" class="mt-20 md:mt-28 flex justify-center">
            <CustomPagination
              :current="currentPage"
              :page-size="pageSize"
              :total="data?.total || 0"
              @page-change="handlePageChange"
            />
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center py-32">
          <div class="w-px h-16 bg-[#D5D4D0] mb-8" />
          <p class="font-serif text-xl text-[#8A8986] mb-3">
            暂无作品
          </p>
          <p class="font-body text-xs tracking-widest text-[#A5A4A0] uppercase">
            No pieces found
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
</style>
