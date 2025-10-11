# API 接口文档

本目录包含了医疗数据管理系统前端的所有 API 接口定义。

## 📁 目录结构

```
src/api/
├── auth.ts           # 用户认证相关API
├── medicalData.ts    # 医疗数据管理API
├── share.ts          # 数据分享管理API
├── access.ts         # 访问记录管理API
├── doctor.ts         # 医生端功能API
├── patient.ts        # 患者端功能API
├── index.ts          # 统一导出入口
└── README.md         # 本文档
```

## 🔐 auth.ts - 用户认证API

提供用户登录、注册、权限管理等功能。

### 主要接口：
- `login()` - 手机号密码登录
- `loginWithIdCard()` - 身份证号登录
- `loginWithPhoneCode()` - 手机验证码登录
- `register()` - 用户注册
- `logout()` - 退出登录
- `refreshToken()` - 刷新令牌
- `getCurrentUser()` - 获取当前用户信息
- `updateProfile()` - 更新个人资料
- `changePassword()` - 修改密码
- `sendVerificationCode()` - 发送验证码
- `resetPassword()` - 重置密码
- `getDoctorVerificationStatus()` - 获取医生认证状态
- `submitDoctorVerification()` - 提交医生认证材料

## 📄 medicalData.ts - 医疗数据管理API

提供医疗文件的完整生命周期管理。

### 主要接口：
- `getMedicalFiles()` - 获取医疗文件列表（支持分页、筛选）
- `getMedicalFileById()` - 获取单个文件详情
- `uploadMedicalFile()` - 上传医疗文件（支持进度回调）
- `updateMedicalFile()` - 更新文件信息
- `deleteMedicalFile()` - 删除文件
- `downloadMedicalFile()` - 下载文件
- `previewMedicalFile()` - 预览文件
- `getFileShareStatus()` - 获取文件分享状态
- `batchOperateFiles()` - 批量操作文件
- `getFileStatistics()` - 获取文件统计信息
- `exportMedicalData()` - 导出医疗数据
- `getDataTraceability()` - 获取数据溯源信息
- `verifyFileIntegrity()` - 验证文件完整性
- `searchMedicalFiles()` - 搜索医疗文件
- `getRecentFiles()` - 获取最近上传的文件

## 🔗 share.ts - 数据分享管理API

管理医疗数据的分享、权限控制等功能。

### 主要接口：
- `createShare()` - 创建文件分享
- `getMyShares()` - 获取我的分享记录
- `getReceivedShares()` - 获取收到的分享（医生端）
- `getShareById()` - 获取分享详情
- `getShareByToken()` - 通过分享链接获取信息
- `updateShare()` - 更新分享记录
- `revokeShare()` - 撤销分享
- `batchRevokeShares()` - 批量撤销分享
- `extendShareExpiration()` - 延长分享有效期
- `getFileShares()` - 获取文件的所有分享
- `getSharesWithDoctor()` - 获取与特定医生的分享
- `getShareStatistics()` - 获取分享统计信息
- `checkSharePermission()` - 检查分享权限
- `generateShareLink()` - 生成分享链接
- `accessSharedFile()` - 访问共享文件

## 📊 access.ts - 访问记录管理API

记录和查询医疗数据的访问历史。

### 主要接口：
- `getMyAccessRecords()` - 获取我的访问记录（患者端）
- `getDoctorAccessHistory()` - 获取医生访问历史
- `getAccessRecordById()` - 获取访问记录详情
- `getFileAccessRecords()` - 获取特定文件的访问记录
- `getDoctorAccessRecords()` - 获取特定医生的访问记录
- `recordAccess()` - 记录文件访问
- `getAccessStatistics()` - 获取访问统计信息
- `getRecentAccessRecords()` - 获取最近访问记录
- `getAbnormalAccessRecords()` - 获取异常访问记录
- `exportAccessRecords()` - 导出访问记录
- `getAccessHeatmap()` - 获取访问热力图数据
- `getFileAccessRanking()` - 获取文件访问排行榜

## 👨‍⚕️ doctor.ts - 医生端功能API

医生端专用的患者管理和数据访问功能。

### 主要接口：
- `getPatientList()` - 获取患者列表
- `getPatientById()` - 获取患者详情
- `searchPatients()` - 搜索患者
- `getPatientFiles()` - 获取患者的医疗文件
- `requestPatientDataAccess()` - 申请访问患者数据
- `getMyPermissionRequests()` - 获取我的权限申请
- `getPermissionRequestById()` - 获取申请详情
- `cancelPermissionRequest()` - 撤销权限申请
- `getSharedFiles()` - 获取收到的分享文件
- `accessPatientFile()` - 访问患者文件
- `downloadSharedFile()` - 下载共享文件
- `getAccessHistory()` - 获取访问历史
- `getDoctorStatistics()` - 获取医生端统计数据
- `addPatientNote()` - 添加患者备注
- `getPatientNotes()` - 获取患者备注
- `toggleFavoritePatient()` - 标记常用患者
- `getFavoritePatients()` - 获取常用患者列表

