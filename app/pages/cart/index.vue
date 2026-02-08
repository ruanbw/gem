<script setup lang="ts">
import type { CartItemResponse } from '@/types/cart'
import { toast } from 'vue-sonner'
import { clearCart, deleteCartItem, getCartList, updateCartItem } from '@/api/cart'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useCartStore } from '~/stores/cart'
import { useCheckoutStore } from '~/stores/checkout'

const { isAuthenticated } = useAuth()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const selectedIds = ref<number[]>([])

const route = useRoute()
const redirect = computed(() => {
  const r = route.query.redirect as string
  return r || '/cart'
})

const { pending, data, refresh, error } = useAsyncData(
  'cart-list',
  () => (isAuthenticated.value ? getCartList() : Promise.resolve([])),
  { watch: [isAuthenticated] },
)

async function changeQty(item: CartItemResponse, delta: number) {
  const qty = Math.max(1, Math.min(item.availableStock, item.quantity + delta))
  if (qty === item.quantity)
    return
  try {
    await updateCartItem({ id: item.id, quantity: qty })
    toast.success('已更新')
    await refresh()
    cartStore.fetchCount()
  }
  catch {
    // useApi 已处理 toaster
  }
}

async function handleDelete(item: CartItemResponse) {
  try {
    await deleteCartItem(item.id)
    selectedIds.value = selectedIds.value.filter(id => id !== item.id)
    toast.success('已删除')
    await refresh()
    cartStore.fetchCount()
  }
  catch {
    // useApi 已处理 toaster
  }
}

async function handleClear() {
  try {
    await clearCart()
    selectedIds.value = []
    toast.success('已清空')
    await refresh()
    cartStore.fetchCount()
  }
  catch {
    // useApi 已处理 toaster
  }
}

