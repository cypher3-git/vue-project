<template>
  <div class="register-view">
    <h2 class="form-title">创建账户</h2>
    <p class="form-subtitle">使用手机号和身份证号注册</p>
    
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="0"
      class="register-form"
      size="default"
    >
      <!-- 身份选择 -->
      <div class="role-selection">
        <el-radio-group v-model="registerForm.role" class="role-group" size="small">
          <el-radio value="patient" class="role-radio">
            <el-icon><UserFilled /></el-icon>
            患者
          </el-radio>
          <el-radio value="doctor" class="role-radio">
            <el-icon><Operation /></el-icon>
            医生
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 手机号 -->
      <el-form-item prop="phone">
        <el-input
          v-model="registerForm.phone"
          placeholder="请输入手机号"
          clearable
          class="form-input"
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 身份证号 -->
      <el-form-item prop="idCard">
        <el-input
          v-model="registerForm.idCard"
          placeholder="请输入身份证号"
          clearable
          class="form-input"
        >
          <template #prefix>
            <el-icon><CreditCard /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 短信验证码 -->
      <el-form-item prop="code">
        <el-input
          v-model="registerForm.code"
          placeholder="请输入短信验证码"
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
              @click="sendSmsCode"
            >
              <span v-if="codeCountdown > 0">{{ codeCountdown }}s后重新获取</span>
              <span v-else-if="isCodeSending">发送中...</span>
              <span v-else>获取验证码</span>
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <!-- 医生专属字段 -->
      <template v-if="registerForm.role === 'doctor'">
        <!-- 医师执业证号 -->
        <el-form-item prop="licenseNumber">
          <el-input
            v-model="registerForm.licenseNumber"
            placeholder="请输入医师执业证号"
            clearable
            class="form-input"
          >
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 医院名称 -->
        <el-form-item prop="hospital">
          <el-input
            v-model="registerForm.hospital"
            placeholder="请输入医院名称"
            clearable
            class="form-input"
          >
            <template #prefix>
              <el-icon><OfficeBuilding /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 科室 -->
        <el-form-item prop="department">
          <el-input
            v-model="registerForm.department"
            placeholder="请输入科室"
            clearable
            class="form-input"
          >
            <template #prefix>
              <el-icon><Odometer /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 职称（可选） -->
        <el-form-item prop="title">
          <el-input
            v-model="registerForm.title"
            placeholder="请输入职称（选填）"
            clearable
            class="form-input"
          >
            <template #prefix>
              <el-icon><Medal /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </template>

      <!-- 协议同意 -->
      <el-form-item prop="agreeToTerms">
        <el-checkbox v-model="registerForm.agreeToTerms" class="agreement-checkbox">
          我已阅读并同意
          <el-button type="text" @click="showTerms">《用户协议》</el-button>
          和
          <el-button type="text" @click="showPrivacy">《隐私政策》</el-button>
        </el-checkbox>
      </el-form-item>

      <!-- 注册按钮 -->
      <div class="form-actions">
        <el-button
          type="primary"
          class="register-btn"
          :loading="authStore.loading"
          @click="handleRegister"
        >
          注册
        </el-button>
        <el-button
          class="reset-btn"
          @click="resetForm"
        >
          重置
        </el-button>
      </div>
    </el-form>

    <!-- 登录链接 -->
    <div class="login-link">
      已有账号？
      <router-link to="/login" class="link">立即登录</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UserFilled, 
  Operation, 
  Phone, 
  CreditCard, 
  Key,
  Document,
  OfficeBuilding,
  Odometer,
  Medal
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import type { UserRole, PatientRegisterData, DoctorRegisterData } from '@/types/auth'
import { authApi } from '@/api'

const authStore = useAuthStore()
const router = useRouter()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 短信验证码倒计时
const codeCountdown = ref(0)
const isCodeSending = ref(false)
let countdownTimer: number | null = null

// 注册表单数据
const registerForm = reactive({
  phone: '',
  idCard: '',
  code: '',
  role: 'patient' as UserRole,
  agreeToTerms: false,
  // 医生专属字段
  licenseNumber: '',
  hospital: '',
  department: '',
  title: ''
})

