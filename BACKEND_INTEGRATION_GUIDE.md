# Go Gin 后端对接清单

## 项目概述

**项目名称**: 医联可信·数据溯源系统  
**前端技术栈**: Vue3 + TypeScript + Element Plus + Pinia + Vite  
**后端技术栈**: Go + Gin Framework + GORM  
**认证方式**: JWT Bearer Token  
**通信协议**: HTTPS + JSON  
**API 基础路径**: `/api`

---

## 一、认证与鉴权机制

### 1.1 JWT Token 规范

**Token 格式**: `Authorization: Bearer <JWT_TOKEN>`

**Token 载荷结构**:
```json
{
  "sub": "用户ID",
  "phone": "手机号",
  "role": "patient | doctor",
  "iat": 签发时间戳,
  "exp": 过期时间戳
}
```

**Token 刷新机制**:
- Access Token 有效期: 7天
- Refresh Token 有效期: 30天
- 前端请求拦截器自动附加 Authorization 头
- 后端中间件验证 Token 并解析用户信息写入上下文

### 1.2 角色权限

- `patient`: 患者角色 - 可管理自己的医疗数据、审批医生的授权请求
- `doctor`: 医生角色 - 可查看已授权的数据详情、发起数据访问授权请求

---

## 二、数据模型定义

### 2.1 用户模型 (User)

```go
type User struct {
    ID              string    `json:"id" gorm:"primaryKey"`
    Name            string    `json:"name"`
    Phone           string    `json:"phone" gorm:"unique;not null"`
    Role            string    `json:"role"` // "patient" | "doctor"
    Avatar          string    `json:"avatar,omitempty"`
    IsActive        bool      `json:"isActive" gorm:"default:true"`
    IsPhoneVerified bool      `json:"isPhoneVerified" gorm:"default:false"`
    LastLoginAt     time.Time `json:"lastLoginAt,omitempty"`
    CreatedAt       time.Time `json:"createdAt"`
    UpdatedAt       time.Time `json:"updatedAt"`
}
```

### 2.2 患者用户扩展模型 (PatientUser)

```go
type PatientUser struct {
    UserID           string    `json:"userId" gorm:"primaryKey"`
    Age              int       `json:"age,omitempty"`
    Gender           string    `json:"gender,omitempty"` // "male" | "female"
    IDCard           string    `json:"idCard,omitempty" gorm:"unique"`
    BirthDate        string    `json:"birthDate,omitempty"`
    EmergencyContact string    `json:"emergencyContact,omitempty"` // JSON string
    MedicalHistory   string    `json:"medicalHistory,omitempty"`   // JSON array
    Allergies        string    `json:"allergies,omitempty"`        // JSON array
    CreatedAt        time.Time `json:"createdAt"`
    UpdatedAt        time.Time `json:"updatedAt"`
}
```

### 2.3 医生用户扩展模型 (DoctorUser)

```go
type DoctorUser struct {
    UserID         string    `json:"userId" gorm:"primaryKey"`
    Department     string    `json:"department" gorm:"not null"`             // 科室，注册时必填
    LicenseNumber  string    `json:"licenseNumber,omitempty" gorm:"unique"`  // 可选，注册后补充
    Hospital       string    `json:"hospital,omitempty"`                     // 可选，注册后补充
    Title          string    `json:"title,omitempty"`                        // 职称
    Specialties    string    `json:"specialties,omitempty"`                  // JSON array
    Experience     int       `json:"experience,omitempty"`                   // 从业年限
    Qualification  string    `json:"qualification,omitempty"`
    IsVerified     bool      `json:"isVerified" gorm:"default:false"`
    VerifiedAt     time.Time `json:"verifiedAt,omitempty"`
    CreatedAt      time.Time `json:"createdAt"`
    UpdatedAt      time.Time `json:"updatedAt"`
}
```

**注意**: 医生注册时需要选择科室（必填），其他信息如医师执业证号、医院名称等可在注册后通过个人资料更新接口补充。

### 2.4 医疗文件模型 (MedicalFile)

```go
type MedicalFile struct {
    ID                 string    `json:"id" gorm:"primaryKey"`
    Title              string    `json:"title" gorm:"not null"`
    Description        string    `json:"description"`
    FileName           string    `json:"fileName" gorm:"not null"`
    OriginalName       string    `json:"originalName" gorm:"not null"`
    FileSize           int64     `json:"fileSize"`
    FileType           string    `json:"fileType"`  // 文件扩展名
    MimeType           string    `json:"mimeType"`
    Category           string    `json:"category"`  // "report" | "image" | "prescription" | "medication" | "other"
    Status             string    `json:"status" gorm:"default:completed"` // "uploading" | "processing" | "completed" | "failed"
    UploadTime         time.Time `json:"uploadTime"`
    UpdatedAt          time.Time `json:"updatedAt"`
    PatientID          string    `json:"patientId" gorm:"not null;index"`
    // 授权相关字段（替代分享字段）
    AuthStatus         string    `json:"authStatus" gorm:"default:not-requested"` // "not-requested" | "pending" | "authorized" | "rejected" | "expired"
    AuthorizationCount int       `json:"authorizationCount" gorm:"default:0"`  // 授权请求数量
    // 访问统计
    DownloadCount      int       `json:"downloadCount" gorm:"default:0"`
    ViewCount          int       `json:"viewCount" gorm:"default:0"`
    // 文件预览和验证
    ThumbnailURL       string    `json:"thumbnailUrl,omitempty"`
    PreviewURL         string    `json:"previewUrl,omitempty"`
    Checksum           string    `json:"checksum,omitempty"`
    IsVerified         bool      `json:"isVerified" gorm:"default:false"`
    VerifiedAt         time.Time `json:"verifiedAt,omitempty"`
}
```

