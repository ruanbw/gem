import type { UserDetail, UserInfo } from '~/types/auth'
import { signout as logoutApi } from '~/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref({
    id: 0,
    email: '',
    avatar: '',
    mobile: '',
    description: '',
    status: 0,
  })

  const userDetail = ref<UserDetail | null>(null)

  // 设置用户信息和 token
  const setUser = (userInfo: UserInfo) => {
    user.value = {
      id: userInfo.id,
      email: userInfo.email,
      avatar: '',
      mobile: '',
      description: '',
      status: 0,
    }
  }

  // 设置用户详情
  const setUserDetail = (detail: UserDetail) => {
    userDetail.value = detail
  }

  const logout = async () => {
    try {
      // 调用登出 API
      await logoutApi()
    }
    catch (error) {
      // 即使 API 调用失败，也清除本地状态
      console.error('登出 API 调用失败:', error)
    }
    finally {
      // 清除用户信息
      user.value = {
        id: 0,
        email: '',
        avatar: '',
        mobile: '',
        description: '',
        status: 0,
      }
      userDetail.value = null
    }
  }

  return { user, userDetail, logout, setUser, setUserDetail }
}, {
  persist: true,
})
