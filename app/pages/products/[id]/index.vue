<script setup lang="ts">
import type { ClientProductResponse, ProductSkuResponse } from '@/types/product'
import { toast } from 'vue-sonner'
import { addCartItem } from '@/api/cart'
import { getProductDetail } from '@/api/product'
import ProductImageSwiper from '@/components/ProductImageSwiper.vue'
import { Button } from '@/components/ui/button'
import {
  FullscreenDrawer,
  FullscreenDrawerClose,
  FullscreenDrawerContent,
  FullscreenDrawerDescription,
  FullscreenDrawerFooter,
  FullscreenDrawerHeader,
  FullscreenDrawerTitle,
} from '@/components/ui/fullscreen-drawer'
import { useFilePath } from '@/composables/useFilePath'
import { ProductSkuStatus } from '@/types/product'
import { useCartStore } from '~/stores/cart'
import { useCheckoutStore } from '~/stores/checkout'

const route = useRoute()

// 获取商品ID
const productId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? Number.parseInt(id) : Number(id)
})

// 当前选中的规格组合
const selectedSpecs = useState<Record<string, string>>('selectedSpecs', () => ({}))

// 匹配到的SKU
const selectedSku = ref<ProductSkuResponse | null>(null)

// 每次进入商品详情页或商品ID变化时，重置已选规格和SKU，避免默认选中
watch(productId, () => {
  selectedSpecs.value = {}
  selectedSku.value = null
}, { immediate: true })

// 检查SKU是否启用（支持数字枚举和字符串两种格式）
function isSkuEnabled(status: ProductSkuStatus | string): boolean {
  return status === ProductSkuStatus.ENABLED || status === 'ENABLED'
}

// 获取商品详情
const { pending, data, refresh, error } = useAsyncData('productDetail', () => getProductDetail(productId.value))

// 从所有SKU中提取规格结构
// 返回格式: { "颜色": ["红色", "蓝色"], "尺寸": ["S", "M", "L"] }
const specStructure = computed(() => {
  if (!data?.value?.skus || data?.value?.skus.length === 0) {
    return {}
  }

  const structure: Record<string, Set<string>> = {}

  data?.value?.skus.forEach((sku) => {
    // 只处理启用状态的SKU（支持数字枚举和字符串两种格式）
    if (isSkuEnabled(sku.status as ProductSkuStatus | string) && sku.specJson && Object.keys(sku.specJson).length > 0) {
      Object.keys(sku.specJson).forEach((specName) => {
        const specValue = sku.specJson[specName]
        // 过滤掉空值
        if (specValue && specValue.trim()) {
          if (!structure[specName]) {
            structure[specName] = new Set()
          }
          structure[specName].add(specValue)
        }
      })
    }
  })

  // 将Set转换为数组并排序
  const result: Record<string, string[]> = {}
  Object.keys(structure).forEach((specName) => {
    const specSet = structure[specName]
    if (specSet && specSet.size > 0) {
      result[specName] = Array.from(specSet).sort()
    }
  })

  return result
})

// 规格名称列表（用于按顺序显示）
const specNames = computed(() => {
  return Object.keys(specStructure.value)
})

// 根据选中的规格组合匹配SKU
function matchSku() {
  if (!data?.value?.skus) {
    selectedSku.value = null
    return
  }

  // 检查是否所有规格都已选择
  const allSpecsSelected = specNames.value.every(specName => selectedSpecs.value[specName])

  if (!allSpecsSelected) {
    selectedSku.value = null
    return
  }

  // 查找匹配的SKU
  const matchedSku = data?.value?.skus.find((sku) => {
    // 检查SKU状态（支持数字枚举和字符串两种格式）
    if (!isSkuEnabled(sku.status as ProductSkuStatus | string) || !sku.specJson) {
      return false
    }

    // 检查specJson是否与选中的规格完全匹配
    const specKeys = Object.keys(selectedSpecs.value)
    if (specKeys.length !== Object.keys(sku.specJson).length) {
      return false
    }

    return specKeys.every(key => sku.specJson[key] === selectedSpecs.value[key])
  })

  selectedSku.value = matchedSku || null
}

