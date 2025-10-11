<template>
  <div class="login-view">
    <h2 class="form-title">用户登录</h2>
    <p class="form-subtitle">使用手机验证码登录</p>
    
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-width="0"
      size="large"
      class="login-form"
      :validate-on-rule-change="false"
      @keyup.enter="handleLogin"
    >
      <!-- 身份选择 -->
      <div class="role-selection">
        <el-radio-group v-model="loginForm.role" class="role-group">
          <el-radio value="patient" class="role-radio">
            <el-icon><UserFilled /></el-icon>
            患者登录
          </el-radio>
          <el-radio value="doctor" class="role-radio">
            <el-icon><Operation /></el-icon>
            医生登录
          </el-radio>
        </el-radio-group>
      </div>
      
      <!-- 手机号 -->
      <el-form-item prop="phone">
        <el-input
          v-model="loginForm.phone"
          placeholder="请输入手机号"
          clearable
          class="form-input"
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 验证码 -->
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          placeholder="请输入验证码"
          clearable
          class="form-input"
        >
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
          <template #suffix>
            <el-button 
              type="text" 
              class="code-btn"
              :disabled="codeCountdown > 0 || isCodeSending"
              @click="sendCode"
            >
              <span v-if="codeCountdown > 0">{{ codeCountdown }}s后重新获取</span>
              <span v-else-if="isCodeSending">发送中...</span>
              <span v-else>获取验证码</span>
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <!-- 登录按钮 -->
      <el-button
        type="primary"
        size="large"
        class="login-button"
        :loading="authStore.loading"
        @click="handleLogin"
      >
        立即登录
      </el-button>

      <!-- 注册链接 -->
      <div class="other-actions">
        <span class="tip-text">还没有账号？</span>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </el-form>

    <!-- 演示账户（仅开发环境） -->
    <div v-if="showDemoAccounts" class="demo-section">
      <el-divider>演示账户</el-divider>
      <div class="demo-buttons">
        <el-button size="small" @click="fillDemoAccount('patient')">患者演示</el-button>
        <el-button size="small" @click="fillDemoAccount('doctor')">医生演示</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  UserFilled, 
  Operation, 
  Phone, 
  Key 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import type { UserRole, LoginCredentials } from '@/types/auth'
import { authApi } from '@/api'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 是否显示演示账户（仅开发环境）
const showDemoAccounts = computed(() => import.meta.env.DEV)

// 登录表单数据
const loginForm = reactive<LoginCredentials>({
  phone: '',
  code: '',
  role: 'patient'
})

// 验证码倒计时
const codeCountdown = ref(0)
const isCodeSending = ref(false)
let countdownTimer: number | null = null

// 控制是否启用验证
const enableValidation = ref(false)

// 表单验证规则
const loginRules = computed<FormRules>(() => {
  // 如果未启用验证，返回空规则
  if (!enableValidation.value) {
    return {}
  }
  
  return {
    phone: [
      { required: true, message: '请输入手机号' },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号'
      }
    ],
    code: [
      { required: true, message: '请输入验证码' },
      { len: 6, message: '验证码长度为6位' }
    ]
  }
})

// 监听角色变化，清除表单验证状态
watch(() => loginForm.role, () => {
  // 禁用验证并清除所有表单项的验证状态
  enableValidation.value = false
  loginFormRef.value?.clearValidate()
})

// 发送验证码
const sendCode = async () => {
  if (!loginForm.phone) {
    ElMessage.error('请先输入手机号')
    return
  }
  
  // 验证手机号格式
  const phonePattern = /^1[3-9]\d{9}$/
  if (!phonePattern.test(loginForm.phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  
  try {
    isCodeSending.value = true
    
    await authApi.sendVerificationCode({
      type: 'phone',
      phone: loginForm.phone,
      purpose: 'login'
    })
    
    ElMessage.success('验证码发送成功，请注意查收')
    
    // 开始倒计时
    startCountdown()
    
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '验证码发送失败，请重试')
  } finally {
    isCodeSending.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  codeCountdown.value = 60
  countdownTimer = window.setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  // 启用验证
  enableValidation.value = true
  
  // 等待下一个 tick 确保规则已更新
  await new Promise(resolve => setTimeout(resolve, 0))
  
  try {
    await loginFormRef.value.validate()
    
    // 调用登录
    await authStore.login(loginForm)
    
    // 登录成功，跳转到对应的仪表板
    const redirectPath = (route.query.redirect as string) || getDefaultRedirectPath()
    router.push(redirectPath)
    
  } catch (error: any) {
    console.error('登录失败:', error)
    // 错误消息已经在store中处理
  }
}

// 获取默认重定向路径
const getDefaultRedirectPath = (): string => {
  return loginForm.role === 'patient' ? '/patient/data' : '/doctor/data'
}

// 填充演示账户（仅开发环境）
const fillDemoAccount = async (role: UserRole) => {
  if (!import.meta.env.DEV) return
  
  try {
    // 模拟登录（避免调用真实API）
    const mockToken = `demo_token_${role}_${Date.now()}`
    const mockUser = {
      id: role === 'patient' ? 'demo_patient_001' : 'demo_doctor_001',
      name: role === 'patient' ? '演示患者' : '演示医生',
      role: role,
      phone: role === 'patient' ? '13800138001' : '13800138002',
      avatar: undefined,
      isActive: true,
      isPhoneVerified: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 直接设置store状态
    authStore.token = mockToken
    authStore.user = mockUser
    localStorage.setItem('token', mockToken)
    
    // 登录成功，跳转到对应的页面
    const redirectPath = role === 'patient' ? '/patient/data' : '/doctor/data'
    ElMessage.success(`${role === 'patient' ? '患者' : '医生'}演示登录成功！`)
    router.push(redirectPath)
    
  } catch (error: any) {
    console.error('演示登录失败:', error)
    ElMessage.error('演示登录失败')
  }
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.login-view {
  width: 100%;
  user-select: none;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px 0;
  text-align: center;
}

.form-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 32px 0;
  text-align: center;
}

/* 身份选择 */
.role-selection {
  margin-bottom: 24px;
}

.role-group {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.role-radio :deep(.el-radio__label) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.role-radio :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #1890ff;
}

/* 表单样式 */
.login-form {
  width: 100%;
}

/* 允许输入框内文本选择 */
.form-input :deep(input) {
  user-select: text;
}

.form-input {
  margin-bottom: 20px;
}

.form-input :deep(.el-input__wrapper) {
  height: 44px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

.form-input :deep(.el-input__wrapper):hover {
  border-color: #4096ff;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
}

.form-input :deep(.el-input__prefix) {
  color: #bfbfbf;
  margin-right: 8px;
}

.form-input :deep(.el-input__suffix) {
  padding-right: 8px;
}

.code-btn {
  font-size: 14px;
  color: #1890ff;
  padding: 0;
  height: auto;
  min-width: 100px;
  text-align: right;
}

.code-btn:disabled {
  color: #bfbfbf;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  margin-bottom: 24px;
}

/* 其他操作 */
.other-actions {
  text-align: center;
  font-size: 14px;
}

.tip-text {
  color: #8c8c8c;
  margin-right: 8px;
}

.register-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  color: #4096ff;
}

/* 演示区域 */
.demo-section {
  margin-top: 32px;
  text-align: center;
}

.demo-section :deep(.el-divider__text) {
  font-size: 12px;
  color: #999;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-title {
    font-size: 24px;
  }
  
  .role-group {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .demo-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
