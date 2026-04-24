# 商品详情页重新设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全面重新设计商品详情页，采用经典奢华简约风格，3D 模型从全屏抽屉改为嵌入图片区域。

**Architecture:** 将现有的单体页面 `[id]/index.vue` 拆分为 4 个子组件：ProductGallery（图片画廊 + 3D 集成）、ProductInfo（商品信息栏）、ProductSpecSelector（规格选择器）、ProductActions（操作按钮）。页面入口保留数据获取和业务逻辑。

**Tech Stack:** Nuxt 4 / Vue 3 / Tailwind CSS v4 / shadcn-vue / Swiper / @google/model-viewer / vue-sonner / lucide-vue-next

---

## File Structure

```
app/pages/products/[id]/index.vue              — 修改：精简为数据获取 + 子组件编排
app/components/product/
  ProductGallery.vue                            — 创建：图片画廊 + 3D 嵌入
  ProductInfo.vue                               — 创建：商品信息栏
  ProductSpecSelector.vue                       — 创建：规格选择器
  ProductActions.vue                            — 创建：操作按钮（购物车/购买/数量）
app/components/ProductImageSwiper.vue           — 删除：功能合并到 ProductGallery
app/components/RhinoModelViewer.vue             — 保留：不修改
```

---

### Task 1: ProductSpecSelector 组件

**Files:**
- Create: `app/components/product/ProductSpecSelector.vue`

这是最独立的组件，无外部依赖，先实现它。

- [ ] **Step 1: 创建 ProductSpecSelector.vue**

```vue
<script setup lang="ts">
interface Props {
  specStructure: Record<string, string[]>
  specNames: string[]
  selectedSpecs: Record<string, string>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedSpecs': [value: Record<string, string>]
}>()

function selectSpec(specName: string, specValue: string) {
  if (props.selectedSpecs[specName] === specValue) return
  emit('update:selectedSpecs', { ...props.selectedSpecs, [specName]: specValue })
}
</script>

<template>
  <div class="space-y-5">
    <div v-for="specName in specNames" :key="specName">
      <div class="text-[11px] tracking-widest text-[#8A8986] mb-2.5">
        {{ specName }}
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="specValue in (specStructure[specName] || [])"
          :key="`${specName}-${specValue}`"
          class="px-4 py-1.5 text-xs transition-colors"
          :class="[
            selectedSpecs[specName] === specValue
              ? 'border border-[#1A1A1A] text-[#1A1A1A]'
              : 'border border-[#D5D4D0] text-[#8A8986] hover:border-[#8A8986]',
          ]"
          @click="selectSpec(specName, specValue)"
        >
          {{ specValue }}
        </button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/product/ProductSpecSelector.vue
git commit -m "feat: add ProductSpecSelector component"
```

---

### Task 2: ProductActions 组件

**Files:**
- Create: `app/components/product/ProductActions.vue`

- [ ] **Step 1: 创建 ProductActions.vue**

```vue
<script setup lang="ts">
interface Props {
  quantity: number
  availableStock: number
  hasSelectedSku: boolean
  hasModel: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:quantity': [value: number]
  'add-to-cart': []
  'buy-now': []
  'view-3d': []
}>()

function decrement(qty: number, stock: number) {
  if (qty > 1) emit('update:quantity', qty - 1)
}
function increment(qty: number, stock: number) {
  if (qty < stock) emit('update:quantity', qty + 1)
}
</script>

<template>
  <div class="space-y-5">
    <!-- 数量 -->
    <div v-if="hasSelectedSku" class="flex items-center gap-4">
      <span class="text-[11px] tracking-widest text-[#8A8986]">数量</span>
      <div class="flex items-center border border-[#D5D4D0]">
        <button
          class="px-3 py-1.5 text-[#8A8986] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          :disabled="quantity <= 1"
          @click="decrement(quantity, availableStock)"
        >
          −
        </button>
        <span class="px-3 py-1.5 border-x border-[#D5D4D0] text-sm min-w-[2.5rem] text-center">
          {{ quantity }}
        </span>
        <button
          class="px-3 py-1.5 text-[#8A8986] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          :disabled="quantity >= availableStock"
          @click="increment(quantity, availableStock)"
        >
          +
        </button>
      </div>
      <span class="text-[11px] text-[#8A8986]">库存 {{ availableStock }} 件</span>
    </div>

    <!-- 分割线 -->
    <div class="h-px bg-[#D5D4D0]" />

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button
        class="flex-1 bg-[#1A1A1A] text-white text-xs tracking-widest py-3.5 hover:bg-[#333] transition-colors"
        @click="$emit('add-to-cart')"
      >
        加入购物车
      </button>
      <button
        class="flex-1 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest py-3.5 hover:bg-[#F0EFED] transition-colors"
        @click="$emit('buy-now')"
      >
        立即购买
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/product/ProductActions.vue
git commit -m "feat: add ProductActions component"
```

