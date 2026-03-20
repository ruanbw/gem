<script setup lang="ts">
/**
 * 3D Model Viewer Component
 * 使用 Google Model Viewer 加载 GLB/GLTF 文件
 * 
 * 支持的格式：.glb, .gltf
 */
interface Props {
  src: string // 模型文件 URL (GLB/GLTF)
  autoRotate?: boolean
  cameraControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoRotate: true,
  cameraControls: true,
})

const emit = defineEmits<{
  load: []
  error: [error: Error]
}>()

const modelViewerRef = ref<HTMLElement>()

// 验证格式
const isValidFormat = computed(() => {
  const url = props.src.toLowerCase()
  return url.endsWith('.glb') || url.endsWith('.gltf')
})

// 监听加载事件
onMounted(() => {
  if (!modelViewerRef.value) return

  const handleLoad = () => {
    emit('load')
  }

  const handleError = (event: Event) => {
    const error = new Error(`Failed to load model: ${props.src}`)
    emit('error', error)
  }

  modelViewerRef.value.addEventListener('load', handleLoad)
  modelViewerRef.value.addEventListener('error', handleError)

  onUnmounted(() => {
    modelViewerRef.value?.removeEventListener('load', handleLoad)
    modelViewerRef.value?.removeEventListener('error', handleError)
  })
})
</script>

<template>
  <div class="relative w-full h-full">
    <!-- 格式错误提示 -->
    <div
      v-if="!isValidFormat"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"
    >
      <div class="text-center">
        <Icon name="mdi:alert-circle" class="w-12 h-12 mx-auto mb-2" />
        <p>不支持的格式</p>
        <p class="text-sm">仅支持 .glb 和 .gltf 格式</p>
      </div>
    </div>

    <!-- Model Viewer -->
    <model-viewer
      v-else
      ref="modelViewerRef"
      :src="src"
      loading="eager"
      :camera-controls="cameraControls"
      :auto-rotate="autoRotate"
      environment-image="/rings.hdr"
      skybox-image="/rings.hdr"
      exposure="0.1"
      shadow-intensity="0"
      shadow-softness="0.52"
      style="width: 100%; height: 100%; "
    />
  </div>
</template>
