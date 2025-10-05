// 用户角色枚举
export type UserRole = 'patient' | 'doctor'

// 用户性别枚举
export type Gender = 'male' | 'female'

// 基础用户信息接口
export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  avatar?: string
  isActive: boolean
  isPhoneVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// 患者用户扩展信息
export interface PatientUser extends User {
  role: 'patient'
  age?: number
  gender?: Gender
  idCard?: string
  birthDate?: string
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  medicalHistory?: string[]
  allergies?: string[]
}

// 医生用户扩展信息
export interface DoctorUser extends User {
  role: 'doctor'
  licenseNumber: string
  hospital: string
  department: string
  title?: string // 职称
  specialties?: string[] // 专业领域
  experience?: number // 从业年限
  qualification?: string // 学历
  isVerified: boolean // 是否已通过医生认证
  verifiedAt?: string
}

// 登录凭证（仅保留手机号验证码登录）
export interface LoginCredentials {
  phone: string
  code: string
  role: UserRole
}

// 保留旧的类型定义以兼容性（已废弃，不再使用）
/** @deprecated 已废弃，请使用 LoginCredentials */
export interface PhoneCodeLoginCredentials extends LoginCredentials {}

/** @deprecated 已废弃，密码登录已被移除 */
export interface IdCardLoginCredentials {
  idCard: string
  password: string
  role: UserRole
  rememberMe?: boolean
}

// 注册数据基础接口（简化版：身份证号+手机号+验证码）
export interface RegisterDataBase {
  phone: string
  code: string
  idCard: string
  role: UserRole
  agreeToTerms: boolean
}

// 患者注册数据
export interface PatientRegisterData extends RegisterDataBase {
  role: 'patient'
}

// 医生注册数据
export interface DoctorRegisterData extends RegisterDataBase {
  role: 'doctor'
  licenseNumber: string
  hospital: string
  department: string
  title?: string
}

// 联合注册数据类型
export type RegisterData = PatientRegisterData | DoctorRegisterData

// 登录响应数据
export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    refreshToken: string
    expiresIn: number
  }
}

// 注册响应数据
export interface RegisterResponse {
  success: boolean
  message: string
  data?: {
    userId: string
    phone: string
  }
}

// 用户资料更新数据
export interface UpdateProfileData {
  name?: string
  phone?: string
  avatar?: string
  // 患者特有字段
  age?: number
  gender?: Gender
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  medicalHistory?: string[]
  allergies?: string[]
  // 医生特有字段
  hospital?: string
  department?: string
  title?: string
  specialties?: string[]
  experience?: number
  qualification?: string
}

// 密码修改数据（已废弃，系统不再使用密码）
/** @deprecated 已废弃，系统已移除密码功能 */
export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// JWT Token 载荷
export interface TokenPayload {
  sub: string // 用户ID
  phone: string
  role: UserRole
  iat: number // 签发时间
  exp: number // 过期时间
}

// 验证码相关
export interface VerificationCode {
  type: 'phone'
  phone: string
  code: string
  purpose: 'register' | 'login' | 'change_phone' | 'bind_phone'
}

// 重置密码数据（已废弃，系统不再使用密码）
/** @deprecated 已废弃，系统已移除密码功能 */
export interface ResetPasswordData {
  phone: string
  code: string
  newPassword: string
  confirmPassword: string
}

// 权限申请相关
export interface PermissionRequest {
  id: string
  doctorId: string
  patientId: string
  requestReason: string
  requestedPermissions: string[]
  expiresAt: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  createdAt: string
  updatedAt: string
  doctor: {
    id: string
    name: string
    hospital: string
    department: string
  }
  patient?: {
    id: string
    name: string
  }
}

// 授权记录
export interface AuthorizationRecord {
  id: string
  doctorId: string
  patientId: string
  permissions: string[]
  grantedAt: string
  expiresAt: string
  isActive: boolean
  revokedAt?: string
  doctor: {
    id: string
    name: string
    hospital: string
    department: string
  }
}

// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  code?: number
  errors?: Record<string, string[]>
}

// 分页数据
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