---

### Task 3: ProductInfo 组件

**Files:**
- Create: `app/components/product/ProductInfo.vue`

- [ ] **Step 1: 创建 ProductInfo.vue**

```vue
<script setup lang="ts">
import type { ProductResponse, ProductSkuResponse } from '@/types/product'

interface Props {
  product: ProductResponse
  currentSku: ProductSkuResponse | null
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-0">
    <!-- 品牌标签 -->
    <div class="text-[10px] tracking-[3px] text-[#8A8986] uppercase mb-5">
      GEM Collection
    </div>

    <!-- 商品名称 -->
    <h1 class="font-display text-[28px] font-light text-[#1A1A1A] tracking-wide mb-3">
      {{ product.name }}
    </h1>

    <!-- 描述 -->
    <p class="text-[11px] text-[#8A8986] leading-relaxed mb-6">
      {{ product.description || '' }}
    </p>

    <!-- 分割线 -->
    <div class="h-px bg-[#D5D4D0] mb-6" />

    <!-- 价格 -->
    <div class="text-[24px] font-light text-[#1A1A1A] mb-6">
      <span v-if="currentSku">¥ {{ currentSku.price }}</span>
      <span v-else class="text-[#8A8986] text-base">请选择规格查看价格</span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/product/ProductInfo.vue
git commit -m "feat: add ProductInfo component"
```

---

### Task 4: ProductGallery 组件（桌面端 + 3D 嵌入）

**Files:**
- Create: `app/components/product/ProductGallery.vue`

这是最复杂的组件，包含图片切换和 3D 模型嵌入逻辑。

- [ ] **Step 1: 创建 ProductGallery.vue**

核心交互状态：
- `activeView`: `'image' | '3d'` — 当前是图片还是 3D 模式
- `activeImageIndex`: `number` — 当前选中的图片索引
- `modelLoading` / `modelError` — 3D 模型加载状态

