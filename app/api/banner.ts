import type { BannerResponse } from '~/types/banner'
import { useApi } from '~/composables/useApi'

/**
 * 获取Banner数据
 * @returns Banner响应（useApi 会自动解包 data，所以直接返回 BannerResponse | null）
 */
export function getBanner() {
  return useApi<BannerResponse | null>('/client/banner', {
    method: 'GET',
  })
}
