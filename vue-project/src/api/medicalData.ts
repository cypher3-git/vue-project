/**
 * 医疗数据管理相关API接口
 * 提供医疗文件的上传、下载、查询、管理等功能
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type {
  MedicalFile,
  UploadData,
  UpdateFileData,
  FileQueryParams,
  FileListResponse,
  FileUploadResponse,
  FileStatistics,
  FileStatisticsResponse,
  BatchOperationData,
  ExportRequest,
  DataTraceability,
  IntegrityCheck
} from '@/types/medicalData'
import { mockService } from '@/mock/mockService'

/**
 * 获取医疗文件列表
 * @param params 查询参数
 * @returns 文件列表及分页信息
 */
export const getMedicalFiles = async (params?: FileQueryParams): Promise<FileListResponse> => {
  // 如果启用了模拟数据，返回模拟数据
  const mockResponse = await mockService.getPatientFiles(params)
  if (mockResponse) return mockResponse as any
  
  return request.get('/medical-data/files', { params })
}

/**
 * 根据ID获取单个医疗文件详情
 * @param fileId 文件ID
 * @returns 文件详细信息
 */
export const getMedicalFileById = async (fileId: string): Promise<ApiResponse<MedicalFile>> => {
  return request.get(`/medical-data/files/${fileId}`)
}

/**
 * 上传医疗文件
 * @param data 上传数据（文件、标题、描述、分类）
 * @param onProgress 上传进度回调
 * @returns 上传后的文件信息
 */
export const uploadMedicalFile = async (
  data: UploadData,
  onProgress?: (progress: number) => void
): Promise<FileUploadResponse> => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('title', data.title)
  formData.append('description', data.description)
  formData.append('category', data.category)

  return request.post('/medical-data/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

/**
 * 更新医疗文件信息
 * @param fileId 文件ID
 * @param updateData 要更新的数据
 * @returns 更新结果
 */
export const updateMedicalFile = async (
  fileId: string,
  updateData: UpdateFileData
): Promise<ApiResponse<MedicalFile>> => {
  return request.put(`/medical-data/files/${fileId}`, updateData)
}

/**
 * 删除医疗文件
 * @param fileId 文件ID
 * @returns 删除结果
 */
export const deleteMedicalFile = async (fileId: string): Promise<ApiResponse> => {
  return request.delete(`/medical-data/files/${fileId}`)
}

/**
 * 下载医疗文件
 * @param fileId 文件ID
 * @param fileName 保存的文件名
 * @returns 下载结果
 */
export const downloadMedicalFile = async (fileId: string, fileName: string): Promise<void> => {
  const response = await request.get(`/medical-data/files/${fileId}/download`, {
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
 * 预览医疗文件
 * @param fileId 文件ID
 * @returns 预览URL
 */
export const previewMedicalFile = async (fileId: string): Promise<ApiResponse<{ previewUrl: string }>> => {
  return request.get(`/medical-data/files/${fileId}/preview`)
}

/**
 * 获取文件分享状态
 * @param fileId 文件ID
 * @returns 分享状态信息
 */
export const getFileShareStatus = async (fileId: string): Promise<ApiResponse<{
  isShared: boolean
  shareCount: number
  activeShares: number
}>> => {
  return request.get(`/medical-data/files/${fileId}/share-status`)
}

/**
 * 批量操作文件
 * @param operationData 批量操作数据
 * @returns 操作结果
 */
export const batchOperateFiles = async (operationData: BatchOperationData): Promise<ApiResponse<{
  successCount: number
  failedCount: number
  errors?: Array<{ fileId: string; error: string }>
}>> => {
  return request.post('/medical-data/files/batch', operationData)
}

/**
 * 获取文件统计信息
 * @returns 统计数据
 */
export const getFileStatistics = async (): Promise<FileStatisticsResponse> => {
  return request.get('/medical-data/statistics')
}

/**
 * 导出医疗数据
 * @param exportRequest 导出请求参数
 * @returns 导出文件
 */
export const exportMedicalData = async (exportRequest: ExportRequest): Promise<void> => {
  const response = await request.post('/medical-data/export', exportRequest, {
    responseType: 'blob'
  })
  
  // 根据format确定文件扩展名
  const extension = exportRequest.format === 'zip' ? 'zip' : 'pdf'
  const fileName = `medical_data_export_${Date.now()}.${extension}`
  
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
 * 获取文件数据溯源信息
 * @param fileId 文件ID
 * @returns 溯源信息
 */
export const getDataTraceability = async (fileId: string): Promise<ApiResponse<DataTraceability>> => {
  return request.get(`/medical-data/files/${fileId}/traceability`)
}

/**
 * 验证文件完整性
 * @param fileId 文件ID
 * @returns 完整性验证结果
 */
export const verifyFileIntegrity = async (fileId: string): Promise<ApiResponse<IntegrityCheck>> => {
  return request.post(`/medical-data/files/${fileId}/verify-integrity`)
}

/**
 * 搜索医疗文件
 * @param keyword 搜索关键词
 * @param filters 过滤条件
 * @returns 搜索结果
 */
export const searchMedicalFiles = async (
  keyword: string,
  filters?: Partial<FileQueryParams>
): Promise<FileListResponse> => {
  return request.get('/medical-data/files/search', {
    params: {
      keyword,
      ...filters
    }
  })
}

/**
 * 获取最近上传的文件
 * @param limit 数量限制
 * @returns 最近文件列表
 */
export const getRecentFiles = async (limit: number = 10): Promise<ApiResponse<MedicalFile[]>> => {
  return request.get('/medical-data/files/recent', {
    params: { limit }
  })
}

/**
 * 获取文件访问次数
 * @param fileId 文件ID
 * @returns 访问统计
 */
export const getFileAccessCount = async (fileId: string): Promise<ApiResponse<{
  viewCount: number
  downloadCount: number
  shareCount: number
}>> => {
  return request.get(`/medical-data/files/${fileId}/access-count`)
}

// 导出所有API函数作为默认对象
export default {
  getMedicalFiles,
  getMedicalFileById,
  uploadMedicalFile,
  updateMedicalFile,
  deleteMedicalFile,
  downloadMedicalFile,
  previewMedicalFile,
  getFileShareStatus,
  batchOperateFiles,
  getFileStatistics,
  exportMedicalData,
  getDataTraceability,
  verifyFileIntegrity,
  searchMedicalFiles,
  getRecentFiles,
  getFileAccessCount
}

