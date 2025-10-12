/**
 * 用户认证相关API接口
 * 为医疗数据管理系统提供完整的认证服务
 */

import request from '@/utils/request'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User,
  UpdateProfileData,
  VerificationCode,
  ApiResponse
} from '@/types/auth'

// ==================== 已使用的API（7个）====================

/**
 * ✅ 用户登录（手机号验证码登录）
 * 
 * @description 唯一的登录方式，使用手机号+验证码+角色进行身份验证
 * 
 * @param credentials - 登录凭证
 * @param credentials.phone - 手机号（11位）
 * @param credentials.code - 6位验证码
 * @param credentials.role - 用户角色（patient 或 doctor）
 * 
 * @returns Promise<LoginResponse> - 登录结果，包含用户信息和token
 * 
 * @后端处理逻辑:
 * 1. 验证手机号格式（11位数字，1开头）
 * 2. 验证验证码是否正确且未过期
 * 3. 根据手机号和角色查询用户信息
 * 4. 生成JWT token（access token + refresh token）
 * 5. 更新用户最后登录时间
 * 6. 返回用户完整信息和token
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "登录成功",
 *   data: {
 *     user: User,              // 用户基本信息
 *     token: string,           // JWT访问令牌（有效期2小时）
 *     refreshToken: string,    // 刷新令牌（有效期7天）
 *     expiresIn: 7200          // token过期时间（秒）
 *   }
 * }
 * 
 * @调用位置:
 * - src/stores/auth.ts:37
 * 
 * @example
 * const response = await login({
 *   phone: '13800138000',
 *   code: '123456',
 *   role: 'patient'
 * })
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return request.post('/auth/login', {
    phone: credentials.phone,
    code: credentials.code,
    role: credentials.role
  })
}

/**
 * ✅ 用户注册
 * 
 * @description 新用户注册接口，支持患者和医生两种角色
 * 
 * @param registerData - 注册数据
 * @param registerData.phone - 手机号（11位，用于登录）
 * @param registerData.code - 6位短信验证码
 * @param registerData.idCard - 18位身份证号（用于实名认证）
 * @param registerData.role - 用户角色（patient 或 doctor）
 * @param registerData.agreeToTerms - 是否同意用户协议（必须为true）
 * @param registerData.department - 科室名称（医生角色时必填）
 * 
 * @returns Promise<RegisterResponse> - 注册结果
 * 
 * @后端处理逻辑:
 * 1. 验证手机号和验证码的有效性
 * 2. 验证身份证号格式（18位，符合规则）
 * 3. 检查手机号是否已注册（返回409冲突）
 * 4. 检查身份证号是否已注册（返回409冲突）
 * 5. 从身份证号中提取：性别、出生日期
 * 6. 生成用户ID（UUID）
 * 7. 创建用户记录到数据库
 * 8. 如果是医生，标记为未认证状态
 * 9. 返回用户ID和手机号
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "注册成功",
 *   data: {
 *     userId: "uuid-string",    // 新创建的用户ID
 *     phone: "13800138000"      // 注册手机号
 *   }
 * }
 * 
 * @调用位置:
 * - src/stores/auth.ts:62
 * 
 * @example
 * // 患者注册
 * await register({
 *   phone: '13800138000',
 *   code: '123456',
 *   idCard: '110101199001011234',
 *   role: 'patient',
 *   agreeToTerms: true
 * })
 * 
 * // 医生注册
 * await register({
 *   phone: '13900139000',
 *   code: '654321',
 *   idCard: '110101198505055678',
 *   role: 'doctor',
 *   department: '心血管科',
 *   agreeToTerms: true
 * })
 */
export const register = async (registerData: RegisterData): Promise<RegisterResponse> => {
  return request.post('/auth/register', registerData)
}

/**
 * ✅ 用户退出登录
 * 
 * @description 退出当前用户会话，清除服务器端token
 * 
 * @returns Promise<ApiResponse> - 退出结果
 * 
 * @后端处理逻辑:
 * 1. 从请求头中获取token
 * 2. 验证token有效性
 * 3. 将token加入黑名单（Redis，过期时间=token剩余有效期）
 * 4. 清除用户会话信息
 * 5. 返回成功响应
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "退出成功"
 * }
 * 
 * @调用位置:
 * - src/stores/auth.ts:82
 * 
 * @注意事项:
 * - 前端需要额外清除本地存储的token和用户信息
 * - 即使后端请求失败，前端也应该清除本地状态
 * 
 * @example
 * await logout()
 * localStorage.removeItem('token')
 */
export const logout = async (): Promise<ApiResponse> => {
  return request.post('/auth/logout')
}

