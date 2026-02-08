<script setup lang="ts">
import { ChevronDown, Search, ShoppingCart, TextAlignJustify, User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { MenuContent, MenuItem, MenuRoot, MenuSeparator, MenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useCartStore } from '~/stores/cart'
import { useConfigStore } from '~/stores/config'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const configStore = useConfigStore()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()

watch(isAuthenticated, () => {
  cartStore.fetchCount()
}, { immediate: true })

const navigationItems = [
  { name: '首页', path: '/' },
  { name: '产品', path: '/products' },
  { name: '新闻', path: '/news' },
  { name: '联系我们', path: '/contact' },
]

// 获取用户邮箱显示
const userEmail = computed(() => {
  if (userStore.userDetail) {
    // 如果接口返回了email字段，使用email；否则使用username（可能是邮箱格式）
    return (userStore.userDetail as any).email || userStore.userDetail.username
  }
  return userStore.user.email || ''
})

async function handleSignOut() {
  await userStore.logout()
  await navigateTo('/auth/signin')
}

async function doLogin() {
  if (isAuthenticated.value) {
    await navigateTo('/profile')
    return
  }
  await navigateTo('/auth/signin')
}
</script>

<template>
  <nav>
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- 左侧：Logo 和导航链接 -->
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="text-xl font-bold">
          Logo
        </NuxtLink>
        <div class="hidden md:flex items-center gap-6">
          <NuxtLink
            v-for="item in navigationItems" :key="item.path" :to="item.path"
            class="font-medium"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>

      <!-- 右侧：搜索、通知、用户菜单 -->
      <div class="flex items-center gap-4">
        <!-- 购物车 -->
        <NuxtLink to="/cart" class="relative flex items-center justify-center">
          <Button variant="ghost" size="icon">
            <ShoppingCart class="h-4 w-4" />
          </Button>
          <span
            v-if="isAuthenticated && cartStore.count > 0"
            class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
          >
            {{ cartStore.count > 99 ? '99+' : cartStore.count }}
          </span>
        </NuxtLink>

        <!-- 用户菜单 -->
        <template v-if="!isAuthenticated">
          <Button variant="ghost" class="flex items-center gap-2" @click="doLogin">
            <User class="h-4 w-4" />
            <span>Login</span>
          </Button>
        </template>

        <ClientOnly>
          <MenuRoot v-if="isAuthenticated">
            <MenuTrigger as-child>
              <Button variant="ghost" class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User class="h-4 w-4" />
                </div>
                <ChevronDown class="h-4 w-4" />
              </Button>
            </MenuTrigger>

            <MenuContent align="end" class="w-56">
              <MenuItem @select="() => navigateTo('/profile')">
                <User class="mr-2 h-4 w-4" />
                <span>{{ userEmail || 'Your Profile' }}</span>
              </MenuItem>
              <MenuItem @select="() => navigateTo('/cart')">
                <span>购物车</span>
              </MenuItem>
              <MenuItem @select="() => navigateTo('/orders')">
                <span>订单</span>
              </MenuItem>
              <MenuSeparator />
              <MenuItem @select="handleSignOut">
                <span>Sign out</span>
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </ClientOnly>

        <!-- 移动端侧边栏 -->
        <ClientOnly>
          <Drawer v-model="configStore.isSidebarOpen">
            <DrawerTrigger @click="configStore.toggleSidebar">
              <Button variant="ghost" size="icon" class="md:hidden" @click="configStore.toggleSidebar">
                <TextAlignJustify class="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent class="fixed inset-y-0 ">
              <DrawerHeader>
                <DrawerTitle>导航菜单</DrawerTitle>
                <DrawerDescription>
                  选择您要访问的页面
                </DrawerDescription>
              </DrawerHeader>
              <div class="flex flex-col gap-2 px-4 pb-4">
                <DrawerClose v-for="item in navigationItems" :key="item.path" as-child>
                  <NuxtLink
                    :to="item.path"
                    class="flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </DrawerClose>
              </div>
              <DrawerFooter>
                <DrawerClose>
                  <Button class="w-full">
                    关闭
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </ClientOnly>
      </div>
    </div>
  </nav>
</template>
