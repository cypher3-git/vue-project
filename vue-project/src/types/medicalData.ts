// 医疗文件类别枚举（5种类型）
// - lab-report: 检验报告
// - medical-image: 影像资料
// - medication: 用药记录
// - physical-exam: 体检报告
// - other: 其他类型
export type FileCategory = 
  | 'lab-report'      // 检验报告
  | 'medical-image'   // 影像资料
  | 'medication'      // 用药记录
  | 'physical-exam'   // 体检报告
  | 'other'           // 其他类型

// 医疗数据类型常量（全局统一使用）
export const MEDICAL_DATA_TYPES = [
  { label: '检验报告', value: 'lab-report' as FileCategory },
  { label: '影像资料', value: 'medical-image' as FileCategory },
  { label: '用药记录', value: 'medication' as FileCategory },
  { label: '体检报告', value: 'physical-exam' as FileCategory },
  { label: '其他类型', value: 'other' as FileCategory }
] as const

// 医疗数据类型映射（用于显示）
export const MEDICAL_DATA_TYPE_MAP: Record<FileCategory, string> = {
  'lab-report': '检验报告',
  'medical-image': '影像资料',
  'medication': '用药记录',
  'physical-exam': '体检报告',
  'other': '其他类型'
}

// 医疗数据类型选项（用于 el-select，包含"全部类型"选项）
export const MEDICAL_DATA_TYPE_OPTIONS = [
  { label: '全部类型', value: '' },
  ...MEDICAL_DATA_TYPES
]

// 文件状态枚举
// - uploading: 上传中
// - processing: 处理中
// - completed: 已完成
// - failed: 上传失败
export type FileStatus = 'uploading' | 'processing' | 'completed' | 'failed'

// 授权状态枚举（核心字段 - MVP）
// - not-requested: 未申请（医生尚未发起授权请求）
// - pending: 待审批（医生已申请，等待患者处理）
// - approved: 已批准（患者已同意，医生可查看）
// - rejected: 已拒绝（患者拒绝授权）
// - expired: 已过期（授权已过期，需重新申请）
export type AuthorizationStatus = 'not-requested' | 'pending' | 'approved' | 'rejected' | 'expired'

// 医疗文件基础接口
// 【用于】多个API的响应部分：
// - GET /api/medical-files 文件列表查询（响应）
// - POST /api/medical-files 文件上传（响应）
// - GET /api/medical-files/:id 文件详情查询（响应）
// - PUT /api/medical-files/:id 文件更新（响应）
// - GET /api/doctor/medical-data 医生查看可见数据（响应）
// - GET /api/patient/medical-files 患者查看自己的数据（响应）
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
  downloadCount: number                   // 下载次数
  viewCount: number                       // 查看次数
  // 授权状态信息
  authStatus?: AuthorizationStatus        // 授权状态（核心字段）
  authorizationCount?: number             // 授权请求次数
  // 患者身份信息（用于医生端脱敏显示）
  patientName?: string                    // 患者姓名（完整）
  patientIdCard?: string                  // 患者身份证号（完整）
  patientPhone?: string                   // 患者手机号（完整）
  patientGender?: string                  // 患者性别
  patientAge?: number                     // 患者年龄
  // 前端状态管理
  isPatientIdentityRevealed?: boolean     // 是否已显示真实患者身份信息
  // 文件预览信息
  thumbnailUrl?: string                   // 缩略图URL
  previewUrl?: string                     // 预览URL
  // 文件验证信息
  checksum?: string                       // 文件校验和
  isVerified: boolean                     // 是否已验证
  verifiedAt?: string                     // 验证时间
}

// 文件上传数据
// 【用于】POST /api/medical-files 文件上传接口（请求体）
// 患者端上传医疗数据时使用
export interface UploadData {
  file: File                    // 文件对象
  title: string                 // 文件标题
  description: string           // 文件描述
  category: FileCategory        // 文件类别
}

// 文件更新数据
// 【用于】PUT /api/medical-files/:id 文件更新接口（请求体）
// 患者端修改医疗数据信息时使用
export interface UpdateFileData {
  title?: string                // 文件标题（可选）
  description?: string          // 文件描述（可选）
  category?: FileCategory       // 文件类别（可选）
}

