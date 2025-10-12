// 用户角色枚举
export type UserRole = 'patient' | 'doctor'

// 用户性别枚举
export type Gender = 'male' | 'female'

// 基础用户信息接口
export interface User {
  id: string          // 用户唯一标识
  name: string        // 用户姓名
  phone: string       // 手机号
  role: UserRole      // 用户角色（patient/doctor）
  createdAt: string   // 创建时间（数据库自动生成，方便调试）
}

// 患者用户扩展信息
export interface PatientUser extends User {
  role: 'patient'
  idCard: string  // 身份证号（注册时使用，从中提取姓名、性别、出生日期）
}

// 医生用户扩展信息
export interface DoctorUser extends User {
  role: 'doctor'
  idCard: string      // 身份证号（注册时使用，验证身份）
  department: string   // 科室（注册时必填）
  hospital?: string    // 医院（可选）
}

// 登录凭证（仅保留手机号验证码登录）
export interface LoginCredentials {
  phone: string     // 手机号
  code: string      // 短信验证码
  role: UserRole    // 用户角色（patient/doctor）
}

// 注册数据基础接口（简化版：身份证号+手机号+验证码）
export interface RegisterDataBase {
  phone: string         // 手机号
  code: string          // 短信验证码
  idCard: string        // 身份证号（18位）
  role: UserRole        // 用户角色（patient/doctor）
  agreeToTerms: boolean // 是否同意服务条款
}

// 患者注册数据
export interface PatientRegisterData extends RegisterDataBase {
  role: 'patient'
}

// 医生注册数据（需要额外填写科室）
export interface DoctorRegisterData extends RegisterDataBase {
  role: 'doctor'
  department: string // 科室（必填）
}

// 联合注册数据类型
export type RegisterData = PatientRegisterData | DoctorRegisterData

// 登录响应数据
export interface LoginResponse {
  success: boolean  //是否登陆成功
  message: string   //提示消息（如"登录成功"或"手机号不存在"）
  data: {
    user: User
    token: string   //JWT Token
    refreshToken: string    //刷新Token
    expiresIn: number   //Token过期时间
  }
}

// 注册响应数据
export interface RegisterResponse {
  success: boolean  // 注册是否成功
  message: string   // 提示消息（如"注册成功"或"手机号已注册"）
  data?: {
    userId: string  // 新注册用户的ID
    phone: string   // 注册的手机号
  }
}


// JWT Token 载荷
export interface TokenPayload {
  sub: string       // 用户ID
  phone: string     // 手机号
  role: UserRole    // 用户角色
  iat: number       // 签发时间（Unix时间戳）
  exp: number       // 过期时间（Unix时间戳）
}

// 验证码相关
export interface VerificationCode {
  type: 'phone'                          // 验证码类型（固定为phone）
  phone: string                          // 手机号
  code: string                           // 验证码（6位数字）
  purpose: 'register' | 'login'          // 用途：注册或登录
}


// 授权申请相关
export interface PermissionRequest {
  id: string                                                          // 申请记录ID
  doctorId: string                                                    // 医生ID
  patientId: string                                                   // 患者ID
  requestReason: string                                               // 申请理由
  requestedPermissions: string[]                                      // 申请的权限列表
  expiresAt: string                                                   // 授权过期时间
  status: 'pending' | 'approved' | 'rejected' | 'expired'            // 状态：待审批/已批准/已拒绝/已过期
  createdAt: string                                                   // 创建时间
  updatedAt: string                                                   // 更新时间
  doctor: {
    id: string                                                        // 医生ID
    name: string                                                      // 医生姓名
    hospital: string                                                  // 医院名称
    department: string                                                // 科室
  }
  patient?: {                                                         // 患者信息（可选，隐私保护）
    id: string                                                        // 患者ID
    name: string                                                      // 患者姓名
  }
}

// 授权记录
export interface AuthorizationRecord {
  id: string                    // 授权记录ID
  doctorId: string              // 医生ID
  patientId: string             // 患者ID
  permissions: string[]         // 已授予的权限列表
  grantedAt: string             // 授权时间
  expiresAt: string             // 过期时间
  isActive: boolean             // 是否有效（未过期且未撤销）
  revokedAt?: string            // 撤销时间（可选）
  doctor: {
    id: string                  // 医生ID
    name: string                // 医生姓名
    hospital: string            // 医院名称
    department: string          // 科室
  }
}

// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean                      // 请求是否成功
  message: string                       // 提示消息
  data?: T                              // 响应数据（泛型）
  code?: number                         // 业务状态码
  errors?: Record<string, string[]>     // 验证错误信息（字段名 -> 错误列表）
}

// 分页数据
export interface PaginatedData<T> {
  items: T[]            // 当前页数据列表
  total: number         // 总记录数
  page: number          // 当前页码（从1开始）
  pageSize: number      // 每页记录数
  totalPages: number    // 总页数
}
