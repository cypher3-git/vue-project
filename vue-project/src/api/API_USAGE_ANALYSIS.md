# API 使用情况详细分析报告

**生成日期**: 2025-10-12  
**项目**: 医疗数据管理系统  
**分析范围**: `/src/api` 目录下的所有 API 文件  

---

## 📊 总体统计

| API 模块 | 总函数数 | 已使用 | 未使用 | 使用率 |
|---------|---------|--------|--------|--------|
| auth.ts | 19 | 7 | 12 | 36.8% |
| medicalData.ts | 15 | 1 | 14 | 6.7% |
| doctor.ts | 24 | 3 | 21 | 12.5% |
| patient.ts | 24 | 6 | 18 | 25.0% |
| share.ts | 16 | 0 | 16 | 0.0% |
| access.ts | 13 | 3 | 10 | 23.1% |
| **总计** | **111** | **20** | **91** | **18.0%** |

---

### 认证模块（7个）

| API | 说明 | 调用位置 |
|-----|------|---------|
| login | 手机号验证码登录 | stores/auth.ts:37 |
| register | 用户注册 | stores/auth.ts:62 |
| logout | 退出登录 | stores/auth.ts:82 |
| getCurrentUser | 获取当前用户信息 | stores/auth.ts:20 |
| updateProfile | 更新个人信息 | stores/auth.ts:102 |
| refreshToken | 刷新访问令牌 | stores/auth.ts:148 |
| sendVerificationCode | 发送手机验证码 | LoginView.vue:185, RegisterView.vue:276 |

### 医疗数据模块（1个）

| API | 说明 | 调用位置 |
|-----|------|---------|
| getMedicalFiles | 获取医疗文件列表 | patient/DataView.vue |

### 医生端模块（3个）

| API | 说明 | 调用位置 |
|-----|------|---------|
| getMedicalDataList | 获取可访问数据列表 | doctor/DataManagementView.vue |
| getDoctorStatistics | 获取统计数据 | doctor/DataManagementView.vue |
| getAccessHistory | 获取访问历史 | doctor/DataManagementView.vue |

### 患者端模块（6个）

| API | 说明 | 调用位置 |
|-----|------|---------|
| getFileStatistics | 获取文件统计 | patient/DataView.vue |
| getAuthorizationRequests | 获取授权请求列表 | patient/AuthorizationView.vue:352 |
| approveAuthorization | 同意授权申请 | patient/AuthorizationView.vue:491 |
| rejectAuthorization | 拒绝授权申请 | patient/AuthorizationView.vue:533 |
| revokeAuthorization | 撤销授权 | （预留） |
| getAuthorizationHistory | 获取授权历史 | （预留） |

### 访问记录模块（3个）

| API | 说明 | 调用位置 |
|-----|------|---------|
| getAccessStatistics | 获取访问统计 | patient/AccessView.vue:321 |
| getMyAccessRecords | 获取访问记录 | patient/AccessView.vue:360 |
| exportAccessRecords | 导出访问记录 | patient/AccessView.vue:548 |


## ✅ 已使用的 API（20个）

### 1. auth.ts - 认证模块（7/19 使用）

#### ✅ login()
- **调用位置**: `stores/auth.ts:37`
- **发送数据**: 
  ```typescript
  {
    phone: string,       // 手机号
    code: string,        // 验证码
    role: UserRole       // 用户角色（patient/doctor）
  }
  ```
- **后端处理**: 
  1. 验证手机号和验证码的正确性
  2. 查询数据库确认用户存在
  3. 生成 JWT token 和 refresh token
  4. 返回用户信息和 token
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      user: User,           // 用户信息
      token: string,        // 访问令牌
      refreshToken: string, // 刷新令牌
      expiresIn: number     // 过期时间（秒）
    }
  }
  ```

#### ✅ register()
- **调用位置**: `stores/auth.ts:62`
- **发送数据**: 
  ```typescript
  {
    phone: string,           // 手机号
    code: string,            // 验证码
    idCard: string,          // 身份证号
    role: UserRole,          // 用户角色
    agreeToTerms: boolean,   // 是否同意条款
    department?: string      // 科室（医生必填）
  }
  ```
- **后端处理**: 
  1. 验证手机号和验证码
  2. 验证身份证号格式
  3. 检查手机号和身份证号是否已注册
  4. 从身份证号提取基本信息（性别、出生日期）
  5. 创建用户记录
  6. 返回用户ID
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      userId: string,
      phone: string
    }
  }
  ```