// 监听选中的规格变化，自动匹配SKU
watch(selectedSpecs, () => {
  matchSku()
}, { deep: true })

// 选择规格值
function selectSpec(specName: string, specValue: string) {
  // 如果已经选中了相同的值，则取消选择
  if (selectedSpecs.value[specName] === specValue) {
    // 不能取消选择，因为需要选择规格才能匹配SKU
    return
  }

  selectedSpecs.value[specName] = specValue
}

// 获取所有图片（封面图 + 预览图）
const allImages = computed(() => {
  if (!data?.value?.product) {
    return []
  }

  const images: string[] = []
  const product = data?.value?.product

  // 添加封面图
  if (product.coverImage) {
    images.push(product.coverImage)
  }

  // 添加预览图（如果预览图和封面图不同，才添加）
  if (product.previewImages) {
    product.previewImages.forEach((img) => {
      if (img !== product.coverImage) {
        images.push(img)
      }
    })
  }

  return images
})

const { isAuthenticated } = useAuth()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()

const quantity = ref(1)
const availableStock = computed(() => {
  if (!selectedSku.value)
    return 1
  return Math.max(0, selectedSku.value.stock - selectedSku.value.lockedStock)
})

async function addToCart() {
  if (!isAuthenticated.value) {
    navigateTo(`/auth/signin?redirect=/products/${productId.value}`)
    return
  }
  if (!selectedSku.value) {
    toast.error('请先选择规格')
    return
  }
  const qty = Math.max(1, Math.min(availableStock.value, quantity.value))
  try {
    await addCartItem({ skuId: selectedSku.value.id, quantity: qty })
    toast.success('已加入购物车')
    cartStore.fetchCount()
  }
  catch {
    // useApi 已处理 toaster
  }
}

function decrementQty() {
  quantity.value = Math.max(1, quantity.value - 1)
}
function incrementQty() {
  quantity.value = Math.min(availableStock.value, quantity.value + 1)
}

function buyNow() {
  if (!selectedSku.value) {
    toast.error('请先选择规格')
    return
  }
  if (!isAuthenticated.value) {
    navigateTo(`/auth/signin?redirect=${encodeURIComponent(`/products/${productId.value}`)}`)
    return
  }
  const product = data?.value?.product
  if (!product) {
    toast.error('商品信息加载中，请稍后再试')
    return
  }
  const qty = Math.max(1, Math.min(availableStock.value, quantity.value))
  checkoutStore.setDirectCheckout([{
    skuId: selectedSku.value.id,
    quantity: qty,
    productName: product.name,
    coverImage: selectedSku.value.coverImage ?? product.coverImage ?? '',
    specJson: selectedSku.value.specJson ?? {},
    price: selectedSku.value.price,
  }])
  navigateTo('/orders/checkout')
}

const isDetailDrawerOpen = ref(false)

// SKU模型信息接口
interface ModelSkuItem {
  coverImage: string
  modelUrl: string
  sku: ProductSkuResponse
}

// 获取所有可用的3D模型SKU信息（包含封面图和模型URL）
const modelSkus = computed(() => {
  if (!data?.value?.skus) {
    return []
  }

  const items: ModelSkuItem[] = []
  data?.value?.skus.forEach((sku) => {
    // 只收集启用状态且有模型URL和封面图的SKU
    if (
      isSkuEnabled(sku.status as ProductSkuStatus | string)
      && sku.modelUrl
      && sku.modelUrl.trim()
      && sku.coverImage
      && sku.coverImage.trim()
    ) {
      // 使用 useFilePath 处理路径（已自动处理完整路径和相对路径）
      const fullModelPath = useFilePath(sku.modelUrl)
      if (fullModelPath) {
        items.push({
          coverImage: sku.coverImage,
          modelUrl: fullModelPath,
          sku,
        })
      }
    }
  })

  return items
})

const currentModelIndex = ref(0)
const modelLoading = ref(true)
const modelError = ref(false)

// 获取当前显示的模型信息
const currentModel = computed(() => {
  const model = modelSkus.value[currentModelIndex.value]
  console.log(model)
  return model
})

function switchModel(index: number) {
  if (index === currentModelIndex.value)
    return
  modelLoading.value = true
  modelError.value = false
  currentModelIndex.value = index
}

