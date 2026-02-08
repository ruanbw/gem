<script setup lang="ts">
import type { ProductListParams } from '@/api/product'
import type { ProductPageResponse } from '@/types/product'
import { getProductList } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import ProductSearch from './_components/ProductSearch.vue'

// 搜索参数
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

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
</script>

<template>
  <div class="flex-1">
    <!-- 搜索区域 -->
    <ProductSearch v-model:search-name="searchName" :loading="pending" @search="handleSearch" @clear="handleClear" />

    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      <p class="mt-4 text-gray-600">
        加载中...
      </p>
    </div>

    <!-- 商品列表 -->
    <div v-else-if="data?.records?.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <ProductCard v-for="product in data?.records || []" :key="product.id" :product="product" />
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <Icon name="mdi:package-variant" class="text-6xl text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 text-lg">
        暂无商品
      </p>
    </div>


    <!-- 分页组件 -->
    <div v-if="!pending && data?.total" class="mt-8 px-4 pb-4">
      <CustomPagination :current="currentPage" :page-size="pageSize" :total="data?.total || 0"
        @page-change="handlePageChange" />
    </div>

    <HotProducts />
    <LatestProducts />
  </div>
</template>
