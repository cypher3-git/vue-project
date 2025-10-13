/**
 * 患者端相关API接口
 * 提供授权管理、文件统计等功能
 */

import request from '@/utils/request'
import type { 
  ApiResponse, 
  PaginatedData,
  PatientDepartment,
  RegisterDepartmentData,
  SwitchDepartmentData
} from '@/types/auth'
import type {
  AuthorizationRequest,
  ApproveAuthorizationData,
  RejectAuthorizationData,
  TraceIdentityData,
  TraceIdentityResponse
} from '@/types/medicalData'
import { mockService } from '@/mock/mockService'

// ==================== 已使用的API（6个）====================

/**
 * ✅ 获取收到的授权请求列表
 * 
 * @description 获取医生发起的数据访问授权请求列表，患者可以审批这些请求
 * 
 * @param params - 查询参数（可选）
 * @param params.status - 按状态筛选
 *   - 'pending': 待审批
 *   - 'approved': 已同意
 *   - 'rejected': 已拒绝
 * @param params.page - 页码（默认1）
 * @param params.pageSize - 每页数量（默认20）
 * 
 * @returns Promise<ApiResponse<PaginatedData<AuthorizationRequest>>> - 授权请求列表
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份（从token获取患者ID）
 * 2. 查询授权请求表（authorization_requests）
 * 3. 筛选条件：
 *    - patient_id = 当前患者ID
 *    - status = params.status (如果提供)
 * 4. 关联查询医生信息：
 *    - 医生姓名、医院、科室、职称
 *    - 医生认证状态
 * 5. 关联查询数据信息：
 *    - 数据名称、类型、上传时间
 * 6. 按请求时间倒序排列（待审批的优先）
 * 7. 分页处理
 * 8. 返回授权请求列表
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "查询成功",
 *   data: {
 *     data: [
 *       {
 *         id: string,              // 授权请求ID
 *         dataId: string,          // 申请访问的数据ID
 *         dataName: string,        // 数据名称
 *         dataType: string,        // 数据类型
 *         dataUploadDate: string,  // 数据上传时间
 *         doctor: {                // 申请医生信息
 *           id: string,
 *           name: string,
 *           hospital: string,
 *           department: string,
 *           title: string,
 *           isVerified: boolean    // 是否已认证
 *         },
 *         reason: string,          // 申请理由
 *         status: string,          // 审批状态
 *         requestedAt: string,     // 申请时间
 *         processedAt?: string,    // 处理时间
 *         expiresAt?: string,      // 授权过期时间（已批准时）
 *         rejectReason?: string    // 拒绝理由（已拒绝时）
 *       },
 *       // ... 更多请求
 *     ],
 *     total: number,
 *     page: number,
 *     pageSize: number
 *   }
 * }
 * 
 * @调用位置:
 * - src/views/patient/AuthorizationView.vue:352 (授权管理页面)
 * - 注释状态，需要取消注释以启用
 * 
 * @应用场景:
 * - 患者查看收到的所有授权申请
 * - 筛选待处理的授权请求
 * - 查看历史授权记录
 * 
 * @注意事项:
 * - 待审批的请求应该优先展示
 * - 已过期的授权应该有明显标识
 * - 显示医生的认证状态，帮助患者判断
 * 
 * @example
 * // 获取所有授权请求
 * const response = await getAuthorizationRequests()
 * 
 * // 只看待审批的请求
 * const response = await getAuthorizationRequests({
 *   status: 'pending',
 *   page: 1,
 *   pageSize: 10
 * })
 */
