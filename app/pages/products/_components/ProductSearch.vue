<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
    <div class="flex justify-center items-center gap-2 w-1/2 mx-auto">
      <!-- 商品名称搜索 -->

      <Input
        v-model="searchName"
        placeholder="请输入商品名称、颜色、切工进行搜索"
        :disabled="props.loading"
        @keyup.enter="handleSearch"
      />

      <!-- 操作按钮 -->
      <div class="flex items-end gap-2">
        <Button :disabled="props.loading" @click="handleSearch">
          搜索
        </Button>
        <Button variant="outline" :disabled="props.loading" @click="handleClear">
          重置
        </Button>
      </div>
    </div>
  </div>
</template>
