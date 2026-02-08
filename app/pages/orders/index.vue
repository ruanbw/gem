<script setup lang="ts">
import type { OrderPageResponse } from '~/types/order'
import { getOrderList } from '~/api/order'
import { ORDER_STATUS_MAP } from '~/types/order'
import { Button } from '~/components/ui/button'
import CustomPagination from '~/components/custom-pagination.vue'

const { isAuthenticated } = useAuth()
const route = useRoute()
const redirect = computed(() => (route.query.redirect as string) || '/orders')

const currentPage = ref(1)
const pageSize = ref(10)
/** 全部=undefined, 否则传枚举字符串如 PENDING_PAYMENT */
const statusFilter = ref<'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | undefined>(undefined)

const tabs = [
  { label: '全部', value: undefined },
  { label: '待支付', value: 'PENDING_PAYMENT' as const },
  { label: '已支付', value: 'PAID' as const },
  { label: '已发货', value: 'SHIPPED' as const },
  { label: '完成', value: 'COMPLETED' as const },
  { label: '取消', value: 'CANCELLED' as const },
]

const { data, pending, error, refresh } = useAsyncData(
  'orders-list',
  () => {
    if (!isAuthenticated.value)
      return Promise.resolve({ records: [], total: 0, size: 10, current: 1, pages: 0 })
    return getOrderList({
      current: currentPage.value,
      size: pageSize.value,
      status: statusFilter.value,
    })
  },
  { watch: [isAuthenticated, currentPage, pageSize, statusFilter] },
)

const records = computed(() => data.value?.records ?? [])
const total = computed(() => data.value?.total ?? 0)
const isEmpty = computed(() => !pending.value && records.value.length === 0)

function setStatus(value: 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | undefined) {
  statusFilter.value = value
  currentPage.value = 1
}

function onPageChange(page: number) {
  currentPage.value = page
}

function statusLabel(status: string) {
  return ORDER_STATUS_MAP[status]?.label ?? '未知'
}

function statusClass(status: string) {
  return ORDER_STATUS_MAP[status]?.className ?? 'bg-gray-100 text-gray-600'
}

function goDetail(order: OrderPageResponse) {
  navigateTo(`/orders/${order.id}`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <Breadcrumb class="mb-6" />
    <h1 class="text-3xl font-bold mb-6">
      我的订单
    </h1>

    <!-- 未登录 -->
    <div v-if="!isAuthenticated" class="rounded-lg border bg-card p-8 text-center">
      <p class="text-muted-foreground mb-4">
        请先登录后查看订单
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
      {{ error?.message ?? String(error) }}
    </div>

    <!-- 已登录：状态 Tab + 列表或空态 -->
    <div v-else>
      <div class="flex flex-wrap gap-2 mb-6">
        <Button
          v-for="tab in tabs"
          :key="tab.value ?? 'all'"
          :variant="(tab.value === undefined && statusFilter === undefined) || tab.value === statusFilter ? 'secondary' : 'ghost'"
          size="sm"
          @click="setStatus(tab.value)"
        >
          {{ tab.label }}
        </Button>
      </div>

      <!-- 空态 -->
      <div v-if="isEmpty" class="rounded-lg border bg-card p-12 text-center">
        <p class="text-muted-foreground mb-4">
          暂无订单
        </p>
        <Button as-child>
          <NuxtLink to="/products">
            去逛逛
          </NuxtLink>
        </Button>
      </div>

      <!-- 订单卡片列表 -->
      <div v-else class="space-y-4">
        <button
          v-for="order in records"
          :key="order.id"
          type="button"
          class="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50"
          @click="goDetail(order)"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-4">
              <span class="font-mono text-sm text-muted-foreground">
                订单号：{{ order.orderNo }}
              </span>
              <span
                :class="['rounded px-2 py-0.5 text-xs font-medium', statusClass(order.status)]"
              >
                {{ statusLabel(order.status) }}
              </span>
            </div>
            <span class="font-semibold">
              ¥{{ order.totalAmount }}
            </span>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{{ order.createdAt }}</span>
            <span>{{ order.receiverName }} {{ order.receiverPhone }}</span>
            <span class="max-w-[200px] truncate" :title="order.receiverAddress">
              {{ order.receiverAddress }}
            </span>
          </div>
        </button>
      </div>

      <!-- 分页 -->
      <div v-if="data && data.pages > 1" class="mt-6 flex justify-center">
        <CustomPagination
          :current="data.current"
          :page-size="data.size"
          :total="data.total"
          :on-page-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>
