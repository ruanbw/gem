/**
 * 购物车项响应
 */
export interface CartItemResponse {
  /** 购物车项 ID */
  id: number
  /** 用户 ID */
  userId: number
  /** SKU ID */
  skuId: number
  /** 数量 */
  quantity: number
  /** SKU 价格（BigDecimal 序列化为 string） */
  price: string
  /** 商品名称（从 Product 获取） */
  productName: string
  /** 商品 ID */
  productId: number
  /** 封面图片 */
  coverImage: string
  /** 规格信息（解析后的 JSON） */
  specJson: Record<string, string>
  /** 可用库存 */
  availableStock: number
}

/**
 * 添加购物车项请求
 */
export interface AddCartItemRequest {
  /** SKU ID */
  skuId: number
  /** 购买数量 */
  quantity: number
}

/**
 * 更新购物车项请求
 */
export interface UpdateCartItemRequest {
  /** 购物车项 ID */
  id: number
  /** 购买数量 */
  quantity: number
}
