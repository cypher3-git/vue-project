/**
 * 医疗数据管理相关API接口
 * 提供医疗文件的查询功能
 */

import request from '@/utils/request'
import type {
  FileQueryParams,
  FileListResponse
} from '@/types/medicalData'

// ==================== 已使用的API（1个）====================

/**
 * ✅ 获取医疗文件列表
 * 
 * @description 获取当前患者的所有医疗数据文件，支持筛选、搜索和分页
 * 
 * @param params - 查询参数（可选）
 * @param params.page - 页码（默认1）
 * @param params.pageSize - 每页数量（默认20）
 * @param params.category - 数据类型筛选
 *   - '检验报告': 实验室检验结果
 *   - '影像资料': X光、CT、MRI等影像
 *   - '病历记录': 门诊/住院病历
 *   - '体检报告': 体检中心出具的报告
 *   - '用药记录': 处方和用药历史
 * @param params.keyword - 搜索关键词（匹配文件名、描述）
 * @param params.startDate - 上传开始日期（YYYY-MM-DD）
 * @param params.endDate - 上传结束日期（YYYY-MM-DD）
 * @param params.authStatus - 授权状态筛选
 *   - 'not-requested': 无授权请求
 *   - 'pending': 待审批
 *   - 'authorized': 已授权
 * 
 * @returns Promise<FileListResponse> - 文件列表和分页信息
 * 
 * @后端处理逻辑:
 * 1. 验证用户身份（从token获取患者ID）
 * 2. 构建查询条件：
 *    - 基础条件: patient_id = 当前用户ID
 *    - 类型筛选: category = params.category
 *    - 关键词搜索: title LIKE %keyword% OR description LIKE %keyword%
 *    - 日期范围: created_at BETWEEN startDate AND endDate
 * 3. 查询医疗文件表
 * 4. 关联查询授权信息：
 *    - 统计每个文件的授权请求数
 *    - 获取最新的授权状态
 * 5. 按上传时间倒序排列
 * 6. 分页处理
 * 7. 返回文件列表和统计信息
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "查询成功",
 *   data: {
 *     files: [
 *       {
 *         id: string,              // 文件唯一ID
 *         name: string,            // 文件名称
 *         description: string,     // 文件描述
 *         category: string,        // 数据类型
 *         fileSize: string,        // 文件大小（如"2.3 MB"）
 *         fileUrl: string,         // 文件访问URL
 *         uploadedAt: string,      // 上传时间（ISO 8601）
 *         authStatus: string,      // 授权状态
 *         authorizationCount: number, // 授权请求数量
 *         viewCount: number,       // 查看次数（医生查看）
 *         hashedValue: string      // 文件哈希值（用于完整性验证）
 *       },
 *       // ... 更多文件
 *     ],
 *     total: number,               // 总记录数
 *     page: number,                // 当前页码
 *     pageSize: number             // 每页数量
 *   }
 * }
 * 
 * @调用位置:
 * - src/views/patient/DataView.vue (我的数据页面)
 * 
 * @模拟数据说明:
 * - 如果是演示账户登录（token以'demo_token_'开头）
 * - 会自动返回模拟数据，不调用真实后端API
 * - 这样演示账户可以看到完整功能，不影响真实数据
 * 
 * @应用场景:
 * - 患者查看自己上传的所有医疗数据
 * - 按类型筛选数据（如只看检验报告）
 * - 搜索特定的数据文件
 * - 查看哪些数据有医生申请授权
 * 
 * @注意事项:
 * - 只能查询当前登录患者自己的数据
 * - 返回的文件URL应该是有权限控制的临时URL
 * - 授权状态会影响医生是否能查看数据详情
 * 
 * @example
 * // 获取所有数据
 * const response = await getMedicalFiles()
 * 
 * // 筛选检验报告
 * const response = await getMedicalFiles({
 *   category: '检验报告',
 *   page: 1,
 *   pageSize: 10
 * })
 * 
 * // 搜索关键词
 * const response = await getMedicalFiles({
 *   keyword: '血常规',
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * })
 * 
 * // 查看待授权的数据
 * const response = await getMedicalFiles({
 *   authStatus: 'pending'
 * })
 */
export const getMedicalFiles = async (params?: FileQueryParams): Promise<FileListResponse> => {
  return request.get('/medical-data/files', { params })
}

// 导出所有API函数作为默认对象
export default {
  getMedicalFiles
}
