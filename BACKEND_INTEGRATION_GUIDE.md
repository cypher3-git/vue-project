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

- `patient`: 患者角色 - 可管理自己的医疗数据、分享数据给医生
- `doctor`: 医生角色 - 可查看已授权的患者数据、申请数据访问权限

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
    ID           string    `json:"id" gorm:"primaryKey"`
    Title        string    `json:"title" gorm:"not null"`
    Description  string    `json:"description"`
    FileName     string    `json:"fileName" gorm:"not null"`
    OriginalName string    `json:"originalName" gorm:"not null"`
    FileSize     int64     `json:"fileSize"`
    FileType     string    `json:"fileType"`  // 文件扩展名
    MimeType     string    `json:"mimeType"`
    Category     string    `json:"category"`  // "report" | "image" | "prescription" | "other"
    Status       string    `json:"status" gorm:"default:completed"` // "uploading" | "processing" | "completed" | "failed"
    UploadTime   time.Time `json:"uploadTime"`
    UpdatedAt    time.Time `json:"updatedAt"`
    PatientID    string    `json:"patientId" gorm:"not null;index"`
    IsShared     bool      `json:"isShared" gorm:"default:false"`
    ShareCount   int       `json:"shareCount" gorm:"default:0"`
    DownloadCount int      `json:"downloadCount" gorm:"default:0"`
    ViewCount    int       `json:"viewCount" gorm:"default:0"`
    ThumbnailURL string    `json:"thumbnailUrl,omitempty"`
    PreviewURL   string    `json:"previewUrl,omitempty"`
    Checksum     string    `json:"checksum,omitempty"`
    IsVerified   bool      `json:"isVerified" gorm:"default:false"`
    VerifiedAt   time.Time `json:"verifiedAt,omitempty"`
}
```

### 2.5 分享记录模型 (ShareRecord)

```go
type ShareRecord struct {
    ID           string    `json:"id" gorm:"primaryKey"`
    FileID       string    `json:"fileId" gorm:"not null;index"`
    DoctorID     string    `json:"doctorId" gorm:"not null;index"`
    PatientID    string    `json:"patientId" gorm:"not null;index"`
    Permissions  string    `json:"permissions"` // JSON array: ["view", "download", "share"]
    ShareReason  string    `json:"shareReason,omitempty"`
    ExpiresAt    time.Time `json:"expiresAt"`
    Status       string    `json:"status" gorm:"default:active"` // "active" | "expired" | "revoked"
    CreatedAt    time.Time `json:"createdAt"`
    RevokedAt    time.Time `json:"revokedAt,omitempty"`
    AccessCount  int       `json:"accessCount" gorm:"default:0"`
    LastAccessAt time.Time `json:"lastAccessAt,omitempty"`
}
```

### 2.6 访问记录模型 (AccessRecord)

```go
type AccessRecord struct {
    ID         string    `json:"id" gorm:"primaryKey"`
    FileID     string    `json:"fileId" gorm:"not null;index"`
    DoctorID   string    `json:"doctorId" gorm:"not null;index"`
    PatientID  string    `json:"patientId" gorm:"not null;index"`
    ShareID    string    `json:"shareId" gorm:"not null;index"`
    AccessType string    `json:"accessType"` // "view" | "download" | "preview"
    AccessTime time.Time `json:"accessTime"`
    IPAddress  string    `json:"ipAddress,omitempty"`
    UserAgent  string    `json:"userAgent,omitempty"`
    Duration   int       `json:"duration,omitempty"` // 访问持续时间（秒）
}
```

### 2.7 权限申请模型 (PermissionRequest)

```go
type PermissionRequest struct {
    ID                   string    `json:"id" gorm:"primaryKey"`
    DoctorID             string    `json:"doctorId" gorm:"not null;index"`
    PatientID            string    `json:"patientId" gorm:"not null;index"`
    RequestReason        string    `json:"requestReason" gorm:"not null"`
    RequestedFiles       string    `json:"requestedFiles,omitempty"` // JSON array
    RequestedPermissions string    `json:"requestedPermissions"`     // JSON array
    ExpiresAt            time.Time `json:"expiresAt"`
    Status               string    `json:"status" gorm:"default:pending"` // "pending" | "approved" | "rejected" | "expired"
    CreatedAt            time.Time `json:"createdAt"`
    ProcessedAt          time.Time `json:"processedAt,omitempty"`
    RejectReason         string    `json:"rejectReason,omitempty"`
}
```

### 2.8 验证码模型 (VerificationCode)

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

## 三、API 路由清单

### 3.1 认证相关 (Auth API) - `/api/auth`

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

#### 3.1.1 发送验证码

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

#### 3.1.2 用户注册

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

#### 3.1.3 用户登录

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

#### 3.1.4 获取当前用户信息

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

#### 3.1.5 更新个人资料

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

### 3.2 医疗数据管理 (Medical Data API) - `/api/medical-data`

| 方法   | 路径                          | 说明               | 角色要求 |
|--------|------------------------------|--------------------|---------| 
| GET    | /medical-data/files          | 获取文件列表        | patient |
| POST   | /medical-data/upload         | 上传文件           | patient |
| GET    | /medical-data/files/:id      | 获取文件详情        | patient |
| PUT    | /medical-data/files/:id      | 更新文件信息        | patient |
| DELETE | /medical-data/files/:id      | 删除文件           | patient |
| GET    | /medical-data/download/:id   | 下载文件           | patient |
| GET    | /medical-data/preview/:id    | 获取文件预览URL     | patient |
| GET    | /medical-data/statistics     | 获取数据统计        | patient |
| POST   | /medical-data/batch-delete   | 批量删除文件        | patient |

#### 3.2.1 获取文件列表

**请求**: `GET /api/medical-data/files`

**Query 参数**:
- `category`: 文件类别 (report | image | prescription | other)
- `keyword`: 搜索关键词
- `status`: 文件状态 (completed | processing | failed)
- `startDate`: 开始日期
- `endDate`: 结束日期
- `isShared`: 是否已分享 (true | false)
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
        "isShared": true,
        "shareCount": 2,
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

#### 3.2.2 上传文件

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

#### 3.2.3 下载文件

**请求**: `GET /api/medical-data/download/:id`

**响应**: 文件流 (Blob)

**Headers**:
- `Content-Type`: 文件MIME类型
- `Content-Disposition`: `attachment; filename="filename.ext"`
- `Content-Length`: 文件大小

#### 3.2.4 获取数据统计

**请求**: `GET /api/medical-data/statistics`

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "totalFiles": 50,
    "totalSize": 104857600,
    "categoryStats": {
      "report": { "count": 20, "size": 40000000 },
      "image": { "count": 15, "size": 50000000 },
      "prescription": { "count": 10, "size": 10000000 },
      "other": { "count": 5, "size": 4857600 }
    },
    "monthlyUploads": [
      { "month": "2025-01", "count": 10, "size": 20000000 },
      { "month": "2025-02", "count": 15, "size": 30000000 }
    ],
    "mostViewedFiles": [
      { "id": "file_1", "title": "CT影像", "viewCount": 50 }
    ],
    "recentShares": 5,
    "activeShares": 8
  }
}
```

