/**
 * 医生端相关API接口
 * 提供数据管理、统计、访问历史等功能
 */

import request from '@/utils/request'
import type { ApiResponse, PaginatedData } from '@/types/auth'
import type { 
  MedicalFile,
  AccessRecord,
  DoctorTracePatientRequest,
  DoctorTracePatientResponse
} from '@/types/medicalData'

// ==================== 已使用的API（4个）====================

/**
 * ✅ 获取医生端可访问的医疗数据列表
 * 
 * @description 获取医生可以查看的所有患者医疗数据，根据授权状态展示不同信息
 * 
 * @param params - 查询参数（可选）
 * @param params.dataType - 数据类型筛选
 *   - '检验报告'
 *   - '影像资料'
 *   - '病历记录'
 *   - '体检报告'
 *   - '用药记录'
 * @param params.authStatus - 授权状态筛选
 *   - 'not-requested': 未申请授权
 *   - 'pending': 待患者审批
 *   - 'authorized': 已授权可访问
 *   - 'rejected': 患者已拒绝
 * @param params.keyword - 搜索关键词（仅搜索数据名称，不包括患者信息）
 * @param params.dateRange - 日期范围 [开始日期, 结束日期]
 * @param params.page - 页码（默认1）
 * @param params.pageSize - 每页数量（默认20）
 * 
 * @returns Promise<ApiResponse<PaginatedData<MedicalFile>>> - 医疗数据列表
 * 
 * @后端处理逻辑:
 * 1. 验证医生身份（从token获取医生ID）
 * 2. 查询医疗数据表
 * 3. 根据授权状态决定数据可见性：
 *    - 'not-requested': 显示数据基本信息（数据名称、类型、上传时间、ID）
 *                      隐藏患者信息（显示为"需授权后可见"）
 *    - 'pending': 显示数据基本信息，隐藏患者信息
 *    - 'authorized': 显示完整信息（包括患者姓名、性别、年龄等）
 *    - 'rejected': 显示数据基本信息，隐藏患者信息
 * 4. 应用筛选条件：
 *    - 数据类型筛选
 *    - 关键词搜索（仅搜索数据名称）
 *    - 日期范围筛选
 * 5. 分页处理
 * 6. 返回数据列表
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "查询成功",
 *   data: {
 *     data: [
 *       {
 *         id: string,              // 数据ID
 *         name: string,            // 数据名称
 *         category: string,        // 数据类型
 *         uploadedAt: string,      // 上传时间
 *         authStatus: string,      // 授权状态
 *         fileSize: string,        // 文件大小
 *         // 以下字段仅在 authStatus = 'authorized' 时显示
 *         patientName?: string,    // 所属患者姓名
 *         patientGender?: string,  // 患者性别
 *         patientAge?: number      // 患者年龄
 *       },
 *       // ... 更多数据
 *     ],
 *     total: number,
 *     page: number,
 *     pageSize: number
 *   }
 * }
 * 
 * @调用位置:
 * - src/views/doctor/DataManagementView.vue (数据管理页面)
 * 
 * @权限设计说明:
 * - 未授权数据：医生可以看到数据存在，但看不到所属患者，需先发起授权申请
 * - 待审批数据：医生已发起授权申请，等待患者审批
 * - 已授权数据：医生可以查看完整信息，包括患者详情和数据内容
 * - 已拒绝数据：患者拒绝了授权，医生可以重新申请
 * 
 * @应用场景:
 * - 医生查看可访问的所有患者数据
 * - 按数据类型筛选（如只看影像资料）
 * - 按授权状态筛选（如查看待审批的申请）
 * - 搜索特定的数据文件
 * 
 * @注意事项:
 * - 搜索功能不包括患者姓名，保护未授权数据的隐私
 * - 只有授权状态为'authorized'时才能查看数据详情
 * - 需要记录医生的每次数据访问行为
 * 
 * @example
 * // 获取所有可访问数据
 * const response = await getMedicalDataList()
 * 
 * // 查看待审批的授权申请
 * const response = await getMedicalDataList({
 *   authStatus: 'pending'
 * })
 * 
 * // 筛选已授权的影像资料
 * const response = await getMedicalDataList({
 *   dataType: '影像资料',
 *   authStatus: 'authorized',
 *   page: 1,
 *   pageSize: 10
 * })
 */
