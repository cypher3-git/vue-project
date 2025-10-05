/**
 * 患者端相关API接口
 * 提供患者仪表板、权限管理、医生管理等功能
 */

import request from '@/utils/request'
import type { ApiResponse, PaginatedData } from '@/types/auth'
import type {
  MedicalFile,
  ShareRecord,
  AccessRecord,
  FileStatistics
} from '@/types/medicalData'

// 医生基本信息
export interface DoctorInfo {
  id: string
  name: string
  hospital: string
  department: string
  title?: string
  licenseNumber: string
  specialties?: string[]
  experience?: number
  isVerified: boolean
  // 关联统计
  sharedFilesCount: number
  accessCount: number
  lastAccessTime?: string
}

// 权限请求（患者视角）
export interface PatientPermissionRequest {
  id: string
  doctorId: string
  patientId: string
  requestReason: string
  requestedFiles?: string[]
  requestedPermissions: string[]
  expiresAt: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  createdAt: string
  processedAt?: string
  rejectReason?: string
  doctor: DoctorInfo
}

/**
 * 获取患者仪表板统计数据
 * @returns 统计数据
 */
export const getDashboardStatistics = async (): Promise<ApiResponse<{
  totalFiles: number
  sharedFiles: number
  activeShares: number
  totalAccessCount: number
  pendingRequests: number
  authorizedDoctors: number
  storageUsed: number
  storageLimit: number
  recentFiles: MedicalFile[]
  recentShares: ShareRecord[]
  recentAccess: AccessRecord[]
  categoryDistribution: Array<{
    category: string
    count: number
    percentage: number
  }>
  monthlyUploadTrend: Array<{
    month: string
    count: number
    size: number
  }>
}>> => {
  return request.get('/patient/dashboard/statistics')
}

/**
 * 获取患者的医疗文件统计
 * @returns 文件统计数据
 */
export const getFileStatistics = async (): Promise<ApiResponse<FileStatistics>> => {
  return request.get('/patient/statistics/files')
}

/**
 * 获取收到的权限申请列表
 * @param params 查询参数
 * @returns 权限申请列表
 */
