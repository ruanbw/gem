<script lang="ts" setup>
import type { DrawerCloseProps } from "vaul-vue"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DrawerClose } from "vaul-vue"
import { X } from "lucide-vue-next"
import { cn } from "@/lib/utils"

interface Props extends DrawerCloseProps {
  class?: HTMLAttributes["class"]
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
}

const props = withDefaults(defineProps<Props>(), {
  position: "top-right",
})

const delegatedProps = reactiveOmit(props, "class", "position")

const positionClasses = computed(() => {
  const positions = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }
  return positions[props.position]
})

const buttonClasses = computed(() => {
  if (props.asChild) {
    // 如果使用 asChild，不添加默认样式，让子元素处理样式
    return props.class
  }
  return cn(
    'absolute z-50 rounded-full p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    positionClasses.value,
    props.class,
  )
})

const isAsChild = computed(() => !!props.asChild)
</script>

<template>
  <DrawerClose
    v-bind="delegatedProps"
    :class="buttonClasses"
  >
    <X v-if="!isAsChild" class="h-4 w-4" />
    <span v-if="!isAsChild" class="sr-only">关闭</span>
    <slot v-if="isAsChild" />
  </DrawerClose>
</template>
