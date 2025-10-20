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

      <!-- 演示账户（仅开发环境） -->
      <div v-if="showDemoAccounts" class="demo-section">
        <el-divider>预设用户快捷登录</el-divider>
        
        
        <div class="demo-category">
          <h4 class="category-title">患者用户</h4>
          <div class="demo-buttons">
            <el-button size="small" @click="loginPresetUser('patient_cardio_001', 'patient')">
              张三 (心血管科)
            </el-button>
            <el-button size="small" @click="loginPresetUser('patient_cardio_002', 'patient')">
              李四 (心血管科)
            </el-button>
            <el-button size="small" @click="loginPresetUser('patient_respiratory_001', 'patient')">
              王五 (呼吸内科)
            </el-button>
            <el-button size="small" @click="loginPresetUser('patient_respiratory_002', 'patient')">
              赵六 (呼吸内科)
            </el-button>
          </div>
        </div>
        
        
        <div class="demo-category">
          <h4 class="category-title">医生用户</h4>
          <div class="demo-buttons">
            <el-button size="small" type="success" @click="loginPresetUser('doctor_cardio_001', 'doctor')">
              刘医生 (心血管科)
            </el-button>
            <el-button size="small" type="success" @click="loginPresetUser('doctor_cardio_002', 'doctor')">
              陈医生 (心血管科)
            </el-button>
            <el-button size="small" type="success" @click="loginPresetUser('doctor_respiratory_001', 'doctor')">
              吴医生 (呼吸内科)
            </el-button>
            <el-button size="small" type="success" @click="loginPresetUser('doctor_respiratory_002', 'doctor')">
              周医生 (呼吸内科)
            </el-button>
          </div>
        </div>
        
        
        
        <div class="demo-category">
          <h4 class="category-title">调试工具</h4>
        <div class="demo-buttons">
            <el-button size="small" type="warning" plain @click="resetAllData">
              🔄 重置数据
            </el-button>
            <el-button size="small" type="info" plain @click="showCurrentUser">
              👤 查看状态
            </el-button>
            <el-button size="small" type="success" plain @click="testUserLogin">
              🧪 测试登录
            </el-button>
            <el-button size="small" type="primary" plain @click="forceInitUsers">
              ⚡ 强制初始化
            </el-button>
            <el-button size="small" type="danger" plain @click="emergencyFix">
              🚨 立即修复
            </el-button>
          </div>
        </div>
      </div>

      <!-- 注册链接 -->
      <div class="other-actions">
        <span class="tip-text">还没有账号？</span>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </el-form>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeUnmount, onMounted } from 'vue'
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
import mockBackend from '@/services/mockBackend'

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
    
    // 开发环境模拟发送，生产环境调用真实API
    if (import.meta.env.DEV) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`📱 模拟发送验证码到 ${loginForm.phone}`)
      ElMessage.success('验证码发送成功，请注意查收')
    } else {
      await authApi.sendVerificationCode({
        type: 'phone',
        phone: loginForm.phone,
        purpose: 'login'
      })
      ElMessage.success('验证码发送成功，请注意查收')
    }
    
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

// 预设用户快捷登录
const loginPresetUser = async (userId: string, role: UserRole) => {
  if (!import.meta.env.DEV) return
  
  try {
    console.log(`🔄 开始登录: ${userId} (${role})`)
    
    // 先清除旧状态
    authStore.logout()
    
    // 直接从mockBackend切换用户（让它自己处理初始化）
    const response = await mockBackend.switchUser(userId, role)
    
    if (!response.success) {
      console.error('切换用户失败:', response.message)
      ElMessage.error(`登录失败: ${response.message}`)
      return
    }
    
    const user = response.data
    const token = `token_${userId}_${Date.now()}`
    
    // 更新状态
    authStore.user = user
    authStore.token = token
    
    if (role === 'patient' && user.departments) {
      authStore.departments = user.departments
    }
    
    console.log('✅ 登录成功:', user.name)
    ElMessage.success(`欢迎 ${user.name}！`)
    
    // 跳转页面
    const path = role === 'patient' ? '/patient/data' : '/doctor/data'
    router.push(path)
    
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请重试')
  }
}

// 重置所有数据
const resetAllData = async () => {
  if (!import.meta.env.DEV) return
  
  try {
    console.log('🔄 重置所有数据...')
    
    // 清除状态
    authStore.logout()
    
    // 清除localStorage
    localStorage.clear()
    
    // 重新初始化
    const response = await mockBackend.resetAllData()
    
    if (response.success) {
      ElMessage.success('数据重置成功！')
      console.log('✅ 重置完成')
    } else {
      ElMessage.error('重置失败')
    }
    
  } catch (error: any) {
    console.error('❌ 重置失败:', error)
    ElMessage.error('重置失败')
  }
}