---

### 3.3 数据分享 (Share API) - `/api/shares`

| 方法   | 路径                              | 说明              | 角色要求 |
|--------|----------------------------------|-------------------|---------| 
| POST   | /shares                          | 创建分享          | patient |
| GET    | /shares/my-shares                | 获取我的分享列表   | patient |
| GET    | /shares/received                 | 获取收到的分享     | doctor  |
| GET    | /shares/:id                      | 获取分享详情      | both    |
| PUT    | /shares/:id                      | 更新分享          | patient |
| POST   | /shares/:id/revoke               | 撤销分享          | patient |
| POST   | /shares/batch-revoke             | 批量撤销分享      | patient |
| POST   | /shares/:id/extend               | 延长分享有效期     | patient |
| GET    | /shares/file/:fileId             | 获取文件的分享记录  | patient |
| GET    | /shares/doctor/:doctorId         | 获取与医生的分享   | patient |
| GET    | /shares/statistics               | 获取分享统计      | patient |
| POST   | /shares/check-permission         | 检查分享权限      | patient |
| POST   | /shares/:id/generate-link        | 生成分享链接      | patient |
| GET    | /shares/:shareId/access/:fileId  | 访问共享文件      | doctor  |

#### 3.3.1 创建分享

**请求**: `POST /api/shares`