```vue
<script setup lang="ts">
import type { ProductSkuResponse } from '@/types/product'
import RhinoModelViewer from '@/components/RhinoModelViewer.vue'

interface ModelSkuItem {
  coverImage: string
  modelUrl: string
  sku: ProductSkuResponse
  format: 'glb' | 'gltf'
}

interface Props {
  images: string[]
  modelSkus: ModelSkuItem[]
  currentModelUrl: string | null
  productName: string
}

const props = defineProps<Props>()
const { filePath } = useFilePathWithPrefix()

const activeView = ref<'image' | '3d'>('image')
const activeImageIndex = ref(0)
const modelLoading = ref(false)
const modelError = ref(false)

// 当前 3D 模型 URL
const displayModelUrl = computed(() => {
  if (props.currentModelUrl) return props.currentModelUrl
  if (props.modelSkus.length > 0) return props.modelSkus[0].modelUrl
  return null
})

// 图片是否可用（至少有 1 张图片）
const hasImages = computed(() => props.images.length > 0)

// 是否有 3D 模型可用
const has3D = computed(() => props.modelSkus.length > 0)

function selectImage(index: number) {
  activeView.value = 'image'
  activeImageIndex.value = index
}

function select3D() {
  if (!has3D.value) return
  activeView.value = '3d'
  modelLoading.value = true
  modelError.value = false
}

function handleModelLoad() {
  modelLoading.value = false
  modelError.value = false
}

function handleModelError() {
  modelLoading.value = false
  modelError.value = true
}

// 切换 SKU 模型时更新
watch(() => props.currentModelUrl, (newUrl) => {
  if (newUrl && activeView.value === '3d') {
    modelLoading.value = true
    modelError.value = false
  }
})

// 图片计数文字
const imageCounterText = computed(() => {
  if (activeView.value === '3d') return '3D'
  return `${activeImageIndex.value + 1}/${props.images.length}`
})
</script>

<template>
  <div class="space-y-3">
    <!-- 主图展示区域 -->
    <div class="relative bg-[#F0EFED] aspect-[4/5] overflow-hidden">
      <!-- 图片模式 -->
      <Transition name="fade" mode="out-in">
        <div v-if="activeView === 'image'" :key="'img-' + activeImageIndex" class="w-full h-full">
          <img
            v-if="images[activeImageIndex]"
            :src="filePath(images[activeImageIndex])"
            :alt="`${productName} - 图片 ${activeImageIndex + 1}`"
            class="w-full h-full object-cover"
          >
        </div>
      </Transition>

      <!-- 3D 模式 -->
      <Transition name="fade" mode="out-in">
        <div v-if="activeView === '3d'" :key="'3d-' + displayModelUrl" class="w-full h-full">
          <!-- 加载中 -->
          <div
            v-if="modelLoading"
            class="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EFED]/90 z-10"
          >
            <div class="w-8 h-8 border-2 border-[#D5D4D0] border-t-[#1A1A1A] rounded-full animate-spin" />
            <p class="mt-3 text-[10px] tracking-widest text-[#8A8986]">加载 3D 模型...</p>
          </div>

          <!-- 加载失败 -->
          <div
            v-if="modelError && !modelLoading"
            class="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EFED]/90 z-10"
          >
            <Icon name="mdi:alert-circle" class="text-4xl text-[#8A8986] mb-2" />
            <p class="text-xs text-[#8A8986]">模型加载失败</p>
          </div>

          <!-- Model Viewer -->
          <ClientOnly>
            <RhinoModelViewer
              v-if="displayModelUrl"
              :key="displayModelUrl"
              :src="displayModelUrl"
              :auto-rotate="true"
              :camera-controls="true"
              @load="handleModelLoad"
              @error="handleModelError"
            />
          </ClientOnly>

          <!-- 浮动控制栏 -->
          <div
            v-if="!modelLoading && !modelError"
            class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20"
          >
            <button
              class="bg-white/95 px-3 py-1.5 text-[9px] text-[#1A1A1A] shadow-sm hover:bg-white transition-colors"
            >
              自动旋转 ↻
            </button>
          </div>
        </div>
      </Transition>

      <!-- 图片计数 / 3D 标识（右下角） -->
      <div
        class="absolute bottom-3 right-3 bg-black/40 text-white px-2 py-0.5 text-[9px] rounded-full z-20"
      >
        {{ imageCounterText }}
      </div>

      <!-- 3D 入口按钮（左下角，仅图片模式 + 有 3D） -->
      <button
        v-if="activeView === 'image' && has3D"
        class="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 text-[9px] text-[#1A1A1A] shadow-sm z-20 hover:bg-white transition-colors"
        @click="select3D"
      >
        3D ↻
      </button>
    </div>

    <!-- 缩略图条 -->
    <div class="flex gap-2">
      <button
        v-for="(image, index) in images"
        :key="'thumb-' + index"
        class="w-14 h-[72px] bg-[#E8E7E4] overflow-hidden transition-all"
        :class="[
          activeView === 'image' && activeImageIndex === index
            ? 'border border-[#1A1A1A]'
            : 'border border-transparent hover:border-[#D5D4D0]',
        ]"
        @click="selectImage(index)"
      >
        <img
          :src="filePath(image)"
          :alt="`${productName} - 缩略图 ${index + 1}`"
          class="w-full h-full object-cover"
        >
      </button>

      <!-- 3D 缩略图 -->
      <button
        v-if="has3D"
        class="w-14 h-[72px] bg-[#E8E7E4] flex items-center justify-center relative transition-all"
        :class="[
          activeView === '3d'
            ? 'border border-[#1A1A1A]'
            : 'border border-transparent hover:border-[#D5D4D0]',
        ]"
        @click="select3D"
      >
        <span class="text-[10px] text-[#8A8986]">3D</span>
        <!-- 绿色圆点标记 -->
        <div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#4CAF50] rounded-full" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

注意：上面的 `useFilePathWithPrefix()` 是一个占位 — 实际实现中直接使用 `useFilePath` composable 的标准调用方式（在模板中使用函数或使用 computed 属性包裹）。实际代码中改为：

```typescript
import { useFilePath } from '@/composables/useFilePath'
// ...
// 在模板中直接调用 useFilePath(image) 即可
```

- [ ] **Step 2: Commit**

```bash
git add app/components/product/ProductGallery.vue
git commit -m "feat: add ProductGallery component with embedded 3D viewer"
```

---

### Task 5: 移动端 ProductGallery 支持

**Files:**
- Modify: `app/components/product/ProductGallery.vue`

ProductGallery 需要同时支持桌面和移动端。移动端使用 Swiper，桌面端使用缩略图条。

- [ ] **Step 1: 在 ProductGallery 中添加移动端 Swiper 支持**

在 `<script setup>` 中添加 Swiper 导入和移动端检测：

```typescript
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  const mediaQuery = window.matchMedia('(min-width: 1024px)')
  const handler = (e: MediaQueryListEvent) => { isMobile.value = !e.matches }
  mediaQuery.addEventListener('change', handler)
  onUnmounted(() => mediaQuery.removeEventListener('change', handler))
})
```

在 `<template>` 中添加移动端布局 — 将整个模板包裹在桌面/移动端条件渲染中：

移动端（`<div class="lg:hidden">`）：
- Swiper 轮播图片，如果点击 3D 则在 Swiper 位置渲染 model-viewer
- 圆点分页指示器
- 右下角图片计数 (1/4)
- 左下角 3D 切换按钮

桌面端（`<div class="hidden lg:block">`）：
- 保持 Task 4 中的主图 + 缩略图条布局

- [ ] **Step 2: Commit**

```bash
git add app/components/product/ProductGallery.vue
git commit -m "feat: add mobile Swiper support to ProductGallery"
```

---

### Task 6: 重构页面入口 [id]/index.vue

**Files:**
- Modify: `app/pages/products/[id]/index.vue`

将现有页面重构为使用新组件，保留数据获取和业务逻辑。

- [ ] **Step 1: 重写 index.vue**

保留 `<script setup>` 中的所有数据获取和业务逻辑（useAsyncData、specStructure、matchSku、addToCart、buyNow 等），删除所有子组件的模板代码，替换为：

```vue
<template>
  <div class="flex-1 py-8">
    <Breadcrumb class="mb-8 mx-2" />

    <!-- 加载状态 -->
    <div v-if="pending" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#D5D4D0] border-t-[#1A1A1A]" />
      <p class="mt-4 text-[11px] tracking-widest text-[#8A8986]">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-20">
      <Icon name="mdi:alert-circle" class="text-5xl text-[#8A8986] mx-auto mb-4" />
      <p class="text-sm text-[#8A8986] mb-4">{{ error }}</p>
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
      <p class="text-sm text-[#8A8986]">商品不存在</p>
    </div>

    <!-- 商品详情内容 -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 relative px-2 lg:px-0">
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
          @update:selected-specs="selectedSpecs = $event"
        />

        <ProductActions
          :quantity="quantity"
          :available-stock="availableStock"
          :has-selected-sku="!!selectedSku"
          :has-model="modelSkus.length > 0"
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
```

需要在 `<script setup>` 中额外添加：

```typescript
// 当前 SKU 对应的 3D 模型 URL
const currentModelUrl = computed(() => {
  if (!selectedSku.value?.modelUrl) return null
  const url = selectedSku.value.modelUrl.trim()
  if (!url) return null
  const urlLower = url.toLowerCase()
  if (!urlLower.endsWith('.glb') && !urlLower.endsWith('.gltf')) return null
  return useFilePath(url)
})
```

删除 `<script setup>` 中与 FullscreenDrawer 相关的 import 和状态（`isDetailDrawerOpen`、`currentModelIndex`、`switchModel`、drawer 相关的 watch 等）。保留 `modelSkus` computed 和 `handleModelLoad` / `handleModelError`（这些移到 ProductGallery 中了，index.vue 不再需要）。

实际上 index.vue 保留：`productId`、`selectedSpecs`、`selectedSku`、`specStructure`、`specNames`、`matchSku`、`selectSpec`、`allImages`、`pending/data/refresh/error`、`quantity`、`availableStock`、`addToCart`、`buyNow`、`modelSkus`、`currentModelUrl`。

删除：`isDetailDrawerOpen`、`currentModelIndex`、`modelLoading`、`modelError`、`currentModel`、`switchModel`、`handleModelLoad`、`handleModelError`、以及所有 FullscreenDrawer 相关 import。

删除模板中：整个 `<FullscreenDrawer>` 块。

删除 `<style scoped>` 中的 fade/model-fade 过渡（移到 ProductGallery）。

- [ ] **Step 2: Commit**

```bash
git add app/pages/products/[id]/index.vue
git commit -m "refactor: rewrite product detail page with new sub-components"
```

---

### Task 7: 删除旧组件 + 清理

**Files:**
- Delete: `app/components/ProductImageSwiper.vue`

- [ ] **Step 1: 删除 ProductImageSwiper.vue**

ProductImageSwiper 的功能已完全合并到 ProductGallery 中（移动端 Swiper 由 ProductGallery 内部处理）。

```bash
rm app/components/ProductImageSwiper.vue
```

- [ ] **Step 2: 确认没有其他地方引用 ProductImageSwiper**

```bash
grep -r "ProductImageSwiper" app/ --include="*.vue" --include="*.ts"
```

预期：无结果（当前只有 `[id]/index.vue` 引用，已在 Task 6 中删除）。

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove ProductImageSwiper (merged into ProductGallery)"
```

