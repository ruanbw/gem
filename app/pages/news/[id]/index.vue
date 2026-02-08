<script setup lang="ts">
import type { Article } from '~/types/article'
import Image from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { getArticleDetail } from '~/api/article'
import { Button } from '~/components/ui/button'
import { useFilePath } from '~/composables/useFilePath'

const route = useRoute()
const newsId = computed(() => route.params.id as string)

// 文章数据
const newsArticle = ref<Article | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 初始化编辑器
const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
  ],
  content: '',
  editable: false, // 详情页只读
})

// 处理文章内容中的图片路径
function processArticleContent(content: string): string {
  if (!content)
    return content

  // 匹配 img 标签中的 src 属性（支持单引号和双引号）
  // 匹配模式：<img ... src="path" ...> 或 <img ... src='path' ...>
  return content.replace(/<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
    // 如果 src 已经是完整 URL（以 http:// 或 https:// 开头），则不需要处理
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return match
    }

    // 使用 useFilePath 完善图片路径
    const fullPath = useFilePath(src)
    return `<img${before} src="${fullPath}"${after}>`
  })
}

// 获取文章详情
async function fetchArticle() {
  loading.value = true
  error.value = null
  try {
    // getArticleDetail 返回的 article 已经是 Article 类型（useApi 会自动解包 data）
    const article = await getArticleDetail(newsId.value)
    newsArticle.value = article

    // 更新编辑器内容，处理图片路径
    if (editor.value && article.content) {
      const processedContent = processArticleContent(article.content)
      editor.value.commands.setContent(processedContent)
    }
  }
  catch (err: any) {
    console.error('获取文章详情失败:', err)
    error.value = err.message || '获取文章详情失败'
  }
  finally {
    loading.value = false
  }
}

// 当文章数据加载后，更新编辑器内容
watch(() => newsArticle.value?.content, (newContent) => {
  if (editor.value && newContent) {
    const processedContent = processArticleContent(newContent)
    editor.value.commands.setContent(processedContent)
  }
}, { immediate: true })

// 组件挂载时获取数据
onMounted(() => {
  fetchArticle()
})

// 组件卸载时销毁编辑器
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

// SEO
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
  <div class="flex-1 max-w-4xl mx-auto px-4 py-8">
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      <p class="mt-4 text-gray-600">
        加载中...
      </p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="mdi:alert-circle" class="text-6xl text-red-400 mx-auto mb-4" />
      <p class="text-red-600 text-lg mb-4">
        {{ error }}
      </p>
      <Button @click="fetchArticle">
        重试
      </Button>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="newsArticle">
      <Breadcrumb class="pb-8" />

      <!-- 新闻标题 -->
      <header class="mb-6">
        <h1 class="text-4xl font-bold mb-4">
          {{ newsArticle.title }}
        </h1>
        <div class="flex items-center gap-4 text-gray-600 text-sm">
          <span class="flex items-center gap-1">
            <Icon name="mdi:account" class="text-base" />
            作者：{{ newsArticle.author }}
          </span>
          <span class="flex items-center gap-1">
            <Icon name="mdi:calendar" class="text-base" />
            发布时间：{{ new Date(newsArticle.createAt).toLocaleString('zh-CN') }}
          </span>
          <span
            v-if="newsArticle.status"
            class="px-2 py-1 rounded text-xs"
            :class="{
              'bg-green-100 text-green-800': newsArticle.status === 'PUBLISHED',
              'bg-gray-100 text-gray-800': newsArticle.status === 'DRAFT',
            }"
          >
            {{ newsArticle.status === 'PUBLISHED' ? '已发布' : '草稿' }}
          </span>
        </div>
      </header>

      <!-- 封面图片 -->
      <div v-if="newsArticle.previewImage" class="mb-6">
        <NuxtImg
          :src="useFilePath(newsArticle.previewImage)"
          :alt="newsArticle.title"
          class="w-full h-auto rounded-lg"
        />
      </div>

      <!-- 编辑器内容 -->
      <div class="prose max-w-none">
        <EditorContent :editor="editor" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <Icon name="mdi:newspaper-variant-outline" class="text-6xl text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 text-lg">
        文章不存在
      </p>
    </div>
  </div>
</template>

<style scoped>
:deep(.ProseMirror) {
  min-height: 300px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  outline: none;
}

:deep(.ProseMirror h1),
:deep(.ProseMirror h2),
:deep(.ProseMirror h3) {
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

:deep(.ProseMirror h1) {
  font-size: 2em;
}

:deep(.ProseMirror h2) {
  font-size: 1.5em;
}

:deep(.ProseMirror h3) {
  font-size: 1.25em;
}

:deep(.ProseMirror p) {
  margin-bottom: 1em;
  line-height: 1.6;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin-bottom: 1em;
}

:deep(.ProseMirror li) {
  margin-bottom: 0.5em;
}

:deep(.ProseMirror a) {
  color: #3b82f6;
  text-decoration: underline;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
  font-style: italic;
}

:deep(.ProseMirror code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

:deep(.ProseMirror pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
}

:deep(.ProseMirror pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}
</style>