**重要变更**:
- 移除 `IsShared` 和 `ShareCount` 字段
- 新增 `AuthStatus` 字段表示授权状态
- 新增 `AuthorizationCount` 字段记录授权请求数量
- Category 新增 `medication` 类型（用药记录）

### 2.5 授权请求模型 (AuthorizationRequest)

```go
type AuthorizationRequest struct {
    ID              string    `json:"id" gorm:"primaryKey"`
    DoctorID        string    `json:"doctorId" gorm:"not null;index"`
    PatientID       string    `json:"patientId" gorm:"not null;index"`
    DataID          string    `json:"dataId" gorm:"not null;index"`  // 医疗数据ID
    Reason          string    `json:"reason" gorm:"not null"`        // 申请原因
    Purpose         string    `json:"purpose" gorm:"not null"`       // 申请目的: "diagnosis" | "evaluation" | "research" | "consultation" | "other"
    Status          string    `json:"status" gorm:"default:pending"` // "pending" | "approved" | "rejected" | "expired"
    RequestedAt     time.Time `json:"requestedAt"`
    ProcessedAt     time.Time `json:"processedAt,omitempty"`
    ExpiresAt       time.Time `json:"expiresAt,omitempty"`          // 授权有效期（审批通过后设置）
    RejectReason    string    `json:"rejectReason,omitempty"`       // 拒绝原因
    Notes           string    `json:"notes,omitempty"`              // 患者审批备注
}
```

**授权流程说明**:
1. 医生发现患者上传的医疗数据（数据列表中数据对所有医生可见，但未授权时看不到所属患者）
2. 医生对感兴趣的数据发起授权请求，说明访问原因和目的
3. 患者在"授权管理"页面收到请求，可以查看数据详情和医生信息
4. 患者选择"同意"或"拒绝"授权请求
5. 同意后，医生可以在"数据管理"页面查看该数据的完整信息（包括所属患者）
6. 医生可以点击"查看数据"访问数据内容

### 2.6 访问记录模型 (AccessRecord)

```go
type AccessRecord struct {
    ID                string    `json:"id" gorm:"primaryKey"`
    DataID            string    `json:"dataId" gorm:"not null;index"`  // 医疗数据ID
    DoctorID          string    `json:"doctorId" gorm:"not null;index"`
    PatientID         string    `json:"patientId" gorm:"not null;index"`
    AuthorizationID   string    `json:"authorizationId" gorm:"not null;index"` // 授权请求ID
    AccessType        string    `json:"accessType"` // "view" | "download" | "preview"
    AccessTime        time.Time `json:"accessTime"`
    IPAddress         string    `json:"ipAddress,omitempty"`
    UserAgent         string    `json:"userAgent,omitempty"`
    Duration          int       `json:"duration,omitempty"` // 访问持续时间（秒）
}
```

**重要变更**:
- `FileID` 改为 `DataID`（统一使用"数据"概念）
- `ShareID` 改为 `AuthorizationID`（基于授权而非分享）

### 2.7 医生统计数据模型 (DoctorStatistics)

```go
type DoctorStatistics struct {
    TotalData         int       `json:"totalData"`         // 可见数据总数
    AuthorizedData    int       `json:"authorizedData"`    // 已授权数据数
    PendingData       int       `json:"pendingData"`       // 待审批数据数
    TodayViewed       int       `json:"todayViewed"`       // 今日已查看数
}
```

### 2.8 患者统计数据模型 (PatientStatistics)

```go
type PatientStatistics struct {
    TotalFiles        int                    `json:"totalFiles"`        // 总数据条目
    AuthorizedFiles   int                    `json:"authorizedFiles"`   // 授权中数据（待审批+已授权）
    RecentUploads     int                    `json:"recentUploads"`     // 本月新增
    FilesByCategory   map[string]int         `json:"filesByCategory"`   // 按类型统计
    StorageUsed       string                 `json:"storageUsed"`       // 存储使用量
}
```

### 2.9 验证码模型 (VerificationCode)

```go
type VerificationCode struct {
    ID        string    `json:"id" gorm:"primaryKey"`
    Phone     string    `json:"phone" gorm:"not null;index"`
    Code      string    `json:"code" gorm:"not null"`
    Purpose   string    `json:"purpose"` // "register" | "login" | "change_phone" | "bind_phone"
    IsUsed    bool      `json:"isUsed" gorm:"default:false"`
    CreatedAt time.Time `json:"createdAt"`
    ExpiresAt time.Time `json:"expiresAt"`
}
```