```json
{
  "fileIds": ["file_123", "file_456"],
  "doctorId": "doctor_789",
  "permissions": ["view", "download"],
  "shareReason": "定期复查需要",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "分享创建成功",
  "data": {
    "id": "share_001",
    "fileId": "file_123",
    "doctorId": "doctor_789",
    "patientId": "user_abc123",
    "permissions": ["view", "download"],
    "shareReason": "定期复查需要",
    "expiresAt": "2025-12-31T23:59:59Z",
    "status": "active",
    "createdAt": "2025-10-04T10:00:00Z",
    "accessCount": 0,
    "doctor": {
      "id": "doctor_789",
      "name": "李医生",
      "hospital": "浙江大学医学院附属第一医院",
      "department": "心血管科"
    },
    "file": {
      "id": "file_123",
      "title": "血常规检查报告",
      "fileName": "blood_test.pdf",
      "fileType": "pdf",
      "category": "report"
    }
  }
}
```

#### 3.3.2 获取我的分享列表

**请求**: `GET /api/shares/my-shares`

**Query 参数**:
- `status`: active | expired | revoked
- `doctorId`: 医生ID
- `fileId`: 文件ID
- `page`: 页码
- `pageSize`: 每页数量

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "shares": [...],
    "total": 20,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 3.4 访问记录 (Access API) - `/api/access`

| 方法   | 路径                          | 说明              | 角色要求 |
|--------|------------------------------|-------------------|---------| 
| GET    | /access/my-records           | 获取我的访问记录   | patient |
| GET    | /access/file/:fileId         | 获取文件访问记录   | patient |
| GET    | /access/statistics           | 获取访问统计      | patient |
| GET    | /access/recent               | 获取最近访问      | patient |

#### 3.4.1 获取访问记录

**请求**: `GET /api/access/my-records`

**Query 参数**:
- `doctorId`: 医生ID
- `fileId`: 文件ID
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
        "fileId": "file_123",
        "doctorId": "doctor_789",
        "patientId": "user_abc123",
        "shareId": "share_001",
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
        "file": {
          "id": "file_123",
          "title": "血常规检查报告",
          "fileName": "blood_test.pdf",
          "fileType": "pdf",
          "category": "report"
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

### 3.5 医生端 (Doctor API) - `/api/doctor`

| 方法   | 路径                                    | 说明              | 角色要求 |
|--------|-----------------------------------------|-------------------|---------| 
| GET    | /doctor/patients                        | 获取患者列表       | doctor  |
| GET    | /doctor/patients/:id                    | 获取患者详情       | doctor  |
| GET    | /doctor/patients/search                 | 搜索患者          | doctor  |
| GET    | /doctor/patients/:id/files              | 获取患者文件列表   | doctor  |
| POST   | /doctor/permission-requests             | 申请访问权限       | doctor  |
| GET    | /doctor/permission-requests             | 获取权限申请列表   | doctor  |
| GET    | /doctor/permission-requests/:id         | 获取申请详情       | doctor  |
| POST   | /doctor/permission-requests/:id/cancel  | 撤销权限申请       | doctor  |
| GET    | /doctor/shared-files                    | 获取共享文件列表   | doctor  |
| POST   | /doctor/access-file                     | 访问患者文件       | doctor  |
| GET    | /doctor/download-file/:shareId/:fileId  | 下载共享文件       | doctor  |
| GET    | /doctor/access-history                  | 获取访问历史       | doctor  |
| GET    | /doctor/dashboard/statistics            | 获取工作台统计     | doctor  |
| POST   | /doctor/patients/:id/notes              | 添加患者备注       | doctor  |
| GET    | /doctor/patients/:id/notes              | 获取患者备注       | doctor  |
| POST   | /doctor/patients/:id/favorite           | 标记常用患者       | doctor  |
| GET    | /doctor/patients/favorites              | 获取常用患者列表   | doctor  |

#### 3.5.1 获取患者列表

**请求**: `GET /api/doctor/patients`

**Query 参数**:
- `keyword`: 搜索关键词
- `hasActiveShare`: 是否有活跃分享 (true | false)
- `page`: 页码
- `pageSize`: 每页数量

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": "user_abc123",
        "name": "张三",
        "age": 35,
        "gender": "male",
        "phone": "138****8000",
        "idCard": "3301********1234",
        "emergencyContact": {
          "name": "李四",
          "phone": "139****9000",
          "relation": "配偶"
        },
        "medicalHistory": ["高血压", "糖尿病"],
        "allergies": ["青霉素"],
        "createdAt": "2025-01-01T08:00:00Z",
        "totalFiles": 20,
        "sharedFiles": 5,
        "lastShareTime": "2025-10-01T10:00:00Z"
      }
    ],
    "total": 18,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

