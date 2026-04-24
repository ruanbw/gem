<script setup lang="ts">
defineProps<{
  title: string
  author: string
  createAt: string
  status?: 'DRAFT' | 'PUBLISHED'
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <header class="mb-8">
    <!-- 标题 -->
    <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
      {{ title }}
    </h1>

    <!-- 元信息 -->
    <div class="flex items-center gap-3 text-sm text-muted-foreground">
      <span class="flex items-center gap-1">
        <Icon name="mdi:account-outline" class="text-base" />
        {{ author }}
      </span>
      <span>·</span>
      <span class="flex items-center gap-1">
        <Icon name="mdi:calendar-outline" class="text-base" />
        {{ formatDate(createAt) }}
      </span>
      <span
        v-if="status"
        class="ml-2 px-2 py-0.5 rounded text-xs"
        :class="{
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': status === 'PUBLISHED',
          'bg-muted text-muted-foreground': status === 'DRAFT',
        }"
      >
        {{ status === 'PUBLISHED' ? '已发布' : '草稿' }}
      </span>
    </div>
  </header>
</template>
