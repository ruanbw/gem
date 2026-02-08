/**
 * 结算页 direct 模式下的订单项（用于展示，提交时仅用 skuId、quantity）
 */
export interface DirectCheckoutItem {
  skuId: number
  quantity: number
  productName: string
  coverImage: string
  specJson: Record<string, string>
  price: string
}

export const useCheckoutStore = defineStore('checkout', () => {
  const mode = ref<'direct' | 'cart' | null>(null)
  const directItems = ref<DirectCheckoutItem[] | null>(null)
  const cartItemIds = ref<number[] | null>(null)

  const hasCheckoutData = computed(() => {
    if (!mode.value)
      return false
    if (mode.value === 'direct')
      return !!directItems.value?.length
    if (mode.value === 'cart')
      return !!cartItemIds.value?.length
    return false
  })

  function setDirectCheckout(items: DirectCheckoutItem[]) {
    mode.value = 'direct'
    directItems.value = items
    cartItemIds.value = null
  }

  function setCartCheckout(ids: number[]) {
    mode.value = 'cart'
    cartItemIds.value = ids
    directItems.value = null
  }

  function clearCheckout() {
    mode.value = null
    directItems.value = null
    cartItemIds.value = null
  }

  return {
    mode,
    directItems,
    cartItemIds,
    hasCheckoutData,
    setDirectCheckout,
    setCartCheckout,
    clearCheckout,
  }
})