#### 3.5.2 获取患者文件列表

**请求**: `GET /api/doctor/patients/:patientId/files`

**Query 参数**:
- `category`: 文件类别
- `keyword`: 搜索关键词
- `page`: 页码
- `pageSize`: 每页数量

**响应**: 同医疗数据文件列表格式

#### 3.5.3 申请访问权限

**请求**: `POST /api/doctor/permission-requests`

```json
{
  "patientId": "user_abc123",
  "requestReason": "患者定期复查需要查看历史病历",
  "requestedFiles": ["file_123", "file_456"],
  "requestedPermissions": ["view", "download"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**响应**:
```json
{
  "code": 200,
  "success": true,
  "message": "权限申请已提交",
  "data": {
    "id": "req_001",
    "patientId": "user_abc123",
    "doctorId": "doctor_789",
    "requestReason": "患者定期复查需要查看历史病历",
    "requestedFiles": ["file_123", "file_456"],
    "requestedPermissions": ["view", "download"],
    "expiresAt": "2025-12-31T23:59:59Z",
    "status": "pending",
    "createdAt": "2025-10-04T10:00:00Z",
    "patient": {
      "id": "user_abc123",
      "name": "张三",
      "phone": "138****8000"
    }
  }
}
```

#### 3.5.4 获取工作台统计

**请求**: `GET /api/doctor/dashboard/statistics`

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "totalPatients": 18,
    "activeShares": 15,
    "pendingRequests": 3,
    "todayAccess": 25,
    "recentPatients": [...],
    "recentShares": [...],
    "recentAccess": [...],
    "monthlyTrend": [
      {
        "date": "2025-09",
        "accessCount": 120,
        "patientCount": 15
      },
      {
        "date": "2025-10",
        "accessCount": 85,
        "patientCount": 18
      }
    ]
  }
}
```

---

### 3.6 患者端 (Patient API) - `/api/patient`

| 方法   | 路径                               | 说明                | 角色要求 |
|--------|------------------------------------|---------------------|---------| 
| GET    | /patient/dashboard/statistics      | 获取工作台统计       | patient |
| GET    | /patient/permission-requests       | 获取权限申请列表     | patient |
| GET    | /patient/permission-requests/:id   | 获取申请详情         | patient |
| POST   | /patient/permission-requests/:id/approve | 批准权限申请   | patient |
| POST   | /patient/permission-requests/:id/reject  | 拒绝权限申请   | patient |
| GET    | /patient/doctors                   | 获取已授权医生列表   | patient |
| GET    | /patient/recent-activities         | 获取最近活动记录     | patient |

#### 3.6.1 获取工作台统计

**请求**: `GET /api/patient/dashboard/statistics`

