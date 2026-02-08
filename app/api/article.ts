import type { Article, ArticlePageResponse } from '~/types/article'
import { useApi } from '~/composables/useApi'

/**
 * 文章列表查询参数
 */
export interface ArticleListParams {
  /** 当前页（从1开始） */
  current?: number
  /** 每页个数 */
  size?: number
  /** 标题（搜索） */
  title?: string
  /** 作者（搜索） */
  author?: string
  /** 状态：DRAFT草稿、PUBLISHED发布 */
  status?: 'DRAFT' | 'PUBLISHED'
}

/**
 * 获取文章列表（分页）
 * @param params - 查询参数
 * @returns 文章分页响应（useApi 会自动解包 data，所以直接返回 ArticlePageResponse）
 */
export function getArticleList(params?: ArticleListParams) {
  return useApi<ArticlePageResponse>('/article', {
    method: 'GET',
    query: params,
  })
}

/**
 * 获取文章详情
 * @param id - 文章ID
 * @returns 文章详情（useApi 会自动解包 data，所以直接返回 Article）
 */
export function getArticleDetail(id: string) {
  return useApi<Article>(`/article/${id}`, {
    method: 'GET',
  })
}