// 动态表单验证规则
const registerRules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    phone: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    idCard: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      { 
        pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, 
        message: '请输入正确的身份证号', 
        trigger: 'blur' 
      }
    ],
    code: [
      { required: true, message: '请输入短信验证码', trigger: 'blur' },
      { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
    ],
    agreeToTerms: [
      {
        validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('请同意用户协议和隐私政策'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  }

  // 如果是医生角色，添加医生专属字段验证
  if (registerForm.role === 'doctor') {
    return {
      ...baseRules,
      licenseNumber: [
        { required: true, message: '请输入医师执业证号', trigger: 'blur' },
        { min: 6, message: '医师执业证号至少6位', trigger: 'blur' }
      ],
      hospital: [
        { required: true, message: '请输入医院名称', trigger: 'blur' },
        { min: 2, message: '医院名称至少2个字符', trigger: 'blur' }
      ],
      department: [
        { required: true, message: '请输入科室', trigger: 'blur' },
        { min: 2, message: '科室名称至少2个字符', trigger: 'blur' }
      ],
      title: [
        { required: false, message: '请输入职称', trigger: 'blur' }
      ]
    }
  }

  return baseRules
})

// 发送短信验证码
const sendSmsCode = async () => {
  // 验证手机号
  if (!registerForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    isCodeSending.value = true
    
    await authApi.sendVerificationCode({
      type: 'phone',
      phone: registerForm.phone,
      purpose: 'register'
    })
    
    ElMessage.success('验证码已发送，请注意查收')
    
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

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    
    // 根据角色构建注册数据
    let registerData: PatientRegisterData | DoctorRegisterData
    
    if (registerForm.role === 'patient') {
      registerData = {
        phone: registerForm.phone,
        idCard: registerForm.idCard,
        code: registerForm.code,
        role: 'patient',
        agreeToTerms: registerForm.agreeToTerms
      }
    } else {
      registerData = {
        phone: registerForm.phone,
        idCard: registerForm.idCard,
        code: registerForm.code,
        role: 'doctor',
        licenseNumber: registerForm.licenseNumber,
        hospital: registerForm.hospital,
        department: registerForm.department,
        title: registerForm.title || undefined,
        agreeToTerms: registerForm.agreeToTerms
      }
    }
    
    await authStore.register(registerData)
    
    // 注册成功，跳转到登录页
    router.push('/login')
  } catch (error: any) {
    console.error('注册失败:', error)
    // 错误消息已经在store中处理
  }
}

// 重置表单
const resetForm = () => {
  registerFormRef.value?.resetFields()
  Object.assign(registerForm, {
    phone: '',
    idCard: '',
    code: '',
    role: 'patient' as UserRole,
    agreeToTerms: false,
    licenseNumber: '',
    hospital: '',
    department: '',
    title: ''
  })
}

// 显示用户协议
const showTerms = () => {
  ElMessageBox.alert(
    '这里是用户协议的内容...',
    '用户协议',
    {
      confirmButtonText: '我知道了',
      dangerouslyUseHTMLString: true
    }
  )
}

// 显示隐私政策
const showPrivacy = () => {
  ElMessageBox.alert(
    '这里是隐私政策的内容...',
    '隐私政策',
    {
      confirmButtonText: '我知道了',
      dangerouslyUseHTMLString: true
    }
  )
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
.register-view {
  width: 100%;
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
  text-align: center;
}

.role-group {
  display: inline-flex;
  gap: 24px;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.role-radio :deep(.el-radio__label) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.role-radio :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #1890ff;
}

/* 表单样式 */
.register-form {
  width: 100%;
}

.form-input {
  margin-bottom: 16px;
}

.form-input :deep(.el-input__wrapper) {
  height: 42px;
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
  font-size: 13px;
  color: #1890ff;
  padding: 0;
  height: auto;
  min-width: 110px;
  text-align: right;
}

.code-btn:disabled {
  color: #bfbfbf;
}

/* 协议同意 */
.agreement-checkbox {
  margin: 16px 0 24px 0;
  font-size: 13px;
  color: #8c8c8c;
}

.agreement-checkbox :deep(.el-checkbox__label) {
  white-space: normal;
  line-height: 1.6;
}

.agreement-checkbox :deep(.el-button--text) {
  color: #1890ff;
  padding: 0 2px;
  font-size: 13px;
  vertical-align: baseline;
}

/* 表单按钮 */
.form-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.register-btn {
  flex: 2;
  height: 42px;
  font-size: 16px;
}

.reset-btn {
  flex: 1;
  height: 42px;
}

/* 登录链接 */
.login-link {
  text-align: center;
  font-size: 14px;
  color: #8c8c8c;
}

.link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.link:hover {
  color: #4096ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-title {
    font-size: 24px;
  }
  
  .role-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .register-btn,
  .reset-btn {
    flex: 1;
  }
}
</style>
