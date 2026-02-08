<script setup lang="ts">
import { getLatestProducts } from '~/api/product';

const { data: latestProducts } = await useAsyncData('latest-products', () => getLatestProducts(10))
</script>

<template>
  <ProductTeam title="最新产品" description="最新产品" :products="latestProducts || []" />
</template>
