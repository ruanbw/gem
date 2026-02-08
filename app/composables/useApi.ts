import type { FetchOptions } from 'ofetch'
import { toast } from 'vue-sonner'
import { useUserStore } from '~/stores/user'

interface ApiResponse<T> {
  message: string
  data?: T
  code: number
}

// 封装后自动解包 data，错误统一处理
export function useApi<T>(path: string, options: FetchOptions = {}) {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase
  const apiBaseServer = config.public.apiBaseServer
  const baseURL = import.meta.client ? apiBase : apiBaseServer

  import.meta.client && console.log('apiBase ===>', apiBase)

  return $fetch<T>(path, {
    baseURL,
    timeout: 10000,
    ...(options as any),
    onRequest: async ({ options }) => {

      // 设置语言偏好
      const i18nRedirected = useCookie('i18n_redirected')
      if (i18nRedirected.value) {
        if (options.headers instanceof Headers) {
          options.headers.set('Accept-Language', i18nRedirected.value)
        }
        else {
          const headers = options.headers as Record<string, string>
          headers['Accept-Language'] = i18nRedirected.value
        }
      }
    },
    onResponse: ({ response }) => {
      // 解构响应数据
      const responseData = response._data as ApiResponse<T>

      // 如果响应不是预期的格式，直接返回
      if (!responseData || typeof responseData !== 'object' || !('code' in responseData)) {
        return
      }

      const { data, code, message } = responseData

      // 根据业务状态码处理错误
      if (code !== 200 && code !== 0) {
        // 401 未授权，跳转到登录页
        if (code === 401) {
          toast.error(message)
          const userStore = useUserStore()
          userStore.logout()
          // SSR 安全处理
          if (import.meta.client) {
            const route = useRoute()
            const redirect = encodeURIComponent(route.fullPath)
            navigateTo(`/auth/signin?redirect=${redirect}`)
          }
          else {
            navigateTo('/auth/signin')
          }

          // 抛出错误以阻止后续处理
          throw createError({
            statusCode: 401,
            message: message || '未授权',
            data: responseData,
          })
        }

        // 其他错误状态码
        toast.error(message)

        // 抛出错误以阻止后续处理
        throw createError({
          statusCode: code,
          message: message || '请求失败',
          data: responseData,
        })
      }

      // 成功时，将 response._data 替换为解构后的 data
      // 这样调用方直接得到 data，而不是整个 ApiResponse
      response._data = data as T
    },
    onResponseError: ({ response, error }) => {
      // 处理 HTTP 状态码错误（4xx, 5xx）
      const statusCode = response?.status || (error && 'statusCode' in error ? (error.statusCode as number) : undefined) || 500
      const statusText = response?.statusText || (error?.message) || '请求失败'

      let errorMessage = '请求失败'

      // 根据 HTTP 状态码设置错误信息
      switch (statusCode) {
        case 400:
          errorMessage = '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 401 时跳转到登录页
          if (import.meta.client) {
            const route = useRoute()
            const redirect = encodeURIComponent(route.fullPath)
            navigateTo(`/auth/signin?redirect=${redirect}`)
          }
          else {
            navigateTo('/auth/signin')
          }
          break
        case 403:
          errorMessage = '没有权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        case 502:
          errorMessage = '网关错误'
          break
        case 503:
          errorMessage = '服务不可用'
          break
        default:
          errorMessage = statusText || '请求失败'
      }

      // SSR 环境下输出更详细的错误信息
      if (import.meta.server) {
        const errorUrl = response?.url || (error && 'request' in error ? (error.request as any)?.url : 'unknown')
        console.error('[SSR Error]', {
          url: errorUrl,
          statusCode,
          errorMessage,
          error: error?.message || String(error),
          stack: error?.stack,
          cause: error?.cause,
          fullError: error,
        })
      }
      else {
        console.error(response?.url, errorMessage, error)
      }

      // toast.add({
      //   title: 'Error',
      //   description: errorMessage,
      //   color: 'error',
      // })
    },
  })
}

// GET 请求
export function useApiGet<T>(path: string, params: any = {}) {
  return useApi<T>(path, {
    method: 'GET',
    query: params,
  })
}

// POST 请求
export function useApiPost<T>(path: string, body?: any) {
  return useApi<T>(path, {
    method: 'POST',
    body,
  })
}

// PUT 请求
export function useApiPut<T>(path: string, body?: any) {
  return useApi<T>(path, {
    method: 'PUT',
    body,
  })
}

// DELETE 请求
export function useApiDelete<T>(path: string) {
  return useApi<T>(path, {
    method: 'DELETE',
  })
}

// 文件上传响应
export interface FileUploadResponse {
  key: string
}

// 文件类型
export type FileType = 'AVATAR' | 'PRODUCT' | 'GENERAL'

// POST FormData 请求（用于文件上传）
export function uploadFileApi<T>(path: string, formData: FormData) {
  return useApi<T>(path, {
    method: 'POST',
    body: formData,
  })
}
