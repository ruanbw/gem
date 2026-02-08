/**
 * MyBatis-Plus Page 分页响应类型
 * @template T 分页记录类型
 */
export interface Page<T> {
  /** 记录列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 每页大小 */
  size: number
  /** 当前页码（从1开始） */
  current: number
  /** 总页数 */
  pages: number
}
