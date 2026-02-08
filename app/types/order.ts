/** 订单状态枚举字符串（与接口请求、响应一致） */
export type OrderStatusEnum = 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'

/**
 * 订单状态到中文与样式的映射（key 为枚举字符串）
 */
export const ORDER_STATUS_MAP: Record<string, { label: string; className?: string }> = {
  PENDING_PAYMENT: { label: '待支付', className: 'bg-amber-100 text-amber-800' },
  PAID: { label: '已支付', className: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: '已发货', className: 'bg-violet-100 text-violet-800' },
  COMPLETED: { label: '完成', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '取消', className: 'bg-gray-100 text-gray-600' },
}

/**
 * 订单列表项响应（分页）
 */
export interface OrderPageResponse {
  id: number
  orderNo: string
  userId: number
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  /** 订单总金额（BigDecimal 序列化为 string） */
  totalAmount: string
  /** 订单状态（枚举字符串，如 PENDING_PAYMENT） */
  status: string
  /** 创建时间 yyyy-MM-dd HH:mm:ss */
  createdAt: string
}

/**
 * 订单详情响应
 */
export interface OrderResponse extends OrderPageResponse {
  /** 更新时间 yyyy-MM-dd HH:mm:ss */
  updatedAt: string
  /** 订单明细列表 */
  orderItems: OrderItemResponse[]
}

/**
 * 订单明细项响应
 */
export interface OrderItemResponse {
  id: number
  orderId: number
  skuId: number
  productId: number
  skuName: string
  coverImage: string
  /** 单价（BigDecimal 序列化为 string） */
  price: string
  quantity: number
  /** 规格信息（解析后的 JSON） */
  specJson: Record<string, string>
  /** 创建时间 yyyy-MM-dd HH:mm:ss */
  createdAt: string
}

/**
 * 保存订单时的订单明细项请求（仅 skuId、quantity，其余由后端从 SKU/Product 补全）
 */
export interface SaveOrderItemRequest {
  skuId: number
  quantity: number
}

/**
 * 保存订单请求（商品详情页直接购买：POST /order）
 */
export interface SaveOrderRequest {
  /** 订单号，可选；为空时由后端生成 */
  orderNo?: string
  /** 用户ID，由 Controller 从 StpUtil 填入或从 body 传入 */
  userId?: number
  /** 收货人 */
  receiverName: string
  /** 手机号 */
  receiverPhone: string
  /** 收货地址 */
  receiverAddress: string
  /** 状态：1待支付 2已支付 3已发货 4完成 5取消，默认为待支付 */
  status?: OrderStatusEnum
  /** 订单明细列表（仅 skuId、quantity，其余由后端从 SKU/Product 补全） */
  orderItems: SaveOrderItemRequest[]
}

/**
 * 从购物车创建订单请求（POST /order/from-cart）
 */
export interface CreateOrderFromCartRequest {
  /** 购物车项 ID 列表（勾选结算的商品） */
  cartItemIds: number[]
  /** 收货人 */
  receiverName: string
  /** 手机号 */
  receiverPhone: string
  /** 收货地址 */
  receiverAddress: string
}