---

## 三、核心功能设计说明

### 3.1 数据授权机制（核心功能）

**设计理念**: 患者上传的医疗数据自动对所有医生可见（仅数据基本信息），但医生需要获得患者授权才能查看数据详情和所属患者信息。

**数据可见性规则**:

| 授权状态 | 医生可见信息 | 医生可执行操作 |
|---------|------------|--------------|
| `not-requested` | 数据名称、类型、上传时间、数据ID | 发起授权请求 |
| `pending` | 数据名称、类型、上传时间、数据ID | 等待患者审批 |
| `approved` | 完整信息（包括所属患者、数据内容） | 查看数据、下载数据 |
| `rejected` | 数据名称、类型、上传时间、数据ID | 重新发起授权请求 |
| `expired` | 数据名称、类型、上传时间、数据ID | 重新发起授权请求 |

**授权流程**:
1. **患者上传数据** → 数据基本信息对所有医生可见
2. **医生发起授权** → 创建授权请求，说明原因
3. **患者审批** → 同意/拒绝授权请求
4. **医生访问** → 授权通过后可查看完整数据

**与传统分享机制的区别**:
- ❌ 旧模式：患者主动分享给指定医生
- ✅ 新模式：数据自动可见，医生申请授权，患者审批

**优势**:
- 医生能发现更多患者数据，提升诊疗效率
- 患者完全掌控数据访问权限
- 数据流转过程透明、可追溯

---

## 四、API 路由清单

### 4.1 认证相关 (Auth API) - `/api/auth`

| 方法   | 路径                        | 说明           | 是否需要认证 |
|--------|----------------------------|----------------|--------------|
| POST   | /auth/send-verification-code | 发送手机验证码  | ❌ |
| POST   | /auth/verify-code           | 验证手机验证码  | ❌ |
| POST   | /auth/register              | 用户注册       | ❌ |
| POST   | /auth/login                 | 用户登录       | ❌ |
| POST   | /auth/logout                | 用户登出       | ✅ |
| POST   | /auth/refresh-token         | 刷新访问令牌   | ✅ |
| GET    | /auth/me                    | 获取当前用户信息 | ✅ |
| PUT    | /auth/profile               | 更新个人资料   | ✅ |
| POST   | /auth/bind-phone            | 绑定手机号     | ✅ |
| POST   | /auth/upload-avatar         | 上传头像       | ✅ |

#### 4.1.1 发送验证码

**请求**: `POST /api/auth/send-verification-code`

```json
{
  "phone": "13800138000",
  "purpose": "login"
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "验证码发送成功",
  "data": {
    "expiresIn": 300
  }
}
```

#### 4.1.2 用户注册

**请求**: `POST /api/auth/register`

患者注册:
```json
{
  "phone": "13800138000",
  "code": "123456",
  "idCard": "330101199001011234",
  "role": "patient",
  "agreeToTerms": true
}
```

医生注册（需要额外填写科室）:
```json
{
  "phone": "13800138001",
  "code": "123456",
  "idCard": "330101198001011234",
  "role": "doctor",
  "department": "心血管科",
  "agreeToTerms": true
}
```

