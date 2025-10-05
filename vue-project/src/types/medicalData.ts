// 医疗文件类别枚举
export type FileCategory = 'report' | 'image' | 'prescription' | 'other'

// 文件状态枚举  
export type FileStatus = 'uploading' | 'processing' | 'completed' | 'failed'

// 分享状态枚举
export type ShareStatus = 'active' | 'expired' | 'revoked'

// 访问权限枚举
export type AccessPermission = 'view' | 'download' | 'share'

// 医疗文件基础接口
export interface MedicalFile {
  id: string
  title: string
  description: string
  fileName: string
  originalName: string
  fileSize: number
  fileType: string
  mimeType: string
  category: FileCategory
  status: FileStatus
  uploadTime: string
  updatedAt: string
  patientId: string
  isShared: boolean
  shareCount: number
  downloadCount: number
  viewCount: number
  // 文件预览信息
  thumbnailUrl?: string
  previewUrl?: string
  // 文件验证信息
  checksum?: string
  isVerified: boolean
  verifiedAt?: string
}

// 文件上传数据
export interface UploadData {
  file: File
  title: string
  description: string
  category: FileCategory
}

// 文件更新数据
export interface UpdateFileData {
  title?: string
  description?: string
  category?: FileCategory
}

// 文件分享记录
export interface ShareRecord {
  id: string
  fileId: string
  doctorId: string
  patientId: string
  permissions: AccessPermission[]
  shareReason?: string
  expiresAt: string
  status: ShareStatus
  createdAt: string
  revokedAt?: string
  accessCount: number
  lastAccessAt?: string
  // 关联数据
  doctor: {
    id: string
    name: string
    hospital: string
    department: string
  }
  file: {
    id: string
    title: string
    fileName: string
    fileType: string
    category: FileCategory
  }
}

// 访问记录
export interface AccessRecord {
  id: string
  fileId: string
  doctorId: string
  patientId: string
  shareId: string
  accessType: 'view' | 'download' | 'preview'
  accessTime: string
  ipAddress?: string
  userAgent?: string
  duration?: number // 访问持续时间（秒）
  // 关联数据
  doctor: {
    id: string
    name: string
    hospital: string
    department: string
  }
  file: {
    id: string
    title: string
    fileName: string
    fileType: string
    category: FileCategory
  }
}

// 文件查询参数
export interface FileQueryParams {
  category?: FileCategory
  keyword?: string
  status?: FileStatus
  startDate?: string
  endDate?: string
  isShared?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'uploadTime' | 'title' | 'fileSize' | 'viewCount'
  sortOrder?: 'asc' | 'desc'
}

// 文件统计数据
export interface FileStatistics {
  totalFiles: number
  totalSize: number // 字节
  categoryStats: {
    [K in FileCategory]: {
      count: number
      size: number
    }
  }
  monthlyUploads: {
    month: string
    count: number
    size: number
  }[]
  mostViewedFiles: Array<{
    id: string
    title: string
    viewCount: number
  }>
  recentShares: number
  activeShares: number
}

// 批量操作数据
export interface BatchOperationData {
  fileIds: string[]
  operation: 'delete' | 'share' | 'unshare' | 'move_category'
  params?: {
    doctorId?: string
    expiresAt?: string
    permissions?: AccessPermission[]
    category?: FileCategory
  }
}

// 文件分享请求数据
export interface ShareFileData {
  fileIds: string[]
  doctorId: string
  permissions: AccessPermission[]
  shareReason?: string
  expiresAt: string
}

// 医疗数据导出请求
export interface ExportRequest {
  fileIds?: string[]
  category?: FileCategory
  dateRange?: {
    startDate: string
    endDate: string
  }
  format: 'zip' | 'pdf'
  includeMetadata: boolean
}

// 文件预览配置
export interface PreviewConfig {
  supportedTypes: string[]
  maxPreviewSize: number // 字节
  previewTimeout: number // 毫秒
  thumbnailSize: {
    width: number
    height: number
  }
}

// 上传配置
export interface UploadConfig {
  maxFileSize: number // 字节
  allowedTypes: string[]
  allowedExtensions: string[]
  chunkSize?: number // 分片大小
  maxConcurrentUploads: number
}

// 数据溯源信息
export interface DataTraceability {
  fileId: string
  creationTrace: {
    uploadedBy: string
    uploadTime: string
    originalSource?: string
    deviceInfo?: string
  }
  modificationTrace: {
    modifiedBy: string
    modifiedAt: string
    operation: string
    oldValue?: any
    newValue?: any
  }[]
  accessTrace: {
    accessedBy: string
    accessTime: string
    accessType: string
    ipAddress?: string
  }[]
  shareTrace: {
    sharedWith: string
    sharedBy: string
    shareTime: string
    permissions: AccessPermission[]
    expiresAt?: string
  }[]
}

// 数据完整性验证
export interface IntegrityCheck {
  fileId: string
  checksum: string
  algorithm: 'md5' | 'sha256'
  verifiedAt: string
  isValid: boolean
  lastModified: string
}

// API响应类型
export interface FileListResponse {
  success: boolean
  data: {
    files: MedicalFile[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  message: string
}

export interface FileUploadResponse {
  success: boolean
  data: MedicalFile
  message: string
}

export interface ShareListResponse {
  success: boolean
  data: {
    shares: ShareRecord[]
    total: number
    page: number
    pageSize: number
  }
  message: string
}

export interface AccessHistoryResponse {
  success: boolean
  data: {
    records: AccessRecord[]
    total: number
    page: number
    pageSize: number
  }
  message: string
}

export interface FileStatisticsResponse {
  success: boolean
  data: FileStatistics
  message: string
}
