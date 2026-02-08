<script lang="ts" setup>
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { useForwardPropsEmits } from "reka-ui"
import { DrawerContent, DrawerPortal } from "vaul-vue"
import { cn } from "@/lib/utils"
import FullscreenDrawerOverlay from "./FullscreenDrawerOverlay.vue"

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwardedProps = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DrawerPortal>
    <FullscreenDrawerOverlay />
    <DrawerContent
      v-bind="forwardedProps" :class="cn(
        'fixed inset-0 z-50 flex flex-col bg-background',
        props.class,
      )"
    >
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