// 监听模型URL变化，重置loading状态
watch(() => currentModel.value?.modelUrl, () => {
  modelLoading.value = true
  modelError.value = false
})

// model-viewer加载事件处理
function handleModelLoad() {
  modelLoading.value = false
  modelError.value = false
}

function handleModelError() {
  modelLoading.value = false
  modelError.value = true
}

// 监听抽屉打开状态，重置loading状态
watch(isDetailDrawerOpen, (isOpen) => {
  if (isOpen) {
    if (modelSkus.value.length > 0) {
      modelLoading.value = true
      modelError.value = false
      currentModelIndex.value = 0
    }
    else {
      // 无模型时直接结束加载状态
      modelLoading.value = false
      modelError.value = false
    }
  }
})

// 无模型时不要显示加载状态
watch(() => modelSkus.value.length, (len) => {
  if (len === 0) {
    modelLoading.value = false
  }
}, { immediate: true })
</script>

<template>
  <div class="flex-1 py-8">
    <Breadcrumb class="mb-8 mx-2" />

    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      <p class="mt-4 text-gray-600">
        加载中...
      </p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="mdi:alert-circle" class="text-6xl text-red-400 mx-auto mb-4" />
      <p class="text-gray-600 text-lg mb-4">
        {{ error }}
      </p>
      <Button @click="refresh">
        重试
      </Button>
    </div>

    <!-- 商品不存在 -->
    <div v-else-if="!data" class="text-center py-12">
      <Icon name="mdi:package-variant-remove" class="text-6xl text-gray-400 mx-auto mb-4" />
      <p class="text-gray-600 text-lg">
        商品不存在
      </p>
    </div>

    <!-- 商品详情内容 -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
      <!-- 左侧：图片展示区 -->
      <!-- 移动端：使用 Swiper 组件 -->
      <div class="lg:hidden">
        <ProductImageSwiper v-if="allImages.length > 0" :images="allImages" :product-name="data?.product?.name" />
      </div>
      <!-- PC端：保持原有展示方式 -->
      <div class="hidden lg:block overflow-hidden">
        <NuxtImg
          v-for="image in allImages" :key="image" :src="useFilePath(image)" :alt="data?.product?.name"
          class="w-full object-cover"
        />
      </div>

      <!-- 右侧：商品信息区 -->
      <div class="space-y-6 md:sticky md:top-40 md:h-screen flex flex-col px-10 pb-10 md:pb-0">
        <!-- 商品名称 -->
        <h1 class=" font-bold text-gray-900">
          {{ data?.product?.name }}
        </h1>

        <!-- 商品描述 -->
        <div class="text-gray-600 leading-relaxed">
          <p class="whitespace-pre-line">
            {{ data?.product?.description || '暂无描述' }}
          </p>
        </div>

        <!-- SKU选择器 -->
        <div v-if="specNames.length > 0" class="space-y-4">
          <div v-for="specName in specNames" :key="specName" class="flex items-center gap-2">
            <span class=" font-medium text-gray-700">
              {{ specName }}:
            </span>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="specValue in (specStructure[specName] || [])" :key="`${specName}-${specValue}`"
                :variant="selectedSpecs[specName] === specValue ? 'default' : 'outline'" size="sm" class="min-w-[60px]"
                :class="[
                  selectedSpecs[specName] === specValue
                    ? 'bg-primary text-primary-foreground'
                    : '',
                ]" @click="selectSpec(specName, specValue)"
              >
                {{ specValue }}
              </Button>
            </div>
          </div>
        </div>

        <!-- SKU列表为空提示 -->
        <div v-else-if="data?.skus && data?.skus.length > 0" class="text-gray-500 text-sm">
          暂无可用SKU规格信息（可能所有SKU都已停用）
        </div>

        <!-- 完全没有SKU的提示 -->
        <div v-else-if="!data?.skus || data?.skus.length === 0" class="text-gray-500 text-sm">
          暂无SKU规格信息
        </div>

        <!-- 价格和库存显示 -->
        <div class="space-y-4 pt-4">
          <!-- 价格 -->
          <div class="flex items-baseline gap-2">
            <span v-if="selectedSku" class=" font-bold ">
              ¥{{ selectedSku.price }}
            </span>
          </div>
          <!-- 数量 -->
          <div v-if="selectedSku" class="flex items-center gap-2">
            <span class="font-medium text-gray-700">数量：</span>
            <div class="flex items-center gap-1">
              <Button variant="outline" size="icon" class="h-8 w-8" :disabled="quantity <= 1" @click="decrementQty">
                −
              </Button>
              <span class="min-w-[2.5rem] text-center">{{ quantity }}</span>
              <Button
                variant="outline" size="icon" class="h-8 w-8" :disabled="quantity >= availableStock"
                @click="incrementQty"
              >
                +
              </Button>
            </div>
            <span class="text-sm text-muted-foreground">库存 {{ availableStock }}</span>
          </div>
        </div>

        <div class="pt-4 border-t flex items-center gap-2 flex-wrap">
          <Button variant="outline" @click="addToCart">
            <Icon name="carbon:shopping-cart" class="size-4" />
            添加到购物车
          </Button>
          <Button variant="default" @click="buyNow">
            <Icon name="mdi:cart-plus" class="size-4" />
            购买
          </Button>
          <Button variant="outline" @click="isDetailDrawerOpen = true">
            <Icon name="carbon:3d-cursor" class="size-4" />
            3D
          </Button>
        </div>
      </div>
    </div>

    <FullscreenDrawer v-model:open="isDetailDrawerOpen">
      <FullscreenDrawerContent>
        <FullscreenDrawerClose position="top-right" />
        <FullscreenDrawerHeader>
          <FullscreenDrawerTitle>
            模型展示
          </FullscreenDrawerTitle>
          <FullscreenDrawerDescription>
            商品详细信息
          </FullscreenDrawerDescription>
        </FullscreenDrawerHeader>

        <div style="flex: 1; position: relative;" @pointerdown.stop @mousedown.stop>
          <!-- Loading状态 -->
          <Transition name="fade">
            <div
              v-if="modelLoading"
              class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10"
            >
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary" />
              <p class="mt-4 text-gray-600 font-medium">
                模型加载中...
              </p>
            </div>
          </Transition>

          <!-- Error状态 -->
          <Transition name="fade">
            <div
              v-if="modelError && !modelLoading"
              class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10"
            >
              <Icon name="mdi:alert-circle" class="text-6xl text-red-400 mb-4" />
              <p class="text-gray-600 font-medium">
                模型加载失败
              </p>
              <Button variant="outline" size="sm" class="mt-4" @click="handleModelLoad">
                重试
              </Button>
            </div>
          </Transition>

          <!-- Model Viewer -->
          <ClientOnly>
            <model-viewer
              v-if="currentModel" :key="currentModel.modelUrl" :src="currentModel.modelUrl"
              loading="eager" camera-controls auto-rotate style="width: 100%; height: 100%;" @load="handleModelLoad"
              @error="handleModelError"
            />
          </ClientOnly>
        </div>

        <FullscreenDrawerFooter>
          <div class="flex justify-center items-center gap-2">
            <button
              v-for="(item, index) in modelSkus" :key="item.sku.id" :disabled="modelLoading"
              class="relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all" :class="[
                currentModelIndex === index
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300',
                modelLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ]" @click="switchModel(index)"
            >
              <NuxtImg
                :src="useFilePath(item.coverImage)" :alt="`SKU ${item.sku.skuCode} 封面图`"
                class="w-full h-full object-cover" loading="lazy"
              />
            </button>
          </div>
        </FullscreenDrawerFooter>
      </FullscreenDrawerContent>
    </FullscreenDrawer>

    <HotProducts />
    <LatestProducts />
  </div>
</template>

<style scoped>
/* Fade过渡效果 - 用于loading和error状态 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Model切换过渡效果 - 更平滑的渐入渐出 */
.model-fade-enter-active {
  transition: opacity 0.5s ease;
}

.model-fade-leave-active {
  transition: opacity 0.3s ease;
}

.model-fade-enter-from {
  opacity: 0;
}

.model-fade-leave-to {
  opacity: 0;
}
</style>