**注意**: 医生注册时需要选择科室，其他信息（如医师执业证号、医院名称等）可在注册后通过个人资料更新接口补充。

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": "user_abc123",
    "phone": "13800138000"
  }
}
```

#### 4.1.3 用户登录

**请求**: `POST /api/auth/login`

```json
{
  "phone": "13800138000",
  "code": "123456",
  "role": "patient"
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "user_abc123",
      "name": "张三",
      "phone": "13800138000",
      "role": "patient",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "isPhoneVerified": true,
      "lastLoginAt": "2025-10-04T10:30:00Z",
      "createdAt": "2025-01-01T08:00:00Z",
      "updatedAt": "2025-10-04T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

#### 4.1.4 获取当前用户信息

**请求**: `GET /api/auth/me`

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "id": "user_abc123",
    "name": "张三",
    "phone": "13800138000",
    "role": "patient",
    "avatar": "https://example.com/avatar.jpg",
    "isActive": true,
    "isPhoneVerified": true,
    "lastLoginAt": "2025-10-04T10:30:00Z",
    "createdAt": "2025-01-01T08:00:00Z",
    "updatedAt": "2025-10-04T10:30:00Z"
  }
}
```

#### 4.1.5 更新个人资料

**请求**: `PUT /api/auth/profile`

```json
{
  "name": "张三丰",
  "age": 35,
  "gender": "male",
  "emergencyContact": {
    "name": "李四",
    "phone": "13900139000",
    "relation": "配偶"
  }
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "资料更新成功",
  "data": {
    "id": "user_abc123",
    "name": "张三丰",
    ...
  }
}
```

---

### 4.2 医疗数据管理 (Medical Data API) - `/api/medical-data`

| 方法   | 路径                          | 说明               | 角色要求 |
|--------|------------------------------|--------------------|---------| 
| GET    | /medical-data/files          | 获取文件列表        | patient |
| POST   | /medical-data/upload         | 上传文件           | patient |
| GET    | /medical-data/files/:id      | 获取文件详情        | patient |
| PUT    | /medical-data/files/:id      | 更新文件信息        | patient |
| DELETE | /medical-data/files/:id      | 删除文件           | patient |
| GET    | /medical-data/download/:id   | 下载文件           | patient |
| GET    | /medical-data/preview/:id    | 获取文件预览URL     | patient |
| POST   | /medical-data/batch-delete   | 批量删除文件        | patient |

#### 4.2.1 获取文件列表

**请求**: `GET /api/medical-data/files`

**Query 参数**:
- `category`: 文件类别 (report | image | prescription | medication | other)
- `keyword`: 搜索关键词
- `status`: 文件状态 (completed | processing | failed)
- `startDate`: 开始日期
- `endDate`: 结束日期
- `authStatus`: 授权状态 (not-requested | pending | approved | rejected)
- `page`: 页码 (默认 1)
- `pageSize`: 每页数量 (默认 10)
- `sortBy`: 排序字段 (uploadTime | title | fileSize | viewCount)
- `sortOrder`: 排序方向 (asc | desc)

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "file_123",
        "title": "血常规检查报告",
        "description": "2025年体检报告",
        "fileName": "blood_test_20250104.pdf",
        "originalName": "血常规.pdf",
        "fileSize": 2048576,
        "fileType": "pdf",
        "mimeType": "application/pdf",
        "category": "report",
        "status": "completed",
        "uploadTime": "2025-01-04T10:00:00Z",
        "updatedAt": "2025-01-04T10:00:00Z",
        "patientId": "user_abc123",
        "authStatus": "approved",
        "authorizationCount": 2,
        "downloadCount": 5,
        "viewCount": 10,
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "previewUrl": "https://example.com/preview.pdf",
        "checksum": "abc123def456",
        "isVerified": true,
        "verifiedAt": "2025-01-04T10:01:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

#### 4.2.2 上传文件

**请求**: `POST /api/medical-data/upload`

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: 文件 (必需)
- `title`: 文件标题 (必需)
- `description`: 文件描述
- `category`: 文件类别 (必需)

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "文件上传成功",
  "data": {
    "id": "file_123",
    "title": "血常规检查报告",
    ...
  }
}
```

---

### 4.3 授权管理 (Authorization API) - `/api/authorization`

**⚠️ 重要**: 本系统已废弃传统的"数据分享"功能，改用"授权管理"机制。

| 方法   | 路径                              | 说明                     | 角色要求 |
|--------|----------------------------------|-------------------------|---------|
| POST   | /authorization/request           | 医生发起授权请求          | doctor  |
| GET    | /authorization/requests          | 获取授权请求列表          | both    |
| GET    | /authorization/requests/:id      | 获取授权请求详情          | both    |
| POST   | /authorization/requests/:id/approve | 患者批准授权请求       | patient |
| POST   | /authorization/requests/:id/reject  | 患者拒绝授权请求       | patient |
| POST   | /authorization/requests/:id/revoke  | 患者撤销已授权         | patient |
| GET    | /authorization/status/:dataId    | 查询数据授权状态          | doctor  |
| GET    | /authorization/history           | 获取授权历史记录          | both    |

#### 4.3.1 医生发起授权请求

**请求**: `POST /api/authorization/request`

```json
{
  "dataId": "data_123",
  "patientId": "patient_456",
  "reason": "患者定期复查，需要查看历史检验报告以评估病情进展",
  "purpose": "diagnosis"
}
```

