# API 接口文档

本目录包含医疗数据管理系统前端的所有 API 接口定义。

## 📊 模块概览

| 模块 | 文件 | API 数量 | 说明 |
|------|------|---------|------|
| 认证模块 | `auth.ts` | 7 | 用户登录、注册、个人信息管理 |
| 医疗数据 | `medicalData.ts` | 1 | 患者医疗数据查询 |
| 医生端 | `doctor.ts` | 3 | 医生数据管理、统计、访问历史 |
| 患者端 | `patient.ts` | 6 | 授权管理、文件统计 |
| 访问记录 | `access.ts` | 3 | 访问统计、记录查询、导出 |
| **总计** | - | **20** | - |

## 📁 文件说明

### 1. auth.ts - 认证模块（7个API）

用户认证和个人信息管理相关接口。

**API列表：**
- ✅ `login()` - 手机号验证码登录
- ✅ `register()` - 用户注册
- ✅ `logout()` - 退出登录
- ✅ `getCurrentUser()` - 获取当前用户信息
- ✅ `updateProfile()` - 更新个人信息
- ✅ `refreshToken()` - 刷新访问令牌
- ✅ `sendVerificationCode()` - 发送手机验证码

**使用位置：**
- `stores/auth.ts` - 认证状态管理
- `views/auth/LoginView.vue` - 登录页面
- `views/auth/RegisterView.vue` - 注册页面

---

### 2. medicalData.ts - 医疗数据模块（1个API）

医疗数据查询相关接口。

**API列表：**
- ✅ `getMedicalFiles()` - 获取医疗文件列表

**使用位置：**
- `views/patient/DataView.vue` - 我的数据页面

---

### 3. doctor.ts - 医生端模块（3个API）

医生端数据管理相关接口。

**API列表：**
- ✅ `getMedicalDataList()` - 获取可访问的医疗数据列表
- ✅ `getDoctorStatistics()` - 获取医生端统计数据
- ✅ `getAccessHistory()` - 获取访问历史记录

**使用位置：**
- `views/doctor/DataManagementView.vue` - 数据管理页面

**权限说明：**
- 未授权数据：只显示数据基本信息，患者信息显示为"需授权后可见"
- 已授权数据：显示完整的数据和患者信息

---

### 4. patient.ts - 患者端模块（6个API）

患者端授权管理和统计相关接口。

**API列表：**
- ✅ `getFileStatistics()` - 获取文件统计信息
- ✅ `getAuthorizationRequests()` - 获取授权请求列表
- ✅ `approveAuthorization()` - 同意授权申请
- ✅ `rejectAuthorization()` - 拒绝授权申请
- ✅ `revokeAuthorization()` - 撤销已授予的授权
- ✅ `getAuthorizationHistory()` - 获取授权历史记录

**使用位置：**
- `views/patient/DataView.vue` - 我的数据页面
- `views/patient/AuthorizationView.vue` - 授权管理页面

**授权流程：**
1. 医生发起授权申请 → `pending` 状态
2. 患者审批：
   - 同意 → `approved` 状态，医生可访问数据
   - 拒绝 → `rejected` 状态，医生需重新申请
3. 患者可随时撤销授权 → `revoked` 状态

---

### 5. access.ts - 访问记录模块（3个API）

数据访问记录和统计相关接口。

**API列表：**
- ✅ `getAccessStatistics()` - 获取访问统计信息
- ✅ `getMyAccessRecords()` - 获取访问记录列表
- ✅ `exportAccessRecords()` - 导出访问记录

**使用位置：**
- `views/patient/AccessView.vue` - 访问记录页面

**访问类型：**
- `view`: 查看数据
- `download`: 下载数据
- `preview`: 预览数据

---

## 🔄 使用方式

### 方式1：从统一入口导入（推荐）

```typescript
import { authApi, medicalDataApi } from '@/api'

// 登录
await authApi.login({ 
  phone: '13800138000', 
  code: '123456',
  role: 'patient' 
})

// 获取医疗文件
const files = await medicalDataApi.getMedicalFiles({ 
  category: '检验报告',
  page: 1,
  pageSize: 10 
})
```

### 方式2：直接导入单个API

```typescript
import { login, register } from '@/api/auth'
import { getMedicalFiles } from '@/api/medicalData'

await login({ phone: '13800138000', code: '123456', role: 'patient' })
```

### 方式3：在Store中使用

```typescript
import { defineStore } from 'pinia'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const login = async (credentials) => {
    const response = await authApi.login(credentials)
    // 处理响应...
  }
  
  return { login }
})
```

---

## 🎯 模拟数据支持

部分API支持模拟数据，用于演示账户展示完整功能。

### 启用条件

模拟数据仅对**演示账户**生效：
- 患者演示账户：手机号 `13800138000`
- 医生演示账户：手机号 `13900139000`
- 判断依据：token 以 `demo_token_` 开头

### 支持模拟数据的API

- `getMedicalFiles()` - 患者医疗文件列表
- `getMedicalDataList()` - 医生可访问数据列表
- `getDoctorStatistics()` - 医生统计数据
- `getAccessHistory()` - 医生访问历史
- `getDoctorAccessibleData()` - 医生可访问数据

### 配置文件

模拟数据配置：`src/config/mock.config.ts`