// 访问记录
// 【用于】GET /api/access-records 访问记录查询接口（响应）
// 患者端查看谁访问了自己的数据，医生端查看自己的访问历史
export interface AccessRecord {
  id: string                                // 记录ID
  fileId: string                            // 文件ID
  doctorId: string                          // 医生ID
  patientId: string                         // 患者ID
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
// 【用于】GET /api/medical-files 文件列表查询接口（请求参数）
// 支持分页、筛选、排序等功能
export interface FileQueryParams {
  category?: FileCategory                                       // 文件类别（可选）
  keyword?: string                                              // 搜索关键词（可选）
  status?: FileStatus                                           // 文件状态（可选）
  authStatus?: AuthorizationStatus                              // 授权状态（可选）
  startDate?: string                                            // 开始日期（可选）
  endDate?: string                                              // 结束日期（可选）
  page?: number                                                 // 页码（可选）
  pageSize?: number                                             // 每页数量（可选）
  sortBy?: 'uploadTime' | 'title' | 'fileSize' | 'viewCount'  // 排序字段（可选）
  sortOrder?: 'asc' | 'desc'                                    // 排序方向（可选）
}

// 批量操作数据
// 【用于】POST /api/medical-files/batch 批量操作接口（请求体）
// 患者端批量删除或移动文件类别
export interface BatchOperationData {
  fileIds: string[]                   // 文件ID列表
  operation: 'delete' | 'move_category'  // 操作类型
  params?: {                          // 操作参数（可选）
    category?: FileCategory           // 目标类别（可选）
  }
}

// 医疗数据导出请求
// 【用于】POST /api/medical-files/export 数据导出接口（请求体）
// 患者端批量导出医疗数据为ZIP或PDF
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
// 【用于】GET /api/config/preview 获取预览配置（响应）
// 前端获取文件预览的相关配置信息
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
// 【用于】GET /api/config/upload 获取上传配置（响应）
// 前端获取文件上传的相关配置和限制
export interface UploadConfig {
  maxFileSize: number             // 最大文件大小（字节）
  allowedTypes: string[]          // 允许的文件MIME类型
  allowedExtensions: string[]     // 允许的文件扩展名
  chunkSize?: number              // 分片大小（字节，可选）
  maxConcurrentUploads: number    // 最大并发上传数
}

// 数据溯源信息
// 【用于】GET /api/medical-files/:id/trace 数据溯源查询接口（响应）
// 查看文件的完整操作历史和访问记录
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
}

// 数据完整性验证
// 【用于】GET /api/medical-files/:id/integrity 文件完整性验证接口（响应）
// 验证文件是否被篡改
export interface IntegrityCheck {
  fileId: string
  checksum: string
  algorithm: 'md5' | 'sha256'
  verifiedAt: string
  isValid: boolean
  lastModified: string
}

// ==================== API 响应类型 ====================

// 文件列表响应
// 【用于】GET /api/medical-files 文件列表查询接口（响应）
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

// 文件上传响应
// 【用于】POST /api/medical-files 文件上传接口（响应）
export interface FileUploadResponse {
  success: boolean          // 是否成功
  data: MedicalFile         // 上传的文件信息
  message: string           // 提示消息
}


// ==================== 授权管理类型 ====================

// 授权请求
export interface AuthorizationRequest {
  id: string                    // 授权请求ID
  dataId: string                // 数据ID
  dataName: string              // 数据名称
  dataType: string              // 数据类型
  doctorId: string              // 医生ID
  doctorName: string            // 医生姓名
  doctorDepartment: string      // 医生科室
  doctorHospital: string        // 医生医院
  doctorIdCard: string          // 医生身份证号（完整）
  reason: string                // 申请理由
  purpose?: string              // 申请目的
  status: string                // 状态
  requestedAt: string           // 申请时间
  processedAt?: string          // 处理时间
  expiresAt?: string            // 过期时间
  rejectReason?: string         // 拒绝理由
  notes?: string                // 备注
  // 前端状态管理
  isIdentityRevealed?: boolean  // 是否已显示真实身份信息
}

// 同意授权数据
export interface ApproveAuthorizationData {
  requestId: string             // 授权请求ID
  expiresIn: number             // 有效期（天数）
  notes?: string                // 备注
}

// 拒绝授权数据
export interface RejectAuthorizationData {
  requestId: string             // 授权请求ID
  reason: string                // 拒绝理由
}

// 身份溯源请求数据
export interface TraceIdentityData {
  requestId: string             // 授权请求ID
}

// 身份溯源响应数据
export interface TraceIdentityResponse {
  doctor: {                     // 医生详细信息
    id: string
    name: string
    hospital: string
    department: string
    title: string
    isVerified: boolean
  }
  accessRecords: AccessRecord[] // 该医生对此数据的访问记录
  totalAccess: number           // 总访问次数
  lastAccessTime?: string       // 最后访问时间
}

// ==================== 医生端身份溯源类型 ====================

// 医生端对患者身份进行溯源的请求数据
export interface DoctorTracePatientRequest {
  dataId: string                // 医疗数据ID
}

// 患者详细信息接口
export interface PatientInfo {
  id: string                    // 患者ID
  name: string                  // 患者姓名
  gender: string                // 性别
  age: number                   // 年龄
  phone?: string                // 联系电话（可选）
  idCard?: string               // 身份证号（脱敏，可选）
  registeredDepartment?: string // 注册科室（可选）
}

// 医生端溯源患者身份的响应数据
export interface DoctorTracePatientResponse {
  patient: PatientInfo          // 患者详细信息
  dataInfo: {                   // 关联的数据信息
    id: string
    name: string
    type: string
    uploadDate: string
  }
  traceTime: string             // 溯源时间
}