**purpose 枚举值**:
- `diagnosis`: 诊断
- `evaluation`: 评估
- `research`: 研究
- `consultation`: 会诊
- `other`: 其他

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "授权请求已提交",
  "data": {
    "id": "auth_req_001",
    "doctorId": "doctor_789",
    "patientId": "patient_456",
    "dataId": "data_123",
    "reason": "患者定期复查，需要查看历史检验报告以评估病情进展",
    "purpose": "diagnosis",
    "status": "pending",
    "requestedAt": "2025-10-12T10:00:00Z",
    "data": {
      "id": "data_123",
      "name": "血常规检查报告",
      "category": "检验报告",
      "uploadedAt": "2025-10-01T14:30:00Z"
    }
  }
}
```

#### 4.3.2 获取授权请求列表

**患者端请求**: `GET /api/authorization/requests?role=patient`
**医生端请求**: `GET /api/authorization/requests?role=doctor`

**Query 参数**:
- `role`: patient | doctor (必需)
- `status`: pending | approved | rejected | expired
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**患者端响应**（收到的授权请求）:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "requests": [
      {
        "id": "auth_req_001",
        "doctorId": "doctor_789",
        "doctorName": "李医生",
        "doctorDepartment": "心血管科",
        "doctorHospital": "浙江大学医学院附属第一医院",
        "patientId": "patient_456",
        "dataId": "data_123",
        "dataName": "血常规检查报告",
        "dataType": "检验报告",
        "reason": "患者定期复查，需要查看历史检验报告以评估病情进展",
        "purpose": "diagnosis",
        "status": "pending",
        "requestedAt": "2025-10-12T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

**医生端响应**（发起的授权请求）:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "requests": [
      {
        "id": "auth_req_001",
        "patientId": "patient_456",
        "patientName": "张三",
        "dataId": "data_123",
        "dataName": "血常规检查报告",
        "reason": "患者定期复查...",
        "status": "approved",
        "requestedAt": "2025-10-12T10:00:00Z",
        "processedAt": "2025-10-12T14:30:00Z",
        "expiresAt": "2025-11-12T14:30:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 4.3.3 患者批准授权请求

**请求**: `POST /api/authorization/requests/:id/approve`

```json
{
  "expiresIn": 30,
  "notes": "已批准，授权有效期30天"
}
```

**expiresIn 说明**:
- 单位：天
- 0 表示永久授权
- >0 表示授权有效天数

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "授权请求已批准",
  "data": {
    "id": "auth_req_001",
    "status": "approved",
    "processedAt": "2025-10-12T14:30:00Z",
    "expiresAt": "2025-11-12T14:30:00Z",
    "notes": "已批准，授权有效期30天"
  }
}
```

#### 4.3.4 患者拒绝授权请求

**请求**: `POST /api/authorization/requests/:id/reject`

```json
{
  "reason": "暂不需要该医生查看此数据"
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "授权请求已拒绝",
  "data": {
    "id": "auth_req_001",
    "status": "rejected",
    "processedAt": "2025-10-12T14:30:00Z",
    "rejectReason": "暂不需要该医生查看此数据"
  }
}
```

---

### 4.4 访问记录 (Access API) - `/api/access`

| 方法   | 路径                          | 说明              | 角色要求 |
|--------|------------------------------|-------------------|---------| 
| GET    | /access/my-records           | 获取我的访问记录   | patient |
| GET    | /access/data/:dataId         | 获取数据访问记录   | patient |
| GET    | /access/statistics           | 获取访问统计      | patient |
| GET    | /access/recent               | 获取最近访问      | patient |

#### 4.4.1 获取访问记录

**请求**: `GET /api/access/my-records`

**Query 参数**:
- `doctorId`: 医生ID
- `dataId`: 数据ID
- `accessType`: view | download | preview
- `startDate`: 开始日期
- `endDate`: 结束日期
- `page`: 页码
- `pageSize`: 每页数量

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "records": [
      {
        "id": "access_001",
        "dataId": "data_123",
        "doctorId": "doctor_789",
        "patientId": "user_abc123",
        "authorizationId": "auth_req_001",
        "accessType": "view",
        "accessTime": "2025-10-04T14:30:00Z",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "duration": 120,
        "doctor": {
          "id": "doctor_789",
          "name": "李医生",
          "hospital": "浙江大学医学院附属第一医院",
          "department": "心血管科"
        },
        "data": {
          "id": "data_123",
          "name": "血常规检查报告",
          "fileName": "blood_test.pdf",
          "fileType": "pdf",
          "category": "检验报告"
        }
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 4.5 医生端 (Doctor API) - `/api/doctor`

**⚠️ 核心变更**: 医生端从"患者管理"改为"数据管理"，医生看到的是医疗数据列表，而非患者列表。

| 方法   | 路径                                    | 说明                        | 角色要求 |
|--------|-----------------------------------------|----------------------------|---------| 
| GET    | /doctor/medical-data                    | 获取医疗数据列表（核心接口）  | doctor  |
| GET    | /doctor/medical-data/:id                | 获取数据详情（需授权）       | doctor  |
| POST   | /doctor/request-authorization           | 发起授权请求                | doctor  |
| GET    | /doctor/authorization-requests          | 获取我的授权请求列表         | doctor  |
| GET    | /doctor/access-history                  | 获取访问历史                | doctor  |
| GET    | /doctor/statistics                      | 获取医生端统计数据           | doctor  |

#### 4.5.1 获取医疗数据列表（核心接口）

**请求**: `GET /api/doctor/medical-data`

**Query 参数**:
- `dataType`: 数据类型（检验报告 | 影像资料 | 病历记录 | 体检报告 | 用药记录）
- `authStatus`: 授权状态（not-requested | pending | authorized | rejected | expired）
- `keyword`: 搜索关键词（仅搜索数据名称，不包括患者信息）
- `dateRange`: 日期范围数组 ["2025-01-01", "2025-12-31"]
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**重要说明**:
- 所有患者上传的数据对医生可见（基本信息）
- 未授权时，隐藏所属患者信息（显示为"🔒 需授权后可见"）
- 已授权时，显示完整信息（包括所属患者）

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "data_123",
        "name": "血常规检查报告",
        "category": "检验报告",
        "uploadedAt": "2025-10-01T14:30:00Z",
        "fileSize": "2.5 MB",
        "authStatus": "authorized",
        "patientName": "张三",
        "patientGender": "male",
        "patientAge": 35
      },
      {
        "id": "data_456",
        "name": "胸部CT影像",
        "category": "影像资料",
        "uploadedAt": "2025-10-05T09:15:00Z",
        "fileSize": "15.8 MB",
        "authStatus": "not-requested",
        "patientName": "🔒 需授权后可见",
        "patientGender": "🔒 需授权后可见",
        "patientAge": null
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 4.5.2 获取医生端统计数据

**请求**: `GET /api/doctor/statistics`

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "totalData": 150,
    "authorizedData": 45,
    "pendingData": 12,
    "todayViewed": 8
  }
}
```

#### 4.5.3 获取访问历史

**请求**: `GET /api/doctor/access-history`

**Query 参数**:
- `page`: 页码
- `pageSize`: 每页数量

**响应**: 参考 4.4.1 访问记录格式

---

### 4.6 患者端 (Patient API) - `/api/patient`

| 方法   | 路径                                           | 说明                | 角色要求 |
|--------|-----------------------------------------------|---------------------|---------| 
| GET    | /patient/statistics/files                     | 获取文件统计         | patient |
| GET    | /patient/authorization-requests               | 获取授权请求列表     | patient |
| GET    | /patient/authorization-requests/:id           | 获取授权请求详情     | patient |
| POST   | /patient/authorization-requests/:id/approve   | 批准授权请求        | patient |
| POST   | /patient/authorization-requests/:id/reject    | 拒绝授权请求        | patient |
| POST   | /patient/authorization-requests/:id/revoke    | 撤销已授权          | patient |
| GET    | /patient/authorization-history                | 获取授权历史记录     | patient |

#### 4.6.1 获取文件统计

**请求**: `GET /api/patient/statistics/files`

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "totalFiles": 50,
    "authorizedFiles": 15,
    "recentUploads": 8,
    "filesByCategory": {
      "检验报告": 15,
      "影像资料": 10,
      "病历记录": 12,
      "体检报告": 8,
      "用药记录": 5
    },
    "storageUsed": "125.6 MB"
  }
}
```