## 🏥 patient.ts - 患者端功能API

患者端专用的数据管理和权限控制功能。

### 主要接口：
- `getFileStatistics()` - 获取文件统计信息
- `getPermissionRequests()` - 获取权限申请列表
- `processPermissionRequest()` - 审批权限申请
- `batchProcessRequests()` - 批量审批申请
- `getAuthorizedDoctors()` - 获取已授权的医生
- `getDoctorById()` - 获取医生详情
- `searchDoctors()` - 搜索医生
- `getDoctorShares()` - 获取与医生的分享记录
- `getDoctorAccessRecords()` - 获取医生的访问记录
- `revokeAllDoctorAccess()` - 撤销医生的所有权限
- `addDoctorNote()` - 添加医生备注
- `getDoctorNotes()` - 获取医生备注
- `toggleTrustedDoctor()` - 标记信任的医生
- `getTrustedDoctors()` - 获取信任的医生列表
- `getAccessOverview()` - 获取访问概览
- `getSecurityEvents()` - 获取安全事件记录
- `resolveSecurityEvent()` - 标记安全事件为已处理
- `getPrivacySettings()` - 获取隐私设置
- `updatePrivacySettings()` - 更新隐私设置

## 📦 使用方法

### 方式1：命名导入（推荐）

```typescript
import { authApi, medicalDataApi, shareApi } from '@/api'

// 使用认证API
await authApi.login({ 
  phone: '13800138000', 
  password: '123456', 
  role: 'patient' 
})

// 使用医疗数据API
const files = await medicalDataApi.getMedicalFiles({ 
  category: 'report',
  page: 1,
  pageSize: 10 
})

// 使用分享API
await shareApi.createShare({
  fileIds: ['file-id-1', 'file-id-2'],
  doctorId: 'doctor-id',
  permissions: ['view', 'download'],
  expiresAt: '2025-12-31'
})
```

### 方式2：默认导入

```typescript
import api from '@/api'

// 所有API都在api对象下
await api.auth.login({ ... })
await api.medicalData.uploadMedicalFile({ ... })
await api.share.revokeShare('share-id')
```

### 方式3：直接导入单个函数

```typescript
import { login, getCurrentUser } from '@/api/auth'
import { uploadMedicalFile, downloadMedicalFile } from '@/api/medicalData'

await login({ ... })
const user = await getCurrentUser()
```

## 🔧 API 响应格式

所有API接口返回统一的响应格式：

```typescript
interface ApiResponse<T = any> {
  success: boolean      // 是否成功
  message: string       // 响应消息
  data?: T             // 响应数据（可选）
  code?: number        // 状态码（可选）
  errors?: Record<string, string[]>  // 错误信息（可选）
}
```

### 分页数据格式

```typescript
interface PaginatedData<T> {
  items: T[]           // 数据列表
  total: number        // 总数
  page: number         // 当前页
  pageSize: number     // 每页数量
  totalPages: number   // 总页数
}
```

## 🛡️ 错误处理

所有API调用都应该包含错误处理：

```typescript
try {
  const response = await medicalDataApi.uploadMedicalFile(uploadData)
  if (response.success) {
    console.log('上传成功:', response.data)
  } else {
    console.error('上传失败:', response.message)
  }
} catch (error) {
  console.error('请求出错:', error)
}
```

## 📝 注意事项

1. **认证要求**：除了登录、注册等公开接口外，其他接口都需要在请求头中携带 Token
2. **权限控制**：某些接口有角色限制，患者端接口只能患者调用，医生端接口只能医生调用
3. **文件上传**：上传接口支持进度回调，可用于显示上传进度条
4. **文件下载**：下载接口会自动触发浏览器下载，无需额外处理
5. **类型安全**：所有接口都有完整的 TypeScript 类型定义，使用时会有代码提示

## 🔗 相关文档

- [类型定义文档](../types/README.md)
- [Store状态管理文档](../stores/README.md)
- [路由配置文档](../router/README.md)

## 📅 更新日志

- **2025-10-04**: 完成所有API模块的初始实现
  - ✅ 认证模块 (auth.ts)
  - ✅ 医疗数据管理模块 (medicalData.ts)
  - ✅ 数据分享模块 (share.ts)
  - ✅ 访问记录模块 (access.ts)
  - ✅ 医生端功能模块 (doctor.ts)
  - ✅ 患者端功能模块 (patient.ts)
  - ✅ 统一导出入口 (index.ts)