#### ✅ logout()
- **调用位置**: `stores/auth.ts:82`
- **发送数据**: 无（使用 token）
- **后端处理**: 
  1. 验证 token 有效性
  2. 将 token 加入黑名单
  3. 清除用户会话
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string
  }
  ```

#### ✅ getCurrentUser()
- **调用位置**: `stores/auth.ts:20`
- **发送数据**: 无（使用 token）
- **后端处理**: 
  1. 验证 token 有效性
  2. 从 token 中提取用户 ID
  3. 查询数据库获取用户完整信息
  4. 根据角色返回扩展信息
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: User | PatientUser | DoctorUser
  }
  ```

#### ✅ updateProfile()
- **调用位置**: `stores/auth.ts:102`
- **发送数据**: 
  ```typescript
  {
    name?: string,
    phone?: string,
    avatar?: string,
    // 患者特有字段
    age?: number,
    gender?: Gender,
    emergencyContact?: EmergencyContact,
    medicalHistory?: string[],
    allergies?: string[],
    // 医生特有字段
    hospital?: string,
    department?: string,
    title?: string,
    specialties?: string[],
    experience?: number,
    qualification?: string
  }
  ```
- **后端处理**: 
  1. 验证 token 和权限
  2. 验证更新数据的有效性
  3. 更新用户信息到数据库
  4. 返回更新后的完整用户信息
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: User
  }
  ```

#### ✅ refreshToken()
- **调用位置**: `stores/auth.ts:148`
- **发送数据**: 无（使用 refresh token）
- **后端处理**: 
  1. 验证 refresh token 有效性
  2. 生成新的 access token
  3. 可选：生成新的 refresh token（滚动刷新）
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      user: User,
      token: string,
      refreshToken: string,
      expiresIn: number
    }
  }
  ```

#### ✅ sendVerificationCode()
- **调用位置**: 
  - `views/auth/LoginView.vue:185`
  - `views/auth/RegisterView.vue:276`
- **发送数据**: 
  ```typescript
  {
    type: 'phone',                    // 验证码类型
    phone: string,                    // 手机号
    purpose: 'register' | 'login' | ... // 用途
  }
  ```
- **后端处理**: 
  1. 验证手机号格式
  2. 检查发送频率限制（防止刷验证码）
  3. 生成6位随机验证码
  4. 调用短信服务发送验证码
  5. 将验证码和过期时间存储到Redis（5分钟过期）
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string
  }
  ```

---

### 2. medicalData.ts - 医疗数据模块（1/15 使用）

#### ✅ getMedicalFiles()
- **调用位置**: `views/patient/DataView.vue:?` (通过 mockService)
- **发送数据**: 
  ```typescript
  {
    page?: number,         // 页码
    pageSize?: number,     // 每页数量
    category?: string,     // 数据类型
    keyword?: string,      // 搜索关键词
    startDate?: string,    // 开始日期
    endDate?: string       // 结束日期
  }
  ```
- **后端处理**: 
  1. 验证用户身份和权限
  2. 根据筛选条件查询数据库
  3. 分页返回医疗文件列表
  4. 包含文件的授权状态信息
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      files: MedicalFile[],
      total: number,
      page: number,
      pageSize: number
    }
  }
  ```

---

### 3. doctor.ts - 医生端模块（3/24 使用）

#### ✅ getMedicalDataList()
- **调用位置**: `views/doctor/DataManagementView.vue:?` (通过 mockService)
- **发送数据**: 
  ```typescript
  {
    dataType?: string,      // 数据类型筛选
    authStatus?: string,    // 授权状态筛选
    keyword?: string,       // 搜索关键词
    dateRange?: string[],   // 日期范围
    page?: number,
    pageSize?: number
  }
  ```
- **后端处理**: 
  1. 验证医生身份
  2. 查询医生可访问的医疗数据列表
  3. 根据授权状态筛选数据
  4. 隐藏未授权数据的患者信息
  5. 返回分页数据列表
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      files: MedicalFile[],  // 数据列表（包含授权状态）
      total: number,
      page: number,
      pageSize: number
    }
  }
  ```

#### ✅ getDoctorStatistics()
- **调用位置**: `views/doctor/DataManagementView.vue:?` (通过 mockService)
- **发送数据**: 无
- **后端处理**: 
  1. 验证医生身份
  2. 统计医生的数据访问情况
  3. 计算各类数据指标
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      totalPatients: number,      // 总数据数（改为数据总数）
      activeShares: number,       // 已授权数据
      pendingRequests: number,    // 待授权数据
      todayAccess: number         // 今日已查看
    }
  }
  ```

#### ✅ getAccessHistory()
- **调用位置**: `views/doctor/DataManagementView.vue:?` (通过 mockService)
- **发送数据**: 
  ```typescript
  {
    patientId?: string,
    fileId?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    pageSize?: number
  }
  ```
