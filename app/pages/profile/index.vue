<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const { isAuthenticated } = useAuth()
const route = useRoute()

// 如果未登录，重定向到登录页
if (!isAuthenticated.value) {
  const redirect = encodeURIComponent(route.fullPath)
  navigateTo(`/auth/signin?redirect=${redirect}`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">
      个人资料
    </h1>
    <div v-if="userStore.userDetail" class="space-y-4">
      <p>用户ID: {{ userStore.userDetail.id }}</p>
      <p>用户名: {{ userStore.userDetail.username }}</p>
      <p>昵称: {{ userStore.userDetail.realName }}</p>
      <p>手机号: {{ userStore.userDetail.mobile }}</p>
      <p>描述: {{ userStore.userDetail.description }}</p>
    </div>
    <div v-else class="text-center py-8 text-muted-foreground">
      暂无用户信息
    </div>
  </div>
</template>
