# 医联可信·数据溯源系统

<div align="center">

![Vue版本](https://img.shields.io/badge/Vue-3.5.18-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

一个现代化的医疗数据管理平台，让患者安全存储医疗数据，医生高效获取诊疗信息

[功能特点](#功能特点) •
[技术栈](#技术栈) •
[快速开始](#快速开始) •
[项目结构](#项目结构) •
[API 文档](#api-文档)

</div>

---

## 📖 项目简介

医联可信·数据溯源系统是一个基于区块链思想的医疗数据管理平台，旨在解决传统医疗数据管理中存在的问题：

- **患者端**：安全存储医疗数据，主动控制数据分享权限，透明追踪数据访问记录
- **医生端**：在患者授权下快速查看完整医疗历史，提高诊疗效率



## ✨ 功能特点

### 🔐 安全的身份认证
- 手机验证码登录，无需记忆复杂密码
- 患者与医生角色分离，权限明确
- JWT Token 认证，保障 API 安全

### 📁 智能数据管理
- 支持多种格式医疗文件（PDF、图片、文档等）
- 自动分类：检查报告、影像资料、处方单等
- 时间线展示，疾病发展轨迹一目了然
- 文件预览、下载、批量操作

### 🤝 灵活的数据分享
- **患者主导**：自主决定分享内容、分享对象、有效期
- **一键授权**：快速授权医生查看指定文件
- **权限精细化**：可设置查看、下载等不同权限级别
- **随时撤销**：支持随时撤回已分享的数据

### 📊 透明的访问记录
- 完整记录每次数据访问的详细信息
- 包含访问者、时间、访问内容、IP 地址等
- 实时通知，异常访问立即提醒
- 可视化统计，数据访问趋势一览无余

### 🏥 医生工作台
- 患者列表管理，快速查找授权患者
- 申请数据访问权限，说明访问原因
- 查看共享文件，高效诊疗决策
- 访问历史记录，规范医疗行为

---

## 🛠 技术栈

### 前端技术
- **框架**: Vue 3.5.18（Composition API）
- **构建工具**: Vite 7.0
- **开发语言**: TypeScript 5.8
- **UI 组件库**: Element Plus 2.11
- **状态管理**: Pinia 3.0
- **路由管理**: Vue Router 4.5
- **HTTP 客户端**: Axios 1.12
- **图标库**: @element-plus/icons-vue

### 后端技术
- **语言**: Go 1.21+
- **Web 框架**: Gin
- **ORM**: GORM
- **认证**: JWT
- **缓存**: Redis（可选）

---

## 📂 项目结构

```
medical-data-traceability/
├── vue-project/                 # 前端项目
│   ├── src/
│   │   ├── api/                # API 接口模块
│   │   │   ├── auth.ts        # 认证 API
│   │   │   ├── medicalData.ts # 医疗数据 API
│   │   │   ├── share.ts       # 分享 API
│   │   │   ├── access.ts      # 访问记录 API
│   │   │   ├── doctor.ts      # 医生端 API
│   │   │   └── patient.ts     # 患者端 API
│   │   ├── components/        # 通用组件
│   │   ├── layouts/           # 布局组件
│   │   ├── views/             # 页面组件
│   │   │   ├── patient/       # 患者端页面
│   │   │   └── doctor/        # 医生端页面
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── utils/             # 工具函数
│   │   ├── styles/            # 全局样式
│   │   └── assets/            # 静态资源
│   ├── public/                # 公共资源
│   ├── index.html            # HTML 入口
│   ├── vite.config.ts        # Vite 配置
│   ├── tsconfig.json         # TypeScript 配置
│   └── package.json          # 项目依赖
├── BACKEND_INTEGRATION_GUIDE.md  # 后端对接指南
└── README.md                 # 项目说明文档
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: 20.19.0+ 或 22.12.0+
- **npm**: 8.0+ 或使用 yarn/pnpm
- **浏览器**: Chrome 88+, Firefox 85+, Safari 14+

### 安装与运行

1. **克隆项目**

```bash
git clone https://github.com/your-username/medical-data-traceability.git
cd medical-data-traceability/vue-project
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

创建 `.env.development` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_UPLOAD_MAX_SIZE=104857600
VITE_UPLOAD_ALLOWED_TYPES=pdf,doc,docx,jpg,jpeg,png,gif
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

## 📱 功能演示

### 患者端

#### 1. 数据管理
- 上传医疗报告、影像资料、处方单等
- 按类别、时间、关键词搜索文件
- 查看文件详情、预览、下载
- 批量删除、文件统计分析

#### 2. 数据分享
- 选择文件和医生，创建分享授权
- 设置权限（查看、下载）和有效期
- 查看我的分享列表，管理授权状态
- 延长分享期限或随时撤销授权

#### 3. 访问记录
- 查看所有数据访问记录
- 按医生、文件、时间筛选记录
- 详细信息包括访问者、时间、内容、IP 等
- 访问统计可视化展示

#### 4. 工作台
- 数据概览：文件数、分享数、授权医生数
- 最近上传、最近分享、最近访问
- 存储空间使用情况
- 待处理权限申请

### 医生端

#### 1. 患者管理
- 查看已授权患者列表
- 按关键词搜索患者
- 查看患者详细信息和医疗档案
- 标记常用患者

#### 2. 数据访问
- 查看共享文件列表
- 按患者、类别、时间筛选
- 预览、下载患者授权的医疗文件
- 访问记录自动记录

#### 3. 权限申请
- 向患者申请数据访问权限
- 说明申请原因和所需权限
- 查看申请状态（待处理、已批准、已拒绝）
- 撤销未处理的申请

#### 4. 工作台
- 工作概览：患者数、活跃分享数、待处理申请
- 最近患者、最近分享、最近访问
- 月度访问趋势统计

---

## 📚 API 文档

### 认证机制

所有需要认证的 API 请求都需要在 Header 中携带 JWT Token：

```http
Authorization: Bearer <JWT_TOKEN>
```

### 主要 API 端点

#### 认证相关 `/api/auth`
- `POST /auth/send-verification-code` - 发送验证码
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/me` - 获取当前用户信息
- `PUT /auth/profile` - 更新个人资料

#### 医疗数据 `/api/medical-data`
- `GET /medical-data/files` - 获取文件列表
- `POST /medical-data/upload` - 上传文件
- `GET /medical-data/files/:id` - 获取文件详情
- `PUT /medical-data/files/:id` - 更新文件信息
- `DELETE /medical-data/files/:id` - 删除文件
- `GET /medical-data/download/:id` - 下载文件
- `GET /medical-data/statistics` - 获取数据统计

#### 数据分享 `/api/shares`
- `POST /shares` - 创建分享
- `GET /shares/my-shares` - 获取我的分享
- `GET /shares/received` - 获取收到的分享
- `POST /shares/:id/revoke` - 撤销分享
- `POST /shares/:id/extend` - 延长分享期限

#### 访问记录 `/api/access`
- `GET /access/my-records` - 获取访问记录
- `GET /access/file/:fileId` - 获取文件访问记录
- `GET /access/statistics` - 获取访问统计

#### 医生端 `/api/doctor`
- `GET /doctor/patients` - 获取患者列表
- `GET /doctor/patients/:id/files` - 获取患者文件
- `POST /doctor/permission-requests` - 申请访问权限
- `GET /doctor/shared-files` - 获取共享文件
- `GET /doctor/dashboard/statistics` - 获取工作台统计

#### 患者端 `/api/patient`
- `GET /patient/dashboard/statistics` - 获取工作台统计
- `GET /patient/permission-requests` - 获取权限申请
- `POST /patient/permission-requests/:id/approve` - 批准申请
- `POST /patient/permission-requests/:id/reject` - 拒绝申请

> 详细的 API 文档请查看 [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)

---

## 🔧 后端对接

本项目提供完整的后端对接文档，包括：

- 数据模型定义（Go Struct）
- 完整的 API 路由清单
- 请求/响应示例
- JWT 认证机制
- 文件上传下载规范
- 安全要求和配置
- 环境配置说明

详见 [后端对接指南](./BACKEND_INTEGRATION_GUIDE.md)

### 后端快速启动

1. 克隆后端项目（假设后端项目地址）
2. 配置数据库连接
3. 运行数据库迁移
4. 启动服务

```bash
# 后端项目目录
cd backend-go-gin
cp .env.example .env
# 编辑 .env 配置数据库等信息

# 运行迁移
go run migrate.go

# 启动服务
go run main.go
```

---

## 🤝 贡献指南

欢迎对本项目提出改进建议或贡献代码！

### 贡献流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
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
  - `test`: 测试相关
  - `chore`: 构建/工具链相关
- **类型检查**: 确保 `npm run type-check` 通过
- **测试**: 为新功能添加测试用例

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。



## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

---

<div align="center">

**医联可信·数据溯源系统** - 让医疗数据管理更安全、更透明、更高效

⭐ 如果这个项目对你有帮助，请给它一个 Star！

</div>