import { getCartCount } from '~/api/cart'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)

  const fetchCount = async () => {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated.value) {
      count.value = 0
      return
    }
    try {
      count.value = await getCartCount()
    }
    catch {
      count.value = 0
    }
  }

  return { count, fetchCount }
})
