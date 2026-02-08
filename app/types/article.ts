// 文章列表项类型
export interface ArticleItem {
  id: string
  title: string
  createAt: string
  previewImage: string
  author: string
  contentSummary: string
  status: 'DRAFT' | 'PUBLISHED'
}

// 文章详情类型
export interface Article {
  id: string
  title: string
  createAt: string
  previewImage: string
  author: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
}

// 分页排序信息
export interface SortInfo {
  empty: boolean
  unsorted: boolean
  sorted: boolean
}

// 分页请求信息
export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: SortInfo
  offset: number
  paged: boolean
  unpaged: boolean
}

// 分页响应数据
export interface ArticlePageResponse {
  content: ArticleItem[]
  pageable: Pageable
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number // 当前页码（从0开始）
  sort: SortInfo
  numberOfElements: number
  first: boolean
  empty: boolean
}

// API响应包装
export interface ArticleListApiResponse {
  code: number
  msg: string
  data: ArticlePageResponse
}

// 文章详情API响应
export interface ArticleDetailApiResponse {
  code: number
  msg: string
  data: Article
}
