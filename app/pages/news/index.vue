<script setup lang="ts">
import type { ArticleListParams } from '@/api/article'
import type { ArticleItem } from '@/types/article'
import { getArticleList } from '@/api/article'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import ArticleCard from '@/components/article/ArticleCard.vue'

const searchTitle = ref('')
const currentPage = ref(1)
const pageSize = ref(9)

const articles = ref<ArticleItem[]>([])
const total = ref(0)
const loading = ref(false)

async function fetchArticles() {
  loading.value = true
  try {
    const params: ArticleListParams = {
      current: currentPage.value,
      size: pageSize.value,
    }
    if (searchTitle.value.trim()) {
      params.title = searchTitle.value.trim()
    }

    const response = await getArticleList(params)
    articles.value = response.content || []
    total.value = response.totalElements || 0
    currentPage.value = response.number + 1
  }
  catch (error) {
    console.error('获取文章列表失败:', error)
    articles.value = []
    total.value = 0
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchArticles()
}

function handleClear() {
  searchTitle.value = ''
  currentPage.value = 1
  fetchArticles()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchArticles()
}

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="flex-1 px-4 py-8 md:py-12">
    <!-- 页面标题区 -->
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
        News &amp; Insights
      </div>
      <h1 class="text-2xl font-semibold text-foreground">
        最新动态
      </h1>
      <div class="w-10 h-0.5 bg-primary mx-auto mt-3" />
    </div>

    <!-- 搜索栏 -->
    <div class="max-w-md mx-auto mb-10">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <Input
            v-model="searchTitle"
            placeholder="搜索文章..."
            class="w-full pr-8"
            @keyup.enter="handleSearch"
          />
          <button
            v-if="searchTitle"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            @click="handleClear"
          >
            <Icon name="lucide:x" class="text-sm" />
          </button>
        </div>
        <Button :disabled="loading" @click="handleSearch">
          <Icon name="lucide:search" class="text-sm" />
        </Button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent" />
      <p class="mt-4 text-muted-foreground">
        加载中...
      </p>
    </div>

    <!-- 文章网格 -->
    <div
      v-else-if="articles.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
    >
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-20">
      <Icon name="mdi:newspaper-variant-outline" class="text-5xl text-muted-foreground mb-4" />
      <p class="text-muted-foreground text-lg">
        暂无文章
      </p>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-10 flex justify-center">
      <Pagination
        :total="total"
        :items-per-page="pageSize"
        :page="currentPage"
        :sibling-count="1"
        @update:page="handlePageChange"
      >
        <PaginationContent>
          <PaginationItem :value="0">
            <PaginationPrevious
              :disabled="currentPage === 1"
              @click="currentPage > 1 && handlePageChange(currentPage - 1)"
            />
          </PaginationItem>

          <template v-for="page in totalPages" :key="page">
            <PaginationItem v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)" :value="page">
              <Button
                :variant="page === currentPage ? 'outline' : 'ghost'"
                size="icon"
                :class="{ 'bg-primary text-primary-foreground': page === currentPage }"
                @click="handlePageChange(page)"
              >
                {{ page }}
              </Button>
            </PaginationItem>
            <PaginationItem v-else-if="page === currentPage - 2 || page === currentPage + 2" :value="page">
              <PaginationEllipsis />
            </PaginationItem>
          </template>

          <PaginationItem :value="totalPages + 1">
            <PaginationNext
              :disabled="currentPage === totalPages"
              @click="currentPage < totalPages && handlePageChange(currentPage + 1)"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>
