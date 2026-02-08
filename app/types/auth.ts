/**
 * 登录成功响应数据
 */
export interface SigninResponse {
  accessToken: string
  tokenName: string
  expiresIn: number
}

/**
 * API 标准响应格式（有数据）
 */
export interface ApiResponse<T = any> {
  data?: T
  msg: string
  code: number
}

/**
 * API 标准响应格式（无数据）
 */
export interface ApiResponseEmpty {
  msg: string
  code: number
}

/**
 * 密码登录请求参数
 */
export interface IPwdSigninParams {
  email: string
  password: string
}

/**
 * 邮箱登录请求参数
 */
export interface ICodeSigninParams {
  email: string
  code: string
}

/**
 * 邮箱注册请求参数
 */
export interface ICodeSignupParams {
  email: string
  code: string
  password: string
  confirmPassword: string
}

/**
 * 验证码发送请求参数
 */
export interface ISendCodeParams {
  email: string
  type: 'LOGIN' | 'REGISTER' | 'RESET' | 'VERIFY_EMAIL'
}

/**
 * 密码重置请求参数
 */
export interface IResetPasswordParams {
  code: string
  password: string
  confirmNewPassword: string
}

export interface UserInfo {
  id: number
  email: string
  avatar: string
  mobile: string
  description: string
  status: number
}

/**
 * 用户详情响应
 */
export interface UserDetail {
  id: number
  avatar: string
  realName: string
  username: string
  mobile: string
  status: number
  description: string
  roles: number[]
}

// 默认导出，防止eslint报错
export {}
