# 医联可信·数据溯源系统

<div align="center">

![Vue版本](https://img.shields.io/badge/Vue-3.5.18-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.11-409EFF)
![License](https://img.shields.io/badge/license-MIT-green)

一个现代化的医疗数据管理平台，让患者安全存储医疗数据，医生高效获取诊疗信息

[功能特点](#-功能特点) •
[技术栈](#-技术栈) •
[快速开始](#-快速开始) •
[在线演示](#-在线演示) •
[项目结构](#-项目结构) •
[API 文档](#-api-文档)

</div>

---

## 📖 项目简介

医联可信·数据溯源系统是一个基于现代Web技术的医疗数据管理平台，通过**患者授权机制**实现医患数据的安全共享：

- **患者端**：安全存储医疗数据，主动控制授权权限，透明追踪数据访问记录
- **医生端**：申请数据访问授权，在患者同意后查看医疗数据

### 核心理念

✅ **患者主权** - 患者完全掌控自己的医疗数据  
✅ **授权透明** - 所有数据访问必须经过明确授权  
✅ **操作可追溯** - 完整记录每一次数据访问  
✅ **隐私保护** - 未授权数据不显示患者信息  

---

## ✨ 功能特点

### 🔐 安全的身份认证
- ✅ 手机验证码登录，无需记忆复杂密码
- ✅ 身份证实名注册，确保用户真实性
- ✅ 患者与医生角色分离，权限明确
- ✅ JWT Token 认证，保障 API 安全
- ✅ 演示账户支持，方便功能预览

### 📁 智能数据管理（患者端）
- 📤 上传医疗数据（检验报告、影像资料、用药记录等）
- 🏷️ 自动分类：**5种医疗数据类型**
  - 检验报告 (lab-report)
  - 影像资料 (medical-image)
  - 用药记录 (medication)
  - 体检报告 (physical-exam)
  - 其他类型 (other)
- 🔍 多维度筛选：按类型、授权状态、日期范围搜索
- 📊 数据统计：总数据条目、授权中数据、本月新增
- 👁️ 授权状态追踪：查看每条数据的授权请求情况

### 🤝 灵活的授权管理（患者端）
- **授权请求管理**：查看医生发起的数据访问授权申请
- **详细申请信息**：
  - ⚠️ 医生信息默认隐藏，保护患者隐私
  - 数据信息（名称、类型、上传时间）
  - 申请理由
- **审批操作**：
  - 同意：设置授权有效期（7天/30天/90天），添加备注
  - 拒绝：说明拒绝理由
  - 撤销：随时撤销已授予的授权
- **🔍 身份溯源**：点击查看医生完整信息
  - 医生详细信息（姓名、医院、科室、职称、认证状态）
  - 该医生对此数据的访问记录
  - 总访问次数和最后访问时间
- **授权历史**：查看所有授权的完整历史记录

### 📊 透明的访问记录（患者端）
- 🕒 完整记录每次数据访问的详细信息
- 👨‍⚕️ 访问者信息：医生姓名、医院、科室
- 📄 访问内容：文件名称、数据类型、访问类型
- 📈 访问统计：今日/本周/本月/总访问次数
- 🎯 多维度统计：按医生、按文件、访问趋势分析
- 📥 导出功能：支持导出为CSV/Excel格式

### 🏥 医生数据管理（医生端）
- **数据中心化视图**：
  - 按数据为单位展示
  - 未授权数据：只显示数据基本信息，患者信息显示"🔒 需授权后可见"
  - 已授权数据：显示完整的数据和患者信息
- **授权申请**：
  - 发起授权申请，说明访问原因
  - 追踪申请状态（待审批/已授权/已拒绝）
- **数据访问**：
  - 查看已授权数据的详细内容
  - 记录每次访问行为
- **🔍 患者身份溯源**（新功能）：
  - 对已授权数据进行患者身份信息溯源
  - 查看患者详细信息（脱敏处理）
  - 追踪数据来源和关联信息
- **统计面板**：
  - 数据总数、已授权数据、待授权数据、今日已查看

### 🏢 科室管理（患者端）
- **多科室支持**：患者可注册多个科室
- **科室切换**：在主页顶部快速切换当前科室
- **智能管理**：
  - 查看已注册科室列表
  - 注册新科室（**12个科室可选**）
  - 切换时仅显示已注册科室
  - 切换到未注册科室需先注册
- **支持科室**：
  - 心血管科、内科、骨科、神经科
  - 外科、呼吸内科、消化内科、泌尿科
  - 妇产科、儿科、内分泌科、肿瘤科

### 🎨 现代化UI体验
- 🌈 基于 Element Plus 的精美界面
- 📱 响应式设计，支持多种设备
- 🎯 直观的操作流程
- ⚡ 流畅的交互体验
- 🎭 演示账户数据与真实账户隔离
- 🔄 统一的枚举类型管理（科室、数据类型）

---

## 🛠 技术栈

### 前端技术
| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3** | 3.5.18 | 渐进式JavaScript框架（Composition API） |
| **TypeScript** | 5.8 | JavaScript超集，类型安全 |
| **Vite** | 7.0 | 下一代前端构建工具 |
| **Element Plus** | 2.11 | Vue 3 UI组件库 |
| **Pinia** | 3.0 | 新一代状态管理 |
| **Vue Router** | 4.5 | 官方路由管理器 |
| **Axios** | 1.12 | HTTP客户端 |
| **@element-plus/icons-vue** | - | Element Plus图标库 |

### 后端技术（推荐）
- **语言**: Go 1.21+
- **Web 框架**: Gin
- **ORM**: GORM
- **数据库**: MySQL 8.0+ / PostgreSQL 14+
- **认证**: JWT
- **缓存**: Redis 6+（可选）

---

## 🚀 快速开始

### 环境要求

- **Node.js**: 20.19.0+ 或 22.12.0+
- **npm**: 8.0+ 或使用 yarn/pnpm
- **浏览器**: Chrome 88+, Firefox 85+, Safari 14+

### 安装与运行

1. **克隆项目**

```bash
git clone https://github.com/cypher3-git/vue-project.git
cd vue-project
```

2. **安装依赖**

```bash
cd vue-project
npm install
```

3. **配置环境变量**

创建 `.env.development` 文件：

```env
# API基础URL（开发环境）
VITE_API_BASE_URL=http://localhost:8080/api

# 文件上传配置
VITE_UPLOAD_MAX_SIZE=104857600
VITE_UPLOAD_ALLOWED_TYPES=pdf,doc,docx,jpg,jpeg,png,gif

# 是否启用模拟数据（开发环境建议开启）
VITE_USE_MOCK_DATA=true
```

4. **启动开发服务器**

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

5. **构建生产版本**

```bash
npm run build
```

构建产物位于 `dist/` 目录

6. **预览生产构建**

```bash
npm run preview
```

---

## 🎮 在线演示

### 演示账户

系统提供两个演示账户，可以直接体验完整功能：

#### 患者演示账户
- **手机号**: `13800138000`
- **验证码**: 任意6位数字（如 `123456`）
- **功能**:
  - 查看模拟的医疗数据
  - 管理授权请求
  - 查看访问记录

#### 医生演示账户
- **手机号**: `13900139000`
- **验证码**: 任意6位数字（如 `123456`）
- **功能**:
  - 查看可访问的医疗数据
  - 发起授权申请
  - 查看授权状态


### 注册新账户

也可以注册真实账户进行测试：

1. 点击"立即注册"
2. 选择角色（患者/医生）
3. 输入手机号并获取验证码
4. 填写身份证号（用于实名认证）
5. **选择科室**（必填）
   - 患者：选择初始就诊科室，登录后可切换或注册新科室
   - 医生：选择工作科室（固定）
6. 同意用户协议并完成注册

---

## 📂 项目结构

```
medical-data-traceability/
├── vue-project/                    # 前端项目
│   ├── src/
│   │   ├── api/                   # API 接口模块（已精简）
│   │   │   ├── auth.ts           # 认证 API (7个)
│   │   │   ├── medicalData.ts    # 医疗数据 API (1个)
│   │   │   ├── doctor.ts         # 医生端 API (4个)
│   │   │   ├── patient.ts        # 患者端 API (10个)
│   │   │   ├── index.ts          # API 统一导出
│   │   │   └── README.md         # API 文档
│   │   ├── assets/               # 静态资源
│   │   │   ├── logo.png         # Logo
│   │   │   └── background.jpg    # 背景图
│   │   ├── components/           # 通用组件
│   │   │   ├── forms/           # 表单组件
│   │   │   └── DepartmentDialog.vue  # 科室管理弹窗
│   │   ├── config/               # 配置文件
│   │   ├── layouts/              # 布局组件
│   │   │   └── AppLayout.vue    # 主布局（含科室切换）
│   │   ├── router/               # 路由配置
│   │   │   └── index.ts         # 路由定义
│   │   ├── stores/               # Pinia 状态管理
│   │   │   ├── auth.ts          # 认证状态（含科室管理）
│   │   │   └── medicalData.ts   # 医疗数据状态
│   │   ├── styles/               # 全局样式
│   │   │   └── main.css         # 主样式文件
│   │   ├── types/                # TypeScript 类型定义
│   │   │   ├── auth.ts          # 认证类型（含科室枚举）
│   │   │   └── medicalData.ts   # 医疗数据类型（含数据类型枚举）
│   │   ├── utils/                # 工具函数
│   │   │   └── request.ts       # Axios 封装
│   │   └── views/                # 页面组件
│   │       ├── auth/            # 认证页面
│   │       │   ├── LoginView.vue
│   │       │   └── RegisterView.vue
│   │       ├── patient/         # 患者端页面
│   │       │   ├── DataView.vue           # 我的数据
│   │       │   └── AuthorizationView.vue  # 授权管理（含身份溯源）
│   │       ├── doctor/          # 医生端页面
│   │       │   └── DataManagementView.vue # 数据管理（含患者溯源）
│   │       ├── common/          # 通用页面
│   │       │   └── NotFoundView.vue
│   │       └── share/           # 分享页面（预留）
│   │           └── ShareView.vue
│   ├── public/                   # 公共资源
│   ├── index.html               # HTML 入口
│   ├── vite.config.ts           # Vite 配置
│   ├── tsconfig.json            # TypeScript 配置
│   └── package.json             # 项目依赖
├── BACKEND_INTEGRATION_GUIDE.md     # 后端对接指南
└── README.md                        # 本文档
```

### 代码组织说明

- **API模块**: 已从111个API精简到25个核心API（减少77%）
- **类型定义**: 完整的TypeScript类型支持，确保类型安全
  - **科室枚举**: 12个科室统一管理 (`types/auth.ts`)
  - **数据类型枚举**: 5种医疗数据类型统一管理 (`types/medicalData.ts`)
  - **接口优化**: 基础接口与角色接口职责分离，消除冗余字段
- **模拟数据**: 演示账户使用独立的模拟数据，不影响真实账户
- **路由管理**: 按角色（患者/医生）分离路由
- **状态管理**: 使用Pinia进行轻量级状态管理，支持类型守卫
- **组件化**: 科室管理、身份溯源等功能模块化

### 接口设计亮点

**科室字段设计** (v1.1.1 优化)：
- **基础 User 接口**：仅包含所有用户共有的字段（id、name、phone、role、createdAt）
- **患者端 (PatientUser)**：
  - `currentDepartment`: 当前选择的科室（可切换）
  - `departments`: 已注册的科室列表（PatientDepartment[]）
- **医生端 (DoctorUser)**：
  - `department`: 所属科室（注册时绑定，固定不变）

这种设计遵循"单一职责原则"和"接口隔离原则"，使得：
- ✅ 基础接口不包含角色特定字段
- ✅ 医生和患者的科室管理逻辑清晰分离
- ✅ 避免了字段冗余和语义混淆
- ✅ 类型更加安全和明确

---

## 📚 API 文档

### API概览

系统共有 **25个核心API**，分布在5个模块：

| 模块 | API数量 | 说明 |
|------|---------|------|
| 认证模块 (auth) | 7 | 登录、注册、个人信息管理 |
| 医疗数据 (medicalData) | 1 | 患者医疗数据查询 |
| 医生端 (doctor) | 4 | 医生数据管理、统计、患者身份溯源 |
| 患者端 (patient) | 10 | 授权管理、科室管理、身份溯源 |
| 访问记录 (access) | 3 | 访问统计、记录查询 |

### 认证机制

所有需要认证的 API 请求都需要在 Header 中携带 JWT Token：

```http
Authorization: Bearer <JWT_TOKEN>
```

### 主要 API 端点

#### 1. 认证模块 `/api/auth`

```typescript
// 发送验证码
POST /auth/send-verification-code
Body: { type: 'phone', phone: string, purpose: 'register' | 'login' }

// 用户注册
POST /auth/register
Body: { phone, code, idCard, role, agreeToTerms, department? }

// 用户登录
POST /auth/login
Body: { phone, code, role }

// 获取当前用户
GET /auth/profile
Headers: { Authorization: 'Bearer <token>' }

// 更新个人信息
PUT /auth/profile
Body: { name?, avatar?, ... }

// 刷新Token
POST /auth/refresh-token

// 退出登录
POST /auth/logout
```

#### 2. 医疗数据模块 `/api/medical-data`

```typescript
// 获取医疗文件列表
GET /medical-data/files
Query: { page?, pageSize?, category?, keyword?, startDate?, endDate? }
```

#### 3. 医生端模块 `/api/doctor`

```typescript
// 获取可访问的医疗数据列表
GET /doctor/medical-data
Query: { dataType?, authStatus?, keyword?, dateRange?, page?, pageSize? }

// 获取医生统计数据
GET /doctor/statistics
Returns: { totalPatients, activeShares, pendingRequests, todayAccess }

// 获取访问历史
GET /doctor/access-history
Query: { patientId?, fileId?, startDate?, endDate?, page?, pageSize? }

// 患者身份溯源（新增）
POST /doctor/trace-patient-identity
Body: { dataId: string }
Returns: { patient, dataInfo, traceTime }
```

#### 4. 患者端模块 `/api/patient`

```typescript
// ========== 授权管理 ==========
// 获取授权请求列表
GET /patient/authorization-requests
Query: { status?, page?, pageSize? }

// 同意授权申请
POST /patient/authorization-requests/:id/approve
Body: { expiresIn: number, notes?: string }

// 拒绝授权申请
POST /patient/authorization-requests/:id/reject
Body: { reason: string }

// 撤销授权
POST /patient/authorizations/:id/revoke

// ========== 统计与溯源 ==========
// 获取文件统计
GET /patient/statistics/files
Returns: { totalFiles, authorizedFiles, recentUploads, filesByCategory }

// 获取授权历史
GET /patient/authorization-history
Query: { dataId?, doctorId?, startDate?, endDate?, page?, pageSize? }

// 医生身份溯源（新增）
POST /patient/authorization-requests/trace-identity
Body: { requestId: string }
Returns: { doctor, accessRecords, totalAccess, lastAccessTime }

// ========== 科室管理（新增） ==========
// 获取患者已注册科室列表
GET /patient/departments
Returns: [{ id, department }]

// 注册新科室
POST /patient/departments
Body: { department: string }
Returns: { id, department }

// 切换当前科室
POST /patient/departments/switch
Body: { departmentId: string }
Returns: { currentDepartment: string }
```

#### 5. 访问记录模块 `/api/access`

```typescript
// 获取访问统计
GET /access/statistics
Query: { startDate?, endDate?, groupBy?: 'day' | 'week' | 'month' }

// 获取访问记录
GET /access/my-records
Query: { fileId?, doctorId?, accessType?, startDate?, endDate?, page?, pageSize? }

// 导出访问记录
GET /access/export
Query: { fileId?, doctorId?, startDate?, endDate?, format?: 'csv' | 'excel' }
```

### 统一响应格式

所有API遵循统一的响应格式：

```typescript
{
  success: boolean,      // 操作是否成功
  message: string,       // 响应消息
  data?: any,           // 响应数据（可选）
  code?: number,        // 业务状态码（可选）
  errors?: object       // 错误详情（可选）
}
```

> 📖 **详细的文档**: 
> - [API使用情况分析](./vue-project/src/api/API_USAGE_ANALYSIS.md) - 包含完整的请求/响应示例
> - [API接口文档](./vue-project/src/api/README.md) - API模块说明
> - [后端对接指南](./BACKEND_INTEGRATION_GUIDE.md) - 后端实现参考
> - [接口优化总结](./INTERFACE_OPTIMIZATION_SUMMARY.md) - 接口设计优化说明

---

## 🔧 后端对接

### 核心功能要求

后端需要实现以下核心功能：

1. **用户认证**
   - 手机验证码发送与验证
   - 用户注册（支持患者和医生）
   - JWT Token生成与刷新

2. **授权管理**
   - 医生发起授权申请
   - 患者审批（同意/拒绝）
   - 授权状态管理
   - 授权撤销

3. **数据访问控制**
   - 未授权数据：隐藏患者信息
   - 已授权数据：显示完整信息
   - 访问记录自动记录

4. **访问追踪**
   - 记录每次数据访问
   - 统计访问数据
   - 支持数据导出

### 数据模型

关键数据模型包括：

```go
// 基础用户模型（所有用户共有的字段）
type User struct {
    ID          string
    Phone       string
    Name        string
    Role        UserRole  // patient / doctor
    CreatedAt   time.Time
}

// 患者用户扩展模型
type PatientUser struct {
    UserID            string              // 用户ID
    IDCard            string              // 身份证号
    CurrentDepartment string              // 当前选择的科室（患者特有，可切换）
    Departments       []PatientDepartment // 已注册的科室列表（关联查询）
    CreatedAt         time.Time
}

// 医生用户扩展模型
type DoctorUser struct {
    UserID     string
    IDCard     string    // 身份证号
    Department string    // 所属科室（医生特有，固定不变）
    Hospital   string    // 医院（可选）
    CreatedAt  time.Time
}

// 患者科室关联模型
type PatientDepartment struct {
    ID          string      // 科室注册记录ID
    PatientID   string      // 患者ID
    Department  string      // 科室名称（12选1）
    CreatedAt   time.Time   // 注册时间（内部使用，不返回前端）
}

// 医疗文件模型
type MedicalFile struct {
    ID          string
    PatientID   string
    Name        string
    Category    string    // 5种类型：lab-report / medical-image / medication / physical-exam / other
    FileSize    string
    FileUrl     string
    UploadedAt  time.Time
}

// 授权请求模型
type AuthorizationRequest struct {
    ID            string
    DataID        string
    PatientID     string
    DoctorID      string
    Reason        string
    Status        string  // pending / approved / rejected
    ExpiresAt     time.Time
    ProcessedAt   time.Time
    CreatedAt     time.Time
}

// 访问记录模型
type AccessRecord struct {
    ID          string
    DoctorID    string
    PatientID   string
    FileID      string
    AccessType  string  // view / download / preview
    AccessedAt  time.Time
    Duration    int
    IPAddress   string
}
```

> 📖 **完整的后端对接文档**: [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)

---

## 📱 功能演示

### 患者端功能

#### 1. 我的数据 (`/patient/data`)
- ✅ 查看所有上传的医疗数据
- ✅ 按类型、授权状态、日期筛选
- ✅ 查看每条数据的授权状态
- ✅ 数据统计卡片展示

#### 2. 授权管理 (`/patient/authorization`)
- ✅ 查看医生发起的授权请求
- ✅ **身份溯源**：点击查看医生完整信息
  - 医生详细信息（姓名、医院、科室、职称、认证状态）
  - 该医生对此数据的访问记录
  - 总访问次数和最后访问时间
- ✅ 同意授权并设置有效期
- ✅ 拒绝授权并说明理由
- ✅ 查看授权历史记录
- ✅ 撤销已授予的授权

#### 3. 科室管理（主页顶部）
- ✅ 查看当前科室
- ✅ 切换到已注册的其他科室
- ✅ 注册新科室（12个科室可选）
- ✅ 查看所有已注册科室列表

### 医生端功能

#### 1. 数据管理 (`/doctor/data`)
- ✅ 查看所有可访问的患者数据
- ✅ 未授权数据：只显示数据信息，患者信息显示"🔒 需授权后可见"
- ✅ 已授权数据：显示完整的数据和患者信息
- ✅ 按数据类型、授权状态筛选
- ✅ 发起授权申请
- ✅ 查看数据详情（需授权）
- ✅ **患者身份溯源**：对已授权数据进行患者信息溯源
  - 查看患者详细信息（脱敏处理）
  - 追踪数据来源
- ✅ 统计面板：数据总数、已授权、待授权、今日已查看

---

## 🎨 界面截图

### 登录页面
- 简洁的登录界面
- 手机验证码登录
- 演示账户快速登录

### 患者端
- **我的数据**: 数据列表、筛选、授权状态
- **授权管理**: 授权请求列表、审批操作
- **访问记录**: 访问统计、记录列表、导出功能

### 医生端
- **数据管理**: 数据列表（授权状态清晰）
- **授权申请**: 发起申请、查看状态
- **统计面板**: 关键指标一目了然

---

## 🔒 安全特性

### 数据安全
- ✅ 所有API请求需要JWT认证
- ✅ 敏感数据加密传输（HTTPS）
- ✅ 文件上传安全校验
- ✅ SQL注入防护
- ✅ XSS攻击防护

### 隐私保护
- ✅ 未授权数据不显示患者信息
- ✅ 授权过期自动失效
- ✅ 支持随时撤销授权
- ✅ 完整的访问日志追踪
- ✅ IP地址脱敏显示

### 权限控制
- ✅ 基于角色的访问控制（RBAC）
- ✅ 前端路由守卫
- ✅ 后端接口权限验证
- ✅ 操作审计日志

---

## 🤝 贡献指南

欢迎对本项目提出改进建议或贡献代码！

### 贡献流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范

- **代码风格**: 遵循 ESLint 和 Prettier 配置
- **提交信息**: 使用语义化提交 (Conventional Commits)
  - `feat`: 新功能
  - `fix`: 修复 bug
  - `docs`: 文档更新
  - `style`: 代码格式调整
  - `refactor`: 代码重构
  - `perf`: 性能优化
  - `test`: 测试相关
  - `chore`: 构建/工具链相关
- **类型检查**: 确保 TypeScript 类型正确
- **测试**: 为新功能添加测试用例（推荐）

### 提交信息示例

```bash
feat: 添加授权管理功能
fix: 修复登录验证码发送失败的问题
docs: 更新API文档
refactor: 重构数据管理页面组件
chore: 更新依赖包版本
```

---

## 📋 开发路线图

### v1.0 ✅ （已完成 - 2025-10-12）
- [x] 用户认证系统
- [x] 患者数据管理
- [x] 授权管理系统
- [x] 访问记录追踪
- [x] 医生数据访问
- [x] 模拟数据支持

### v1.1 ✅ （已完成 - 2025-10-13）
- [x] 患者科室管理功能
  - [x] 多科室注册
  - [x] 科室切换
  - [x] 科室列表管理
- [x] 身份溯源功能
  - [x] 患者端：医生身份溯源
  - [x] 医生端：患者身份溯源
- [x] 统一枚举类型
  - [x] 12个科室枚举
  - [x] 5种医疗数据类型枚举
- [x] 接口优化（v1.1.1）
  - [x] 消除科室字段冗余
  - [x] 基础接口与角色接口职责分离
  - [x] 简化状态管理逻辑

### v1.2 🚧 （开发中）
- [ ] 文件上传功能
- [ ] 数据预览功能
- [ ] 批量操作支持
- [ ] 通知系统

### v2.0 📅 （计划中）
- [ ] 数据加密存储
- [ ] 区块链数据溯源
- [ ] 多端同步（移动端）
- [ ] 智能推荐系统

---

## 🐛 问题反馈

如果你在使用过程中遇到问题，可以通过以下方式反馈：

1. **GitHub Issues**: [提交Issue](https://github.com/cypher3-git/vue-project/issues)
2. **邮件**: 发送邮件描述问题
3. **Pull Request**: 直接提交代码修复

### 提交Issue时请包含

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 截图（如有）
- 环境信息（浏览器版本、Node版本等）

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

### 核心技术

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Pinia](https://pinia.vuejs.org/) - Vue 3 状态管理
- [Axios](https://axios-http.com/) - HTTP 客户端

### 开发工具

- [VSCode](https://code.visualstudio.com/) - 代码编辑器
- [Vue DevTools](https://devtools.vuejs.org/) - Vue调试工具
- [ESLint](https://eslint.org/) - 代码检查
- [Prettier](https://prettier.io/) - 代码格式化

---

## 📈 项目统计

- **代码行数**: ~16,500+
- **组件数量**: 22+
- **API接口**: 25个（已优化，从111个精简）
- **类型枚举**: 2个（12个科室 + 5种数据类型）
- **开发周期**: 2个月
- **最后更新**: 2025-10-13 (v1.1.1)

### 最近更新 (v1.1.1 - 2025-10-13)

**接口优化**：
- 🔧 **消除科室字段冗余**
  - 基础 `User` 接口移除 `currentDepartment` 字段
  - `PatientUser` 新增 `currentDepartment`（患者特有，可切换）
  - `DoctorUser` 保持 `department`（医生固定科室）
- 🔧 **职责分离**
  - 基础接口只包含所有用户共有字段
  - 角色特定字段放在扩展接口中
- 🔧 **简化状态管理**
  - 移除 `isActive` 字段，通过比较 `currentDepartment` 判断
  - 移除 `registeredAt` 字段，前端不需要显示
  - 类型更加明确：`departments` 从 `string[]` 改为 `PatientDepartment[]`

**新增功能** (v1.1)：
- ✅ 患者科室管理（3个API）
- ✅ 双向身份溯源（2个API）
- ✅ 统一枚举类型管理
- ✅ 科室切换组件
- ✅ 身份溯源弹窗

**其他改进**：
- 🔧 医疗数据类型统一（5种）
- 🔧 科室枚举统一（12个）
- 🔧 API文档完善
- 🔧 类型安全增强

---

<div align="center">

**医联可信·数据溯源系统** - 让医疗数据管理更安全、更透明、更高效

⭐ 如果这个项目对你有帮助，请给它一个 Star！

[GitHub](https://github.com/cypher3-git/vue-project) • 
[报告问题](https://github.com/cypher3-git/vue-project/issues) • 
[贡献代码](https://github.com/cypher3-git/vue-project/pulls)

---

Made with ❤️ by 医联可信团队

</div>
