<script setup lang="ts">
import { getOrderDetail } from '~/api/order'
import { ORDER_STATUS_MAP } from '~/types/order'
import { Button } from '~/components/ui/button'

const route = useRoute()
const orderId = computed(() => Number(route.params.id))

const { data: order, pending, error, refresh } = useAsyncData(
  'order-detail',
  () => getOrderDetail(orderId.value),
  { watch: [orderId] },
)

const statusLabel = (status: string) => ORDER_STATUS_MAP[status]?.label ?? '未知'
const statusClass = (status: string) => ORDER_STATUS_MAP[status]?.className ?? 'bg-gray-100 text-gray-600'

const breadcrumbItems = [
  { label: '首页', href: '/' },
  { label: '我的订单', href: '/orders' },
  { label: '订单详情' },
]
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <Breadcrumb class="mb-6" :items="breadcrumbItems" />

    <!-- 加载中 -->
    <div v-if="pending" class="py-12 text-center">
      <div class="inline-block size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p class="mt-4 text-muted-foreground">
        加载中...
      </p>
    </div>

    <!-- 错误或不存在 -->
    <div v-else-if="error || !order" class="rounded-lg border bg-card p-12 text-center">
      <p class="text-muted-foreground mb-4">
        订单不存在或已失效
      </p>
      <Button as-child>
        <NuxtLink to="/orders">
          返回我的订单
        </NuxtLink>
      </Button>
    </div>

    <!-- 订单详情 -->
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">
          订单详情
        </h1>
        <Button variant="outline" as-child>
          <NuxtLink to="/orders">
            返回我的订单
          </NuxtLink>
        </Button>
      </div>

      <!-- 订单主信息 -->
      <div class="rounded-lg border bg-card p-6">
        <h2 class="mb-4 text-lg font-semibold">
          订单信息
        </h2>
        <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt class="text-sm text-muted-foreground">
              订单号
            </dt>
            <dd class="font-mono">
              {{ order.orderNo }}
            </dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">
              订单状态
            </dt>
            <dd>
              <span :class="['rounded px-2 py-0.5 text-xs font-medium', statusClass(order.status)]">
                {{ statusLabel(order.status) }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">
              创建时间
            </dt>
            <dd>{{ order.createdAt }}</dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">
              更新时间
            </dt>
            <dd>{{ order.updatedAt }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm text-muted-foreground">
              收货人
            </dt>
            <dd>{{ order.receiverName }} {{ order.receiverPhone }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm text-muted-foreground">
              收货地址
            </dt>
            <dd>{{ order.receiverAddress }}</dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">
              订单金额
            </dt>
            <dd class="text-lg font-semibold">
              ¥{{ order.totalAmount }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- 商品明细 -->
      <div class="overflow-x-auto rounded-lg border">
        <table class="w-full">
          <thead class="border-b bg-muted/50">
            <tr class="text-left text-sm font-medium">
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
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in (order.orderItems ?? [])"
              :key="item.id"
              class="border-b last:border-b-0"
            >
              <td class="p-4">
                <div class="flex items-center gap-4">
                  <NuxtLink :to="`/products/${item.productId}`" class="shrink-0">
                    <NuxtImg
                      :src="useFilePath(item.coverImage)"
                      :alt="item.skuName"
                      class="size-16 rounded-md object-cover sm:size-20"
                    />
                  </NuxtLink>
                  <div>
                    <NuxtLink :to="`/products/${item.productId}`" class="font-medium hover:underline">
                      {{ item.skuName }}
                    </NuxtLink>
                    <p
                      v-if="item.specJson && Object.keys(item.specJson).length"
                      class="mt-1 text-sm text-muted-foreground"
                    >
                      {{ Object.entries(item.specJson).map(([k, v]) => `${k}: ${v}`).join(' / ') }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                ¥{{ item.price }}
              </td>
              <td class="p-4">
                {{ item.quantity }}
              </td>
              <td class="p-4 font-medium">
                ¥{{ (Number(item.price) * item.quantity).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
