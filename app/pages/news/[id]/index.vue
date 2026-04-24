<script setup lang="ts">
import type { Article } from '@/types/article'
import { getArticleDetail } from '@/api/article'
import { Button } from '@/components/ui/button'
import { useFilePath } from '@/composables/useFilePath'
import ArticleHeader from '@/components/article/ArticleHeader.vue'
import ArticleContent from '@/components/article/ArticleContent.vue'

const route = useRoute()
const newsId = computed(() => route.params.id as string)

const newsArticle = ref<Article | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchArticle() {
  loading.value = true
  error.value = null
  try {
    const article = await getArticleDetail(newsId.value)
    newsArticle.value = article
  }
  catch (err: any) {
    console.error('获取文章详情失败:', err)
    error.value = err.message || '获取文章详情失败'
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticle()
})

useHead({
  title: computed(() => newsArticle.value?.title || '文章详情'),
  meta: [
    {
      name: 'description',
      content: computed(() => newsArticle.value?.content?.replace(/<[^>]*>/g, '').substring(0, 200) || ''),
    },
  ],
})
</script>

<template>
  <div class="flex-1 max-w-3xl mx-auto px-4 py-8 md:py-12">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent" />
      <p class="mt-4 text-muted-foreground">
        加载中...
      </p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
      <Icon name="mdi:alert-circle-outline" class="text-5xl text-destructive mb-4" />
      <p class="text-destructive text-lg mb-4">
        {{ error }}
      </p>
      <Button @click="fetchArticle">
        重试
      </Button>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="newsArticle">
      <Breadcrumb class="mb-6" />

      <ArticleHeader
        :title="newsArticle.title"
        :author="newsArticle.author"
        :create-at="newsArticle.createAt"
        :status="newsArticle.status"
      />

      <!-- 封面图 -->
      <div v-if="newsArticle.previewImage" class="mb-8">
        <NuxtImg
          :src="useFilePath(newsArticle.previewImage)"
          :alt="newsArticle.title"
          class="w-full h-auto rounded-lg"
        />
      </div>

      <!-- 正文 -->
      <ArticleContent
        v-if="newsArticle.content"
        :content="newsArticle.content"
      />

      <!-- 返回链接 -->
      <div class="mt-12 pt-6 border-t border-border">
        <NuxtLink
          to="/news"
          class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="lucide:arrow-left" class="text-sm" />
          返回列表
        </NuxtLink>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-20">
      <Icon name="mdi:newspaper-variant-outline" class="text-5xl text-muted-foreground mb-4" />
      <p class="text-muted-foreground text-lg">
        文章不存在
      </p>
    </div>
  </div>
</template>