/**
 * ✅ 获取当前用户信息
 * 
 * @description 根据token获取当前登录用户的完整信息
 * 
 * @returns Promise<ApiResponse<User>> - 用户详细信息
 * 
 * @后端处理逻辑:
 * 1. 从请求头Authorization中提取token
 * 2. 验证token有效性（未过期、未在黑名单）
 * 3. 从token的payload中提取用户ID
 * 4. 查询数据库获取用户完整信息
 * 5. 根据角色返回不同的扩展信息：
 *    - 患者：包含病史、过敏史、紧急联系人等
 *    - 医生：包含医院、科室、职称、认证状态等
 * 6. 返回用户信息
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "获取成功",
 *   data: {
 *     id: string,
 *     name: string,
 *     phone: string,
 *     role: "patient" | "doctor",
 *     createdAt: string,
 *     idCard?: string,  // 身份证号（患者）
 *     department?: string,  // 科室（医生）
 *     hospital?: string  // 医院（医生）
 *   }
 * }
 * 
 * @调用位置:
 * - src/stores/auth.ts:20 (用于初始化用户信息)
 * 
 * @应用场景:
 * - 页面刷新后恢复用户状态
 * - 定期检查用户信息是否更新
 * - 验证token是否仍然有效
 * 
 * @example
 * const response = await getCurrentUser()
 * if (response.success && response.data) {
 *   setUser(response.data)
 * }
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return request.get('/auth/profile')
}

/**
 * ⚠️ 更新用户个人信息（MVP暂不支持）
 * 
 * @description 更新当前登录用户的个人资料
 * 
 * @param profileData - 要更新的个人信息（MVP阶段暂不支持此功能）
 * @returns Promise<ApiResponse<User>> - 更新后的用户信息
 * 
 * @注意: MVP阶段暂不支持此功能，后期扩展时再实现
 */
export const updateProfile = async (profileData: UpdateProfileData): Promise<ApiResponse<User>> => {
  return request.put('/auth/profile', profileData)
}

/**
 * ✅ 刷新访问令牌
 * 
 * @description 使用refresh token获取新的access token
 * 
 * @returns Promise<LoginResponse> - 新的token信息
 * 
 * @后端处理逻辑:
 * 1. 从请求中获取refresh token
 * 2. 验证refresh token的有效性
 * 3. 检查用户账户状态（是否被禁用）
 * 4. 生成新的access token
 * 5. 可选：生成新的refresh token（滚动刷新策略）
 * 6. 返回新的token
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "刷新成功",
 *   data: {
 *     user: User,
 *     token: string,           // 新的访问令牌
 *     refreshToken: string,    // 新的刷新令牌（如使用滚动刷新）
 *     expiresIn: 7200
 *   }
 * }
 * 
 * @调用位置:
 * - src/stores/auth.ts:148
 * 
 * @应用场景:
 * - access token即将过期时（如剩余30分钟）
 * - 收到401响应时自动重试
 * - 定期刷新以维持登录状态
 * 
 * @注意事项:
 * - 如果refresh token也过期，需要重新登录
 * - 建议在token过期前主动刷新，而非等到401
 * 
 * @example
 * try {
 *   const response = await refreshToken()
 *   // 更新本地token
 *   localStorage.setItem('token', response.data.token)
 * } catch (error) {
 *   // refresh token也过期，需要重新登录
 *   logout()
 *   router.push('/login')
 * }
 */
export const refreshToken = async (): Promise<LoginResponse> => {
  return request.post('/auth/refresh-token')
}

/**
 * ✅ 发送手机验证码
 * 
 * @description 向指定手机号发送验证码，用于注册、登录、修改手机号等场景
 * 
 * @param verificationData - 验证码发送信息
 * @param verificationData.type - 验证码类型（固定为'phone'）
 * @param verificationData.phone - 目标手机号（11位）
 * @param verificationData.purpose - 验证码用途
 *   - 'register': 注册
 *   - 'login': 登录
 *   - 'change_phone': 更换手机号
 *   - 'bind_phone': 绑定手机号
 * 
 * @returns Promise<ApiResponse> - 发送结果
 * 
 * @后端处理逻辑:
 * 1. 验证手机号格式（11位，1开头）
 * 2. 根据purpose进行业务校验：
 *    - register: 检查手机号是否已注册
 *    - login: 检查手机号是否已注册
 *    - change_phone: 验证当前用户身份
 * 3. 检查发送频率限制：
 *    - 同一手机号60秒内只能发送一次
 *    - 同一IP每小时最多发送10次
 *    - 同一手机号每天最多发送5次
 * 4. 生成6位随机数字验证码
 * 5. 存储到Redis：
 *    - key: `sms:${phone}:${purpose}`
 *    - value: 验证码
 *    - 过期时间: 5分钟
 * 6. 调用短信服务商API发送验证码
 * 7. 记录发送日志
 * 8. 返回成功响应
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "验证码已发送，5分钟内有效"
 * }
 * 
 * @调用位置:
 * - src/views/auth/LoginView.vue:185 (登录页面)
 * - src/views/auth/RegisterView.vue:276 (注册页面)
 * 
 * @错误处理:
 * - 400: 手机号格式错误
 * - 429: 发送过于频繁
 * - 409: 手机号已注册（register时）/ 手机号未注册（login时）
 * - 500: 短信服务异常
 * 
 * @注意事项:
 * - 生产环境需要接入真实的短信服务商（阿里云、腾讯云等）
 * - 开发环境可以将验证码打印到控制台
 * - 需要做好防刷机制，避免短信轰炸
 * 
 * @example
 * // 注册时发送验证码
 * await sendVerificationCode({
 *   type: 'phone',
 *   phone: '13800138000',
 *   purpose: 'register'
 * })
 * 
 * // 登录时发送验证码
 * await sendVerificationCode({
 *   type: 'phone',
 *   phone: '13800138000',
 *   purpose: 'login'
 * })
 */
export const sendVerificationCode = async (
  verificationData: Omit<VerificationCode, 'code'>
): Promise<ApiResponse> => {
  return request.post('/auth/send-verification-code', verificationData)
}

// 导出所有API函数作为默认对象
export default {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  refreshToken,
  sendVerificationCode
}
