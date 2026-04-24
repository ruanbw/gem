<script setup lang="ts">
import type { ArticleItem } from '@/types/article'
import { useFilePath } from '@/composables/useFilePath'

defineProps<{
  article: ArticleItem
}>()

function stripHtml(html: string | null | undefined): string {
  if (!html)
    return ''
  return html.replace(/<[^>]*>/g, '')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <NuxtLink
    :to="`/news/${article.id}`"
    class="group block"
  >
    <div class="bg-card rounded-lg border border-border overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <!-- 封面图 -->
      <div class="relative w-full aspect-video overflow-hidden bg-muted">
        <NuxtImg
          v-if="article.previewImage"
          :src="useFilePath(article.previewImage)"
          :alt="article.title"
          class="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
        >
          <Icon name="mdi:image-off" class="text-3xl text-muted-foreground" />
        </div>
      </div>

      <!-- 文章信息 -->
      <div class="p-4">
        <div class="text-sm text-muted-foreground mb-2">
          {{ formatDate(article.createAt) }}
        </div>
        <h3 class="text-base font-semibold text-foreground line-clamp-2 mb-2 transition-colors group-hover:text-primary">
          {{ article.title }}
        </h3>
        <p
          v-if="article.contentSummary"
          class="text-sm text-muted-foreground line-clamp-2"
        >
          {{ stripHtml(article.contentSummary) }}
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
