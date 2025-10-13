/**
 * API统一导出文件
 * 集中导出所有API模块，便于统一管理和使用
 * 
 * 📊 API使用统计：
 * - auth: 7个API（认证相关）
 * - medicalData: 1个API（医疗数据查询）
 * - doctor: 3个API（医生端功能）
 * - patient: 6个API（患者端功能）
 */

// 导入各个API模块
import * as authApi from './auth'
import * as medicalDataApi from './medicalData'
import * as doctorApi from './doctor'
import * as patientApi from './patient'

// 统一导出
export {
  authApi,
  medicalDataApi,
  doctorApi,
  patientApi
}

// 默认导出所有API
export default {
  auth: authApi,
  medicalData: medicalDataApi,
  doctor: doctorApi,
  patient: patientApi
}

/**
 * 使用示例：
 * 
 * 方式1：命名导入（推荐）
 * import { authApi, medicalDataApi } from '@/api'
 * await authApi.login({ phone: '13800138000', code: '123456', role: 'patient' })
 * 
 * 方式2：默认导入
 * import api from '@/api'
 * await api.auth.login({ phone: '13800138000', code: '123456', role: 'patient' })
 * 
 * 方式3：直接导入单个函数
 * import { login } from '@/api/auth'
 * await login({ phone: '13800138000', code: '123456', role: 'patient' })
 */
