import type { Page } from '~/types/page'

/**
 * 商品状态枚举
 */
export enum ProductStatus {
  /** 下架 */
  OFFLINE = 0,
  /** 上架 */
  ONLINE = 1,
}

/**
 * 商品SKU状态枚举
 */
export enum ProductSkuStatus {
  /** 禁用 */
  DISABLED = 0,
  /** 启用 */
  ENABLED = 1,
}

/**
 * 商品分页列表项
 */
export interface ProductPageResponse {
  /** 商品ID */
  id: number
  /** 商品名称 */
  name: string
  /** 封面图片 */
  coverImage: string
  /** 商品状态 */
  status: ProductStatus
  /** 创建时间 */
  createdAt: string
}

/**
 * 商品详情
 */
export interface ProductResponse {
  /** 商品ID */
  id: number
  /** 商品名称 */
  name: string
  /** 封面图片 */
  coverImage: string
  /** 商品描述 */
  description: string
  /** 商品状态 */
  status: ProductStatus
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 预览图URL列表 */
  previewImages: string[]
}

/**
 * 商品SKU响应
 */
export interface ProductSkuResponse {
  /** SKU ID */
  id: number
  /** 商品ID */
  productId: number
  /** SKU编码 */
  skuCode: string
  /** 价格（BigDecimal转string，避免精度问题） */
  price: string
  /** 库存 */
  stock: number
  /** 锁定库存 */
  lockedStock: number
  /** SKU状态 */
  status: ProductSkuStatus
  /** 规格信息（解析后的JSON） */
  specJson: Record<string, string>
  /** SKU封面图片 */
  coverImage: string
  /** 3D模型URL */
  modelUrl?: string
}

/**
 * 客户端商品详情响应（包含商品信息和SKU列表）
 */
export interface ClientProductResponse {
  /** 商品信息 */
  product: ProductResponse
  /** SKU列表 */
  skus: ProductSkuResponse[]
}

/**
 * 商品分页响应
 */
export type ProductPageData = Page<ProductPageResponse>

// 默认导出，防止eslint报错
export {}
