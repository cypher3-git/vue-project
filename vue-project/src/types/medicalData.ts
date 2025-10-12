// 医疗文件类别枚举
// - report: 检验报告
// - image: 医学影像
// - prescription: 处方记录
// - other: 其他类型
export type FileCategory = 'report' | 'image' | 'prescription' | 'other'

// 文件状态枚举
// - uploading: 上传中
// - processing: 处理中
// - completed: 已完成
// - failed: 上传失败
export type FileStatus = 'uploading' | 'processing' | 'completed' | 'failed'

// 分享状态枚举（已废弃 - 改用授权机制）
// - active: 活跃状态
// - expired: 已过期
// - revoked: 已撤销
export type ShareStatus = 'active' | 'expired' | 'revoked'

// 授权状态枚举（核心字段 - MVP）
// - not-requested: 未申请（医生尚未发起授权请求）
// - pending: 待审批（医生已申请，等待患者处理）
// - approved: 已批准（患者已同意，医生可查看）
// - rejected: 已拒绝（患者拒绝授权）
// - expired: 已过期（授权已过期，需重新申请）
export type AuthorizationStatus = 'not-requested' | 'pending' | 'approved' | 'rejected' | 'expired'

// 访问权限枚举（已废弃 - 改用授权机制）
// - view: 查看权限
// - download: 下载权限
// - share: 分享权限
export type AccessPermission = 'view' | 'download' | 'share'

// 医疗文件基础接口
export interface MedicalFile {
  id: string                              // 文件唯一标识
  title: string                           // 文件标题
  description: string                     // 文件描述
  fileName: string                        // 存储文件名
  originalName: string                    // 原始文件名
  fileSize: number                        // 文件大小（字节）
  fileType: string                        // 文件类型（扩展名）
  mimeType: string                        // MIME类型
  category: FileCategory                  // 文件类别
  status: FileStatus                      // 文件状态
  uploadTime: string                      // 上传时间
  updatedAt: string                       // 更新时间
  patientId: string                       // 所属患者ID
  isShared: boolean                       // 是否已分享（已废弃，保留兼容）
  shareCount: number                      // 分享次数（已废弃，保留兼容）
  downloadCount: number                   // 下载次数
  viewCount: number                       // 查看次数
  // 授权状态信息
  authStatus?: AuthorizationStatus        // 授权状态（核心字段）
  authorizationCount?: number             // 授权请求次数
  // 文件预览信息
  thumbnailUrl?: string                   // 缩略图URL
  previewUrl?: string                     // 预览URL
  // 文件验证信息
  checksum?: string                       // 文件校验和
  isVerified: boolean                     // 是否已验证
  verifiedAt?: string                     // 验证时间
}

// 文件上传数据
export interface UploadData {
  file: File                    // 文件对象
  title: string                 // 文件标题
  description: string           // 文件描述
  category: FileCategory        // 文件类别
}

// 文件更新数据
export interface UpdateFileData {
  title?: string                // 文件标题（可选）
  description?: string          // 文件描述（可选）
  category?: FileCategory       // 文件类别（可选）
}

// 文件分享记录（已废弃 - 改用授权机制）
export interface ShareRecord {
  id: string                            // 分享记录ID
  fileId: string                        // 文件ID
  doctorId?: string                     // 特定医生ID（可选，向后兼容）
  department?: string                   // 科室名称（可选，新的分享方式）
  patientId: string                     // 患者ID
  permissions: AccessPermission[]       // 访问权限列表
  shareReason?: string                  // 分享理由（可选）
  expiresAt: string                     // 过期时间
  status: ShareStatus                   // 分享状态
  createdAt: string                     // 创建时间
  revokedAt?: string                    // 撤销时间（可选）
  accessCount: number                   // 访问次数
  lastAccessAt?: string                 // 最后访问时间（可选）
  // 关联数据
  doctor?: {                            // 医生信息（可选，当分享给特定医生时）
    id: string                          // 医生ID
    name: string                        // 医生姓名
    hospital: string                    // 医院名称
    department: string                  // 科室
  }
  file: {                               // 文件信息
    id: string                          // 文件ID
    title: string                       // 文件标题
    fileName: string                    // 文件名
    fileType: string                    // 文件类型
    category: FileCategory              // 文件类别
  }
}