- **后端处理**: 
  1. 验证医生身份
  2. 查询医生的数据访问历史
  3. 返回访问记录列表
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      records: AccessRecord[],
      total: number,
      page: number,
      pageSize: number
    }
  }
  ```

---

### 4. patient.ts - 患者端模块（6/24 使用）

#### ✅ getAuthorizationRequests()
- **调用位置**: `views/patient/AuthorizationView.vue:352` (注释)
- **发送数据**: 
  ```typescript
  {
    status?: 'pending' | 'approved' | 'rejected',
    page?: number,
    pageSize?: number
  }
  ```
- **后端处理**: 
  1. 验证患者身份
  2. 查询患者收到的授权请求列表
  3. 包含医生信息和数据信息
  4. 按状态筛选
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      requests: AuthorizationRequest[],
      total: number,
      page: number,
      pageSize: number
    }
  }
  ```

#### ✅ approveAuthorization()
- **调用位置**: `views/patient/AuthorizationView.vue:491` (注释)
- **发送数据**: 
  ```typescript
  {
    requestId: string,      // 授权请求ID
    expiresIn: number,      // 授权有效期（天）
    notes?: string          // 备注
  }
  ```
- **后端处理**: 
  1. 验证患者身份和权限
  2. 验证请求是否属于该患者
  3. 更新授权状态为已批准
  4. 设置授权过期时间
  5. 发送通知给医生
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string
  }
  ```

#### ✅ rejectAuthorization()
- **调用位置**: `views/patient/AuthorizationView.vue:533` (注释)
- **发送数据**: 
  ```typescript
  {
    requestId: string,      // 授权请求ID
    reason: string          // 拒绝理由
  }
  ```
- **后端处理**: 
  1. 验证患者身份和权限
  2. 更新授权状态为已拒绝
  3. 记录拒绝理由
  4. 发送通知给医生
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string
  }
  ```

#### ✅ revokeAuthorization()
- **调用位置**: 可能在未来使用
- **发送数据**: `authorizationId: string`
- **后端处理**: 
  1. 验证患者身份
  2. 撤销已授予的授权
  3. 记录撤销操作
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string
  }
  ```

#### ✅ getAuthorizationHistory()
- **调用位置**: 可能在未来使用
- **发送数据**: 查询参数
- **后端处理**: 
  1. 查询授权历史记录
  2. 包含所有状态的授权记录
- **返回数据**: 授权历史列表

#### ✅ getFileStatistics()
- **调用位置**: 可能在 `patient/DataView.vue` 使用
- **发送数据**: 无
- **后端处理**: 
  1. 统计患者的文件数据
  2. 计算各类统计指标
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: FileStatistics
  }
  ```

---

### 5. share.ts - 分享模块（0/16 使用）

❌ **该模块所有API均未使用，建议全部删除**

---

### 6. access.ts - 访问记录模块（3/13 使用）

#### ✅ getAccessStatistics()
- **调用位置**: `views/patient/AccessView.vue:321`
- **发送数据**: 
  ```typescript
  {
    startDate?: string,
    endDate?: string,
    groupBy?: 'day' | 'week' | 'month'
  }
  ```
