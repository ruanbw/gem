<script setup lang="ts">
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '~/lib/utils'

interface BreadcrumbItemData {
  label: string
  href?: string
}

interface Props {
  class?: string
  items?: BreadcrumbItemData[]
  separator?: string
}

const props = withDefaults(defineProps<Props>(), {
  separator: '/',
})

const route = useRoute()

// 根据路由自动生成面包屑
const breadcrumbItems = computed<BreadcrumbItemData[]>(() => {
  if (props.items && props.items.length > 0) {
    return props.items
  }

  // 自动从路由生成
  const pathSegments = route.path.split('/').filter(Boolean)
  const items: BreadcrumbItemData[] = []

  // 添加首页
  if (pathSegments.length > 0) {
    items.push({
      label: '首页',
      href: '/',
    })
  }

  // 生成路径段
  let currentPath = ''
  pathSegments.forEach((segment: string, index: number) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1

    // 尝试从路由 meta 获取标题，否则使用路径段
    let label = segment

    // 如果是动态路由参数，尝试从路由 params 或 meta 获取标签
    if (segment.startsWith('[') || /^\d+$/.test(segment)) {
      // 动态路由，尝试从 meta 获取标题
      const metaTitle = route.meta?.title as string | undefined
      if (metaTitle) {
        label = metaTitle
      }
      else {
        // 尝试从路由 params 获取
        const paramKey = Object.keys(route.params).find(key => route.params[key] === segment)
        if (paramKey) {
          label = route.params[paramKey] as string
        }
        else {
          label = segment
        }
      }
    }
    else {
      // 普通路由，首字母大写
      label = segment.charAt(0).toUpperCase() + segment.slice(1)
    }

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  })

  return items
})
</script>

<template>
  <BreadcrumbRoot :class="cn(props.class)">
    <BreadcrumbList>
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <BreadcrumbItem>
          <BreadcrumbPage v-if="!item.href">
            {{ item.label }}
          </BreadcrumbPage>
          <BreadcrumbLink v-else :to="item.href">
            {{ item.label }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1">
          <span>{{ separator }}</span>
        </BreadcrumbSeparator>
      </template>
    </BreadcrumbList>
  </BreadcrumbRoot>
</template>
