/**
 * 医生端相关API接口
 * 提供数据管理、统计、访问历史等功能
 */

import request from '@/utils/request'
import type { ApiResponse, PaginatedData } from '@/types/auth'
import type { 
  MedicalFile,
  AccessRecord 
} from '@/types/medicalData'
import { mockService } from '@/mock/mockService'

// ==================== 已使用的API（3个）====================

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
 * - 通过 mockService.getDoctorAccessibleData() 调用（演示账户使用模拟数据）
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
  // 如果启用了模拟数据，返回模拟数据
  const mockResponse = await mockService.getDoctorAccessibleData(params)
  if (mockResponse) return mockResponse as any
  
  return request.get('/doctor/medical-data', { params })
}

/**
 * ✅ 获取医生端统计数据
 * 
 * @description 获取医生工作台的关键统计指标
 * 
 * @returns Promise<ApiResponse> - 统计数据
 * 
 * @后端处理逻辑:
 * 1. 验证医生身份（从token获取医生ID）
 * 2. 统计以下指标：
 *    a. 数据总数：医生科室可访问的所有患者数据数量
 *    b. 已授权数据：授权状态为'authorized'的数据数量
 *    c. 待授权数据：授权状态为'pending'的数据数量
 *    d. 今日已查看：今天医生实际查看/下载的数据数量
 * 3. 从相关数据表查询并汇总
 * 4. 返回统计结果
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "统计成功",
 *   data: {
 *     totalPatients: number,      // 数据总数（注：命名保持兼容，实际是数据总数）
 *     activeShares: number,       // 已授权数据数量
 *     pendingRequests: number,    // 待授权数据数量
 *     todayAccess: number         // 今日已查看数据数量
 *   }
 * }
 * 
 * @调用位置:
 * - src/views/doctor/DataManagementView.vue (数据管理页面顶部统计卡片)
 * - 通过 mockService.getDoctorStatistics() 调用（演示账户使用模拟数据）
 * 
 * @统计规则:
 * - 数据总数：包括所有授权状态的数据（未申请、待审批、已授权、已拒绝）
 * - 已授权数据：只统计当前有效的授权（未过期、未被撤销）
 * - 待授权数据：只统计状态为'pending'的授权申请
 * - 今日已查看：统计今天00:00至当前时间的访问记录
 * 
 * @应用场景:
 * - 数据管理页面顶部展示关键指标
 * - 帮助医生快速了解工作量和待办事项
 * - 页面初始化时加载
 * 
 * @缓存建议:
 * - 可以对统计数据进行短时间缓存（如5分钟）
 * - 减少数据库查询压力
 * - 实时性要求不高的统计数据
 * 
 * @example
 * const response = await getDoctorStatistics()
 * // {
 * //   totalPatients: 156,      // 共156条可访问数据
 * //   activeShares: 89,        // 其中89条已授权
 * //   pendingRequests: 12,     // 12条待患者审批
 * //   todayAccess: 34          // 今天已查看34条
 * // }
 */
export const getDoctorStatistics = async (): Promise<ApiResponse<{
  totalPatients: number
  activeShares: number
  pendingRequests: number
  todayAccess: number
}>> => {
  // 如果启用了模拟数据，返回模拟数据
  const mockResponse = await mockService.getDoctorStatistics()
  if (mockResponse) return mockResponse as any
  
  return request.get('/doctor/statistics')
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
 * - 通过 mockService.getDoctorAccessHistory() 调用（演示账户使用模拟数据）
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
  // 如果启用了模拟数据，返回模拟数据
  const mockResponse = await mockService.getDoctorAccessHistory(params)
  if (mockResponse) return mockResponse as any
  
  return request.get('/doctor/access-history', { params })
}

// 导出所有API函数作为默认对象
export default {
  getMedicalDataList,
  getDoctorStatistics,
  getAccessHistory
}
