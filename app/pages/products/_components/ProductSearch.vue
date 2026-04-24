<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

// 加载状态
const props = defineProps<{
  loading?: boolean
}>()

// 搜索事件
const emit = defineEmits<{
  search: []
  clear: []
}>()

// 商品名称搜索
const searchName = defineModel<string>('searchName', { default: '' })

// 处理搜索
function handleSearch() {
  emit('search')
}

// 处理清空
function handleClear() {
  searchName.value = ''
  emit('clear')
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <div class="relative flex items-center border-b border-[#D5D4D0] transition-colors duration-300 focus-within:border-[#1A1A1A]">
      <Search class="h-4 w-4 text-[#A5A4A0] shrink-0" />
      <input
        v-model="searchName"
        type="text"
        placeholder="搜索作品名称..."
        :disabled="props.loading"
        class="w-full py-3 px-3 bg-transparent font-body text-sm text-[#1A1A1A] placeholder:text-[#C5C3BF] outline-none disabled:opacity-50"
        @keyup.enter="handleSearch"
      >
      <button
        v-if="searchName"
        type="button"
        class="p-1 text-[#A5A4A0] hover:text-[#1A1A1A] transition-colors shrink-0"
        @click="handleClear"
      >
        <X class="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        :disabled="props.loading"
        class="ml-3 font-body text-xs tracking-widest text-[#8A8986] uppercase hover:text-[#1A1A1A] transition-colors disabled:opacity-50 shrink-0"
        @click="handleSearch"
      >
        Search
      </button>
    </div>
  </div>
</template>
