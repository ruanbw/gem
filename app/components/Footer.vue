<script setup lang="ts">
</script>

<template>
  <footer class="border-t border-border/40">
    <div class="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
      <!-- Main Footer -->
      <div class="grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:gap-8 md:py-20">
        <!-- Brand -->
        <div class="md:col-span-4">
          <NuxtLink
            to="/"
            class="font-display text-2xl font-light tracking-[0.22em] text-foreground"
          >
            GEM
          </NuxtLink>
          <p class="mt-4 font-body text-xs font-light leading-relaxed tracking-wide text-foreground/40 max-w-xs">
            精选全球珍稀宝石，以极致工艺呈现自然之美。
          </p>
        </div>

        <!-- Navigation -->
        <div class="md:col-span-2 md:col-start-6">
          <h4 class="font-body text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/30 mb-5">
            导航
          </h4>
          <nav class="flex flex-col gap-3">
            <NuxtLink
              to="/products"
              class="font-body text-xs tracking-wide text-foreground/50 transition-colors duration-300 hover:text-foreground"
            >
              产品
            </NuxtLink>
            <NuxtLink
              to="/news"
              class="font-body text-xs tracking-wide text-foreground/50 transition-colors duration-300 hover:text-foreground"
            >
              文章
            </NuxtLink>
          </nav>
        </div>

        <!-- Account -->
        <div class="md:col-span-2">
          <h4 class="font-body text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/30 mb-5">
            账户
          </h4>
          <nav class="flex flex-col gap-3">
            <NuxtLink
              to="/auth/signin"
              class="font-body text-xs tracking-wide text-foreground/50 transition-colors duration-300 hover:text-foreground"
            >
              登录
            </NuxtLink>
            <NuxtLink
              to="/cart"
              class="font-body text-xs tracking-wide text-foreground/50 transition-colors duration-300 hover:text-foreground"
            >
              购物车
            </NuxtLink>
            <NuxtLink
              to="/orders"
              class="font-body text-xs tracking-wide text-foreground/50 transition-colors duration-300 hover:text-foreground"
            >
              订单
            </NuxtLink>
          </nav>
        </div>

        <!-- Contact -->
        <div class="md:col-span-2">
          <h4 class="font-body text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/30 mb-5">
            联系
          </h4>
          <nav class="flex flex-col gap-3">
            <span class="font-body text-xs tracking-wide text-foreground/50">
              contact@gem.com
            </span>
          </nav>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-border/30 py-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p class="font-body text-[10px] tracking-[0.15em] text-foreground/25 uppercase">
          &copy; {{ new Date().getFullYear() }} GEM. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