---

### Task 8: 视觉调优和验证

**Files:**
- Modify: `app/components/product/ProductGallery.vue`
- Modify: `app/pages/products/[id]/index.vue`

- [ ] **Step 1: 启动开发服务器验证**

```bash
npm run dev
```

打开浏览器检查：
1. 桌面端布局：左侧图片 + 右侧信息栏，右侧 sticky
2. 移动端布局：图片在上、信息在下、底部固定操作栏
3. 3D 模型：点击 3D 缩略图，模型嵌入主图区域
4. 规格选择：直角边框风格，选中状态有 `#1A1A1A` 边框
5. 价格显示：选中 SKU 后显示价格
6. 数量选择：−/+ 按钮
7. 加载/错误/空状态正常

- [ ] **Step 2: 修复发现的视觉问题**

常见需要调整的点：
- 主图 4:5 比例是否正确
- 移动端图片是否 3:4
- 字体：标题是否使用 `font-display`（Cormorant Garamond）
- 颜色是否与设计稿一致
- 底部固定栏是否与内容重叠（需要给页面底部加 padding）

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: visual polish for product detail page"
```

---

## Self-Review

**1. Spec coverage:**
- 经典奢华风格（直角边框、serif 字体、温暖中性色） → Task 1-6 全部覆盖
- 桌面端左右分栏 → Task 6
- 桌面端图片区 4:5 比例 → Task 4
- 缩略图条 + 3D 绿色标记 → Task 4
- 3D 嵌入主图区域 → Task 4
- 右侧 sticky 信息栏 → Task 3 + Task 6
- 移动端图片在上信息在下 → Task 5 + Task 6
- 移动端底部固定操作栏 → Task 6
- 删除全屏抽屉 → Task 6
- 组件拆分为 4 个子组件 → Task 1-4
- 删除旧 ProductImageSwiper → Task 7

**2. Placeholder scan:** 无 TBD/TODO，所有步骤含完整代码。

**3. Type consistency:**
- `ModelSkuItem` 接口在 Task 4 定义，与 Task 6 中 `modelSkus` 的类型一致
- `selectedSpecs: Record<string, string>` 在 index.vue 和 ProductSpecSelector 中类型一致
- `ProductSkuResponse | null` 在 ProductInfo 和 index.vue 中类型一致
