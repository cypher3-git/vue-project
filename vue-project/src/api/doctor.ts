/**
 * 医生端相关API接口
 * 提供患者管理、权限申请、数据访问等功能
 */

import request from '@/utils/request'
import type { ApiResponse, PaginatedData } from '@/types/auth'
import type { 
  MedicalFile,
  ShareRecord,
  AccessRecord,
  CreateAuthorizationRequest,
  AuthorizationRequest,
  DataAuthorizationStatus
} from '@/types/medicalData'
import { mockService } from '@/mock/mockService'

// 患者基本信息
export interface PatientInfo {
  id: string
  name: string
  age?: number
  gender?: 'male' | 'female'
  phone: string
  idCard?: string
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  medicalHistory?: string[]
  allergies?: string[]
  createdAt: string
  // 关联统计
  totalFiles: number
  sharedFiles: number
  lastShareTime?: string
}

// 权限申请
export interface PermissionRequest {
  id: string
  patientId: string
  doctorId: string
  requestReason: string
  requestedFiles?: string[]
  requestedPermissions: string[]
  expiresAt: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  createdAt: string
  processedAt?: string
  rejectReason?: string
  patient: {
    id: string
    name: string
    phone: string
  }
}

/**
 * 获取医生管理的患者列表
 * @param params 查询参数
 * @returns 患者列表
 */
