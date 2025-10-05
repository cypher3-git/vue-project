/**
 * 用户认证相关API接口
 * 为医疗数据管理系统提供完整的认证服务
 */

import request from '@/utils/request'
import type {
  LoginCredentials,
  IdCardLoginCredentials,
  PhoneCodeLoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User,
  ChangePasswordData,
  ResetPasswordData,
  UpdateProfileData,
  VerificationCode,
  ApiResponse
} from '@/types/auth'

/**
 * 用户登录（手机号验证码登录 - 唯一登录方式）
 * @param credentials 登录凭证（手机号 + 验证码 + 角色）
 * @returns 登录结果（用户信息 + token）
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return request.post('/auth/login', {
    phone: credentials.phone,
    code: credentials.code,
    role: credentials.role
  })
}

/**
 * 身份证号登录（已废弃）
 * @deprecated 已废弃，请使用 login() 方法
 */
export const loginWithIdCard = async (credentials: IdCardLoginCredentials): Promise<LoginResponse> => {
  throw new Error('密码登录已被移除，请使用手机验证码登录')
}

/**
 * 手机号验证码登录（已废弃，请直接使用 login）
 * @deprecated 已废弃，请使用 login() 方法
 */
export const loginWithPhoneCode = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return login(credentials)
}

/**
 * 用户注册
 * @param registerData 注册数据（患者或医生信息）
 * @returns 注册结果
 */
export const register = async (registerData: RegisterData): Promise<RegisterResponse> => {
  return request.post('/auth/register', registerData)
}

/**
 * 用户退出登录
 * @returns 退出结果
 */
export const logout = async (): Promise<ApiResponse> => {
  return request.post('/auth/logout')
}

/**
 * 刷新访问令牌
 * @returns 新的访问令牌
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  return request.post('/auth/refresh-token')
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return request.get('/auth/profile')
}

/**
 * 更新用户个人信息
 * @param profileData 要更新的个人信息
 * @returns 更新结果
 */
export const updateProfile = async (profileData: UpdateProfileData): Promise<ApiResponse<User>> => {
  return request.put('/auth/profile', profileData)
}

/**
 * 修改密码（已废弃）
 * @deprecated 系统已移除密码功能
 */
export const changePassword = async (passwordData: ChangePasswordData): Promise<ApiResponse> => {
  throw new Error('系统已移除密码功能，使用手机验证码登录')
}

/**
 * 发送验证码
 * @param verificationData 验证码发送信息
 * @returns 发送结果
 */
export const sendVerificationCode = async (
  verificationData: Omit<VerificationCode, 'code'>
): Promise<ApiResponse> => {
  return request.post('/auth/send-verification-code', verificationData)
}

/**
 * 验证验证码
 * @param verificationData 验证码验证信息
 * @returns 验证结果
 */
export const verifyCode = async (verificationData: VerificationCode): Promise<ApiResponse> => {
  return request.post('/auth/verify-code', verificationData)
}

/**
 * 重置密码（已废弃）
 * @deprecated 系统已移除密码功能
 */
export const sendResetPasswordSms = async (phone: string): Promise<ApiResponse> => {
  throw new Error('系统已移除密码功能')
}

/**
 * 通过重置码重置密码（已废弃）
 * @deprecated 系统已移除密码功能
 */
export const resetPassword = async (resetData: ResetPasswordData): Promise<ApiResponse> => {
  throw new Error('系统已移除密码功能')
}



/**
 * 绑定手机号
 * @param phone 手机号码
 * @param code 验证码
 * @returns 绑定结果
 */
export const bindPhone = async (phone: string, code: string): Promise<ApiResponse> => {
  return request.post('/auth/bind-phone', { phone, code })
}

/**
 * 解绑手机号
 * @param code 验证码
 * @returns 解绑结果
 */
export const unbindPhone = async (code: string): Promise<ApiResponse> => {
  return request.post('/auth/unbind-phone', { code })
}

/**
 * 获取医生认证状态
 * @returns 医生认证信息
 */
export const getDoctorVerificationStatus = async (): Promise<ApiResponse> => {
  return request.get('/auth/doctor-verification-status')
}

/**
 * 提交医生认证材料
 * @param verificationData 认证材料
 * @returns 提交结果
 */
export const submitDoctorVerification = async (verificationData: {
  licenseImage: File
  hospitalCertificate: File
  idCardImage: File
  additionalDocuments?: File[]
}): Promise<ApiResponse> => {
  const formData = new FormData()
  formData.append('licenseImage', verificationData.licenseImage)
  formData.append('hospitalCertificate', verificationData.hospitalCertificate)
  formData.append('idCardImage', verificationData.idCardImage)
  
  if (verificationData.additionalDocuments) {
    verificationData.additionalDocuments.forEach((file, index) => {
      formData.append(`additionalDocument_${index}`, file)
    })
  }
  
  return request.post('/auth/submit-doctor-verification', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 检查用户名是否可用
 * @param username 用户名
 * @returns 可用性检查结果
 */
export const checkUsernameAvailability = async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
  return request.get(`/auth/check-username/${encodeURIComponent(username)}`)
}


/**
 * 检查手机号是否已注册
 * @param phone 手机号码
 * @returns 注册状态检查结果
 */
export const checkPhoneExists = async (phone: string): Promise<ApiResponse<{ exists: boolean }>> => {
  return request.get(`/auth/check-phone/${encodeURIComponent(phone)}`)
}

/**
 * 获取用户会话信息
 * @returns 会话信息
 */
export const getSessionInfo = async (): Promise<ApiResponse<{
  loginTime: string
  lastActiveTime: string
  ipAddress: string
  userAgent: string
  expiresAt: string
}>> => {
  return request.get('/auth/session-info')
}

/**
 * 注销所有设备的会话
 * @returns 注销结果
 */
export const logoutAllDevices = async (): Promise<ApiResponse> => {
  return request.post('/auth/logout-all-devices')
}

// 导出所有API函数作为默认对象
export default {
  login,
  loginWithIdCard,
  loginWithPhoneCode,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  sendVerificationCode,
  verifyCode,
  sendResetPasswordSms,
  resetPassword,
  bindPhone,
  unbindPhone,
  getDoctorVerificationStatus,
  submitDoctorVerification,
  checkUsernameAvailability,
  checkPhoneExists,
  getSessionInfo,
  logoutAllDevices
}