// 查看当前用户状态
const showCurrentUser = async () => {
  if (!import.meta.env.DEV) return
  
  try {
    console.log('=== 系统状态检查 ===')
    
    // 检查localStorage
    const user = localStorage.getItem('user')
    console.log('当前用户:', user ? JSON.parse(user) : null)
    
    // 检查用户数据库
    const usersResponse = await mockBackend.getAllUsers()
    if (usersResponse.success && usersResponse.data) {
      console.log('用户数据库:')
      console.log('- 患者:', usersResponse.data.patients.map(p => `${p.id}: ${p.name}`))
      console.log('- 医生:', usersResponse.data.doctors.map(d => `${d.id}: ${d.name}`))
    } else {
      console.log('❌ 用户数据库异常:', usersResponse.message)
    }
    
    console.log('================')
    ElMessage.info('状态信息已输出到控制台，按F12查看')
    
  } catch (error: any) {
    console.error('❌ 状态检查失败:', error)
    ElMessage.error('状态检查失败')
  }
}

// 测试用户登录
const testUserLogin = async () => {
  if (!import.meta.env.DEV) return
  
  try {
    console.log('🧪 开始完整测试...')
    
    // 先检查数据库状态
    const usersResponse = await mockBackend.getAllUsers()
    if (usersResponse.success && usersResponse.data) {
      console.log('📊 数据库用户列表:')
      console.log('患者:', usersResponse.data.patients.map(p => `${p.id}: ${p.name}`))
      console.log('医生:', usersResponse.data.doctors.map(d => `${d.id}: ${d.name}`))
    }
    
    // 测试所有用户
    const testUsers = [
      { id: 'patient_cardio_001', role: 'patient', name: '张三' },
      { id: 'patient_cardio_002', role: 'patient', name: '李四' },
      { id: 'patient_respiratory_001', role: 'patient', name: '王五' },
      { id: 'patient_respiratory_002', role: 'patient', name: '赵六' },
      { id: 'doctor_cardio_001', role: 'doctor', name: '刘医生' },
      { id: 'doctor_cardio_002', role: 'doctor', name: '陈医生' },
      { id: 'doctor_respiratory_001', role: 'doctor', name: '吴医生' },
      { id: 'doctor_respiratory_002', role: 'doctor', name: '周医生' }
    ]
    
    for (const user of testUsers) {
      console.log(`🔍 测试用户: ${user.name} (${user.id})`)
      const response = await mockBackend.switchUser(user.id, user.role as any)
      if (response.success) {
        console.log(`✅ ${user.name} - 成功`)
      } else {
        console.log(`❌ ${user.name} - 失败: ${response.message}`)
      }
    }
    
    ElMessage.info('测试完成，查看控制台')
    
  } catch (error: any) {
    console.error('❌ 测试失败:', error)
    ElMessage.error('测试失败')
  }
}

// 强制初始化用户数据
const forceInitUsers = async () => {
  if (!import.meta.env.DEV) return
  
  try {
    console.log('⚡ 强制初始化所有用户数据...')
    ElMessage.info('正在强制初始化用户数据...')
    
    // 清除现有状态
    authStore.logout()
    
    // 强制重置数据
    const response = await mockBackend.resetAllData()
    
    if (response.success) {
      // 验证用户创建结果
      const usersResponse = await mockBackend.getAllUsers()
      if (usersResponse.success && usersResponse.data) {
        const { patients, doctors } = usersResponse.data
        console.log('✅ 用户初始化验证:')
        console.log(`患者用户 (${patients.length}个):`, patients.map(p => `${p.id}: ${p.name}`))
        console.log(`医生用户 (${doctors.length}个):`, doctors.map(d => `${d.id}: ${d.name}`))
        
        if (patients.length === 4 && doctors.length === 4) {
          ElMessage.success('用户数据强制初始化完成！所有8个用户已创建')
          console.log('🎉 所有用户初始化成功，现在可以正常登录了')
        } else {
          ElMessage.warning(`初始化不完整：患者${patients.length}个，医生${doctors.length}个`)
        }
      } else {
        ElMessage.error('无法验证用户数据')
      }
    } else {
      ElMessage.error('强制初始化失败')
    }
    
  } catch (error: any) {
    console.error('❌ 强制初始化失败:', error)
    ElMessage.error('强制初始化失败')
  }
}