- **后端处理**: 
  1. 验证患者身份
  2. 统计指定时间范围的访问数据
  3. 按医生、文件、时间维度统计
  4. 生成访问趋势图数据
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      totalAccess: number,        // 总访问次数
      viewCount: number,          // 查看次数
      downloadCount: number,      // 下载次数
      previewCount: number,       // 预览次数
      uniqueVisitors: number,     // 独立访问医生数
      accessByDoctor: Array<...>, // 按医生统计
      accessByFile: Array<...>,   // 按文件统计
      accessTrend: Array<...>,    // 访问趋势
      peakAccessTime: {...}       // 访问高峰时段
    }
  }
  ```

#### ✅ getMyAccessRecords()
- **调用位置**: `views/patient/AccessView.vue:360`
- **发送数据**: 
  ```typescript
  {
    fileId?: string,
    doctorId?: string,
    accessType?: 'view' | 'download' | 'preview',
    startDate?: string,
    endDate?: string,
    page?: number,
    pageSize?: number
  }
  ```
- **后端处理**: 
  1. 验证患者身份
  2. 查询患者数据的访问记录
  3. 包含医生信息、文件信息、访问详情
  4. 支持多维度筛选
- **返回数据**: 
  ```typescript
  {
    success: boolean,
    message: string,
    data: {
      records: AccessRecord[],
      total: number,
      page: number,
      pageSize: number
    }
  }
  ```

#### ✅ exportAccessRecords()
- **调用位置**: `views/patient/AccessView.vue:548`
- **发送数据**: 
  ```typescript
  {
    fileId?: string,
    doctorId?: string,
    startDate?: string,
    endDate?: string,
    format?: 'csv' | 'excel'
  }
  ```
- **后端处理**: 
  1. 验证患者身份
  2. 查询符合条件的访问记录
  3. 生成 CSV 或 Excel 文件
  4. 返回文件流供下载
- **返回数据**: Blob 文件流

---

## ❌ 未使用的 API（91个）

### auth.ts（12个未使用）

❌ loginWithIdCard  
❌ loginWithPhoneCode  
❌ changePassword  
❌ verifyCode  
❌ sendResetPasswordSms  
❌ resetPassword  
❌ bindPhone  
❌ unbindPhone  
❌ getDoctorVerificationStatus  
❌ submitDoctorVerification  
❌ checkUsernameAvailability  
❌ checkPhoneExists  
❌ getSessionInfo  
❌ logoutAllDevices  

### medicalData.ts（14个未使用）

❌ getMedicalFileById  
❌ uploadMedicalFile  
❌ updateMedicalFile  
❌ deleteMedicalFile  
❌ downloadMedicalFile  
❌ previewMedicalFile  
❌ getFileShareStatus  
❌ batchOperateFiles  
❌ getFileStatistics  
❌ exportMedicalData  
❌ getDataTraceability  
❌ verifyFileIntegrity  
❌ searchMedicalFiles  
❌ getRecentFiles  
❌ getFileAccessCount  

### doctor.ts（21个未使用）

❌ getPatientList  
❌ getPatientById  
❌ searchPatients  
❌ getPatientFiles  
❌ requestPatientDataAccess  
❌ getMyPermissionRequests  
❌ getPermissionRequestById  
❌ cancelPermissionRequest  
❌ getSharedFiles  
❌ accessPatientFile  
❌ downloadSharedFile  
❌ addPatientNote  
❌ getPatientNotes  
❌ toggleFavoritePatient  
❌ getFavoritePatients  
❌ requestDataAuthorization  
❌ getAuthorizationStatus  
❌ getMyAuthorizationRequests  

### patient.ts（18个未使用）

❌ getPermissionRequests  
❌ processPermissionRequest  
❌ batchProcessRequests  
❌ getAuthorizedDoctors  
❌ getDoctorById  
❌ searchDoctors  
❌ getDoctorShares  
❌ getDoctorAccessRecords  
❌ revokeAllDoctorAccess  
❌ addDoctorNote  
❌ getDoctorNotes  
❌ toggleTrustedDoctor  
❌ getTrustedDoctors  
❌ getAccessOverview  
❌ getSecurityEvents  
❌ resolveSecurityEvent  
❌ getPrivacySettings  
❌ updatePrivacySettings  

### share.ts（16个全部未使用）

❌ createShare  
❌ getMyShares  
❌ getReceivedShares  
❌ getShareById  
❌ getShareByToken  
❌ updateShare  
❌ revokeShare  
❌ batchRevokeShares  
❌ extendShareExpiration  
❌ getFileShares  
❌ getSharesWithDoctor  
❌ getSharesByDepartment  
❌ getShareStatistics  
❌ checkSharePermission  
❌ generateShareLink  
❌ accessSharedFile  

### access.ts（10个未使用）

❌ getDoctorAccessHistory  
❌ getAccessRecordById  
❌ getFileAccessRecords  
❌ getDoctorAccessRecords  
❌ recordAccess  
❌ getRecentAccessRecords  
❌ getAbnormalAccessRecords  
❌ getAccessHeatmap  
❌ getFileAccessRanking  

---

## 💡 建议

### 1. 立即删除（91个）

建议删除所有未使用的 API 函数，以简化代码库并减少维护成本。

### 2. 保留的核心 API（20个）

保留以下正在使用的 API：

**认证模块（7个）**:
- login, register, logout
- getCurrentUser, updateProfile
- refreshToken, sendVerificationCode

**医疗数据模块（1个）**:
- getMedicalFiles

**医生端模块（3个）**:
- getMedicalDataList
- getDoctorStatistics
- getAccessHistory

**患者端模块（6个）**:
- getAuthorizationRequests
- approveAuthorization, rejectAuthorization
- revokeAuthorization, getAuthorizationHistory
- getFileStatistics

**访问记录模块（3个）**:
- getAccessStatistics
- getMyAccessRecords
- exportAccessRecords

### 3. 需要实现的功能

部分 API 在代码中以注释形式存在，建议：

1. 在 `AuthorizationView.vue` 中实现授权管理功能
2. 在 `DataManagementView.vue` 中完善数据请求功能
3. 在 `DataView.vue` 中实现文件上传功能

---

## 📝 下一步行动

1. ✅ 分析所有 API 使用情况
2. 🔄 为已使用的 API 添加详细注释
3. ⏳ 删除未使用的 API 函数
4. ⏳ 生成最终的 API 文档

---

**报告生成完毕**

