export function useFilePath(path: string) {
  if (!path || !path.trim()) {
    return path
  }

  const runtimeConfig = useRuntimeConfig()
  const fileUrl = runtimeConfig.public.fileUrl

  // 如果没有配置 fileUrl，直接返回原路径
  if (!fileUrl || !fileUrl.trim()) {
    return path
  }

  // 规范化路径，去除首尾空格
  const normalizedPath = path.trim()

  // 如果路径已经是完整 URL（以 http:// 或 https:// 开头），直接返回
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://') || normalizedPath.startsWith('//')) {
    return normalizedPath
  }

  // 规范化 fileUrl，去除首尾空格和末尾的 /
  const normalizedFileUrl = fileUrl.trim().replace(/\/+$/, '')

  // 如果路径中包含了 http:// 或 https://，说明已经是完整 URL（可能在中间，说明被重复拼接过）
  // 这种情况下，我们需要提取出正确的 URL
  if (normalizedPath.includes('http://') || normalizedPath.includes('https://')) {
    // 尝试提取最后一个 http:// 或 https:// 开始的部分
    const httpIndex = normalizedPath.lastIndexOf('http://')
    const httpsIndex = normalizedPath.lastIndexOf('https://')
    const urlStartIndex = Math.max(httpIndex, httpsIndex)
    if (urlStartIndex >= 0) {
      return normalizedPath.substring(urlStartIndex)
    }
    return normalizedPath
  }

  // 如果路径已经包含完整的 fileUrl，说明已经被拼接过了，直接返回
  if (normalizedPath.startsWith(normalizedFileUrl)) {
    return normalizedPath
  }

  // 确保 path 以 / 开头（如果不是以 http:// 开头的话）
  const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`

  return `${normalizedFileUrl}${finalPath}`
}