// 访问记录
export interface AccessRecord {
  id: string                                // 记录ID
  fileId: string                            // 文件ID
  doctorId: string                          // 医生ID
  patientId: string                         // 患者ID
  shareId: string                           // 分享ID（已废弃，改用授权ID）
  accessType: 'view' | 'download' | 'preview'  // 访问类型
  accessTime: string                        // 访问时间
  ipAddress?: string                        // IP地址（可选）
  userAgent?: string                        // 用户代理（可选）
  duration?: number                         // 访问持续时间（秒）
  // 关联数据
  doctor: {
    id: string                              // 医生ID
    name: string                            // 医生姓名
    hospital: string                        // 医院名称
    department: string                      // 科室
  }
  file: {
    id: string                              // 文件ID
    title: string                           // 文件标题
    fileName: string                        // 文件名
    fileType: string                        // 文件类型
    category: FileCategory                  // 文件类别
  }
}

// 文件查询参数
export interface FileQueryParams {
  category?: FileCategory                                       // 文件类别（可选）
  keyword?: string                                              // 搜索关键词（可选）
  status?: FileStatus                                           // 文件状态（可选）
  startDate?: string                                            // 开始日期（可选）
  endDate?: string                                              // 结束日期（可选）
  isShared?: boolean                                            // 是否已分享（可选，已废弃）
  page?: number                                                 // 页码（可选）
  pageSize?: number                                             // 每页数量（可选）
  sortBy?: 'uploadTime' | 'title' | 'fileSize' | 'viewCount'  // 排序字段（可选）
  sortOrder?: 'asc' | 'desc'                                    // 排序方向（可选）
}

// 文件统计数据
export interface FileStatistics {
  totalFiles: number              // 文件总数
  totalSize: number               // 总大小（字节）
  categoryStats: {                // 按类别统计
    [K in FileCategory]: {
      count: number               // 文件数量
      size: number                // 大小（字节）
    }
  }
  monthlyUploads: {               // 每月上传统计
    month: string                 // 月份
    count: number                 // 上传数量
    size: number                  // 上传大小（字节）
  }[]
  mostViewedFiles: Array<{        // 最常查看的文件
    id: string                    // 文件ID
    title: string                 // 文件标题
    viewCount: number             // 查看次数
  }>
  recentShares: number            // 近期分享数（已废弃）
  activeShares: number            // 活跃分享数（已废弃）
}

// 批量操作数据
export interface BatchOperationData {
  fileIds: string[]                                       // 文件ID列表
  operation: 'delete' | 'share' | 'unshare' | 'move_category'  // 操作类型
  params?: {                                              // 操作参数（可选）
    doctorId?: string                                     // 医生ID（可选）
    expiresAt?: string                                    // 过期时间（可选）
    permissions?: AccessPermission[]                      // 权限列表（可选）
    category?: FileCategory                               // 目标类别（可选）
  }
}

// 文件分享请求数据（已废弃 - 改用授权机制）
export interface ShareFileData {
  fileId?: string                 // 单个文件ID（可选）
  fileIds?: string[]              // 多个文件ID（可选）
  doctorId?: string               // 医生ID（可选）
  department?: string             // 科室（可选）
  permissions: AccessPermission[] // 权限列表
  shareReason?: string            // 分享理由（可选）
  expiresAt?: string              // 过期时间（可选）
  accessPassword?: string         // 访问密码（可选）
}

// 医疗数据导出请求
export interface ExportRequest {
  fileIds?: string[]              // 文件ID列表（可选）
  category?: FileCategory         // 文件类别（可选）
  dateRange?: {                   // 日期范围（可选）
    startDate: string             // 开始日期
    endDate: string               // 结束日期
  }
  format: 'zip' | 'pdf'           // 导出格式
  includeMetadata: boolean        // 是否包含元数据
}