#### 4.6.2 批准授权请求

**请求**: `POST /api/patient/authorization-requests/:id/approve`

```json
{
  "expiresIn": 30,
  "notes": "已批准，授权有效期30天"
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "已批准医生访问权限",
  "data": {
    "id": "req_001",
    "status": "approved",
    "processedAt": "2025-10-04T10:30:00Z",
    "expiresAt": "2025-11-04T10:30:00Z"
  }
}
```

---

## 五、统一响应格式

### 5.1 成功响应

```go
type SuccessResponse struct {
    Code    int         `json:"code"`
    Success bool        `json:"success"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}
```

**示例**:
```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

### 5.2 错误响应

```go
type ErrorResponse struct {
    Code    int                    `json:"code"`
    Success bool                   `json:"success"`
    Message string                 `json:"message"`
    Errors  map[string][]string    `json:"errors,omitempty"`
}
```

**示例**:
```json
{
  "code": 400,
  "success": false,
  "message": "请求参数错误",
  "errors": {
    "phone": ["手机号格式不正确"],
    "code": ["验证码不能为空"]
  }
}
```

### 5.3 分页响应

```go
type PaginatedResponse struct {
    Code    int         `json:"code"`
    Success bool        `json:"success"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
}

type PaginatedData struct {
    Items      interface{} `json:"items"`
    Total      int64       `json:"total"`
    Page       int         `json:"page"`
    PageSize   int         `json:"pageSize"`
    TotalPages int         `json:"totalPages"`
}
```

---

## 六、HTTP 状态码规范

| 状态码 | 说明                     | 使用场景                    |
|--------|--------------------------|----------------------------|
| 200    | OK                       | 请求成功                    |
| 201    | Created                  | 资源创建成功                |
| 204    | No Content               | 请求成功但无返回内容         |
| 400    | Bad Request              | 请求参数错误                |
| 401    | Unauthorized             | 未认证或Token无效           |
| 403    | Forbidden                | 无权限访问                  |
| 404    | Not Found                | 资源不存在                  |
| 409    | Conflict                 | 资源冲突（如手机号已存在）   |
| 422    | Unprocessable Entity     | 参数验证失败                |
| 429    | Too Many Requests        | 请求过于频繁                |
| 500    | Internal Server Error    | 服务器内部错误              |
| 503    | Service Unavailable      | 服务暂时不可用              |

---

## 七、文件上传下载规范

### 7.1 文件上传

- **请求方式**: POST
- **Content-Type**: `multipart/form-data`
- **最大文件大小**: 100 MB
- **支持的文件类型**:
  - 文档: pdf, doc, docx, txt
  - 图片: jpg, jpeg, png, gif, bmp
  - 其他: zip, rar

**上传流程**:
1. 前端使用 FormData 封装文件和其他字段
2. 后端接收文件流并保存到服务器磁盘
3. 计算文件 MD5 校验和
4. 生成缩略图（图片文件）
5. 保存文件记录到数据库
6. 返回文件信息

### 7.2 文件下载

- **请求方式**: GET
- **Response Type**: blob
- **Headers**:
  - `Content-Type`: 对应文件的MIME类型
  - `Content-Disposition`: `attachment; filename="文件名.扩展名"`
  - `Content-Length`: 文件大小（字节）

**下载流程**:
1. 验证用户权限（是否拥有文件或有授权权限）
2. 读取文件流
3. 设置响应头
4. 返回文件流
5. 记录下载访问记录

---

## 八、安全要求

### 8.1 密码与敏感信息

- 系统采用手机验证码登录，不使用密码
- 身份证号需加密存储（AES-256）
- 手机号部分脱敏显示（138****8000）
- API响应中不暴露完整身份证号

### 8.2 Token 安全

- JWT 使用 HS256 算法签名
- Token 密钥长度至少 32 字节
- Access Token 有效期 7 天
- Refresh Token 有效期 30 天
- Token 失效后需重新登录

### 8.3 验证码

- 验证码长度 6 位数字
- 有效期 5 分钟
- 同一手机号 1 分钟内只能发送一次
- 验证成功后立即失效
- 最多验证 3 次失败后锁定

### 8.4 文件安全

- 文件存储路径不暴露给前端
- 文件访问需要授权验证
- 上传文件需病毒扫描
- 文件完整性校验（MD5/SHA256）

### 8.5 CORS 配置

```go
// 允许的前端域名
AllowOrigins: []string{
    "http://localhost:5173",
    "https://medical-data.example.com"
}

