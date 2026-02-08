import type {
  ApiResponse,
  ApiResponseEmpty,
  ICodeSigninParams,
  ICodeSignupParams,
  IPwdSigninParams,
  IResetPasswordParams,
  ISendCodeParams,
  SigninResponse,
  UserDetail,
} from '~/types/auth'

/**
 * 密码登录
 * @param params - 登录参数
 * @returns 登录结果（useApi 会自动解包 data，所以直接返回 SigninResponse）
 */
export function pwdSignin(params: IPwdSigninParams) {
  return useApi<SigninResponse>('/auth/pwd_signin', {
    method: 'POST',
    body: params,
  })
}

/**
 * 邮箱登录（验证码登录）
 * @param params - 登录参数
 * @returns 登录结果（useApi 会自动解包 data，所以直接返回 SigninResponse）
 */
export function codeSignin(params: ICodeSigninParams) {
  return useApi<SigninResponse>('/auth/code_signin', {
    method: 'POST',
    body: params,
  })
}

/**
 * 邮箱注册
 * @param params - 注册参数
 * @returns 注册结果
 */
export function codeSignup(params: ICodeSignupParams) {
  return useApi<ApiResponseEmpty>('/auth/code_signup', {
    method: 'POST',
    body: params,
  })
}

/**
 * 发送验证码
 * @param params - 发送验证码参数
 * @returns 发送验证码结果
 */
export function sendCode(params: ISendCodeParams) {
  return useApi<ApiResponseEmpty>('/auth/send_code', {
    method: 'POST',
    body: params,
  })
}

/**
 * 密码重置
 * @param params - 重置密码参数
 * @returns 重置密码结果
 */
export function resetPassword(params: IResetPasswordParams) {
  return useApi<ApiResponseEmpty>('/auth/reset_password', {
    method: 'POST',
    body: params,
  })
}

/**
 * 退出登录
 * @returns 退出登录结果
 */
export function signout() {
  return useApi<ApiResponseEmpty>('/auth/signout', {
    method: 'GET',
  })
}

/**
 * 获取用户个人详情
 * @param options - 可选的请求选项（如headers）
 * @returns 用户详情（useApi 会自动解包 data，所以直接返回 UserDetail）
 */
export function getUserInfo(options?: { headers?: Record<string, string> }) {
  return useApi<UserDetail>('/user/info', {
    method: 'GET',
    ...options,
  })
}
