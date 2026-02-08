import type { ClientProductResponse, ProductPageData, ProductPageResponse } from '~/types/product'
import { useApi } from '~/composables/useApi'

/**
 * 商品列表查询参数
 */
export interface ProductListParams {
  /** 当前页（从1开始） */
  current?: number
  /** 每页个数 */
  size?: number
  /** 商品名称（搜索） */
  name?: string
}

/**
 * 获取商品列表（分页）
 * @param params - 查询参数
 * @returns 商品分页响应（useApi 会自动解包 data，所以直接返回 ProductPageData）
 */
export function getProductList(params?: ProductListParams) {
  return useApi<ProductPageData>('/client/product', {
    method: 'GET',
    query: params,
  })
}

/**
 * 获取商品详情
 * @param id - 商品ID
 * @returns 商品详情（包含商品信息和SKU列表，useApi 会自动解包 data，所以直接返回 ClientProductResponse）
 */
export function getProductDetail(id: number) {
  return useApi<ClientProductResponse>(`/client/product/${id}`, {
    method: 'GET',
  })
}

/**
 * 获取热门商品列表
 * @param limit - 返回商品数量，默认为 10
 * @returns 热门商品列表（useApi 会自动解包 data，所以直接返回 ProductPageResponse[]）
 */
export function getHotProducts(limit: number = 10) {
  return useApi<ProductPageResponse[]>('/client/hot-products', {
    method: 'GET',
    query: { limit },
  })
}

/**
 * 获取最新商品列表
 * @param limit - 返回商品数量，默认为 10
 * @returns 最新商品列表（useApi 会自动解包 data，所以直接返回 ProductPageResponse[]）
 */
export function getLatestProducts(limit: number = 10) {
  return useApi<ProductPageResponse[]>('/client/latest-products', {
    method: 'GET',
    query: { limit },
  })
}