export const getPatientList = async (params?: {
  keyword?: string
  hasActiveShare?: boolean
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<PatientInfo>>> => {
  // 如果启用了模拟数据，返回模拟数据
  const mockResponse = await mockService.getDoctorPatients(params)
  if (mockResponse) return mockResponse as any
  
  return request.get('/doctor/patients', { params })
}

/**
 * 根据ID获取患者详细信息
 * @param patientId 患者ID
 * @returns 患者详细信息
 */
export const getPatientById = async (patientId: string): Promise<ApiResponse<PatientInfo>> => {
  return request.get(`/doctor/patients/${patientId}`)
}

/**
 * 搜索患者
 * @param keyword 搜索关键词（姓名、手机号、身份证号）
 * @returns 搜索结果
 */
export const searchPatients = async (keyword: string): Promise<ApiResponse<PatientInfo[]>> => {
  return request.get('/doctor/patients/search', {
    params: { keyword }
  })
}

/**
 * 获取患者的医疗文件列表（需要分享权限）
 * @param patientId 患者ID
 * @param params 查询参数
 * @returns 文件列表
 */
export const getPatientFiles = async (
  patientId: string,
  params?: {
    category?: string
    keyword?: string
    page?: number
    pageSize?: number
  }
): Promise<ApiResponse<PaginatedData<MedicalFile>>> => {
  // 如果启用了模拟数据，返回模拟数据
  const mockResponse = await mockService.getDoctorPatientFiles(patientId, params)
  if (mockResponse) return mockResponse as any
  
  return request.get(`/doctor/patients/${patientId}/files`, { params })
}

/**
 * 申请访问患者数据权限
 * @param requestData 申请数据
 * @returns 申请结果
 */
export const requestPatientDataAccess = async (requestData: {
  patientId: string
  requestReason: string
  requestedFiles?: string[]
  requestedPermissions: string[]
  expiresAt: string
}): Promise<ApiResponse<PermissionRequest>> => {
  return request.post('/doctor/permission-requests', requestData)
}

/**
 * 获取医生的权限申请列表
 * @param params 查询参数
 * @returns 权限申请列表
 */
export const getMyPermissionRequests = async (params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'expired'
  patientId?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<PermissionRequest>>> => {
  return request.get('/doctor/permission-requests', { params })
}

/**
 * 根据ID获取权限申请详情
 * @param requestId 申请ID
 * @returns 申请详情
 */
export const getPermissionRequestById = async (requestId: string): Promise<ApiResponse<PermissionRequest>> => {
  return request.get(`/doctor/permission-requests/${requestId}`)
}

/**
 * 撤销权限申请
 * @param requestId 申请ID
 * @returns 撤销结果
 */
export const cancelPermissionRequest = async (requestId: string): Promise<ApiResponse> => {
  return request.post(`/doctor/permission-requests/${requestId}/cancel`)
}

/**
 * 获取医生收到的分享记录
 * @param params 查询参数
 * @returns 分享记录列表
 */
export const getSharedFiles = async (params?: {
  patientId?: string
  category?: string
  status?: 'active' | 'expired' | 'revoked'
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<ShareRecord>>> => {
  return request.get('/doctor/shared-files', { params })
}

/**
 * 访问共享的患者文件
 * @param shareId 分享ID
 * @param fileId 文件ID
 * @returns 文件访问信息
 */
export const accessPatientFile = async (
  shareId: string,
  fileId: string
): Promise<ApiResponse<{
  file: MedicalFile
  permissions: string[]
  canDownload: boolean
}>> => {
  return request.post(`/doctor/access-file`, { shareId, fileId })
}

/**
 * 下载共享的患者文件
 * @param shareId 分享ID
 * @param fileId 文件ID
 * @param fileName 保存的文件名
 * @returns 下载结果
 */
export const downloadSharedFile = async (
  shareId: string,
  fileId: string,
  fileName: string
): Promise<void> => {
  const response = await request.get(`/doctor/download-file/${shareId}/${fileId}`, {
    responseType: 'blob'
  })
  
  // 创建下载链接
  const url = window.URL.createObjectURL(new Blob([response as any]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * 获取医生的访问历史
 * @param params 查询参数
 * @returns 访问记录列表
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

/**
 * 添加患者备注
 * @param patientId 患者ID
 * @param note 备注内容
 * @returns 添加结果
 */
export const addPatientNote = async (
  patientId: string,
  note: string
): Promise<ApiResponse> => {
  return request.post(`/doctor/patients/${patientId}/notes`, { note })
}

/**
 * 获取患者备注列表
 * @param patientId 患者ID
 * @returns 备注列表
 */
export const getPatientNotes = async (patientId: string): Promise<ApiResponse<Array<{
  id: string
  note: string
  createdAt: string
  createdBy: string
}>>> => {
  return request.get(`/doctor/patients/${patientId}/notes`)
}

/**
 * 标记常用患者
 * @param patientId 患者ID
 * @param isFavorite 是否标记为常用
 * @returns 操作结果
 */
export const toggleFavoritePatient = async (
  patientId: string,
  isFavorite: boolean
): Promise<ApiResponse> => {
  return request.post(`/doctor/patients/${patientId}/favorite`, { isFavorite })
}

/**
 * 获取常用患者列表
 * @returns 常用患者列表
 */
export const getFavoritePatients = async (): Promise<ApiResponse<PatientInfo[]>> => {
  return request.get('/doctor/patients/favorites')
}

/**
 * 获取医生端统计数据
 * @returns 统计数据
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
 * 获取医生端可访问的医疗数据列表
 * @param params 查询参数
 * @returns 数据列表
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
 * 发起数据授权申请
 * @param requestData 申请数据
 * @returns 申请结果
 */
export const requestDataAuthorization = async (requestData: CreateAuthorizationRequest): Promise<ApiResponse<AuthorizationRequest>> => {
  return request.post('/doctor/authorization-requests', requestData)
}

/**
 * 获取授权状态
 * @param dataId 数据ID
 * @returns 授权状态
 */
export const getAuthorizationStatus = async (dataId: string): Promise<ApiResponse<DataAuthorizationStatus>> => {
  return request.get(`/doctor/authorization-status/${dataId}`)
}

/**
 * 获取我的授权申请列表
 * @param params 查询参数
 * @returns 授权申请列表
 */
export const getMyAuthorizationRequests = async (params?: {
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PaginatedData<AuthorizationRequest>>> => {
  return request.get('/doctor/my-authorization-requests', { params })
}

// 导出所有API函数作为默认对象
export default {
  getPatientList,
  getPatientById,
  searchPatients,
  getPatientFiles,
  requestPatientDataAccess,
  getMyPermissionRequests,
  getPermissionRequestById,
  cancelPermissionRequest,
  getSharedFiles,
  accessPatientFile,
  downloadSharedFile,
  getAccessHistory,
  addPatientNote,
  getPatientNotes,
  toggleFavoritePatient,
  getFavoritePatients,
  getDoctorStatistics,
  getMedicalDataList,
  requestDataAuthorization,
  getAuthorizationStatus,
  getMyAuthorizationRequests
}

