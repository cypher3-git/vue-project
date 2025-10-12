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

// ==================== 已使用的API（3个）====================

/**
 * ✅ 获取患者的所有访问记录
 * 
 * @description 获取医生访问患者数据的详细记录列表
 * 
 * @param params - 查询参数（可选）
 * @param params.fileId - 按文件ID筛选
 * @param params.doctorId - 按医生ID筛选
 * @param params.accessType - 按访问类型筛选
 *   - 'view': 查看
 *   - 'download': 下载
 *   - 'preview': 预览
 * @param params.startDate - 开始日期（YYYY-MM-DD）
 * @param params.endDate - 结束日期（YYYY-MM-DD）
 * @param params.page - 页码（默认1）
 * @param params.pageSize - 每页数量（默认20）
 * 
 * @returns Promise<AccessHistoryResponse> - 访问记录列表
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份（从token获取患者ID）
 * 2. 查询访问记录表（access_records）
 * 3. 条件筛选：
 *    - patient_id = 当前患者ID
 *    - file_id = params.fileId (如果提供)
 *    - doctor_id = params.doctorId (如果提供)
 *    - access_type = params.accessType (如果提供)
 *    - accessed_at BETWEEN startDate AND endDate
 * 4. 关联查询：
 *    - 医生信息（姓名、医院、科室）
 *    - 文件信息（名称、类型、大小）
 *    - 授权信息（用于验证访问合法性）
 * 5. 按访问时间倒序排列
 * 6. 分页处理
 * 7. 返回访问记录列表
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "查询成功",
 *   data: {
 *     records: [
 *       {
 *         id: string,              // 访问记录ID
 *         doctorId: string,        // 医生ID
 *         doctorName: string,      // 医生姓名
 *         doctorHospital: string,  // 医院
 *         doctorDepartment: string,// 科室
 *         fileId: string,          // 文件ID
 *         fileName: string,        // 文件名称
 *         fileCategory: string,    // 文件类型
 *         accessType: string,      // 访问类型（view/download/preview）
 *         accessedAt: string,      // 访问时间（ISO 8601）
 *         duration: number,        // 访问时长（秒）
 *         ipAddress: string,       // 访问IP地址
 *         userAgent: string,       // 浏览器信息
 *         isAuthorized: boolean    // 是否有授权（用于标识异常访问）
 *       },
 *       // ... 更多记录
 *     ],
 *     total: number,
 *     page: number,
 *     pageSize: number,
 *     hasAbnormal: boolean         // 是否存在异常访问
 *   }
 * }
 * 
 * @调用位置:
 * - src/views/patient/AccessView.vue:360 (访问记录页面)
 * 
 * @应用场景:
 * - 查看所有医生对数据的访问历史
 * - 筛选特定医生的访问记录
 * - 筛选特定文件的访问记录
 * - 按时间范围查询访问记录
 * - 发现异常访问行为
 * 
 * @异常检测:
 * - 未授权的访问（isAuthorized = false）
 * - 频繁访问（短时间内多次访问）
 * - 异常时间访问（深夜访问）
 * - 可疑IP访问（异地IP）
 * 
 * @隐私保护:
 * - IP地址脱敏显示（如 192.168.*.*）
 * - UserAgent简化显示（只显示浏览器类型）
 * - 访问记录保留期限设置（如1年）
 * 
 * @example
 * // 获取所有访问记录
 * const response = await getMyAccessRecords()
 * 
 * // 查看特定文件的访问记录
 * const response = await getMyAccessRecords({
 *   fileId: 'file-123',
 *   page: 1,
 *   pageSize: 20
 * })
 * 
 * // 查看特定医生的访问记录
 * const response = await getMyAccessRecords({
 *   doctorId: 'doctor-456',
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * })
 * 
 * // 只看下载记录
 * const response = await getMyAccessRecords({
 *   accessType: 'download'
 * })
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
 * ✅ 导出访问记录
 * 
 * @description 将访问记录导出为CSV或Excel文件，供离线查看和分析
 * 
 * @param params - 导出参数（可选）
 * @param params.fileId - 按文件ID筛选
 * @param params.doctorId - 按医生ID筛选
 * @param params.startDate - 开始日期（YYYY-MM-DD）
 * @param params.endDate - 结束日期（YYYY-MM-DD）
 * @param params.format - 导出格式
 *   - 'csv': CSV文件（逗号分隔值）
 *   - 'excel': Excel文件（.xlsx）
 * 
 * @returns Promise<void> - 自动触发文件下载
 * 
 * @后端处理逻辑:
 * 1. 验证患者身份
 * 2. 查询符合条件的访问记录（不分页，全部导出）
 * 3. 数据脱敏处理：
 *    - IP地址部分隐藏
 *    - 敏感信息过滤
 * 4. 根据format参数生成文件：
 *    - CSV: 使用UTF-8编码，包含BOM（Excel兼容）
 *    - Excel: 生成.xlsx格式，包含表头样式
 * 5. 文件内容包含：
 *    - 访问时间
 *    - 医生姓名
 *    - 医院/科室
 *    - 文件名称
 *    - 数据类型
 *    - 访问类型
 *    - 访问时长
 * 6. 设置响应头：
 *    - Content-Type: text/csv 或 application/vnd.openxmlformats
 *    - Content-Disposition: attachment; filename="访问记录.csv"
 * 7. 返回文件流
 * 
 * @后端返回数据: Blob文件流
 * 
 * @调用位置:
 * - src/views/patient/AccessView.vue:548 (访问记录页面-导出按钮)
 * 
 * @应用场景:
 * - 导出访问记录用于离线分析
 * - 提供给第三方审计
 * - 生成访问报告
 * - 留档备查
 * 
 * @文件格式:
 * CSV/Excel列：
 * | 访问时间 | 医生姓名 | 医院 | 科室 | 文件名称 | 数据类型 | 访问类型 | 时长(秒) |
 * |---------|---------|------|------|---------|---------|---------|---------|
 * 
 * @导出限制:
 * - 单次导出最多10000条记录
 * - 大量数据建议分批导出或使用异步任务
 * - 频率限制：每小时最多导出3次
 * 
 * @注意事项:
 * - 导出操作会记录到操作日志
 * - 导出文件不包含敏感的IP和UserAgent完整信息
 * - 文件名自动包含时间范围（如"访问记录_2024-01-01_至_2024-12-31.xlsx"）
 * 
 * @example
 * // 导出所有访问记录为Excel
 * await exportAccessRecords({
 *   format: 'excel'
 * })
 * 
 * // 导出指定时间范围的记录为CSV
 * await exportAccessRecords({
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31',
 *   format: 'csv'
 * })
 * 
 * // 导出特定医生的访问记录
 * await exportAccessRecords({
 *   doctorId: 'doctor-456',
 *   format: 'excel'
 * })
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

// 导出所有API函数作为默认对象
export default {
  getMyAccessRecords,
  exportAccessRecords
}
