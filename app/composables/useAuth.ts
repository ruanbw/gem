export function useAuth() {
  const token = useCookie<string>('Authentication')
  
  /**
   * 是否已登录
   */
  const isAuthenticated = computed(() => {
    if (!token.value) {
      return false
    }
    return true
  })

  return {
    isAuthenticated,
  }
}
