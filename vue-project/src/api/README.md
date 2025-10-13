# API 接口文档

本目录包含医疗数据管理系统前端的所有 API 接口定义。

## 📊 模块概览

| 模块 | 文件 | API 数量 | 说明 |
|------|------|---------|------|
| 认证模块 | `auth.ts` | 7 | 用户登录、注册、个人信息管理 |
| 医疗数据 | `medicalData.ts` | 1 | 患者医疗数据查询 |
| 医生端 | `doctor.ts` | 4 | 医生数据管理、统计、访问历史、患者身份溯源 |
| 患者端 | `patient.ts` | 10 | 授权管理、科室管理、身份溯源 |
| 访问记录 | `access.ts` | 3 | 访问统计、记录查询、导出 |
| **总计** | - | **25** | - |

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

### 3. doctor.ts - 医生端模块（4个API）

医生端数据管理相关接口。

**API列表：**
- ✅ `getMedicalDataList()` - 获取可访问的医疗数据列表
- ✅ `getDoctorStatistics()` - 获取医生端统计数据
- ✅ `getAccessHistory()` - 获取访问历史记录
- ✅ `tracePatientIdentity()` - 患者身份溯源

**使用位置：**
- `views/doctor/DataManagementView.vue` - 数据管理页面

**权限说明：**
- 未授权数据：只显示数据基本信息，患者信息显示为"需授权后可见"
- 已授权数据：显示完整的数据和患者信息
- 身份溯源：医生对已授权数据进行患者身份信息溯源

---

### 4. patient.ts - 患者端模块（10个API）

患者端授权管理、科室管理和身份溯源相关接口。

**API列表：**

**授权管理（4个）：**
- ✅ `getAuthorizationRequests()` - 获取授权请求列表
- ✅ `approveAuthorization()` - 同意授权申请
- ✅ `rejectAuthorization()` - 拒绝授权申请
- ✅ `revokeAuthorization()` - 撤销已授予的授权

**统计与溯源（3个）：**
- ✅ `getFileStatistics()` - 获取文件统计信息
- ✅ `getAuthorizationHistory()` - 获取授权历史记录
- ✅ `traceIdentity()` - 医生身份溯源

**科室管理（3个）：**
- ✅ `getPatientDepartments()` - 获取患者已注册科室列表
- ✅ `registerNewDepartment()` - 注册新科室
- ✅ `switchDepartment()` - 切换当前科室

**使用位置：**
- `views/patient/DataView.vue` - 我的数据页面
- `views/patient/AuthorizationView.vue` - 授权管理页面
- `layouts/AppLayout.vue` - 科室切换
- `components/DepartmentDialog.vue` - 科室管理弹窗

**授权流程：**
1. 医生发起授权申请 → `pending` 状态
2. 患者审批：
   - 同意 → `approved` 状态，医生可访问数据
   - 拒绝 → `rejected` 状态，医生需重新申请
3. 患者可随时撤销授权 → `revoked` 状态
4. 患者可通过"身份溯源"查看医生详细信息和访问记录

**科室管理流程：**
1. 患者注册时选择初始科室
2. 登录后可在主页切换科室
3. 切换时只能选择已注册科室
4. 需要切换到未注册科室时，需先注册该科室

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

## 🏥 医疗数据类型枚举

系统支持 5 种医疗数据类型（定义在 `types/medicalData.ts`）：

| FileCategory 值 | 中文标签 | 典型数据 |
|----------------|---------|----------|
| `lab-report` | 检验报告 | 血常规、肝功能、肾功能、血脂、血糖等 |
| `medical-image` | 影像资料 | X光片、CT、MRI、彩超、心电图等 |
| `medication` | 用药记录 | 处方记录、用药历史、疫苗接种等 |
| `physical-exam` | 体检报告 | 入职体检、年度体检、专项体检等 |
| `other` | 其他类型 | 其他医疗相关文件 |

**使用示例：**

```typescript
import { MEDICAL_DATA_TYPES, MEDICAL_DATA_TYPE_MAP } from '@/types/medicalData'

// 获取所有类型选项（用于 el-select）
const options = MEDICAL_DATA_TYPES
// [{ label: '检验报告', value: 'lab-report' }, ...]

// 显示类型标签
const label = MEDICAL_DATA_TYPE_MAP['lab-report']  // '检验报告'
```

---

## 🏢 科室枚举

系统支持 12 个科室（定义在 `types/auth.ts`）：

```typescript
export const DEPARTMENTS = [
  '心血管科',
  '内科',
  '骨科',
  '神经科',
  '外科',
  '呼吸内科',
  '消化内科',
  '泌尿科',
  '妇产科',
  '儿科',
  '内分泌科',
  '肿瘤科'
] as const
```

**使用说明：**
- 患者和医生注册时必须选择科室
- 患者可注册多个科室并切换使用
- 医生只能注册一个科室

**使用示例：**

```typescript
import { DEPARTMENTS, DEPARTMENT_OPTIONS } from '@/types/auth'

// 获取所有科室选项（用于 el-select）
const options = DEPARTMENT_OPTIONS
// [{ label: '心血管科', value: '心血管科' }, ...]
```

---

## 🔄 使用方式

### 方式1：从统一入口导入（推荐）

```typescript
import { authApi, medicalDataApi, patientApi } from '@/api'

// 登录
await authApi.login({ 
  phone: '13800138000', 
  code: '123456',
  role: 'patient' 
})

// 获取医疗文件
const files = await medicalDataApi.getMedicalFiles({ 
  category: 'lab-report',  // 使用 FileCategory 枚举值
  page: 1,
  pageSize: 10 
})

// 获取患者科室列表
const departments = await patientApi.getPatientDepartments()

// 切换科室
await patientApi.switchDepartment({ departmentId: 'dept-123' })
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

**患者端：**
- `getMedicalFiles()` - 患者医疗文件列表
- `getPatientAuthorizationRequests()` - 授权请求列表
- `traceIdentity()` - 医生身份溯源

**医生端：**
- `getMedicalDataList()` - 医生可访问数据列表
- `getDoctorStatistics()` - 医生统计数据
- `getAccessHistory()` - 医生访问历史
- `getDoctorAccessibleData()` - 医生可访问数据
- `traceDoctorPatientIdentity()` - 患者身份溯源

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

**最后更新**: 2025-10-13  
**API总数**: 25个  
**文档维护**: 每次API变更后需同步更新此文档

---

## 🆕 最近更新

### 2025-10-13
- ✅ 新增患者端科室管理功能（3个API）
  - `getPatientDepartments()` - 获取患者已注册科室列表
  - `registerNewDepartment()` - 注册新科室
  - `switchDepartment()` - 切换当前科室
- ✅ 新增身份溯源功能（2个API）
  - 患者端：`traceIdentity()` - 查看医生详细信息和访问记录
  - 医生端：`tracePatientIdentity()` - 查看患者详细信息
- ✅ 统一科室枚举（12个科室）
- ✅ 精简医疗数据类型（5种类型）
- 📝 API总数：20 → 25

### 2025-10-12
- ✅ 删除未使用的API（91个）
- ✅ 添加模拟数据支持
- 📝 初始版本文档
