import type {
  CreateOrderFromCartRequest,
  OrderPageResponse,
  OrderResponse,
  OrderStatusEnum,
  SaveOrderRequest,
} from '~/types/order'
import type { Page } from '~/types/page'
import { useApi } from '~/composables/useApi'

/**
 * 我的订单列表查询参数
 */
export interface OrderListParams {
  /** 当前页（从 1 开始），默认 1 */
  current?: number
  /** 每页条数，默认 10 */
  size?: number
  /** 订单状态（枚举字符串，如 PENDING_PAYMENT），不传查全部 */
  status?: OrderStatusEnum
}

/**
 * 获取我的订单列表（分页）
 * @param params - 查询参数
 * @returns 分页数据（useApi 会自动解包 data，返回 Page<OrderPageResponse>）
 */
export function getOrderList(params?: OrderListParams) {
  const { current = 1, size = 10, status } = params ?? {}
  const query: Record<string, number | string> = { current, size }
  if (status !== undefined && status !== null && status !== '') {
    query.status = status
  }
  return useApi<Page<OrderPageResponse>>('/order/my', {
    method: 'GET',
    query,
  })
}

/**
 * 获取我的订单详情
 * @param id - 订单 ID
 * @returns 订单详情（useApi 会自动解包 data，返回 OrderResponse）
 */
export function getOrderDetail(id: number) {
  return useApi<OrderResponse>(`/order/my/${id}`, {
    method: 'GET',
  })
}

/**
 * 保存订单（商品详情页直接购买：POST /order）
 * @param body - SaveOrderRequest
 * @returns Promise<void>（后端 SaResult.ok()，useApi 解包后 data 可为空）
 */
export function saveOrder(body: SaveOrderRequest) {
  return useApi<void>('/order', {
    method: 'POST',
    body,
  })
}

/**
 * 从购物车创建订单（POST /order/from-cart）
 * @param body - CreateOrderFromCartRequest
 * @returns Promise<number> 订单 ID（SaResult.data(orderId)）
 */
export function createOrderFromCart(body: CreateOrderFromCartRequest) {
  return useApi<number>('/order/from-cart', {
    method: 'POST',
    body,
  })
}
