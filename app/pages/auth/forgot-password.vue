<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { resetPassword, sendCode } from '@/api/auth'
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
  code: z.string().length(6, '验证码为6位数字'),
  password: z.string().min(8, '密码至少需要8个字符'),
  confirmNewPassword: z.string().min(8, '确认密码至少需要8个字符'),
}).refine((data) => data.password === data.confirmNewPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmNewPassword'],
}))

// 邮箱地址（用于发送验证码）
const email = ref('')

const { handleSubmit, isSubmitting } = useForm({
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
  const emailValue = email.value
  if (!emailValue) {
    toast.error('请先输入邮箱地址')
    return
  }

  // 验证邮箱格式
  try {
    z.string().email().parse(emailValue)
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
      email: emailValue,
      type: 'RESET',
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

const onSubmit = handleSubmit(async (_values) => {
  try {
    await resetPassword({
      code: _values.code,
      password: _values.password,
      confirmNewPassword: _values.confirmNewPassword,
    })

    toast.success('密码重置成功！')

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
              忘记密码
            </h1>
            <p class="text-muted-foreground">
              请输入您的邮箱地址，我们将发送验证码到您的邮箱
            </p>
          </div>

          <form class="space-y-6">
            <div>
              <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                邮箱
              </label>
              <div class="flex gap-2">
                <Input v-model="email" type="email" placeholder="请输入邮箱地址" class="flex-1" />
                <Button type="button" variant="outline" :disabled="isActive || countdown > 0 || isSendingCode || !email"
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
            </div>

            <FormField v-slot="{ componentField }" name="code">
              <FormItem>
                <FormLabel>验证码</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="请输入6位验证码" maxlength="6" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem class="relative">
                <FormLabel>新密码</FormLabel>
                <FormControl>
                  <Input :type="showPassword ? 'text' : 'password'" placeholder="请输入新密码（至少8个字符）"
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

            <FormField v-slot="{ componentField }" name="confirmNewPassword">
              <FormItem class="relative">
                <FormLabel>确认新密码</FormLabel>
                <FormControl>
                  <Input :type="showConfirmPassword ? 'text' : 'password'" placeholder="请再次输入新密码"
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
                提交
              </span>
              <span v-else class="flex items-center justify-center">
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                提交中...
              </span>
            </Button>

            <div class="text-center">
              <NuxtLink to="/auth/signin" class="text-sm text-primary hover:text-primary/80 transition-colors">
                返回登录
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
