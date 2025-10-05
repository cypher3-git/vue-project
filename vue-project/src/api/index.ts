/**
 * API统一导出文件
 * 集中导出所有API模块，便于统一管理和使用
 */

// 导入各个API模块
import * as authApi from './auth'
import * as medicalDataApi from './medicalData'
import * as shareApi from './share'
import * as accessApi from './access'
import * as doctorApi from './doctor'
import * as patientApi from './patient'

// 统一导出
export {
  authApi,
  medicalDataApi,
  shareApi,
  accessApi,
  doctorApi,
  patientApi
}

// 默认导出所有API
export default {
  auth: authApi,
  medicalData: medicalDataApi,
  share: shareApi,
  access: accessApi,
  doctor: doctorApi,
  patient: patientApi
}

/**
 * 使用示例：
 * 
 * 方式1：命名导入
 * import { authApi, medicalDataApi } from '@/api'
 * authApi.login({ phone: '13800138000', password: '123456', role: 'patient' })
 * 
 * 方式2：默认导入
 * import api from '@/api'
 * api.auth.login({ phone: '13800138000', password: '123456', role: 'patient' })
 * 
 * 方式3：直接导入单个模块
 * import { login } from '@/api/auth'
 * login({ phone: '13800138000', password: '123456', role: 'patient' })
 */

