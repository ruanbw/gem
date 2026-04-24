<script setup lang="ts">
interface Props {
  quantity: number
  availableStock: number
  hasSelectedSku: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:quantity': [value: number]
  'add-to-cart': []
  'buy-now': []
}>()

function decrement(qty: number) {
  if (qty > 1) emit('update:quantity', qty - 1)
}
function increment(qty: number, stock: number) {
  if (qty < stock) emit('update:quantity', qty + 1)
}
</script>

<template>
  <div class="space-y-5">
    <!-- 数量 -->
    <div v-if="hasSelectedSku" class="flex items-center gap-4">
      <span class="text-[11px] tracking-widest text-[#8A8986]">数量</span>
      <div class="flex items-center border border-[#D5D4D0]">
        <button
          class="px-3 py-1.5 text-[#8A8986] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          :disabled="quantity <= 1"
          @click="decrement(quantity)"
        >
          −
        </button>
        <span class="px-3 py-1.5 border-x border-[#D5D4D0] text-sm min-w-[2.5rem] text-center">
          {{ quantity }}
        </span>
        <button
          class="px-3 py-1.5 text-[#8A8986] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          :disabled="quantity >= availableStock"
          @click="increment(quantity, availableStock)"
        >
          +
        </button>
      </div>
      <span class="text-[11px] text-[#8A8986]">库存 {{ availableStock }} 件</span>
    </div>

    <!-- 分割线 -->
    <div class="h-px bg-[#D5D4D0]" />

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button
        class="flex-1 bg-[#1A1A1A] text-white text-xs tracking-widest py-3.5 hover:bg-[#333] transition-colors"
        @click="$emit('add-to-cart')"
      >
        加入购物车
      </button>
      <button
        class="flex-1 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest py-3.5 hover:bg-[#F0EFED] transition-colors"
        @click="$emit('buy-now')"
      >
        立即购买
      </button>
    </div>
  </div>
</template>
