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
import { useFilePath } from '@/composables/useFilePath'

// 搜索参数
const searchTitle = ref('')
const searchAuthor = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 文章列表数据
const articles = ref<ArticleItem[]>([])
const total = ref(0)
const loading = ref(false)

// 获取文章列表
async function fetchArticles() {
  loading.value = true
  try {
    // 构建查询参数
    const params: ArticleListParams = {
      current: currentPage.value,
      size: pageSize.value,
    }

    // 只添加非空的搜索参数
    if (searchTitle.value.trim()) {
      params.title = searchTitle.value.trim()
    }
    if (searchAuthor.value.trim()) {
      params.author = searchAuthor.value.trim()
    }

    // 调用API获取文章列表
    // getArticleList 返回的 response 已经是 ArticlePageResponse 类型（useApi 会自动解包 data）
    const response = await getArticleList(params)

    // 设置文章列表
    articles.value = response.content || []
    // 设置总数和总页数
    total.value = response.totalElements || 0
    // 更新当前页码（API返回的number是从0开始，需要转换为从1开始）
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

// 搜索处理
function handleSearch() {
  currentPage.value = 1
  fetchArticles()
}

// 清空搜索
function handleClear() {
  searchTitle.value = ''
  searchAuthor.value = ''
  currentPage.value = 1
  fetchArticles()
}

// 页码变化
function handlePageChange(page: number) {
  currentPage.value = page
  fetchArticles()
}

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

// 去除 HTML 标签的函数
function stripHtml(html: string | null | undefined): string {
  if (!html)
    return '暂无摘要'
  // 创建一个临时的 DOM 元素来解析 HTML
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || '暂无摘要'
}

// 初始化加载
onMounted(() => {
  fetchArticles()
})

// 监听路由查询参数（支持从URL参数初始化搜索）
const route = useRoute()
watch(() => route.query, (query) => {
  if (query.title && typeof query.title === 'string') {
    searchTitle.value = query.title
  }
  if (query.author && typeof query.author === 'string') {
    searchAuthor.value = query.author
  }
  if (query.page && typeof query.page === 'string') {
    currentPage.value = Number.parseInt(query.page) || 1
  }
  fetchArticles()
}, { immediate: false })
</script>

<template>
  <div class="flex-1 p-2">
    <Breadcrumb class="mb-2" />

    <!-- 搜索区域 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 标题搜索 -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">搜索标题</label>
          <Input
            v-model="searchTitle"
            placeholder="请输入文章标题"
            class="w-full"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- 作者搜索 -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">搜索作者</label>
          <Input
            v-model="searchAuthor"
            placeholder="请输入作者名称"
            class="w-full"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-end gap-2">
          <Button :disabled="loading" @click="handleSearch">
            搜索
          </Button>
          <Button variant="outline" :disabled="loading" @click="handleClear">
            清空
          </Button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      <p class="mt-4 text-gray-600">
        加载中...
      </p>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="articles.length > 0" class="space-y-6">
      <article
        v-for="article in articles"
        :key="article.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateTo(`/news/${article.id}`)"
      >
        <div class="flex p-2 gap-2">
          <!-- 预览图 -->
          <div class="w-24 flex-shrink-0">
            <NuxtImg
              v-if="article.previewImage"
              :src="useFilePath(article.previewImage)"
              :alt="article.title"
              class="w-24 h-full object-cover"
            />
            <div
              v-else
              class="w-24 h-24 bg-gray-200 flex items-center justify-center"
            >
              <Icon name="mdi:image-off" class="text-4xl text-gray-400" />
            </div>
          </div>

          <!-- 文章内容 -->
          <div class="flex-1 overflow-hidden">
            <h2 class=" font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {{ article.title }}
            </h2>
            <p class="text-gray-600 line-clamp-2">
              {{ stripHtml(article.contentSummary) }}
            </p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <Icon name="mdi:account" class="text-base " />
                <span class="truncate max-w-[80px] block" :title="article.author">
                  {{ article.author }}
                </span>
              </span>
              <span class="flex items-center gap-1">
                <Icon name="mdi:calendar" class="text-base" />
                {{ new Date(article.createAt).toLocaleDateString('zh-CN') }}
              </span>
              <span
                v-if="article.status"
                class="px-2 py-1 rounded text-xs"
                :class="{
                  'bg-green-100 text-green-800': article.status === 'PUBLISHED',
                  'bg-gray-100 text-gray-800': article.status === 'DRAFT',
                }"
              >
                {{ article.status === 'PUBLISHED' ? '已发布' : '草稿' }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <Icon name="mdi:newspaper-variant-outline" class="text-6xl text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 text-lg">
        暂无文章
      </p>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
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

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