// 允许的请求方法
AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}

// 允许的请求头
AllowHeaders: []string{
    "Origin", 
    "Content-Type", 
    "Accept", 
    "Authorization"
}

// 允许携带认证信息
AllowCredentials: true
```

---

## 九、环境配置

### 9.1 环境变量

```bash
# 服务配置
APP_ENV=development
APP_PORT=8080
APP_BASE_URL=http://localhost:8080

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medical_data
DB_USER=root
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your-secret-key-at-least-32-bytes
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 文件存储配置
UPLOAD_DIR=/var/data/uploads
MAX_FILE_SIZE=104857600
THUMBNAIL_SIZE=200x200

# 短信服务配置（阿里云/腾讯云）
SMS_ACCESS_KEY=your_access_key
SMS_ACCESS_SECRET=your_access_secret
SMS_SIGN_NAME=医联可信
SMS_TEMPLATE_CODE=SMS_123456789

# Redis 配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 9.2 数据库配置

- **类型**: MySQL 8.0+
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **时区**: UTC
- **连接池**: 最小 10, 最大 100

---

## 十、开发约定

### 10.1 命名规范

- **路由**: 小写字母 + 连字符（kebab-case）如: `/medical-data`
- **结构体**: 大驼峰（PascalCase）如: `MedicalFile`
- **函数**: 大驼峰（PascalCase）如: `GetFileList`
- **变量**: 小驼峰（camelCase）如: `userId`
- **常量**: 全大写 + 下划线（UPPER_SNAKE_CASE）如: `MAX_FILE_SIZE`
- **数据库字段**: 小写 + 下划线（snake_case）如: `created_at`

### 10.2 日志规范

使用结构化日志（推荐 zap 或 logrus）:

```go
log.Info("用户登录成功",
    zap.String("userId", userId),
    zap.String("phone", phone),
    zap.String("role", role),
    zap.String("ip", clientIP),
)

log.Error("文件上传失败",
    zap.String("userId", userId),
    zap.String("fileName", fileName),
    zap.Error(err),
)
```

### 10.3 错误处理

```go
// 定义业务错误码
const (
    ErrCodeInvalidParams    = 40000
    ErrCodeUnauthorized     = 40100
    ErrCodeForbidden        = 40300
    ErrCodeNotFound         = 40400
    ErrCodeConflict         = 40900
    ErrCodeInternalError    = 50000
)

// 错误信息
var ErrMessages = map[int]string{
    ErrCodeInvalidParams: "请求参数错误",
    ErrCodeUnauthorized:  "未授权访问",
    ErrCodeForbidden:     "权限不足",
    ErrCodeNotFound:      "资源不存在",
    ErrCodeConflict:      "资源冲突",
    ErrCodeInternalError: "服务器内部错误",
}
```

---

## 十一、测试要求

### 11.1 单元测试

- 所有 Handler 函数需编写单元测试
- Service 层业务逻辑需单元测试
- 测试覆盖率要求 > 70%

### 11.2 集成测试

- 数据库操作集成测试
- API 端到端测试
- 文件上传下载测试

### 11.3 性能测试

- 并发用户数: 1000
- 响应时间: P95 < 500ms, P99 < 1000ms
- QPS: > 500

---

## 十二、部署要求

### 12.1 服务器环境

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **Go 版本**: 1.21+
- **数据库**: MySQL 8.0+
- **反向代理**: Nginx
- **HTTPS**: Let's Encrypt SSL 证书

