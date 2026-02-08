<script setup lang="ts">
import { getHotProducts } from '~/api/product';

const { data: hotProducts } = await useAsyncData('hot-products', () => getHotProducts(10))
</script>

<template>
  <ProductTeam title="热门产品" description="热门产品" :products="hotProducts || []" class="bg-gray-100" />
</template>