// 文件预览配置
export interface PreviewConfig {
  supportedTypes: string[]        // 支持的文件类型列表
  maxPreviewSize: number          // 最大预览大小（字节）
  previewTimeout: number          // 预览超时时间（毫秒）
  thumbnailSize: {                // 缩略图尺寸
    width: number                 // 宽度（像素）
    height: number                // 高度（像素）
  }
}

// 上传配置
export interface UploadConfig {
  maxFileSize: number             // 最大文件大小（字节）
  allowedTypes: string[]          // 允许的文件MIME类型
  allowedExtensions: string[]     // 允许的文件扩展名
  chunkSize?: number              // 分片大小（字节，可选）
  maxConcurrentUploads: number    // 最大并发上传数
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
  success: boolean          // 是否成功
  data: {
    files: MedicalFile[]    // 文件列表
    total: number           // 总数
    page: number            // 当前页码
    pageSize: number        // 每页数量
    totalPages: number      // 总页数
  }
  message: string           // 提示消息
}

export interface FileUploadResponse {
  success: boolean          // 是否成功
  data: MedicalFile         // 上传的文件信息
  message: string           // 提示消息
}

export interface ShareListResponse {
  success: boolean          // 是否成功
  data: {
    shares: ShareRecord[]   // 分享记录列表（已废弃）
    total: number           // 总数
    page: number            // 当前页码
    pageSize: number        // 每页数量
  }
  message: string           // 提示消息
}

export interface AccessHistoryResponse {
  success: boolean          // 是否成功
  data: {
    records: AccessRecord[] // 访问记录列表
    total: number           // 总数
    page: number            // 当前页码
    pageSize: number        // 每页数量
  }
  message: string           // 提示消息
}

export interface FileStatisticsResponse {
  success: boolean          // 是否成功
  data: FileStatistics      // 统计数据
  message: string           // 提示消息
}

// 授权请求接口（已废弃 - 改用 MedicalFile.authStatus）
export interface AuthorizationRequest {
  id: string                                  // 请求ID
  doctorId: string                            // 医生ID
  doctorName: string                          // 医生姓名
  doctorDepartment: string                    // 医生科室
  patientId: string                           // 患者ID
  dataId: string                              // 数据ID
  dataName: string                            // 数据名称
  dataType: string                            // 数据类型
  reason: string                              // 申请理由（已移除）
  purpose: string                             // 申请目的（已移除）
  requestedAt: string                         // 申请时间
  status: 'pending' | 'approved' | 'rejected' // 状态
  processedAt?: string                        // 处理时间（可选）
  expiresAt?: string                          // 过期时间（可选）
  rejectReason?: string                       // 拒绝理由（可选）
}

// 授权请求数据（医生发起）（已废弃）
export interface CreateAuthorizationRequest {
  dataId: string                                                                // 数据ID
  patientId: string                                                             // 患者ID
  reason: string                                                                // 申请理由（已移除）
  purpose: 'diagnosis' | 'evaluation' | 'research' | 'consultation' | 'other'  // 申请目的（已移除）
}

// 授权审批数据（患者处理）
export interface ApproveAuthorizationData {
  requestId: string         // 请求ID
  expiresIn: number         // 有效天数（0表示永久）
  notes?: string            // 备注（可选）
}

export interface RejectAuthorizationData {
  requestId: string         // 请求ID
  reason: string            // 拒绝理由
}

// 数据授权状态
export interface DataAuthorizationStatus {
  dataId: string            // 数据ID
  isAuthorized: boolean     // 是否已授权
  authorizationId?: string  // 授权ID（可选）
  authorizedAt?: string     // 授权时间（可选）
  expiresAt?: string        // 过期时间（可选）
}

// 授权请求列表响应
export interface AuthorizationListResponse {
  success: boolean          // 是否成功
  data: {
    requests: AuthorizationRequest[]  // 请求列表
    total: number                      // 总数
    page: number                       // 当前页码
    pageSize: number                   // 每页数量
  }
  message: string           // 提示消息
}