```typescript
export const MOCK_CONFIG = {
  USE_MOCK_DATA: true,     // 是否启用模拟数据
  MOCK_DELAY: 300,         // 模拟请求延迟（毫秒）
  ENABLE_MOCK_LOG: true    // 是否打印模拟日志
}
```

---

## 📝 API 注释规范

每个API函数包含以下详细注释：

1. **功能描述** (`@description`)
2. **参数说明** (`@param`)
   - 参数名称和类型
   - 参数含义和取值范围
   - 可选参数标注
3. **返回值** (`@returns`)
4. **后端处理逻辑** (`@后端处理逻辑`)
   - 详细的处理步骤
   - 业务规则说明
5. **返回数据结构** (`@后端返回数据`)
   - 完整的JSON结构
   - 字段说明
6. **调用位置** (`@调用位置`)
   - 文件路径和行号
7. **使用示例** (`@example`)

**示例：**

```typescript
/**
 * ✅ 用户登录
 * 
 * @description 使用手机号+验证码+角色进行登录
 * 
 * @param credentials - 登录凭证
 * @param credentials.phone - 手机号（11位）
 * @param credentials.code - 验证码（6位）
 * @param credentials.role - 用户角色
 * 
 * @returns Promise<LoginResponse> - 登录结果
 * 
 * @后端处理逻辑:
 * 1. 验证手机号和验证码
 * 2. 查询用户信息
 * 3. 生成JWT token
 * 4. 返回用户信息和token
 * 
 * @后端返回数据:
 * {
 *   success: true,
 *   message: "登录成功",
 *   data: {
 *     user: User,
 *     token: string,
 *     refreshToken: string,
 *     expiresIn: number
 *   }
 * }
 * 
 * @调用位置:
 * - src/stores/auth.ts:37
 * 
 * @example
 * await login({
 *   phone: '13800138000',
 *   code: '123456',
 *   role: 'patient'
 * })
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  return request.post('/auth/login', credentials)
}
```

---

## 🗑️ 已删除的API

以下API已被删除（未在前端使用）：

### auth.ts（12个）
- ❌ loginWithIdCard
- ❌ loginWithPhoneCode  
- ❌ changePassword
- ❌ verifyCode
- ❌ sendResetPasswordSms
- ❌ resetPassword
- ❌ bindPhone
- ❌ unbindPhone
- ❌ getDoctorVerificationStatus
- ❌ submitDoctorVerification
- ❌ checkUsernameAvailability
- ❌ checkPhoneExists
- ❌ getSessionInfo
- ❌ logoutAllDevices

### medicalData.ts（14个）
- ❌ getMedicalFileById
- ❌ uploadMedicalFile
- ❌ updateMedicalFile
- ❌ deleteMedicalFile
- ❌ downloadMedicalFile
- ❌ previewMedicalFile
- ❌ getFileShareStatus
- ❌ batchOperateFiles
- ❌ getFileStatistics
- ❌ exportMedicalData
- ❌ getDataTraceability
- ❌ verifyFileIntegrity
- ❌ searchMedicalFiles
- ❌ getRecentFiles
- ❌ getFileAccessCount

### doctor.ts（21个）
- ❌ getPatientList
- ❌ getPatientById
- ❌ searchPatients
- ❌ getPatientFiles
- ❌ requestPatientDataAccess
- ❌ getMyPermissionRequests
- ❌ getPermissionRequestById
- ❌ cancelPermissionRequest
- ❌ getSharedFiles
- ❌ accessPatientFile
- ❌ downloadSharedFile
- ❌ addPatientNote
- ❌ getPatientNotes
- ❌ toggleFavoritePatient
- ❌ getFavoritePatients
- ❌ requestDataAuthorization
- ❌ getAuthorizationStatus
- ❌ getMyAuthorizationRequests

### patient.ts（18个）
- ❌ getPermissionRequests
- ❌ processPermissionRequest
- ❌ batchProcessRequests
- ❌ getAuthorizedDoctors
- ❌ getDoctorById
- ❌ searchDoctors
- ❌ getDoctorShares
- ❌ getDoctorAccessRecords
- ❌ revokeAllDoctorAccess
- ❌ addDoctorNote
- ❌ getDoctorNotes
- ❌ toggleTrustedDoctor
- ❌ getTrustedDoctors
- ❌ getAccessOverview
- ❌ getSecurityEvents
- ❌ resolveSecurityEvent
- ❌ getPrivacySettings
- ❌ updatePrivacySettings

### share.ts（16个，整个文件已删除）
- ❌ 所有分享相关API

### access.ts（10个）
- ❌ getDoctorAccessHistory
- ❌ getAccessRecordById
- ❌ getFileAccessRecords
- ❌ getDoctorAccessRecords
- ❌ recordAccess
- ❌ getRecentAccessRecords
- ❌ getAbnormalAccessRecords
- ❌ getAccessHeatmap
- ❌ getFileAccessRanking

**删除原因：**
- 代码中未调用
- 简化API维护
- 减少不必要的代码

---

## 📚 相关文档

- [API使用情况详细分析](../../API_USAGE_ANALYSIS.md) - 完整的API使用情况报告
- [Mock数据配置](../config/mock.config.ts) - 模拟数据配置说明
- [类型定义](../types/) - TypeScript类型定义

---

**最后更新**: 2025-10-12  
**API总数**: 20个  
**文档维护**: 每次API变更后需同步更新此文档