**响应**:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "totalFiles": 50,
    "sharedFiles": 15,
    "authorizedDoctors": 5,
    "pendingRequests": 2,
    "recentUploads": [...],
    "recentShares": [...],
    "recentAccess": [...],
    "storageUsage": {
      "used": 104857600,
      "total": 1073741824,
      "percentage": 10
    }
  }
}
```

#### 3.6.2 批准权限申请

**请求**: `POST /api/patient/permission-requests/:id/approve`

```json
{
  "approvedPermissions": ["view", "download"],
  "expiresAt": "2025-12-31T23:59:59Z"
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
    ...
  }
}
```

---

## 四、统一响应格式

### 4.1 成功响应

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

### 4.2 错误响应

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

### 4.3 分页响应

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

## 五、HTTP 状态码规范

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

## 六、文件上传下载规范

### 6.1 文件上传

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

### 6.2 文件下载

- **请求方式**: GET
- **Response Type**: blob
- **Headers**:
  - `Content-Type`: 对应文件的MIME类型
  - `Content-Disposition`: `attachment; filename="文件名.扩展名"`
  - `Content-Length`: 文件大小（字节）

**下载流程**:
1. 验证用户权限（是否拥有文件或有分享权限）
2. 读取文件流
3. 设置响应头
4. 返回文件流
5. 记录下载访问记录

---

## 七、安全要求

### 7.1 密码与敏感信息

- 系统采用手机验证码登录，不使用密码
- 身份证号需加密存储（AES-256）
- 手机号部分脱敏显示（138****8000）
- API响应中不暴露完整身份证号

### 7.2 Token 安全

- JWT 使用 HS256 算法签名
- Token 密钥长度至少 32 字节
- Access Token 有效期 7 天
- Refresh Token 有效期 30 天
- Token 失效后需重新登录

### 7.3 验证码

- 验证码长度 6 位数字
- 有效期 5 分钟
- 同一手机号 1 分钟内只能发送一次
- 验证成功后立即失效
- 最多验证 3 次失败后锁定

### 7.4 文件安全

- 文件存储路径不暴露给前端
- 文件访问需要签名或Token验证
- 上传文件需病毒扫描
- 文件完整性校验（MD5/SHA256）

### 7.5 CORS 配置

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

## 八、环境配置

### 8.1 环境变量

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

### 8.2 数据库配置

- **类型**: MySQL 8.0+
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **时区**: UTC
- **连接池**: 最小 10, 最大 100

---

## 九、开发约定

### 9.1 命名规范

- **路由**: 小写字母 + 连字符（kebab-case）如: `/medical-data`
- **结构体**: 大驼峰（PascalCase）如: `MedicalFile`
- **函数**: 大驼峰（PascalCase）如: `GetFileList`
- **变量**: 小驼峰（camelCase）如: `userId`
- **常量**: 全大写 + 下划线（UPPER_SNAKE_CASE）如: `MAX_FILE_SIZE`
- **数据库字段**: 小写 + 下划线（snake_case）如: `created_at`

### 9.2 日志规范

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

### 9.3 错误处理

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

## 十、测试要求

### 10.1 单元测试

- 所有 Handler 函数需编写单元测试
- Service 层业务逻辑需单元测试
- 测试覆盖率要求 > 70%

### 10.2 集成测试

- 数据库操作集成测试
- API 端到端测试
- 文件上传下载测试

### 10.3 性能测试

- 并发用户数: 1000
- 响应时间: P95 < 500ms, P99 < 1000ms
- QPS: > 500

---

## 十一、部署要求

### 11.1 服务器环境

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 8+)
- **Go 版本**: 1.21+
- **数据库**: MySQL 8.0+
- **反向代理**: Nginx
- **HTTPS**: Let's Encrypt SSL 证书

### 11.2 Docker 部署（推荐）

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

## 十二、附录

### 12.1 前端项目结构

```
vue-project/
├── src/
│   ├── api/                  # API 接口模块
│   │   ├── auth.ts          # 认证API
│   │   ├── medicalData.ts   # 医疗数据API
│   │   ├── share.ts         # 分享API
│   │   ├── access.ts        # 访问记录API
│   │   ├── doctor.ts        # 医生端API
│   │   ├── patient.ts       # 患者端API
│   │   └── index.ts         # 统一导出
│   ├── stores/              # Pinia 状态管理
│   │   ├── auth.ts          # 认证状态
│   │   └── medicalData.ts   # 医疗数据状态
│   ├── views/               # 页面组件
│   │   ├── patient/         # 患者端页面
│   │   └── doctor/          # 医生端页面
│   ├── types/               # TypeScript 类型定义
│   │   ├── auth.ts
│   │   └── medicalData.ts
│   └── utils/
│       └── request.ts       # Axios 封装
└── .env.development         # 开发环境配置
```

### 12.2 前端环境配置

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



