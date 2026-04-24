<script setup lang="ts">
import { getHotProducts } from '~/api/product'

const { data: hotProducts } = await useAsyncData('hot-products', () => getHotProducts(10))
</script>

<template>
  <ProductTeam
    title="精选藏品"
    description="Curated Collection"
    :products="hotProducts || []"
  />
</template>
