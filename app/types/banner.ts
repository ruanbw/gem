/**
 * Banner项
 */
export interface BannerItem {
  /** 图片URL */
  imageUrl: string
  /** 点击链接跳转地址 */
  linkUrl: string
}

/**
 * Banner响应
 */
export interface BannerResponse {
  /** Banner ID */
  id: string
  /** Banner项列表 */
  items: BannerItem[]
  /** 创建时间 */
  createAt: string
  /** 更新时间 */
  updateAt: string
}

// 默认导出，防止eslint报错
export {}
