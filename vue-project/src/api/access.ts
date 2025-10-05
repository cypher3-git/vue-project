/**
 * 访问记录相关API接口
 * 提供医疗数据访问历史、统计分析等功能
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type {
  AccessRecord,
  AccessHistoryResponse
} from '@/types/medicalData'

/**
 * 获取患者的所有访问记录
 * @param params 查询参数
 * @returns 访问记录列表
 */
export const getMyAccessRecords = async (params?: {
  fileId?: string
  doctorId?: string
  accessType?: 'view' | 'download' | 'preview'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<AccessHistoryResponse> => {
  return request.get('/access/my-records', { params })
}

/**
 * 获取医生的访问历史
 * @param params 查询参数
 * @returns 访问记录列表
 */
export const getDoctorAccessHistory = async (params?: {
  patientId?: string
  fileId?: string
  accessType?: 'view' | 'download' | 'preview'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<AccessHistoryResponse> => {
  return request.get('/access/doctor-history', { params })
}

/**
 * 根据ID获取访问记录详情
 * @param recordId 访问记录ID
 * @returns 访问记录详细信息
 */
export const getAccessRecordById = async (recordId: string): Promise<ApiResponse<AccessRecord>> => {
  return request.get(`/access/records/${recordId}`)
}

/**
 * 获取特定文件的访问记录
 * @param fileId 文件ID
 * @param params 查询参数
 * @returns 访问记录列表
 */
export const getFileAccessRecords = async (
  fileId: string,
  params?: {
    doctorId?: string
    accessType?: 'view' | 'download' | 'preview'
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }
): Promise<AccessHistoryResponse> => {
  return request.get(`/access/file/${fileId}/records`, { params })
}

/**
 * 获取特定医生的访问记录
 * @param doctorId 医生ID
 * @param params 查询参数
 * @returns 访问记录列表
 */
export const getDoctorAccessRecords = async (
  doctorId: string,
  params?: {
    fileId?: string
    accessType?: 'view' | 'download' | 'preview'
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }
): Promise<AccessHistoryResponse> => {
  return request.get(`/access/doctor/${doctorId}/records`, { params })
}

/**
 * 记录文件访问（系统内部调用）
 * @param accessData 访问数据
 * @returns 记录结果
 */
export const recordAccess = async (accessData: {
  fileId: string
  shareId: string
  accessType: 'view' | 'download' | 'preview'
  duration?: number
}): Promise<ApiResponse<AccessRecord>> => {
  return request.post('/access/record', accessData)
}

/**
 * 获取访问统计信息
 * @param params 统计参数
 * @returns 统计数据
 */
export const getAccessStatistics = async (params?: {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}): Promise<ApiResponse<{
  totalAccess: number
  viewCount: number
  downloadCount: number
  previewCount: number
  uniqueVisitors: number
  accessByDoctor: Array<{
    doctorId: string
    doctorName: string
    hospital: string
    accessCount: number
    lastAccessTime: string
  }>
  accessByFile: Array<{
    fileId: string
    fileName: string
    category: string
    accessCount: number
  }>
  accessTrend: Array<{
    date: string
    count: number
  }>
  peakAccessTime: {
    hour: number
    count: number
  }
}>> => {
  return request.get('/access/statistics', { params })
}

/**
 * 获取最近的访问记录
 * @param limit 数量限制
 * @returns 最近访问记录列表
 */
export const getRecentAccessRecords = async (limit: number = 10): Promise<ApiResponse<AccessRecord[]>> => {
  return request.get('/access/recent', {
    params: { limit }
  })
}

/**
 * 获取异常访问记录
 * @param params 查询参数
 * @returns 异常访问记录列表
 */
export const getAbnormalAccessRecords = async (params?: {
  type?: 'frequent' | 'unusual_time' | 'suspicious_ip'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<AccessHistoryResponse> => {
  return request.get('/access/abnormal', { params })
}

/**
 * 导出访问记录
 * @param params 导出参数
 * @returns 导出文件
 */
export const exportAccessRecords = async (params?: {
  fileId?: string
  doctorId?: string
  startDate?: string
  endDate?: string
  format?: 'csv' | 'excel'
}): Promise<void> => {
  const response = await request.get('/access/export', {
    params,
    responseType: 'blob'
  }) 
  
  const format = params?.format || 'excel'
  const extension = format === 'csv' ? 'csv' : 'xlsx'
  const fileName = `access_records_${Date.now()}.${extension}`
  
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
 * 获取访问热力图数据
 * @param params 查询参数
 * @returns 热力图数据
 */
export const getAccessHeatmap = async (params?: {
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<{
  data: Array<{
    date: string
    hour: number
    count: number
  }>
  maxCount: number
}>> => {
  return request.get('/access/heatmap', { params })
}

/**
 * 获取文件访问排行榜
 * @param params 查询参数
 * @returns 排行榜数据
 */
export const getFileAccessRanking = async (params?: {
  startDate?: string
  endDate?: string
  limit?: number
  accessType?: 'view' | 'download' | 'all'
}): Promise<ApiResponse<Array<{
  fileId: string
  fileName: string
  category: string
  accessCount: number
  viewCount: number
  downloadCount: number
  uniqueVisitors: number
}>>> => {
  return request.get('/access/ranking', { params })
}

// 导出所有API函数作为默认对象
export default {
  getMyAccessRecords,
  getDoctorAccessHistory,
  getAccessRecordById,
  getFileAccessRecords,
  getDoctorAccessRecords,
  recordAccess,
  getAccessStatistics,
  getRecentAccessRecords,
  getAbnormalAccessRecords,
  exportAccessRecords,
  getAccessHeatmap,
  getFileAccessRanking
}

