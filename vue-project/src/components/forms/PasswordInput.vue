<!--
  密码输入组件
  为中老年用户优化的密码输入体验
-->
<template>
  <div class="password-input">
    <el-input
      :model-value="modelValue"
      type="password"
      :placeholder="placeholder"
      :show-password="showPasswordToggle"
      :clearable="clearable"
      :size="size"
      :disabled="disabled"
      class="password-field"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    
    <!-- 密码强度指示器 -->
    <div v-if="showStrengthIndicator && modelValue" class="strength-indicator">
      <div class="strength-bar">
        <div 
          class="strength-fill"
          :class="strengthClass"
          :style="{ width: strengthPercentage + '%' }"
        />
      </div>
      <div class="strength-text" :class="strengthClass">
        {{ strengthText }}
      </div>
    </div>
    
    <!-- 密码提示 -->
    <div v-if="showHints && focused" class="password-hints">
      <div class="hint-title">密码要求：</div>
      <ul class="hint-list">
        <li :class="{ valid: hasMinLength }">
          <el-icon><Check v-if="hasMinLength" /><Close v-else /></el-icon>
          至少8位字符
        </li>
        <li :class="{ valid: hasLetter }">
          <el-icon><Check v-if="hasLetter" /><Close v-else /></el-icon>
          包含字母
        </li>
        <li :class="{ valid: hasNumber }">
          <el-icon><Check v-if="hasNumber" /><Close v-else /></el-icon>
          包含数字
        </li>
        <li v-if="requireSpecialChar" :class="{ valid: hasSpecialChar }">
          <el-icon><Check v-if="hasSpecialChar" /><Close v-else /></el-icon>
          包含特殊字符
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'

interface Props {
  modelValue: string
  placeholder?: string
  showPasswordToggle?: boolean
  showStrengthIndicator?: boolean
  showHints?: boolean
  clearable?: boolean
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  requireSpecialChar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入密码',
  showPasswordToggle: true,
  showStrengthIndicator: true,
  showHints: true,
  clearable: true,
  size: 'large',
  disabled: false,
  requireSpecialChar: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const focused = ref(false)

// 密码验证规则
const hasMinLength = computed(() => props.modelValue.length >= 8)
const hasLetter = computed(() => /[a-zA-Z]/.test(props.modelValue))
const hasNumber = computed(() => /\d/.test(props.modelValue))
const hasSpecialChar = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(props.modelValue))

// 密码强度计算
const strengthScore = computed(() => {
  let score = 0
  if (hasMinLength.value) score += 1
  if (hasLetter.value) score += 1
  if (hasNumber.value) score += 1
  if (hasSpecialChar.value) score += 1
  
  // 长度奖励
  if (props.modelValue.length >= 12) score += 1
  
  return Math.min(score, 5)
})

const strengthPercentage = computed(() => (strengthScore.value / 5) * 100)

const strengthClass = computed(() => {
  if (strengthScore.value <= 2) return 'weak'
  if (strengthScore.value <= 3) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  if (strengthScore.value <= 1) return '弱'
  if (strengthScore.value <= 2) return '一般'
  if (strengthScore.value <= 3) return '中等'
  if (strengthScore.value <= 4) return '强'
  return '很强'
})

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}
</script>

<style scoped>
.password-input {
  width: 100%;
}

.password-field :deep(.el-input__wrapper) {
  min-height: 48px;
  font-size: 16px;
}

/* 密码强度指示器 */
.strength-indicator {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #f56c6c;
}

.strength-fill.medium {
  background: #e6a23c;
}

.strength-fill.strong {
  background: #67c23a;
}

.strength-text {
  font-size: 14px;
  font-weight: 500;
  min-width: 32px;
  text-align: center;
}

.strength-text.weak {
  color: #f56c6c;
}

.strength-text.medium {
  color: #e6a23c;
}

.strength-text.strong {
  color: #67c23a;
}

/* 密码提示 */
.password-hints {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.hint-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.hint-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  transition: color 0.3s ease;
}

.hint-list li.valid {
  color: #67c23a;
}

.hint-list li :deep(.el-icon) {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .password-hints {
    padding: 10px;
  }
  
  .hint-list {
    gap: 6px;
  }
  
  .hint-list li {
    font-size: 13px;
  }
}
</style>

