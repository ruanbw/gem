# Nuxt 中 Cookie 处理说明

## 问题：为什么 Nuxt 无法在浏览器中处理 Set-Cookie 响应头？

### 核心原因

**浏览器安全限制**：JavaScript 无法直接读取 `Set-Cookie` 响应头。这是浏览器的安全特性，用于防止恶意脚本访问敏感的 cookie 信息。

### 技术细节

1. **浏览器自动处理**：
   - 浏览器会自动处理 `Set-Cookie` 响应头并设置 cookie
   - 但这个过程对 JavaScript 是**不可见的**
   - JavaScript 无法通过 `response.headers.get('set-cookie')` 读取 `Set-Cookie` 响应头

2. **必要条件**：
   浏览器自动处理 `Set-Cookie` 需要满足以下条件：
   - ✅ 请求设置了 `credentials: 'include'`（对于跨域请求）
   - ✅ 服务器正确配置了 CORS：
     - `Access-Control-Allow-Credentials: true`
     - `Access-Control-Allow-Origin` 不能是 `*`，必须是具体域名
   - ✅ Cookie 属性符合浏览器安全策略

3. **服务器端（SSR）**：
   - 在服务器端（Node.js 环境），可以正常读取 `Set-Cookie` 响应头
   - 这是因为服务器端不受浏览器安全限制

## 解决方案

### 方案 1：让浏览器自动处理（推荐用于同域或正确配置 CORS 的情况）

如果服务器正确配置了 CORS，浏览器会自动处理 `Set-Cookie`：

```typescript
// app/composables/useApi.ts
return $fetch<T>(path, {
  baseURL,
  credentials: 'include', // 关键：允许浏览器自动处理 Set-Cookie
  // ...
})
```

**优点**：
- 简单，无需手动处理
- 支持 HttpOnly、Secure 等安全属性
- 浏览器自动管理 cookie 生命周期

**缺点**：
- 需要服务器正确配置 CORS
- 跨域情况下配置复杂

### 方案 2：从响应体读取 Token 并手动设置 Cookie（当前实现）

如果服务器在响应体中返回 token，可以手动设置 cookie：

```typescript
// app/pages/auth/signin.vue
if (result?.accessToken && result?.tokenName) {
  // 手动设置 cookie
  const tokenCookie = useCookie<string>(result.tokenName, {
    path: '/',
    sameSite: 'lax',
    maxAge: result.expiresIn,
  })
  tokenCookie.value = result.accessToken
}
```

**优点**：
- 不依赖 CORS 配置
- 可以灵活控制 cookie 属性
- 适用于任何跨域场景

**缺点**：
- 无法设置 HttpOnly 属性（JavaScript 限制）
- 需要服务器在响应体中返回 token

## 当前项目实现

### 1. 请求配置（`app/composables/useApi.ts`）

```typescript
return $fetch<T>(path, {
  baseURL,
  credentials: 'include', // 允许浏览器自动处理 Set-Cookie
  // ...
})
```

### 2. 登录后手动设置 Cookie（`app/pages/auth/signin.vue`）

```typescript
// 从响应体读取 token 并手动设置
const tokenCookie = useCookie<string>(result.tokenName, {
  path: '/',
  sameSite: 'lax',
  maxAge: result.expiresIn,
})
tokenCookie.value = result.accessToken
```

### 3. 请求时自动添加认证头（`app/composables/useApi.ts`）

```typescript
onRequest: async ({ options }) => {
  const tokenNameCookie = useCookie<string>('tokenName')
  const tokenName = tokenNameCookie.value || 'Authentication'
  const token = useCookie<string>(tokenName)
  
  if (token.value) {
    // 添加 Authentication 头
    options.headers['Authentication'] = token.value
  }
}
```

## 注意事项

1. **HttpOnly Cookie**：
   - JavaScript 无法设置 HttpOnly 属性
   - 如果服务器设置了 HttpOnly cookie，浏览器会自动处理，但 JavaScript 无法读取

2. **跨域 Cookie**：
   - 跨域情况下，需要服务器正确配置 CORS
   - `Access-Control-Allow-Origin` 不能是 `*`
   - 必须设置 `Access-Control-Allow-Credentials: true`

3. **SameSite 属性**：
   - 现代浏览器对 SameSite 有严格限制
   - 建议使用 `sameSite: 'lax'` 或 `sameSite: 'none'`（需要 Secure）

4. **开发环境代理**：
   - 如果使用 Nuxt 的 `devProxy`，cookie 会自动转发
   - 确保代理配置正确（`nuxt.config.ts`）

## 调试技巧

1. **检查 Cookie 是否设置**：
   ```typescript
   console.log(useCookie('tokenName').value)
   console.log(document.cookie) // 浏览器控制台
   ```

2. **检查网络请求**：
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 检查 Response Headers 中的 `Set-Cookie`
   - 检查 Application/Storage 标签中的 Cookies

3. **服务器端日志**：
   ```typescript
   if (import.meta.server) {
     console.log('[SSR] Set-Cookie:', response.headers.get('set-cookie'))
   }
   ```

## 总结

- ✅ **浏览器无法读取 `Set-Cookie` 响应头**（安全限制）
- ✅ **浏览器会自动处理 `Set-Cookie`**（如果配置正确）
- ✅ **服务器端可以读取 `Set-Cookie`**（SSR 环境）
- ✅ **推荐方案**：从响应体读取 token 并手动设置 cookie（当前实现）