### 12.2 Docker 部署（推荐）

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
COPY --from=builder /app/.env .
EXPOSE 8080
CMD ["./main"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: medical_data
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

---

## 十三、附录

### 13.1 前端项目结构

```
vue-project/
├── src/
│   ├── api/                  # API 接口模块（已精简至20个核心API）
│   │   ├── access.ts        # 访问记录 API（5个）
│   │   ├── auth.ts          # 认证 API（3个）
│   │   ├── doctor.ts        # 医生端 API（3个）
│   │   ├── index.ts         # API 统一导出
│   │   ├── medicalData.ts   # 医疗数据 API（1个）
│   │   └── patient.ts       # 患者端 API（6个）
│   ├── stores/              # Pinia 状态管理
│   │   ├── auth.ts          # 认证状态
│   │   └── medicalData.ts   # 医疗数据状态
│   ├── views/               # 页面组件
│   │   ├── patient/         # 患者端页面
│   │   │   ├── DataView.vue          # 我的数据
│   │   │   ├── AccessView.vue        # 访问记录
│   │   │   └── AuthorizationView.vue # 授权管理
│   │   └── doctor/          # 医生端页面
│   │       ├── DataManagementView.vue # 数据管理
│   │       └── AccessHistoryView.vue  # 访问历史
│   ├── types/               # TypeScript 类型定义
│   │   ├── auth.ts
│   │   └── medicalData.ts
│   └── utils/
│       └── request.ts       # Axios 封装
└── .env.development         # 开发环境配置
```

### 13.2 前端环境配置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_UPLOAD_MAX_SIZE=104857600
VITE_UPLOAD_ALLOWED_TYPES=pdf,doc,docx,jpg,jpeg,png,gif

# .env.production
VITE_API_BASE_URL=https://api.medical-data.example.com/api
VITE_UPLOAD_MAX_SIZE=104857600
VITE_UPLOAD_ALLOWED_TYPES=pdf,doc,docx,jpg,jpeg,png,gif
```

### 13.3 前端核心API清单

#### 认证API (3个)
- `POST /auth/send-verification-code` - 发送验证码
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出

#### 患者端API (6个)
- `GET /patient/statistics/files` - 获取文件统计
- `GET /patient/authorization-requests` - 获取授权请求列表
- `GET /patient/authorization-requests/:id` - 获取授权请求详情
- `POST /patient/authorization-requests/:id/approve` - 批准授权
- `POST /patient/authorization-requests/:id/reject` - 拒绝授权
- `POST /patient/authorization-requests/:id/revoke` - 撤销授权

#### 医生端API (3个)
- `GET /doctor/medical-data` - 获取医疗数据列表
- `GET /doctor/statistics` - 获取统计数据
- `GET /doctor/access-history` - 获取访问历史

#### 医疗数据API (1个)
- `GET /medical-data/files` - 获取文件列表

#### 访问记录API (5个)
- `GET /access/my-records` - 获取访问记录
- `GET /access/statistics` - 获取访问统计
- `GET /access/recent` - 获取最近访问
- `GET /access/doctors` - 获取访问的医生列表
- `GET /access/files` - 获取被访问的文件列表

### 13.4 核心功能页面映射

#### 患者端页面
- `/patient/data` - 我的数据（数据上传、查看、管理）
- `/patient/authorization` - 授权管理（处理医生的授权请求）
- `/patient/access` - 访问记录（查看数据访问历史）

#### 医生端页面
- `/doctor/data` - 数据管理（查看可访问的医疗数据）
- `/doctor/access-history` - 访问历史（查看自己的访问记录）

---

## 十四、FAQ

### Q1: 为什么废弃"数据分享"功能，改用"授权管理"？

**A**: 新的授权管理机制更符合医疗数据的实际使用场景：
- 医生可以发现更多患者数据，无需患者主动分享
- 患者保留完全的数据控制权，可审批每个访问请求
- 数据流转过程更透明、可追溯

### Q2: 医生能看到哪些数据？

**A**: 医生可以看到所有患者上传的数据的基本信息（数据名称、类型、上传时间），但看不到所属患者信息。只有在患者授权后，医生才能查看完整的数据内容和患者信息。

### Q3: 授权有效期如何设置？

**A**: 患者在批准授权请求时可以设置有效期：
- 0 天表示永久授权
- >0 天表示限时授权（如 30 天）
- 过期后医生需要重新申请

### Q4: 如何保证数据安全？

**A**: 多层安全机制：
- JWT Token 认证
- 授权机制控制数据访问
- 完整的访问日志记录
- 文件加密存储
- 敏感信息脱敏

### Q5: 前端如何调用后端API？

**A**: 前端使用 Axios 封装的请求工具，自动处理：
- Token 附加
- 错误处理
- Mock 数据拦截（演示账户）
- 请求/响应日志

---

**文档版本**: v2.0  
**最后更新**: 2025-10-12  
**维护者**: 开发团队