export const getPermissionRequests = async (params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'expired'
  doctorId?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<PatientPermissionRequest>>> => {
  return request.get('/patient/permission-requests', { params })
}

/**
 * 审批权限申请
 * @param requestId 申请ID
 * @param action 操作（approve 或 reject）
 * @param rejectReason 拒绝原因（拒绝时必填）
 * @returns 审批结果
 */
export const processPermissionRequest = async (
  requestId: string,
  action: 'approve' | 'reject',
  rejectReason?: string
): Promise<ApiResponse> => {
  return request.post(`/patient/permission-requests/${requestId}/${action}`, {
    rejectReason
  })
}

/**
 * 批量审批权限申请
 * @param requestIds 申请ID列表
 * @param action 操作
 * @returns 批量审批结果
 */
export const batchProcessRequests = async (
  requestIds: string[],
  action: 'approve' | 'reject'
): Promise<ApiResponse<{
  successCount: number
  failedCount: number
  errors?: Array<{ requestId: string; error: string }>
}>> => {
  return request.post('/patient/permission-requests/batch-process', {
    requestIds,
    action
  })
}

/**
 * 获取已授权的医生列表
 * @param params 查询参数
 * @returns 医生列表
 */
export const getAuthorizedDoctors = async (params?: {
  keyword?: string
  hasActiveShare?: boolean
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<DoctorInfo>>> => {
  return request.get('/patient/authorized-doctors', { params })
}

/**
 * 根据ID获取医生详细信息
 * @param doctorId 医生ID
 * @returns 医生详细信息
 */
export const getDoctorById = async (doctorId: string): Promise<ApiResponse<DoctorInfo>> => {
  return request.get(`/patient/doctors/${doctorId}`)
}

/**
 * 搜索医生
 * @param keyword 搜索关键词
 * @returns 搜索结果
 */
export const searchDoctors = async (keyword: string): Promise<ApiResponse<DoctorInfo[]>> => {
  return request.get('/patient/doctors/search', {
    params: { keyword }
  })
}

/**
 * 获取与特定医生的分享记录
 * @param doctorId 医生ID
 * @param params 查询参数
 * @returns 分享记录列表
 */
export const getDoctorShares = async (
  doctorId: string,
  params?: {
    status?: 'active' | 'expired' | 'revoked'
    page?: number
    pageSize?: number
  }
): Promise<ApiResponse<PaginatedData<ShareRecord>>> => {
  return request.get(`/patient/doctors/${doctorId}/shares`, { params })
}

/**
 * 获取医生对患者数据的访问记录
 * @param doctorId 医生ID
 * @param params 查询参数
 * @returns 访问记录列表
 */
export const getDoctorAccessRecords = async (
  doctorId: string,
  params?: {
    fileId?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }
): Promise<ApiResponse<PaginatedData<AccessRecord>>> => {
  return request.get(`/patient/doctors/${doctorId}/access-records`, { params })
}

/**
 * 撤销医生的所有访问权限
 * @param doctorId 医生ID
 * @returns 撤销结果
 */
export const revokeAllDoctorAccess = async (doctorId: string): Promise<ApiResponse> => {
  return request.post(`/patient/doctors/${doctorId}/revoke-all`)
}

/**
 * 添加医生备注
 * @param doctorId 医生ID
 * @param note 备注内容
 * @returns 添加结果
 */
export const addDoctorNote = async (
  doctorId: string,
  note: string
): Promise<ApiResponse> => {
  return request.post(`/patient/doctors/${doctorId}/notes`, { note })
}

/**
 * 获取医生备注列表
 * @param doctorId 医生ID
 * @returns 备注列表
 */
export const getDoctorNotes = async (doctorId: string): Promise<ApiResponse<Array<{
  id: string
  note: string
  createdAt: string
}>>> => {
  return request.get(`/patient/doctors/${doctorId}/notes`)
}

/**
 * 标记信任的医生
 * @param doctorId 医生ID
 * @param isTrusted 是否信任
 * @returns 操作结果
 */
export const toggleTrustedDoctor = async (
  doctorId: string,
  isTrusted: boolean
): Promise<ApiResponse> => {
  return request.post(`/patient/doctors/${doctorId}/trust`, { isTrusted })
}

/**
 * 获取信任的医生列表
 * @returns 信任的医生列表
 */
export const getTrustedDoctors = async (): Promise<ApiResponse<DoctorInfo[]>> => {
  return request.get('/patient/doctors/trusted')
}

/**
 * 获取数据访问概览
 * @param params 查询参数
 * @returns 访问概览数据
 */
export const getAccessOverview = async (params?: {
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<{
  totalAccess: number
  uniqueDoctors: number
  mostAccessedFiles: Array<{
    fileId: string
    fileName: string
    category: string
    accessCount: number
  }>
  accessByDoctor: Array<{
    doctorId: string
    doctorName: string
    hospital: string
    accessCount: number
    lastAccessTime: string
  }>
  accessTrend: Array<{
    date: string
    count: number
  }>
}>> => {
  return request.get('/patient/access-overview', { params })
}

/**
 * 获取安全事件记录
 * @param params 查询参数
 * @returns 安全事件列表
 */
export const getSecurityEvents = async (params?: {
  type?: 'abnormal_access' | 'unauthorized_attempt' | 'data_export'
  severity?: 'low' | 'medium' | 'high'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<{
  id: string
  type: string
  severity: string
  description: string
  relatedDoctor?: DoctorInfo
  relatedFile?: MedicalFile
  occurredAt: string
  isResolved: boolean
  resolvedAt?: string
}>>> => {
  return request.get('/patient/security-events', { params })
}

/**
 * 标记安全事件为已处理
 * @param eventId 事件ID
 * @returns 操作结果
 */
export const resolveSecurityEvent = async (eventId: string): Promise<ApiResponse> => {
  return request.post(`/patient/security-events/${eventId}/resolve`)
}

/**
 * 获取隐私设置
 * @returns 隐私设置
 */
export const getPrivacySettings = async (): Promise<ApiResponse<{
  autoApproveRequests: boolean
  allowAnonymousSharing: boolean
  requireReasonForAccess: boolean
  notifyOnAccess: boolean
  maxShareDuration: number
  allowedDepartments: string[]
}>> => {
  return request.get('/patient/privacy-settings')
}

/**
 * 更新隐私设置
 * @param settings 隐私设置
 * @returns 更新结果
 */
export const updatePrivacySettings = async (settings: {
  autoApproveRequests?: boolean
  allowAnonymousSharing?: boolean
  requireReasonForAccess?: boolean
  notifyOnAccess?: boolean
  maxShareDuration?: number
  allowedDepartments?: string[]
}): Promise<ApiResponse> => {
  return request.put('/patient/privacy-settings', settings)
}

// 导出所有API函数作为默认对象
export default {
  getDashboardStatistics,
  getFileStatistics,
  getPermissionRequests,
  processPermissionRequest,
  batchProcessRequests,
  getAuthorizedDoctors,
  getDoctorById,
  searchDoctors,
  getDoctorShares,
  getDoctorAccessRecords,
  revokeAllDoctorAccess,
  addDoctorNote,
  getDoctorNotes,
  toggleTrustedDoctor,
  getTrustedDoctors,
  getAccessOverview,
  getSecurityEvents,
  resolveSecurityEvent,
  getPrivacySettings,
  updatePrivacySettings
}

