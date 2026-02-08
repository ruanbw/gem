<script setup lang="ts">
import type { CartItemResponse } from '@/types/cart'
import type { DirectCheckoutItem } from '@/stores/checkout'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { createOrderFromCart, saveOrder } from '@/api/order'
import { getCartList } from '@/api/cart'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCartStore } from '~/stores/cart'
import { useCheckoutStore } from '~/stores/checkout'

const { isAuthenticated } = useAuth()
const checkoutStore = useCheckoutStore()
const cartStore = useCartStore()

const addressSchema = z.object({
  receiverName: z.string().min(1, '收货人不能为空').max(64, '收货人长度不能超过64个字符'),
  receiverPhone: z.string().min(1, '手机号不能为空').max(20, '手机号长度不能超过20个字符').regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  receiverAddress: z.string().min(1, '收货地址不能为空').max(512, '收货地址长度不能超过512个字符'),
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(addressSchema),
})

const onSubmit = handleSubmit(async (values: { receiverName: string; receiverPhone: string; receiverAddress: string }) => {
  const { receiverName, receiverPhone, receiverAddress } = values
  try {
    if (checkoutStore.mode === 'direct' && checkoutStore.directItems?.length) {
      await saveOrder({
        receiverName,
        receiverPhone,
        receiverAddress,
        orderItems: checkoutStore.directItems.map(i => ({ skuId: i.skuId, quantity: i.quantity })),
      })
      checkoutStore.clearCheckout()
      toast.success('订单提交成功')
      navigateTo('/orders')
      return
    }
    if (checkoutStore.mode === 'cart' && checkoutStore.cartItemIds?.length) {
      const orderId = await createOrderFromCart({
        cartItemIds: checkoutStore.cartItemIds,
        receiverName,
        receiverPhone,
        receiverAddress,
      })
      checkoutStore.clearCheckout()
      cartStore.fetchCount()
      toast.success('订单创建成功')
      navigateTo(`/orders/${orderId}`)
    }
  }
  catch {
    // useApi 已处理 toaster
  }
})

const { data: cartItemsData, pending: cartPending } = useAsyncData(
  'checkout-cart',
  async () => {
    if (checkoutStore.mode !== 'cart' || !checkoutStore.cartItemIds?.length)
      return []
    const list = await getCartList()
    return list.filter(i => checkoutStore.cartItemIds!.includes(i.id))
  },
)

const cartItems = computed(() => (cartItemsData.value ?? []) as CartItemResponse[])

const orderItems = computed(() => {
  if (checkoutStore.mode === 'direct' && checkoutStore.directItems?.length)
    return checkoutStore.directItems!
  if (checkoutStore.mode === 'cart' && cartItems.value.length)
    return cartItems.value
  return []
})

const isDirect = computed(() => checkoutStore.mode === 'direct')

const totalAmount = computed(() => {
  const items = orderItems.value
  if (!items.length)
    return '0.00'
  const sum = items.reduce((acc, it) => {
    const p = Number('price' in it ? it.price : (it as CartItemResponse).price)
    const q = 'quantity' in it ? it.quantity : (it as CartItemResponse).quantity
    return acc + p * q
  }, 0)
  return sum.toFixed(2)
})

function getItemDisplay(it: DirectCheckoutItem | CartItemResponse) {
  if (isDirect.value && 'productName' in it)
    return { name: (it as DirectCheckoutItem).productName, spec: (it as DirectCheckoutItem).specJson, cover: (it as DirectCheckoutItem).coverImage, price: (it as DirectCheckoutItem).price, qty: (it as DirectCheckoutItem).quantity }
  const c = it as CartItemResponse
  return { name: c.productName, spec: c.specJson ?? {}, cover: c.coverImage, price: c.price, qty: c.quantity }
}

watch(
  [cartItemsData, cartPending],
  () => {
    if (cartPending.value)
      return
    if (checkoutStore.mode === 'cart' && (checkoutStore.cartItemIds?.length ?? 0) > 0 && cartItems.value.length === 0) {
      toast.error('所选商品已失效或已移除')
      checkoutStore.clearCheckout()
      navigateTo('/cart')
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo('/auth/signin?redirect=/orders/checkout')
    return
  }
  if (!checkoutStore.hasCheckoutData) {
    toast.error('请先选择要结算的商品')
    navigateTo('/cart')
  }
})

const loading = computed(() => isDirect.value ? false : cartPending.value)
const canSubmit = computed(() => orderItems.value.length > 0)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <Breadcrumb class="mb-6" />
    <h1 class="text-3xl font-bold mb-6">
      结算
    </h1>

    <div v-if="loading" class="py-12 text-center">
      <div class="inline-block size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p class="mt-4 text-muted-foreground">
        加载中...
      </p>
    </div>

    <div v-else-if="!canSubmit" class="rounded-lg border bg-card p-8 text-center text-muted-foreground">
      <p>暂无商品，请从商品详情或购物车选择后再结算。</p>
      <Button as-child class="mt-4">
        <NuxtLink to="/cart">
          去购物车
        </NuxtLink>
      </Button>
    </div>

    <div v-else class="space-y-8">
      <!-- 订单摘要 -->
      <section class="rounded-lg border bg-card">
        <h2 class="border-b px-4 py-3 font-semibold">
          订单摘要
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b bg-muted/50 text-sm font-medium">
              <tr class="text-left">
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
                v-for="(it, idx) in orderItems"
                :key="isDirect ? `d-${(it as DirectCheckoutItem).skuId}-${idx}` : `c-${(it as CartItemResponse).id}`"
                class="border-b last:border-b-0"
              >
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <NuxtImg
                      :src="useFilePath(getItemDisplay(it).cover)"
                      :alt="getItemDisplay(it).name"
                      class="size-16 shrink-0 rounded-md object-cover"
                    />
                    <div>
                      <p class="font-medium">
                        {{ getItemDisplay(it).name }}
                      </p>
                      <p
                        v-if="Object.keys(getItemDisplay(it).spec).length"
                        class="mt-0.5 text-sm text-muted-foreground"
                      >
                        {{ Object.entries(getItemDisplay(it).spec).map(([k, v]) => `${k}: ${v}`).join(' / ') }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  ¥{{ getItemDisplay(it).price }}
                </td>
                <td class="p-4">
                  {{ getItemDisplay(it).qty }}
                </td>
                <td class="p-4 font-medium">
                  ¥{{ (Number(getItemDisplay(it).price) * getItemDisplay(it).qty).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="border-t px-4 py-3 text-right text-lg font-semibold">
          合计：¥{{ totalAmount }}
        </div>
      </section>

      <!-- 收货信息 -->
      <section class="rounded-lg border bg-card">
        <h2 class="border-b px-4 py-3 font-semibold">
          收货信息
        </h2>
        <form class="space-y-4 p-4" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="receiverName">
            <FormItem>
              <FormLabel>收货人</FormLabel>
              <FormControl>
                <Input placeholder="请输入收货人姓名" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="receiverPhone">
            <FormItem>
              <FormLabel>手机号</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="请输入11位手机号" maxlength="20" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="receiverAddress">
            <FormItem>
              <FormLabel>收货地址</FormLabel>
              <FormControl>
                <Input type="text" placeholder="请输入详细地址" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 size-4 animate-spin" />
            {{ isSubmitting ? '提交中...' : '提交订单' }}
          </Button>
        </form>
      </section>
    </div>
  </div>
</template>
