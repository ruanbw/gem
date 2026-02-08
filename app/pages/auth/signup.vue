<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { codeSignup, sendCode } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = toTypedSchema(z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码为6位数字'),
  password: z.string().min(8, '密码至少需要8个字符'),
  confirmPassword: z.string().min(8, '确认密码至少需要8个字符'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
}))

const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema: formSchema,
})

// 验证码发送倒计时
const countdown = ref(0)
const isSendingCode = ref(false)

const { pause, resume, isActive } = useIntervalFn(() => {
  countdown.value--
  if (countdown.value <= 0) {
    pause()
  }
}, 1000)

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
      type: 'REGISTER',
    })

    toast.success('验证码已发送，请查看邮箱')
    countdown.value = 60
    resume()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isSendingCode.value = false
  }
}

const onSubmit = handleSubmit(async (values) => {
  try {
    await codeSignup({
      email: values.email,
      code: values.code,
      password: values.password,
      confirmPassword: values.confirmPassword,
    })


    toast.success('注册成功！')

    // 延迟后跳转到登录页
    setTimeout(() => {
      navigateTo('/auth/signin')
    }, 2000)
  }
  catch (error) {
    console.error(error)
  }
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
</script>

<template>
  <section class="relative w-full min-h-screen flex items-center justify-center bg-background py-8 md:py-16 lg:py-24">
    <div class="container mx-auto px-4 md:px-6 lg:px-8">
      <div class="flex items-center justify-center">
        <!-- Form -->
        <div class="w-full max-w-md space-y-8">
          <div class="space-y-2 text-center">
            <h1 class="text-5xl font-bold">
              注册账号
            </h1>
            <p class="text-muted-foreground">
              创建您的账号以开始使用
            </p>
          </div>

          <form class="space-y-6">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="请输入邮箱地址" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="code">
              <FormItem>
                <FormLabel>验证码</FormLabel>
                <FormControl>
                  <div class="flex gap-2">
                    <Input type="text" placeholder="请输入6位验证码" maxlength="6" class="flex-1" v-bind="componentField" />
                    <Button type="button" variant="outline"
                      :disabled="isActive || countdown > 0 || isSendingCode || !values.email"
                      @click="sendVerificationCode">
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

            <FormField v-slot="{ componentField }" name="password">
              <FormItem class="relative">
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input :type="showPassword ? 'text' : 'password'" placeholder="请输入密码（至少8个字符）"
                    v-bind="componentField" />
                  <button type="button" class="absolute right-3 top-8" :disabled="isSubmitting"
                    @click="showPassword = !showPassword">
                    <Eye v-if="!showPassword"
                      class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    <EyeOff v-else class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="confirmPassword">
              <FormItem class="relative">
                <FormLabel>确认密码</FormLabel>
                <FormControl>
                  <Input :type="showConfirmPassword ? 'text' : 'password'" placeholder="请再次输入密码"
                    v-bind="componentField" />
                  <button type="button" class="absolute right-3 top-8" :disabled="isSubmitting"
                    @click="showConfirmPassword = !showConfirmPassword">
                    <Eye v-if="!showConfirmPassword"
                      class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    <EyeOff v-else class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button type="button" class="w-full" :disabled="isSubmitting" @click="onSubmit">
              <span v-if="!isSubmitting" class="group-hover:translate-x-0.5 transition-transform">
                注册
              </span>
              <span v-else class="flex items-center justify-center">
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                注册中...
              </span>
            </Button>

            <div class="text-center space-y-2">
              <div>
                <span class="text-sm text-muted-foreground">
                  已有账号？
                </span>
                <NuxtLink to="/auth/signin" class="text-sm text-primary hover:text-primary/80 transition-colors ml-1">
                  立即登录
                </NuxtLink>
              </div>
              <div>
                <NuxtLink to="/auth/signin" class="text-sm text-primary hover:text-primary/80 transition-colors">
                  ← 返回登录
                </NuxtLink>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
