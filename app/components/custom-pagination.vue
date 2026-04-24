<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  current: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

function handlePageChange(page: number) {
  if (page < 1 || page > totalPages.value || page === props.current)
    return
  emit('pageChange', page)
}

// 计算要显示的页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = props.current

  if (total <= 7) {
    for (let i = 1; i <= total; i++)
      pages.push(i)
    return pages
  }

  // 总是显示第一页
  pages.push(1)

  // 当前页在开头附近
  if (current <= 3) {
    pages.push(2, 3, 4, '...', total)
  }
  // 当前页在末尾附近
  else if (current >= total - 2) {
    pages.push('...', total - 3, total - 2, total - 1, total)
  }
  // 当前页在中间
  else {
    pages.push('...', current - 1, current, current + 1, '...', total)
  }

  return pages
})
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center gap-1">
    <!-- 上一页 -->
    <button
      type="button"
      :disabled="current <= 1"
      class="p-2 text-[#A5A4A0] hover:text-[#1A1A1A] disabled:opacity-30 disabled:hover:text-[#A5A4A0] transition-colors"
      @click="handlePageChange(current - 1)"
    >
      <ChevronLeft class="h-4 w-4" />
    </button>

    <!-- 页码 -->
    <div class="flex items-center gap-1">
      <template v-for="(page, index) in visiblePages" :key="index">
        <button
          v-if="typeof page === 'number'"
          type="button"
          class="relative min-w-[36px] px-2 py-2 font-body text-xs tracking-wide transition-colors"
          :class="page === current ? 'text-[#1A1A1A] font-medium' : 'text-[#A5A4A0] hover:text-[#1A1A1A]'"
          @click="handlePageChange(page)"
        >
          {{ page }}
          <span
            v-if="page === current"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px bg-[#1A1A1A]"
          />
        </button>
        <span
          v-else
          class="px-2 py-2 font-body text-xs text-[#C5C3BF]"
        >
          {{ page }}
        </span>
      </template>
    </div>

    <!-- 下一页 -->
    <button
      type="button"
      :disabled="current >= totalPages"
      class="p-2 text-[#A5A4A0] hover:text-[#1A1A1A] disabled:opacity-30 disabled:hover:text-[#A5A4A0] transition-colors"
      @click="handlePageChange(current + 1)"
    >
      <ChevronRight class="h-4 w-4" />
    </button>
  </nav>
</template>
