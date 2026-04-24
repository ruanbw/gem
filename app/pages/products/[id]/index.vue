<script setup lang="ts">
import type { ClientProductResponse, ProductSkuResponse } from '@/types/product'
import { toast } from 'vue-sonner'
import { addCartItem } from '@/api/cart'
import { getProductDetail } from '@/api/product'
import ProductGallery from '@/components/product/ProductGallery.vue'
import ProductInfo from '@/components/product/ProductInfo.vue'
import ProductSpecSelector from '@/components/product/ProductSpecSelector.vue'
import ProductActions from '@/components/product/ProductActions.vue'
import { useFilePath } from '@/composables/useFilePath'
import { ProductSkuStatus } from '@/types/product'
import { useCartStore } from '~/stores/cart'
import { useCheckoutStore } from '~/stores/checkout'

const route = useRoute()

const productId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? Number.parseInt(id) : Number(id)
})

const selectedSpecs = useState<Record<string, string>>('selectedSpecs', () => ({}))
const selectedSku = ref<ProductSkuResponse | null>(null)

watch(productId, () => {
  selectedSpecs.value = {}
  selectedSku.value = null
}, { immediate: true })

function isSkuEnabled(status: ProductSkuStatus | string): boolean {
  return status === ProductSkuStatus.ENABLED || status === 'ENABLED'
}

const { pending, data, refresh, error } = useAsyncData('productDetail', () => getProductDetail(productId.value))

const specStructure = computed(() => {
  if (!data?.value?.skus || data?.value?.skus.length === 0) {
    return {}
  }

  const structure: Record<string, Set<string>> = {}

  data?.value?.skus.forEach((sku) => {
    if (isSkuEnabled(sku.status as ProductSkuStatus | string) && sku.specJson && Object.keys(sku.specJson).length > 0) {
      Object.keys(sku.specJson).forEach((specName) => {
        const specValue = sku.specJson[specName]
        if (specValue && specValue.trim()) {
          if (!structure[specName]) {
            structure[specName] = new Set()
          }
          structure[specName].add(specValue)
        }
      })
    }
  })

  const result: Record<string, string[]> = {}
  Object.keys(structure).forEach((specName) => {
    const specSet = structure[specName]
    if (specSet && specSet.size > 0) {
      result[specName] = Array.from(specSet).sort()
    }
  })

  return result
})

const specNames = computed(() => {
  return Object.keys(specStructure.value)
})

function matchSku() {
  if (!data?.value?.skus) {
    selectedSku.value = null
    return
  }

  const allSpecsSelected = specNames.value.every(specName => selectedSpecs.value[specName])

  if (!allSpecsSelected) {
    selectedSku.value = null
    return
  }

  const matchedSku = data?.value?.skus.find((sku) => {
    if (!isSkuEnabled(sku.status as ProductSkuStatus | string) || !sku.specJson) {
      return false
    }

    const specKeys = Object.keys(selectedSpecs.value)
    if (specKeys.length !== Object.keys(sku.specJson).length) {
      return false
    }

    return specKeys.every(key => sku.specJson[key] === selectedSpecs.value[key])
  })

  selectedSku.value = matchedSku || null
}

watch(selectedSpecs, () => {
  matchSku()
}, { deep: true })

function selectSpec(specName: string, specValue: string) {
  if (selectedSpecs.value[specName] === specValue) return
  selectedSpecs.value[specName] = specValue
}

