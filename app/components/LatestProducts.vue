<script setup lang="ts">
import { getLatestProducts } from '~/api/product'

const { data: latestProducts } = await useAsyncData('latest-products', () => getLatestProducts(10))
</script>

<template>
  <ProductTeam
    title="新品上市"
    description="New Arrivals"
    :products="latestProducts || []"
    class="bg-secondary/30"
  />
</template>