export const getMedicalDataList = async (params?: {
  dataType?: string
  authStatus?: string
  keyword?: string
  dateRange?: string[]
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<MedicalFile>>> => {
  return request.get('/doctor/medical-data', { params })
}

/**
 * ✅ 获取医生的数据访问历史
 * 
 * @description 查询医生访问患者数据的完整历史记录
 * 
 * @param params - 查询参数（可选）
 * @param params.patientId - 按患者ID筛选（已授权患者）
 * @param params.fileId - 按文件ID筛选
 * @param params.startDate - 开始日期（YYYY-MM-DD）
 * @param params.endDate - 结束日期（YYYY-MM-DD）
 * @param params.page - 页码
 * @param params.pageSize - 每页数量
 * 
 * @returns Promise<ApiResponse<PaginatedData<AccessRecord>>> - 访问记录列表
 * 
 * @后端处理逻辑:
 * 1. 验证医生身份（从token获取医生ID）
 * 2. 查询访问记录表（access_records）
 * 3. 条件筛选：
 *    - doctor_id = 当前医生ID
 *    - patient_id = params.patientId (如果提供)
 *    - file_id = params.fileId (如果提供)
 *    - accessed_at BETWEEN startDate AND endDate
 * 4. 关联查询：
 *    - 患者信息（姓名、性别）
 *    - 文件信息（名称、类型）
 * 5. 按访问时间倒序排列
 * 6. 分页处理
 * 7. 返回访问记录列表
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "查询成功",
 *   data: {
 *     data: [
 *       {
 *         id: string,              // 访问记录ID
 *         doctorId: string,        // 医生ID
 *         doctorName: string,      // 医生姓名
 *         patientId: string,       // 患者ID
 *         patientName: string,     // 患者姓名
 *         fileId: string,          // 文件ID
 *         fileName: string,        // 文件名称
 *         fileCategory: string,    // 文件类型
 *         accessType: string,      // 访问类型（view/download/preview）
 *         accessedAt: string,      // 访问时间
 *         duration: number,        // 访问时长（秒）
 *         ipAddress: string        // 访问IP地址
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
 * - src/views/doctor/DataManagementView.vue (可能在访问历史查看功能中)
 * 
 * @应用场景:
 * - 医生查看自己的数据访问历史
 * - 追溯特定患者的数据访问记录
 * - 生成访问报告和统计
 * - 审计和合规检查
 * 
 * @隐私保护:
 * - 只能查询医生自己的访问记录
 * - 不能查询其他医生的访问记录
 * - 访问记录不可删除或修改（审计日志）
 * 
 * @数据保留:
 * - 访问记录至少保留1年
 * - 用于合规审计和纠纷处理
 * - 超过保留期后可以归档到冷存储
 * 
 * @example
 * // 查看所有访问历史
 * const response = await getAccessHistory()
 * 
 * // 查看特定患者的访问记录
 * const response = await getAccessHistory({
 *   patientId: 'patient-123',
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * })
 * 
 * // 查看特定文件的访问历史
 * const response = await getAccessHistory({
 *   fileId: 'file-456',
 *   page: 1,
 *   pageSize: 20
 * })
 */
export const getAccessHistory = async (params?: {
  patientId?: string
  fileId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<AccessRecord>>> => {
  return request.get('/doctor/access-history', { params })
}

/**
 * ✅ 医生端患者身份溯源
 * 
 * @description 医生对已授权的医疗数据进行患者身份溯源，获取患者详细信息
 * 
 * @param dataId - 医疗数据ID
 * 
 * @returns Promise<ApiResponse<DoctorTracePatientResponse>> - 溯源结果
 * 
 * @后端处理逻辑:
 * 1. 验证医生身份（从token获取医生ID）
 * 2. 查询医疗数据记录：
 *    - 验证数据是否存在
 *    - 验证数据对该医生的授权状态是否为'authorized'
 * 3. 检查授权是否有效：
 *    - 检查授权是否过期
 *    - 检查授权是否被撤销
 * 4. 获取患者详细信息：
 *    - 患者姓名、性别、年龄
 *    - 患者联系电话（脱敏处理）
 *    - 患者身份证号（脱敏处理）
 *    - 患者注册科室
 * 5. 记录溯源操作日志（审计用）
 * 6. 返回患者信息和数据信息
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "患者身份溯源成功",
 *   data: {
 *     patient: {
 *       id: string,
 *       name: string,
 *       gender: string,
 *       age: number,
 *       phone: string,              // 脱敏：138****5678
 *       idCard: string,             // 脱敏：320***********1234
 *       registeredDepartment: string
 *     },
 *     dataInfo: {
 *       id: string,
 *       name: string,
 *       type: string,
 *       uploadDate: string
 *     },
 *     traceTime: string             // 溯源时间
 *   }
 * }
 * 
 * @调用位置:
 * - src/views/doctor/DataManagementView.vue (数据详情弹窗-身份溯源按钮)
 * 
 * @应用场景:
 * - 医生在已授权情况下，需要知道数据所属患者的身份信息
 * - 用于诊断、会诊等医疗场景
 * - 保护患者隐私，只有授权后才能溯源
 * 
 * @错误处理:
 * - 400: 请求参数错误
 * - 403: 无权溯源（未授权或授权已过期）
 * - 404: 数据不存在
 * 
 * @隐私保护:
 * - 只能溯源已授权的数据
 * - 敏感信息（电话、身份证）进行脱敏处理
 * - 每次溯源都会记录日志，便于审计
 * - 患者可以查看谁对其数据进行了溯源
 * 
 * @注意事项:
 * - 溯源操作会被记录到访问日志
 * - 频繁溯源可能触发安全审计
 * - 授权过期后无法溯源
 * 
 * @example
 * // 对某个数据进行患者身份溯源
 * const response = await tracePatientIdentity('data-123')
 * if (response.success && response.data) {
 *   console.log('患者信息:', response.data.patient)
 *   console.log('溯源时间:', response.data.traceTime)
 * }
 */
export const tracePatientIdentity = async (
  dataId: string
): Promise<ApiResponse<DoctorTracePatientResponse>> => {
  return request.post(`/doctor/medical-data/${dataId}/trace-patient`)
}

/**
 * ✅ 医生端简化患者身份溯源
 * 
 * @description 医生端简化的患者身份溯源，仅切换前端显示状态
 * @param dataId 数据ID 
 * @returns Promise<ApiResponse>
 * 
 * @example
 * ```typescript
 * const response = await revealPatientIdentity('file_001')
 * if (response.success) {
 *   // 前端切换显示真实患者信息
 * }
 * ```
 */
export const revealPatientIdentity = async (
  dataId: string
): Promise<ApiResponse> => {
  return request.post(`/doctor/medical-data/${dataId}/reveal-patient`)
}

/**
 * ✅ 医生发起授权请求
 * 
 * @description 医生对患者的医疗数据发起访问授权请求
 * 
 * @param dataId - 医疗数据ID
 * @param reason - 申请理由
 * 
 * @returns Promise<ApiResponse> - 申请结果
 * 
 * @example
 * const response = await requestAuthorization('file-123', '需要查看患者病历以便诊断')
 */
export const requestAuthorization = async (
  dataId: string,
  reason: string
): Promise<ApiResponse> => {
  return request.post(`/doctor/medical-data/${dataId}/request-authorization`, { reason })
}

/**
 * ✅ 医生查看医疗数据
 * 
 * @description 医生查看已授权的医疗数据，并记录访问日志
 * 
 * @param dataId - 医疗数据ID
 * 
 * @returns Promise<ApiResponse<MedicalFile>> - 医疗数据详情
 * 
 * @example
 * const response = await viewMedicalData('file-123')
 */
export const viewMedicalData = async (
  dataId: string
): Promise<ApiResponse<MedicalFile>> => {
  return request.post(`/doctor/medical-data/${dataId}/view`)
}

// 导出所有API函数作为默认对象
export default {
  getMedicalDataList,
  getAccessHistory,
  tracePatientIdentity,
  revealPatientIdentity,
  requestAuthorization,
  viewMedicalData
}
