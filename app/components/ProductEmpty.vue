<script setup lang="ts">
import { Box } from 'lucide-vue-next'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Box />
      </EmptyMedia>
      <EmptyTitle>暂无产品</EmptyTitle>
      <EmptyDescription>
        暂无产品，敬请期待。
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
