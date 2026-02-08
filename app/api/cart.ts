import type { AddCartItemRequest, CartItemResponse, UpdateCartItemRequest } from '~/types/cart'
import { useApi } from '~/composables/useApi'

/**
 * 获取购物车列表
 * @returns 购物车项列表（useApi 会自动解包 data）
 */
export function getCartList() {
  return useApi<CartItemResponse[]>('/cart', {
    method: 'GET',
  })
}

/**
 * 添加购物车商品
 * @param body - 请求体
 */
export function addCartItem(body: AddCartItemRequest) {
  return useApi<void>('/cart', {
    method: 'POST',
    body,
  })
}

/**
 * 更新购物车商品数量
 * @param body - 请求体
 */
export function updateCartItem(body: UpdateCartItemRequest) {
  return useApi<void>('/cart', {
    method: 'PUT',
    body,
  })
}

/**
 * 删除购物车商品
 * @param id - 购物车项 ID
 */
export function deleteCartItem(id: number) {
  return useApi<void>(`/cart/${id}`, {
    method: 'DELETE',
  })
}

/**
 * 清空购物车
 */
export function clearCart() {
  return useApi<void>('/cart/clear', {
    method: 'DELETE',
  })
}

/**
 * 获取购物车商品数量
 * @returns 购物车商品件数（useApi 会自动解包 data）
 */
export function getCartCount() {
  return useApi<number>('/cart/count', {
    method: 'GET',
  })
}
