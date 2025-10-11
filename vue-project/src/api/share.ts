/**
 * 数据分享相关API接口
 * 提供医疗数据分享、权限管理等功能
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type {
  ShareRecord,
  ShareFileData,
  ShareListResponse,
  ShareStatus,
  AccessPermission
} from '@/types/medicalData'

/**
 * 创建文件分享
 * @param shareData 分享数据（文件ID、医生ID、权限、过期时间等）
 * @returns 创建的分享记录
 */
export const createShare = async (shareData: ShareFileData): Promise<ApiResponse<ShareRecord>> => {
  return request.post('/shares', shareData)
}

/**
 * 获取患者的所有分享记录
 * @param params 查询参数
 * @returns 分享记录列表
 */
export const getMyShares = async (params?: {
  status?: ShareStatus
  doctorId?: string
  department?: string
  fileId?: string
  page?: number
  pageSize?: number
}): Promise<ShareListResponse> => {
  return request.get('/shares/my-shares', { params })
}

/**
 * 获取医生收到的分享记录（包括分享给其所在科室的数据）
 * @param params 查询参数
 * @returns 分享记录列表
 */
export const getReceivedShares = async (params?: {
  status?: ShareStatus
  patientId?: string
  department?: string
  page?: number
  pageSize?: number
}): Promise<ShareListResponse> => {
  return request.get('/shares/received', { params })
}

/**
 * 根据ID获取分享详情
 * @param shareId 分享记录ID
 * @returns 分享详细信息
 */
export const getShareById = async (shareId: string): Promise<ApiResponse<ShareRecord>> => {
  return request.get(`/shares/${shareId}`)
}

/**
 * 通过分享链接获取分享信息（公开访问）
 * @param shareToken 分享令牌
 * @returns 分享信息
 */
export const getShareByToken = async (shareToken: string): Promise<ApiResponse<{
  share: ShareRecord
  file: any
  isExpired: boolean
  canAccess: boolean
}>> => {
  return request.get(`/shares/public/${shareToken}`)
}

/**
 * 更新分享记录
 * @param shareId 分享记录ID
 * @param updateData 要更新的数据
 * @returns 更新结果
 */
export const updateShare = async (
  shareId: string,
  updateData: {
    permissions?: AccessPermission[]
    expiresAt?: string
    shareReason?: string
  }
): Promise<ApiResponse<ShareRecord>> => {
  return request.put(`/shares/${shareId}`, updateData)
}

/**
 * 撤销分享
 * @param shareId 分享记录ID
 * @returns 撤销结果
 */
export const revokeShare = async (shareId: string): Promise<ApiResponse> => {
  return request.post(`/shares/${shareId}/revoke`)
}

/**
 * 批量撤销分享
 * @param shareIds 分享记录ID列表
 * @returns 批量撤销结果
 */
export const batchRevokeShares = async (shareIds: string[]): Promise<ApiResponse<{
  successCount: number
  failedCount: number
  errors?: Array<{ shareId: string; error: string }>
}>> => {
  return request.post('/shares/batch-revoke', { shareIds })
}

/**
 * 延长分享有效期
 * @param shareId 分享记录ID
 * @param newExpiresAt 新的过期时间
 * @returns 更新结果
 */
export const extendShareExpiration = async (
  shareId: string,
  newExpiresAt: string
): Promise<ApiResponse<ShareRecord>> => {
  return request.post(`/shares/${shareId}/extend`, { expiresAt: newExpiresAt })
}

/**
 * 获取文件的所有分享记录
 * @param fileId 文件ID
 * @returns 该文件的分享记录列表
 */
export const getFileShares = async (fileId: string): Promise<ShareListResponse> => {
  return request.get(`/shares/file/${fileId}`)
}

/**
 * 获取与特定医生的分享记录
 * @param doctorId 医生ID
 * @param params 查询参数
 * @returns 分享记录列表
 */
export const getSharesWithDoctor = async (
  doctorId: string,
  params?: {
    status?: ShareStatus
    page?: number
    pageSize?: number
  }
): Promise<ShareListResponse> => {
  return request.get(`/shares/doctor/${doctorId}`, { params })
}

/**
 * 获取分享给特定科室的记录
 * @param department 科室名称
 * @param params 查询参数
 * @returns 分享记录列表
 */
export const getSharesByDepartment = async (
  department: string,
  params?: {
    status?: ShareStatus
    patientId?: string
    page?: number
    pageSize?: number
  }
): Promise<ShareListResponse> => {
  return request.get(`/shares/department/${encodeURIComponent(department)}`, { params })
}

/**
 * 获取分享统计信息
 * @returns 分享统计数据
 */
export const getShareStatistics = async (): Promise<ApiResponse<{
  totalShares: number
  activeShares: number
  expiredShares: number
  revokedShares: number
  sharedWithDoctors: number
  mostSharedFiles: Array<{
    fileId: string
    fileName: string
    shareCount: number
  }>
  recentShares: ShareRecord[]
}>> => {
  return request.get('/shares/statistics')
}

/**
 * 检查是否可以分享给指定医生
 * @param doctorId 医生ID
 * @param fileIds 文件ID列表
 * @returns 检查结果
 */
export const checkSharePermission = async (
  doctorId: string,
  fileIds: string[]
): Promise<ApiResponse<{
  canShare: boolean
  alreadyShared: string[]
  cannotShare: string[]
  reason?: string
}>> => {
  return request.post('/shares/check-permission', { doctorId, fileIds })
}

/**
 * 生成分享链接
 * @param shareId 分享记录ID
 * @returns 分享链接信息
 */
export const generateShareLink = async (shareId: string): Promise<ApiResponse<{
  shareUrl: string
  shareToken: string
  qrCodeUrl: string
  expiresAt: string
}>> => {
  return request.post(`/shares/${shareId}/generate-link`)
}

/**
 * 通过分享访问文件（医生端）
 * @param shareId 分享记录ID
 * @param fileId 文件ID
 * @returns 访问结果及文件信息
 */
export const accessSharedFile = async (
  shareId: string,
  fileId: string
): Promise<ApiResponse<{
  file: any
  permissions: AccessPermission[]
  canDownload: boolean
  canShare: boolean
}>> => {
  return request.get(`/shares/${shareId}/access/${fileId}`)
}

// 导出所有API函数作为默认对象
export default {
  createShare,
  getMyShares,
  getReceivedShares,
  getShareById,
  getShareByToken,
  updateShare,
  revokeShare,
  batchRevokeShares,
  extendShareExpiration,
  getFileShares,
  getSharesWithDoctor,
  getSharesByDepartment,
  getShareStatistics,
  checkSharePermission,
  generateShareLink,
  accessSharedFile
}

