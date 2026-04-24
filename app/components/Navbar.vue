<script setup lang="ts">
import {
  ChevronDown,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartStore } from '~/stores/cart'
import { useConfigStore } from '~/stores/config'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const configStore = useConfigStore()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()
const route = useRoute()

watch(isAuthenticated, () => {
  cartStore.fetchCount()
}, { immediate: true })

const navigationItems = [
  { name: '首页', path: '/' },
  { name: '产品', path: '/products' },
  { name: '文章', path: '/news' },
]

const userEmail = computed(() => {
  if (userStore.userDetail) {
    return (userStore.userDetail as any).email || userStore.userDetail.username
  }
  return userStore.user.email || ''
})

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

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
  <nav class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
    <!-- 左侧：Logo -->
    <NuxtLink
      to="/"
      class="font-display text-[22px] font-light tracking-[0.22em] text-foreground transition-opacity duration-300 hover:opacity-60 sm:text-2xl"
    >
      GEM
    </NuxtLink>

    <!-- 中间：导航链接（桌面端） -->
    <div class="hidden md:flex items-center gap-10">
      <NuxtLink
        v-for="item in navigationItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'group relative font-sans text-[11px] font-medium uppercase tracking-[0.15em] text-foreground/70 transition-colors duration-300 hover:text-foreground',
          isActive(item.path) ? 'text-foreground' : '',
        ]"
      >
        {{ item.name }}
        <span
          :class="[
            'absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ease-out',
            isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full',
          ]"
        />
      </NuxtLink>
      <NuxtLink
        v-if="isAuthenticated"
        to="/orders"
        :class="[
          'group relative font-sans text-[11px] font-medium uppercase tracking-[0.15em] text-foreground/70 transition-colors duration-300 hover:text-foreground',
          isActive('/orders') ? 'text-foreground' : '',
        ]"
      >
        我的订单
        <span
          :class="[
            'absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ease-out',
            isActive('/orders') ? 'w-full' : 'w-0 group-hover:w-full',
          ]"
        />
      </NuxtLink>
    </div>

    <!-- 右侧：操作区 -->
    <div class="flex items-center gap-1 sm:gap-2">
      <!-- 搜索 -->
      <NuxtLink to="/products">
        <Button
          variant="ghost"
          size="icon"
          class="h-10 w-10 text-foreground/60 transition-colors duration-300 hover:text-foreground"
        >
          <Search class="h-[18px] w-[18px]" stroke-width="1.5" />
        </Button>
      </NuxtLink>

      <!-- 购物车 -->
      <NuxtLink to="/cart" class="relative">
        <Button
          variant="ghost"
          size="icon"
          class="h-10 w-10 text-foreground/60 transition-colors duration-300 hover:text-foreground"
        >
          <ShoppingCart class="h-[18px] w-[18px]" stroke-width="1.5" />
        </Button>
        <span
          v-if="isAuthenticated && cartStore.count > 0"
          class="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-0.5 text-[9px] font-medium text-background"
        >
          {{ cartStore.count > 99 ? '99+' : cartStore.count }}
        </span>
      </NuxtLink>

      <!-- 用户（未登录） -->
      <template v-if="!isAuthenticated">
        <Button
          variant="ghost"
          size="icon"
          class="h-10 w-10 text-foreground/60 transition-colors duration-300 hover:text-foreground"
          @click="doLogin"
        >
          <User class="h-[18px] w-[18px]" stroke-width="1.5" />
        </Button>
      </template>

      <!-- 用户菜单（已登录） -->
      <ClientOnly>
        <MenuRoot v-if="isAuthenticated">
          <MenuTrigger as-child>
            <Button
              variant="ghost"
              class="h-10 gap-1.5 px-2 text-foreground/60 transition-colors duration-300 hover:text-foreground"
            >
              <div class="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-muted/40">
                <User class="h-3.5 w-3.5" stroke-width="1.5" />
              </div>
              <ChevronDown class="h-3 w-3 opacity-50" stroke-width="1.5" />
            </Button>
          </MenuTrigger>

          <MenuContent align="end" class="w-52 border-border/40">
            <MenuItem @select="() => navigateTo('/profile')">
              <User class="mr-2 h-3.5 w-3.5" stroke-width="1.5" />
              <span class="text-xs">{{ userEmail || 'Your Profile' }}</span>
            </MenuItem>
            <MenuItem @select="() => navigateTo('/cart')">
              <span class="text-xs">购物车</span>
            </MenuItem>
            <MenuItem @select="() => navigateTo('/orders')">
              <span class="text-xs">订单</span>
            </MenuItem>
            <MenuSeparator />
            <MenuItem @select="handleSignOut">
              <span class="text-xs">Sign out</span>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </ClientOnly>

      <!-- 移动端菜单按钮 -->
      <ClientOnly>
        <Drawer v-model="configStore.isSidebarOpen">
          <DrawerTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="ml-1 h-10 w-10 text-foreground/60 transition-colors duration-300 hover:text-foreground md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </svg>
            </Button>
          </DrawerTrigger>
          <DrawerContent class="fixed inset-0 h-screen w-screen border-none bg-background p-0">
            <DrawerHeader class="flex items-center justify-between px-6 pt-6 sm:px-10">
              <DrawerTitle class="font-display text-xl font-light tracking-[0.2em]">
                GEM
              </DrawerTitle>
              <DrawerClose as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-10 w-10 text-foreground/60 transition-colors duration-300 hover:text-foreground"
                >
                  <X class="h-5 w-5" stroke-width="1.5" />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <nav class="flex flex-1 flex-col items-center justify-center gap-8 px-6">
              <DrawerClose
                v-for="item in navigationItems"
                :key="item.path"
                as-child
              >
                <NuxtLink
                  :to="item.path"
                  :class="[
                    'font-display text-3xl font-light tracking-[0.1em] text-foreground/50 transition-colors duration-300 hover:text-foreground sm:text-4xl',
                    isActive(item.path) ? 'text-foreground' : '',
                  ]"
                >
                  {{ item.name }}
                </NuxtLink>
              </DrawerClose>
              <DrawerClose
                v-if="isAuthenticated"
                as-child
              >
                <NuxtLink
                  to="/orders"
                  :class="[
                    'font-display text-3xl font-light tracking-[0.1em] text-foreground/50 transition-colors duration-300 hover:text-foreground sm:text-4xl',
                    isActive('/orders') ? 'text-foreground' : '',
                  ]"
                >
                  我的订单
                </NuxtLink>
              </DrawerClose>
            </nav>

            <div class="flex flex-col items-center gap-4 px-6 pb-10">
              <template v-if="!isAuthenticated">
                <DrawerClose as-child>
                  <Button
                    variant="outline"
                    class="w-full max-w-xs font-sans text-[11px] uppercase tracking-[0.15em]"
                    @click="doLogin"
                  >
                    Login
                  </Button>
                </DrawerClose>
              </template>
              <template v-else>
                <div class="text-xs text-muted-foreground">
                  {{ userEmail }}
                </div>
                <DrawerClose as-child>
                  <Button
                    variant="ghost"
                    class="font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                    @click="handleSignOut"
                  >
                    Sign out
                  </Button>
                </DrawerClose>
              </template>
            </div>
          </DrawerContent>
        </Drawer>
      </ClientOnly>
    </div>
  </nav>
</template>