// 紧急修复所有用户登录问题
const emergencyFix = async () => {
  if (!import.meta.env.DEV) return
  
  try {
    console.log('🚨 开始紧急修复流程...')
    ElMessage.info('紧急修复中，请稍候...')
    
    // 步骤1: 彻底清除所有数据
    console.log('🧹 步骤1: 彻底清除所有缓存数据')
    authStore.logout()
    localStorage.clear()
    console.log('✅ 所有数据已清除')
    
    // 步骤2: 强制重新初始化
    console.log('🚀 步骤2: 强制重新初始化用户数据库')
    const resetResponse = await mockBackend.resetAllData()
    console.log('重置响应:', resetResponse)
    
    // 步骤3: 验证所有用户创建
    console.log('🔍 步骤3: 验证用户创建结果')
    const usersResponse = await mockBackend.getAllUsers()
    
    if (usersResponse.success && usersResponse.data) {
      const { patients, doctors } = usersResponse.data
      console.log('📊 创建结果验证:')
      console.log(`患者用户: ${patients.length}个`)
      patients.forEach(p => console.log(`  ✓ ${p.id}: ${p.name} (${p.currentDepartment})`))
      console.log(`医生用户: ${doctors.length}个`)
      doctors.forEach(d => console.log(`  ✓ ${d.id}: ${d.name} (${d.department})`))
      
      if (patients.length === 4 && doctors.length === 4) {
        console.log('✅ 所有用户创建成功!')
        
        // 步骤4: 逐一测试每个用户
        console.log('🧪 步骤4: 测试所有用户登录功能')
        const allUsers = [
          ...patients.map(p => ({ ...p, role: 'patient' as const })),
          ...doctors.map(d => ({ ...d, role: 'doctor' as const }))
        ]
        
        let successCount = 0
        for (const user of allUsers) {
          console.log(`🔍 测试用户: ${user.name} (${user.id})`)
          try {
            const testResponse = await mockBackend.switchUser(user.id, user.role)
            if (testResponse.success) {
              console.log(`✅ ${user.name} - 登录测试成功`)
              successCount++
            } else {
              console.log(`❌ ${user.name} - 登录测试失败: ${testResponse.message}`)
            }
          } catch (error) {
            console.log(`❌ ${user.name} - 登录测试异常:`, error)
          }
        }
        
        console.log(`🎯 修复结果: ${successCount}/${allUsers.length} 用户可用`)
        
        if (successCount === 8) {
          ElMessage.success('🎉 紧急修复完成！所有8个用户都可以正常登录了')
          console.log('🎉 紧急修复完全成功，现在可以正常使用了!')
        } else {
          ElMessage.warning(`修复部分成功: ${successCount}/8 个用户可用`)
        }
      } else {
        console.error('❌ 用户创建不完整')
        ElMessage.error('用户创建不完整，修复失败')
      }
    } else {
      console.error('❌ 无法获取用户列表')
      ElMessage.error('修复失败，无法验证用户数据')
    }
    
  } catch (error: any) {
    console.error('❌ 紧急修复失败:', error)
    ElMessage.error('紧急修复失败，请尝试刷新页面')
  }
}

// 页面挂载时强制检查并初始化数据
onMounted(async () => {
  if (import.meta.env.DEV) {
    console.log('🚀 登录页面已加载，开始检查用户数据...')
    
    try {
      // 检查当前用户数据状态
      const usersResponse = await mockBackend.getAllUsers()
      
      if (!usersResponse.success || !usersResponse.data) {
        console.log('❌ 获取用户数据失败，强制初始化...')
        await mockBackend.resetAllData()
      } else {
        const { patients, doctors } = usersResponse.data
        console.log(`📊 当前用户状态: 患者${patients.length}个, 医生${doctors.length}个`)
        
        if (patients.length < 4 || doctors.length < 4) {
          console.log('⚠️ 用户数据不完整，强制重新初始化...')
          await mockBackend.resetAllData()
        } else {
          console.log('✅ 用户数据完整')
          console.log('患者列表:', patients.map(p => `${p.id}: ${p.name}`))
          console.log('医生列表:', doctors.map(d => `${d.id}: ${d.name}`))
        }
      }
      
      // 再次验证
      const finalCheck = await mockBackend.getAllUsers()
      if (finalCheck.success && finalCheck.data) {
        const { patients, doctors } = finalCheck.data
        console.log('🎯 最终验证结果:')
        console.log(`- 患者用户: ${patients.length}个`)
        console.log(`- 医生用户: ${doctors.length}个`)
        
        if (patients.length === 4 && doctors.length === 4) {
          console.log('🎉 所有用户数据已准备就绪!')
        } else {
          console.error('❌ 数据初始化仍然不完整')
        }
      }
      
    } catch (error: any) {
      console.error('❌ 页面初始化失败:', error)
    }
  }
})

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

/* 演示账户区域 */
.demo-section {
  margin-bottom: 24px;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.demo-buttons .el-button {
  flex: 1;
  font-size: 13px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #6c757d;
  transition: all 0.2s;
}

.demo-buttons .el-button:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  color: #495057;
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

.demo-category {
  margin-bottom: 20px;
  text-align: left;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 16px 0 8px 0;
}

.demo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.demo-buttons .el-button {
  font-size: 12px;
  padding: 6px 12px;
  height: auto;
  border-radius: 4px;
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