function toggleSelect(id: number, value: boolean | 'indeterminate') {
  if (value === true) {
    if (!selectedIds.value.includes(id))
      selectedIds.value = [...selectedIds.value, id]
  }
  else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

function onRowCheck(id: number) {
  return (v: boolean | 'indeterminate') => toggleSelect(id, v)
}

function toggleAll(value: boolean | 'indeterminate') {
  if ((value === true || value === 'indeterminate') && data?.value)
    selectedIds.value = data.value.map(i => i.id)
  else
    selectedIds.value = []
}

const isAllSelected = computed(() =>
  !!data?.value?.length && data.value.every(item => selectedIds.value.includes(item.id)),
)

const isSomeSelected = computed(() => selectedIds.value.length > 0 && !isAllSelected.value)

// 全选 checkbox 的 model-value：全选为 true，部分选为 indeterminate，未选为 false
const headerCheckboxValue = computed(() =>
  isAllSelected.value ? true : (isSomeSelected.value ? 'indeterminate' : false),
)

// 数据刷新后剔除已不存在的 id（含空列表时清空 selectedIds）
watch(
  () => data?.value,
  (list) => {
    if (list)
      selectedIds.value = selectedIds.value.filter(id => list.some(i => i.id === id))
  },
  { deep: true },
)

function goCheckout() {
  if (selectedIds.value.length === 0) {
    toast.error('请选择要结算的商品')
    return
  }
  checkoutStore.setCartCheckout([...selectedIds.value])
  navigateTo('/orders/checkout')
}

const totalPrice = computed(() => {
  if (!data?.value?.length)
    return '0.00'
  const sum = data.value.reduce(
    (acc, it) => acc + Number(it.price) * it.quantity,
    0,
  )
  return sum.toFixed(2)
})

const selectedTotal = computed(() => {
  if (!data?.value?.length || selectedIds.value.length === 0)
    return '0.00'
  const sum = data.value
    .filter(it => selectedIds.value.includes(it.id))
    .reduce((acc, it) => acc + Number(it.price) * it.quantity, 0)
  return sum.toFixed(2)
})

const isEmpty = computed(() => !data?.value || data.value.length === 0)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <Breadcrumb class="mb-6" />
    <h1 class="text-3xl font-bold mb-6">
      购物车
    </h1>

    <!-- 未登录 -->
    <div v-if="!isAuthenticated" class="rounded-lg border bg-card p-8 text-center">
      <p class="text-muted-foreground mb-4">
        请先登录后查看购物车
      </p>
      <Button as-child>
        <NuxtLink :to="`/auth/signin?redirect=${encodeURIComponent(redirect)}`">
          去登录
        </NuxtLink>
      </Button>
    </div>

    <!-- 已登录：加载中 -->
    <div v-else-if="pending" class="py-12 text-center">
      <div class="inline-block size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p class="mt-4 text-muted-foreground">
        加载中...
      </p>
    </div>

    <!-- 已登录：加载错误 -->
    <div v-else-if="error" class="rounded-lg border bg-destructive/10 p-8 text-center text-destructive">
      {{ error }}
    </div>

    <!-- 已登录：空态 -->
    <div v-else-if="isEmpty" class="rounded-lg border bg-card p-12 text-center">
      <p class="text-muted-foreground mb-4">
        购物车是空的
      </p>
      <Button as-child>
        <NuxtLink to="/products">
          去逛逛
        </NuxtLink>
      </Button>
    </div>

    <!-- 已登录：列表 -->
    <div v-else class="space-y-6">
      <div class="overflow-x-auto rounded-lg border">
        <table class="w-full">
          <thead class="border-b bg-muted/50">
            <tr class="text-left text-sm font-medium">
              <th class="w-12 p-4">
                <Checkbox
                  :model-value="headerCheckboxValue"
                  aria-label="全选"
                  @update:model-value="toggleAll"
                />
              </th>
              <th class="p-4">
                商品
              </th>
              <th class="p-4">
                单价
              </th>
              <th class="p-4">
                数量
              </th>
              <th class="p-4">
                小计
              </th>
              <th class="w-24 p-4" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in data"
              :key="item.id"
              class="border-b last:border-b-0"
            >
              <td class="w-12 p-4">
                <Checkbox
                  :model-value="selectedIds.includes(item.id)"
                  :aria-label="`选择 ${item.productName}`"
                  @update:model-value="onRowCheck(item.id)"
                />
              </td>
              <td class="p-4">
                <div class="flex items-center gap-4">
                  <NuxtLink :to="`/products/${item.productId}`" class="shrink-0">
                    <NuxtImg
                      :src="useFilePath(item.coverImage)"
                      :alt="item.productName"
                      class="size-20 rounded-md object-cover"
                    />
                  </NuxtLink>
                  <div>
                    <NuxtLink :to="`/products/${item.productId}`" class="font-medium hover:underline">
                      {{ item.productName }}
                    </NuxtLink>
                    <p v-if="item.specJson && Object.keys(item.specJson).length" class="mt-1 text-sm text-muted-foreground">
                      {{ Object.entries(item.specJson).map(([k, v]) => `${k}: ${v}`).join(' / ') }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                ¥{{ item.price }}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    :disabled="item.quantity <= 1"
                    @click="changeQty(item, -1)"
                  >
                    −
                  </Button>
                  <span class="min-w-[2rem] text-center">{{ item.quantity }}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    :disabled="item.quantity >= item.availableStock"
                    @click="changeQty(item, 1)"
                  >
                    +
                  </Button>
                </div>
              </td>
              <td class="p-4 font-medium">
                ¥{{ (Number(item.price) * item.quantity).toFixed(2) }}
              </td>
              <td class="p-4">
                <Button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10 hover:text-destructive" @click="handleDelete(item)">
                  删除
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <div class="text-lg font-semibold">
          <template v-if="selectedIds.length > 0">
            已选 {{ selectedIds.length }} 件，合计：¥{{ selectedTotal }}
          </template>
          <template v-else>
            合计：¥{{ totalPrice }}
          </template>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="handleClear">
            清空购物车
          </Button>
          <Button @click="goCheckout">
            去结算
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
