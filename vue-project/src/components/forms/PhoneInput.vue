<!--
  手机号输入组件
  专为中国手机号码格式优化
-->
<template>
  <div class="phone-input">
    <el-input
      :model-value="formattedPhoneValue"
      :placeholder="props.placeholder"
      :clearable="props.clearable"
      :size="props.size"
      :disabled="props.disabled"
      :maxlength="13"
      class="phone-field"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <template #prefix>
        <span class="country-code">+86</span>
      </template>
      <template #suffix v-if="props.showValidation && props.modelValue">
        <el-icon v-if="isPhoneValid" class="validation-icon valid">
          <Check />
        </el-icon>
        <el-icon v-else class="validation-icon invalid">
          <Close />
        </el-icon>
      </template>
    </el-input>
    
    <!-- 发送验证码按钮 -->
    <div v-if="props.showVerificationButton" class="verification-section">
      <el-button
        :disabled="!isPhoneValid || countdownSeconds > 0 || isSendingCode"
        :loading="isSendingCode"
        @click="handleSendCode"
        class="send-code-btn"
      >
        <span v-if="countdownSeconds > 0">{{ countdownSeconds }}秒后重发</span>
        <span v-else-if="isSendingCode">发送中...</span>
        <span v-else>发送验证码</span>
      </el-button>
    </div>

    <!-- 验证码输入 -->
    <div v-if="props.showCodeInput && isCodeSent" class="code-input-section">
      <el-input
        v-model="codeValue"
        placeholder="请输入6位验证码"
        :maxlength="6"
        clearable
        class="code-input"
        @input="handleCodeInput"
      >
        <template #prefix>
          <el-icon><Message /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="error-message">
      <el-icon><WarningFilled /></el-icon>
      {{ errorMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check, Close, Message, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue: string
  placeholder?: string
  clearable?: boolean
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  showValidation?: boolean
  showVerificationButton?: boolean
  showCodeInput?: boolean
  autoFormat?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入手机号码',
  clearable: true,
  size: 'large',
  disabled: false,
  showValidation: true,
  showVerificationButton: false,
  showCodeInput: false,
  autoFormat: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'code-input': [code: string]
  'send-code': [phone: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

// 状态变量
const codeValue = ref('')
const countdownSeconds = ref(0)
const isSendingCode = ref(false)
const isCodeSent = ref(false)
const errorMsg = ref('')

// 中国手机号验证正则
const phoneRegex = /^1[3-9]\d{9}$/

// 验证手机号是否有效
const isPhoneValid = computed(() => {
  const cleanPhone = props.modelValue.replace(/\D/g, '')
  return phoneRegex.test(cleanPhone)
})

// 格式化显示的手机号
const formattedPhoneValue = computed(() => {
  if (!props.autoFormat || !props.modelValue) return props.modelValue
  
  const digits = props.modelValue.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`
})

// 处理输入
const handleInput = (value: string) => {
  // 只保留数字
  const cleanValue = value.replace(/\D/g, '')
  
  // 限制长度为11位
  const limitedValue = cleanValue.slice(0, 11)
  
  // 验证手机号格式
  if (limitedValue && !limitedValue.startsWith('1')) {
    errorMsg.value = '手机号必须以1开头'
  } else if (limitedValue.length > 0 && limitedValue.length < 11) {
    errorMsg.value = '请输入完整的11位手机号'
  } else if (limitedValue.length === 11 && !phoneRegex.test(limitedValue)) {
    errorMsg.value = '请输入正确的手机号码'
  } else {
    errorMsg.value = ''
  }
  
  emit('update:modelValue', limitedValue)
}

// 处理验证码输入
const handleCodeInput = (code: string) => {
  // 只保留数字，限制6位
  const cleanCode = code.replace(/\D/g, '').slice(0, 6)
  codeValue.value = cleanCode
  emit('code-input', cleanCode)
}

// 发送验证码
const handleSendCode = async () => {
  if (!isPhoneValid.value) {
    ElMessage.error('请输入正确的手机号码')
    return
  }
  
  isSendingCode.value = true
  errorMsg.value = ''
  
  try {
    emit('send-code', props.modelValue.replace(/\D/g, ''))
    
    // 模拟发送过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    isCodeSent.value = true
    startCountdown()
    ElMessage.success('验证码已发送，请查收短信')
  } catch (error: any) {
    errorMsg.value = error.message || '发送验证码失败，请重试'
    ElMessage.error(errorMsg.value)
  } finally {
    isSendingCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdownSeconds.value = 60
  const timer = setInterval(() => {
    countdownSeconds.value--
    if (countdownSeconds.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

// 重置状态
const resetState = () => {
  codeValue.value = ''
  isCodeSent.value = false
  countdownSeconds.value = 0
  isSendingCode.value = false
  errorMsg.value = ''
}

// 监听手机号变化，重置验证码状态
watch(() => props.modelValue, () => {
  if (isCodeSent.value) {
    resetState()
  }
})

// 暴露方法给父组件
defineExpose({
  resetState,
  isValid: isPhoneValid
})
</script>

<style scoped>
.phone-input {
  width: 100%;
}

.phone-field :deep(.el-input__wrapper) {
  min-height: 48px;
  font-size: 16px;
}

.country-code {
  color: #909399;
  font-size: 14px;
  font-weight: 500;
  margin-right: 8px;
}

.validation-icon {
  font-size: 16px;
}

.validation-icon.valid {
  color: #67c23a;
}

.validation-icon.invalid {
  color: #f56c6c;
}

/* 验证码发送区域 */
.verification-section {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.send-code-btn {
  min-width: 120px;
  height: 40px;
}

/* 验证码输入区域 */
.code-input-section {
  margin-top: 12px;
}

.code-input :deep(.el-input__wrapper) {
  min-height: 44px;
}

/* 错误信息 */
.error-message {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f56c6c;
  font-size: 14px;
}

.error-message :deep(.el-icon) {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .verification-section {
    justify-content: center;
  }
  
  .send-code-btn {
    width: 100%;
  }
}
</style>