export const getAuthorizationRequests = async (params?: {
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<AuthorizationRequest>>> => {
  // TODO: 集成模拟数据支持
  return request.get('/patient/authorization-requests', { params })
}

/**
 * ✅ 同意授权申请
 * 
 * @description 患者同意医生的数据访问授权申请
 * 
 * @param approveData - 授权数据
 * @param approveData.requestId - 授权请求ID
 * @param approveData.expiresIn - 授权有效期（天数，如7、30、90）
 * @param approveData.notes - 备注信息（可选）
 * 
 * @returns Promise<ApiResponse> - 操作结果
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份和权限
 * 2. 查询授权请求记录：
 *    - 验证请求是否存在
 *    - 验证请求是否属于当前患者
 *    - 验证请求状态是否为'pending'
 * 3. 更新授权请求状态：
 *    - status = 'approved'
 *    - processedAt = 当前时间
 *    - expiresAt = 当前时间 + expiresIn天
 * 4. 创建授权记录表项（authorizations）：
 *    - 用于快速查询有效授权
 *    - 包含授权范围和权限
 * 5. 发送通知给医生：
 *    - 站内消息
 *    - 可选：短信或邮件通知
 * 6. 记录操作日志
 * 7. 返回成功响应
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "授权成功"
 * }
 * 
 * @调用位置:
 * - src/views/patient/AuthorizationView.vue:491 (授权管理页面-同意按钮)
 * - 注释状态，需要取消注释以启用
 * 
 * @应用场景:
 * - 患者审批医生的授权申请
 * - 设置授权有效期
 * - 添加授权备注
 * 
 * @错误处理:
 * - 400: 请求参数错误
 * - 403: 无权操作（不是自己的数据）
 * - 404: 授权请求不存在
 * - 409: 请求状态已变更（不是pending）
 * 
 * @注意事项:
 * - 授权一旦同意，在有效期内医生可以随时访问
 * - 患者可以随时撤销授权
 * - 授权过期后需要重新申请
 * 
 * @example
 * // 同意授权，有效期7天
 * await approveAuthorization({
 *   requestId: 'req-123',
 *   expiresIn: 7,
 *   notes: '请妥善保管我的数据'
 * })
 * 
 * // 同意授权，有效期30天
 * await approveAuthorization({
 *   requestId: 'req-456',
 *   expiresIn: 30
 * })
 */
export const approveAuthorization = async (approveData: ApproveAuthorizationData): Promise<ApiResponse> => {
  return request.post(`/patient/authorization-requests/${approveData.requestId}/approve`, {
    expiresIn: approveData.expiresIn,
    notes: approveData.notes
  })
}

/**
 * ✅ 拒绝授权申请
 * 
 * @description 患者拒绝医生的数据访问授权申请
 * 
 * @param rejectData - 拒绝数据
 * @param rejectData.requestId - 授权请求ID
 * @param rejectData.reason - 拒绝理由（必填）
 * 
 * @returns Promise<ApiResponse> - 操作结果
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份和权限
 * 2. 查询授权请求记录：
 *    - 验证请求是否存在
 *    - 验证请求是否属于当前患者
 *    - 验证请求状态是否为'pending'
 * 3. 更新授权请求状态：
 *    - status = 'rejected'
 *    - processedAt = 当前时间
 *    - rejectReason = 拒绝理由
 * 4. 发送通知给医生：
 *    - 告知授权请求被拒绝
 *    - 可选：包含拒绝理由（如果不涉及隐私）
 * 5. 记录操作日志
 * 6. 返回成功响应
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "已拒绝授权申请"
 * }
 * 
 * @调用位置:
 * - src/views/patient/AuthorizationView.vue:533 (授权管理页面-拒绝按钮)
 * - 注释状态，需要取消注释以启用
 * 
 * @应用场景:
 * - 患者拒绝医生的授权申请
 * - 说明拒绝理由（如数据敏感、不信任等）
 * 
 * @错误处理:
 * - 400: 请求参数错误（如缺少拒绝理由）
 * - 403: 无权操作
 * - 404: 授权请求不存在
 * - 409: 请求状态已变更
 * 
 * @注意事项:
 * - 拒绝理由是必填的，帮助医患沟通
 * - 拒绝后医生可以重新发起申请
 * - 多次拒绝同一医生可能需要标记异常
 * 
 * @example
 * await rejectAuthorization({
 *   requestId: 'req-789',
 *   reason: '暂时不需要就诊，谢谢'
 * })
 */
export const rejectAuthorization = async (rejectData: RejectAuthorizationData): Promise<ApiResponse> => {
  return request.post(`/patient/authorization-requests/${rejectData.requestId}/reject`, {
    reason: rejectData.reason
  })
}

/**
 * ✅ 撤销已授予的授权
 * 
 * @description 患者主动撤销之前授予医生的数据访问权限
 * 
 * @param authorizationId - 授权记录ID（不是授权请求ID）
 * 
 * @returns Promise<ApiResponse> - 操作结果
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份和权限
 * 2. 查询授权记录：
 *    - 验证授权是否存在
 *    - 验证授权是否属于当前患者
 *    - 验证授权是否处于有效状态
 * 3. 更新授权状态：
 *    - status = 'revoked'
 *    - revokedAt = 当前时间
 * 4. 清除授权缓存（如Redis中的权限缓存）
 * 5. 发送通知给医生：
 *    - 告知授权已被撤销
 *    - 之后将无法访问该数据
 * 6. 记录操作日志
 * 7. 返回成功响应
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "授权已撤销"
 * }
 * 
 * @调用位置:
 * - 可能在未来的授权管理界面中使用
 * - 或在数据详情页的授权列表中使用
 * 
 * @应用场景:
 * - 患者不再信任某医生，撤销访问权限
 * - 治疗结束后撤销授权
 * - 发现异常访问行为后立即撤销
 * 
 * @注意事项:
 * - 撤销是立即生效的
 * - 撤销后医生正在进行的访问会被终止
 * - 撤销记录会永久保留用于审计
 * - 医生需要重新申请才能再次访问
 * 
 * @example
 * await revokeAuthorization('auth-123')
 */
export const revokeAuthorization = async (authorizationId: string): Promise<ApiResponse> => {
  return request.post(`/patient/authorizations/${authorizationId}/revoke`)
}

/**
 * ✅ 身份溯源
 * 
 * @description 患者对授权请求进行身份溯源，获取医生详细信息和访问记录
 * 
 * @param data - 溯源请求数据
 * @param data.requestId - 授权请求ID
 * 
 * @returns Promise<ApiResponse<TraceIdentityResponse>> - 溯源结果
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份（从token获取患者ID）
 * 2. 查询授权请求记录：
 *    - 验证请求是否存在
 *    - 验证请求是否属于当前患者
 * 3. 获取医生详细信息：
 *    - 医生姓名、医院、科室、职称
 *    - 医生认证状态
 * 4. 查询该医生对该数据的所有访问记录：
 *    - 访问类型（查看/下载/预览）
 *    - 访问时间
 *    - IP地址等
 * 5. 统计访问信息：
 *    - 总访问次数
 *    - 最后访问时间
 * 6. 记录溯源操作日志
 * 7. 返回溯源结果
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "身份溯源成功",
 *   data: {
 *     doctor: {
 *       id: string,
 *       name: string,
 *       hospital: string,
 *       department: string,
 *       title: string,
 *       isVerified: boolean
 *     },
 *     accessRecords: [
 *       {
 *         id: string,
 *         accessType: 'view' | 'download' | 'preview',
 *         accessTime: string,
 *         ipAddress: string,
 *         duration: number,
 *         ...
 *       }
 *     ],
 *     totalAccess: number,
 *     lastAccessTime: string
 *   }
 * }
 * 
 * @应用场景:
 * - 患者在授权管理页面查看医生真实身份
 * - 了解医生对数据的访问历史
 * - 增强患者对数据访问的知情权
 * 
 * @注意事项:
 * - 每次溯源都会记录日志，用于审计
 * - 溯源成功后显示完整医生信息
 * - 访问记录按时间倒序排列
 * 
 * @example
 * const response = await traceIdentity({ requestId: 'req-123' })
 * if (response.success && response.data) {
 *   console.log('医生信息:', response.data.doctor)
 *   console.log('访问记录:', response.data.accessRecords)
 * }
 */
export const traceIdentity = async (
  data: TraceIdentityData
): Promise<ApiResponse<TraceIdentityResponse>> => {
  // 如果启用了模拟数据，返回模拟数据
  const mockResponse = await mockService.traceIdentity(data.requestId)
  if (mockResponse) return mockResponse as any
  
  return request.post('/patient/authorization-requests/trace-identity', data)
}

/**
 * ✅ 获取授权历史记录
 * 
 * @description 查询患者授权的完整历史记录，包括所有状态
 * 
 * @param params - 查询参数（可选）
 * @param params.dataId - 按数据ID筛选
 * @param params.doctorId - 按医生ID筛选
 * @param params.startDate - 开始日期
 * @param params.endDate - 结束日期
 * @param params.page - 页码
 * @param params.pageSize - 每页数量
 * 
 * @returns Promise<ApiResponse<PaginatedData<AuthorizationRequest>>> - 授权历史列表
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份
 * 2. 查询授权请求表
 * 3. 条件筛选：
 *    - patient_id = 当前患者ID
 *    - data_id = params.dataId (如果提供)
 *    - doctor_id = params.doctorId (如果提供)
 *    - requested_at BETWEEN startDate AND endDate
 * 4. 包含所有状态的记录（pending、approved、rejected、revoked）
 * 5. 关联查询医生和数据信息
 * 6. 按请求时间倒序排列
 * 7. 分页处理
 * 8. 返回历史记录列表
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "查询成功",
 *   data: {
 *     data: [
 *       {
 *         id: string,
 *         dataId: string,
 *         dataName: string,
 *         doctor: {...},
 *         status: string,          // pending/approved/rejected/revoked
 *         requestedAt: string,
 *         processedAt: string,
 *         expiresAt: string,
 *         rejectReason: string,
 *         revokedAt: string
 *       },
 *       // ... 更多记录
 *     ],
 *     total: number,
 *     page: number,
 *     pageSize: number
 *   }
 * }
 * 
 * @调用位置:
 * - 可能在授权管理页面的历史记录标签页中使用
 * 
 * @应用场景:
 * - 查看某个数据的所有授权历史
 * - 查看某个医生的授权申请历史
 * - 生成授权报告
 * - 审计和追溯
 * 
 * @example
 * // 查看所有授权历史
 * const response = await getAuthorizationHistory()
 * 
 * // 查看特定数据的授权历史
 * const response = await getAuthorizationHistory({
 *   dataId: 'data-123'
 * })
 * 
 * // 查看特定医生的申请历史
 * const response = await getAuthorizationHistory({
 *   doctorId: 'doctor-456',
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * })
 */
export const getAuthorizationHistory = async (params?: {
  dataId?: string
  doctorId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<AuthorizationRequest>>> => {
  return request.get('/patient/authorization-history', { params })
}

/**
 * ✅ 获取患者已注册的科室列表
 * 
 * @description 获取当前患者已注册的所有科室信息
 * 
 * @returns Promise<ApiResponse<PatientDepartment[]>> - 已注册科室列表
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份（从token获取患者ID）
 * 2. 查询患者科室注册表（patient_departments）
 * 3. 获取所有已注册科室
 * 4. 标记当前活跃科室
 * 5. 按注册时间排序
 * 6. 返回科室列表
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "查询成功",
 *   data: [
 *     {
 *       id: string,              // 科室注册记录ID
 *       department: string       // 科室名称
 *     },
 *     // ... 更多科室
 *   ]
 * }
 * 
 * @应用场景:
 * - 科室切换弹窗中显示可选科室列表
 * - 患者主页显示当前科室
 * 
 * @example
 * const response = await getPatientDepartments()
 * if (response.success && response.data) {
 *   const departments = response.data
 * }
 */
export const getPatientDepartments = async (): Promise<ApiResponse<PatientDepartment[]>> => {
  return request.get('/patient/departments')
}

/**
 * ✅ 患者注册新科室
 * 
 * @description 患者在已有账户基础上注册新的科室
 * 
 * @param data - 注册科室数据
 * @param data.department - 科室名称
 * 
 * @returns Promise<ApiResponse<PatientDepartment>> - 新注册的科室信息
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份（从token获取患者ID）
 * 2. 检查该科室是否已注册
 * 3. 如果未注册，创建新的科室注册记录
 * 4. 生成科室注册记录ID
 * 5. 设置注册时间
 * 6. 返回新注册的科室信息
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "科室注册成功",
 *   data: {
 *     id: string,
 *     department: string
 *   }
 * }
 * 
 * @错误处理:
 * - 400: 科室名称无效
 * - 409: 科室已注册
 * 
 * @应用场景:
 * - 用户需要在新科室就诊时注册
 * - 科室切换弹窗中的"注册新科室"功能
 * 
 * @example
 * const response = await registerNewDepartment({ department: '心血管科' })
 */
export const registerNewDepartment = async (
  data: RegisterDepartmentData
): Promise<ApiResponse<PatientDepartment>> => {
  return request.post('/patient/departments', data)
}

/**
 * ✅ 切换当前科室
 * 
 * @description 患者切换到已注册的其他科室
 * 
 * @param data - 切换科室数据
 * @param data.departmentId - 要切换到的科室记录ID
 * 
 * @returns Promise<ApiResponse> - 切换结果
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份（从token获取患者ID）
 * 2. 验证目标科室是否属于该患者
 * 3. 更新用户表的currentDepartment字段
 * 4. 返回成功响应
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "科室切换成功",
 *   data: {
 *     currentDepartment: string  // 当前科室名称
 *   }
 * }
 * 
 * @错误处理:
 * - 400: 科室ID无效
 * - 403: 科室不属于当前患者
 * - 404: 科室未找到
 * 
 * @应用场景:
 * - 用户在不同科室之间切换
 * - 根据就诊需求切换对应科室
 * 
 * @example
 * const response = await switchDepartment({ departmentId: 'dept-123' })
 */
export const switchDepartment = async (
  data: SwitchDepartmentData
): Promise<ApiResponse> => {
  return request.post('/patient/departments/switch', data)
}

// 导出所有API函数作为默认对象
export default {
  getAuthorizationRequests,
  approveAuthorization,
  rejectAuthorization,
  revokeAuthorization,
  traceIdentity,
  getAuthorizationHistory,
  getPatientDepartments,
  registerNewDepartment,
  switchDepartment
}
