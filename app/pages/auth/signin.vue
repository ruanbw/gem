<script setup lang="ts">
import type { SigninResponse } from '~/types/auth'
import { toTypedSchema } from '@vee-validate/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { codeSignin, getUserInfo, pwdSignin, sendCode } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useUserStore } from '~/stores/user'

// 登录方式：password（密码登录）或 code（验证码登录）
const loginType = ref<'password' | 'code'>('password')

// 验证码发送倒计时
const countdown = ref(0)
const isSendingCode = ref(false)

const { pause, resume, isActive } = useIntervalFn(() => {
  countdown.value--
  if (countdown.value <= 0) {
    pause()
  }
}, 1000)

// 根据登录方式动态生成表单验证规则
const passwordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
})

const codeSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码为6位数字'),
})

const formSchema = computed(() => {
  return toTypedSchema(loginType.value === 'password' ? passwordSchema : codeSchema)
})

const { handleSubmit, isSubmitting, setFieldValue, values, resetForm } = useForm({
  validationSchema: formSchema,
})

const route = useRoute()
const userStore = useUserStore()

const rememberMe = ref(false)

onMounted(() => {
  if (useCookie('rememberMe').value) {
    rememberMe.value = true
    setFieldValue('email', useCookie('email').value || '')
    if (loginType.value === 'password') {
      setFieldValue('password', useCookie('password').value || '')
    }
  }
})

// 切换登录方式时重置表单
watch(loginType, () => {
  resetForm()
  countdown.value = 0
  pause()
})

// 组件卸载时暂停倒计时
onUnmounted(() => {
  pause()
})

// 发送验证码
async function sendVerificationCode() {
  const email = values.email
  if (!email) {
    toast.error('请先输入邮箱地址')
    return
  }

  // 验证邮箱格式
  try {
    z.string().email().parse(email)
  }
  catch {
    toast.error('请输入有效的邮箱地址')
    return
  }

  if (isActive.value || countdown.value > 0) {
    return
  }

  isSendingCode.value = true
  try {
    await sendCode({
      email,
      type: 'LOGIN',
    })
    toast.success('验证码已发送，请查看邮箱')
    countdown.value = 60
    resume()
  }
  catch (error) {
    toast.error('发送验证码失败，请稍后重试')
    console.error(error)
  }
  finally {
    isSendingCode.value = false
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    let result: SigninResponse

    if (loginType.value === 'password') {
      const passwordValues = values as { email: string, password: string }
      result = await pwdSignin({
        email: passwordValues.email,
        password: passwordValues.password,
      })
    }
    else {
      const codeValues = values as { email: string, code: string }
      result = await codeSignin({
        email: codeValues.email,
        code: codeValues.code,
      })
    }

    if (result?.accessToken && result?.tokenName) {
      try {
        const userDetail = await getUserInfo()
        if (userDetail) {
          userStore.setUserDetail(userDetail)
        }
      }
      catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    toast.success('登录成功')

    // 只有密码登录时才保存密码
    if (loginType.value === 'password') {
      setRememberMe(values)
    }
    else {
      // 验证码登录时，如果 Remember me 为 true，只保存邮箱
      if (rememberMe.value) {
        useCookie('rememberMe').value = 'true'
        useCookie('email').value = values.email
        useCookie('password').value = null
      }
      else {
        useCookie('rememberMe').value = null
        useCookie('email').value = null
        useCookie('password').value = null
      }
    }

    // 如果存在重定向，则重定向到重定向地址
    if (route.query.redirect) {
      navigateTo(decodeURIComponent(route.query.redirect as string))
    }
    else {
      navigateTo('/')
    }
  }
  catch (error) {
    console.error(error)
  }
})

function setRememberMe(values: any) {
  if (rememberMe.value) {
    useCookie('rememberMe').value = 'true'
    useCookie('email').value = values.email
    useCookie('password').value = values.password
  }
  else {
    useCookie('rememberMe').value = null
    useCookie('email').value = null
    useCookie('password').value = null
  }
}

const showPassword = ref(false)
</script>

<template>
  <section class="relative w-full min-h-screen flex items-center justify-center bg-background py-8 md:py-16 lg:py-24">
    <div class="container mx-auto px-4 md:px-6 lg:px-8">
      <div class="flex items-center justify-center">
        <!-- Form -->
        <div class="w-full max-w-md space-y-8">
          <div class="space-y-2 text-center">
            <h1 class="text-5xl font-bold">
              欢迎回来
            </h1>
            <p class="text-muted-foreground">
              请输入您的凭据以访问您的账户
            </p>
          </div>

          <form class="space-y-6">
            <!-- 登录方式切换 -->
            <div class="flex gap-4 border-b pb-4">
              <button
                type="button" class="flex-1 py-2 px-4 text-sm font-medium transition-colors" :class="[
                  loginType === 'password'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground',
                ]" @click="loginType = 'password'"
              >
                密码登录
              </button>
              <button
                type="button" class="flex-1 py-2 px-4 text-sm font-medium transition-colors" :class="[
                  loginType === 'code'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground',
                ]" @click="loginType = 'code'"
              >
                验证码登录
              </button>
            </div>

            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="请输入邮箱地址" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 密码登录 -->
            <FormField v-if="loginType === 'password'" v-slot="{ componentField }" name="password">
              <FormItem class="relative">
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" v-bind="componentField" />
                  <button
                    type="button" class="absolute right-3 top-8" :disabled="isSubmitting"
                    @click="showPassword = !showPassword"
                  >
                    <Eye
                      v-if="!showPassword"
                      class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                    />
                    <EyeOff v-else class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- 验证码登录 -->
            <FormField v-if="loginType === 'code'" v-slot="{ componentField }" name="code">
              <FormItem>
                <FormLabel>验证码</FormLabel>
                <FormControl>
                  <div class="flex gap-2">
                    <Input type="text" placeholder="请输入6位验证码" maxlength="6" class="flex-1" v-bind="componentField" />
                    <Button
                      type="button" variant="outline"
                      :disabled="isActive || countdown > 0 || isSendingCode || !values.email"
                      @click="sendVerificationCode"
                    >
                      <span v-if="isSendingCode">
                        <Loader2 class="h-4 w-4 animate-spin" />
                      </span>
                      <span v-else-if="countdown > 0">
                        {{ countdown }}秒
                      </span>
                      <span v-else>
                        发送验证码
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Checkbox id="remember" v-model="rememberMe" :disabled="isSubmitting" />
                <label
                  for="remember"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  记住我
                </label>
              </div>
              <NuxtLink
                v-if="loginType === 'password'" to="/auth/forgot-password"
                class="text-sm text-primary hover:text-primary/80 transition-colors"
                :class="{ 'pointer-events-none opacity-50': isSubmitting }"
              >
                忘记密码？
              </NuxtLink>
            </div>
            <Button type="button" class="w-full" :disabled="isSubmitting" @click="onSubmit">
              <span v-if="!isSubmitting" class="group-hover:translate-x-0.5 transition-transform">
                登录
              </span>
              <span v-else class="flex items-center justify-center">
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </span>
            </Button>

            <div class="text-center">
              <span class="text-sm text-muted-foreground">
                还没有账号？
              </span>
              <NuxtLink to="/auth/signup" class="text-sm text-primary hover:text-primary/80 transition-colors ml-1">
                立即注册
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
