<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination'

const props = defineProps<{
  current: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}>()

// 处理页面变化
function handlePageChange(page: number) {
  props.onPageChange(page)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Pagination
      v-slot="{ page }"
      :items-per-page="pageSize"
      :total="total"
      :default-page="current"
      @update:page="handlePageChange"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />

        <template v-for="(item, index) in items" :key="index">
          <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
            {{ item.value }}
          </PaginationItem>
        </template>

        <PaginationEllipsis :index="4" />

        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </div>
</template>
