/**
 * 表单组件导出文件
 * 统一管理所有表单相关组件
 */

export { default as PasswordInput } from './PasswordInput.vue'
export { default as PhoneInput } from './PhoneInput.vue'

// 表单组件类型定义
export interface FormComponentProps {
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  clearable?: boolean
}

// 验证状态类型
export type ValidationStatus = 'success' | 'error' | 'validating' | ''

// 表单项配置类型
export interface FormItemConfig {
  label: string
  prop: string
  required?: boolean
  rules?: any[]
  component?: string
  componentProps?: Record<string, any>
  placeholder?: string
  help?: string
}

