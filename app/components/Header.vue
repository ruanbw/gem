<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import Navbar from './Navbar.vue'

const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 20)
</script>

<template>
  <header
    :class="[
      'fixed top-0 z-50 w-full transition-all duration-500 ease-out',
      isScrolled
        ? 'border-b border-border/40 bg-background/95 backdrop-blur-md'
        : 'border-b border-transparent bg-background/60 backdrop-blur-sm',
    ]"
  >
    <Navbar />
  </header>
</template>