const allImages = computed(() => {
  if (!data?.value?.product) {
    return []
  }

  const images: string[] = []
  const product = data?.value?.product

  if (product.coverImage) {
    images.push(product.coverImage)
  }

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

// SKU 模型信息
interface ModelSkuItem {
  coverImage: string
  modelUrl: string
  sku: ProductSkuResponse
  format: 'glb' | 'gltf'
}

const modelSkus = computed(() => {
  if (!data?.value?.skus) {
    return []
  }

  const items: ModelSkuItem[] = []
  data?.value?.skus.forEach((sku) => {
    if (
      isSkuEnabled(sku.status as ProductSkuStatus | string)
      && sku.modelUrl
      && sku.modelUrl.trim()
      && sku.coverImage
      && sku.coverImage.trim()
    ) {
      const modelUrlLower = sku.modelUrl.toLowerCase()
      let format: 'glb' | 'gltf' | null = null

      if (modelUrlLower.endsWith('.glb')) {
        format = 'glb'
      }
      else if (modelUrlLower.endsWith('.gltf')) {
        format = 'gltf'
      }

      if (!format) return

      const fullModelPath = useFilePath(sku.modelUrl)
      if (fullModelPath) {
        items.push({
          coverImage: sku.coverImage,
          modelUrl: fullModelPath,
          sku,
          format,
        })
      }
    }
  })

  return items
})

// 当前 SKU 对应的 3D 模型 URL
const currentModelUrl = computed(() => {
  if (!selectedSku.value?.modelUrl) return null
  const url = selectedSku.value.modelUrl.trim()
  if (!url) return null
  const urlLower = url.toLowerCase()
  if (!urlLower.endsWith('.glb') && !urlLower.endsWith('.gltf')) return null
  return useFilePath(url)
})
</script>

<template>
  <div class="flex-1 py-8">
    <Breadcrumb class="mb-8 mx-2" />

    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#D5D4D0] border-t-[#1A1A1A]" />
      <p class="mt-4 text-[11px] tracking-widest text-[#8A8986]">
        加载中...
      </p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-20">
      <Icon name="mdi:alert-circle" class="text-5xl text-[#8A8986] mx-auto mb-4" />
      <p class="text-sm text-[#8A8986] mb-4">
        {{ error }}
      </p>
      <button
        class="px-6 py-2 border border-[#1A1A1A] text-xs tracking-widest text-[#1A1A1A] hover:bg-[#F0EFED] transition-colors"
        @click="refresh"
      >
        重试
      </button>
    </div>

    <!-- 商品不存在 -->
    <div v-else-if="!data" class="text-center py-20">
      <Icon name="mdi:package-variant-remove" class="text-5xl text-[#8A8986] mx-auto mb-4" />
      <p class="text-sm text-[#8A8986]">
        商品不存在
      </p>
    </div>

    <!-- 商品详情内容 -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative px-2 lg:px-0">
      <!-- 左侧：图片画廊 -->
      <ProductGallery
        :images="allImages"
        :model-skus="modelSkus"
        :current-model-url="currentModelUrl"
        :product-name="data?.product?.name || ''"
      />

      <!-- 右侧：商品信息 -->
      <div class="space-y-6 lg:sticky lg:top-40 lg:self-start lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto px-2 lg:px-10 pb-24 lg:pb-0">
        <ProductInfo
          :product="data.product"
          :current-sku="selectedSku"
        />

        <!-- 规格选择 -->
        <ProductSpecSelector
          v-if="specNames.length > 0"
          :spec-structure="specStructure"
          :spec-names="specNames"
          :selected-specs="selectedSpecs"
          @update:selected-specs="(val: Record<string, string>) => selectedSpecs = val"
        />

        <ProductActions
          :quantity="quantity"
          :available-stock="availableStock"
          :has-selected-sku="!!selectedSku"
          @update:quantity="quantity = $event"
          @add-to-cart="addToCart"
          @buy-now="buyNow"
        />
      </div>
    </div>

    <!-- 移动端底部固定操作栏 -->
    <div
      v-if="data"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D5D4D0] p-3 flex gap-2 lg:hidden z-40"
    >
      <button
        class="flex-1 border border-[#1A1A1A] text-[#1A1A1A] text-[11px] tracking-widest py-3 hover:bg-[#F0EFED] transition-colors"
        @click="addToCart"
      >
        加入购物车
      </button>
      <button
        class="flex-1 bg-[#1A1A1A] text-white text-[11px] tracking-widest py-3 hover:bg-[#333] transition-colors"
        @click="buyNow"
      >
        立即购买
      </button>
    </div>

    <HotProducts />
    <LatestProducts />
  </div>
</template>
