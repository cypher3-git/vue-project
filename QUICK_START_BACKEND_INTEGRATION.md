# 快速开始 - 后端对接指南

## 🚀 5分钟快速配置

### 第一步：配置环境变量

在 `vue-project` 目录下创建 `.env.development` 文件：

```bash
cd vue-project
touch .env.development
```

编辑 `.env.development`，添加以下内容：

```env
# 修改为你的后端API地址
VITE_API_BASE_URL=http://localhost:8080/api

# 文件上传配置（可选）
VITE_UPLOAD_MAX_SIZE=104857600
VITE_UPLOAD_ALLOWED_TYPES=pdf,doc,docx,jpg,jpeg,png,gif,bmp,tiff,dicom
```

### 第二步：确认后端服务运行

确保你的 Go Gin 后端服务已启动：

```bash
# 示例（根据你的后端项目实际情况）
cd ../backend
go run main.go
```

后端应该运行在 `http://localhost:8080`

### 第三步：启动前端开发服务器

```bash
cd vue-project
npm install  # 如果还没安装依赖
npm run dev
```

访问 `http://localhost:5173` 查看应用

---

## 🧪 快速测试

### 1. 测试注册功能

1. 打开浏览器访问 `http://localhost:5173`
2. 点击"立即注册"
3. 填写注册信息：
   - 选择角色（患者/医生）
   - 输入手机号
   - 获取验证码
   - 输入身份证号
   - 选择科室
   - 同意条款并注册

**预期结果**：
- ✅ 能够发送验证码
- ✅ 注册成功并跳转到登录页
- ✅ 显示"注册成功"提示

### 2. 测试登录功能

1. 在登录页面输入手机号
2. 获取验证码
3. 输入验证码并登录

**预期结果**：
- ✅ 能够发送验证码
- ✅ 登录成功并跳转到对应的仪表板
  - 患者：跳转到 `/patient/data`
  - 医生：跳转到 `/doctor/data`

### 3. 测试患者端功能

登录后测试以下功能：

#### 科室管理
- [ ] 查看当前科室（页面顶部）
- [ ] 查看已注册科室列表
- [ ] 注册新科室
- [ ] 切换到其他科室

#### 数据管理
- [ ] 查看医疗数据列表
- [ ] 按类型筛选数据
- [ ] 查看数据详情

#### 授权管理
- [ ] 查看授权请求列表
- [ ] 同意授权请求
- [ ] 拒绝授权请求
- [ ] 医生身份溯源

### 4. 测试医生端功能

以医生身份登录后测试：

#### 数据管理
- [ ] 查看可访问的医疗数据列表
- [ ] 查看未授权数据（患者信息隐藏）
- [ ] 查看已授权数据（完整信息）
- [ ] 患者身份溯源

#### 访问历史
- [ ] 查看访问历史记录
- [ ] 按患者筛选
- [ ] 按文件筛选

---

## 🔧 常见问题排查

### 问题1：无法连接到后端

**症状**：页面显示"网络连接失败"或"服务器暂时不可用"

**解决方案**：
1. 检查后端服务是否运行
   ```bash
   # 检查端口是否被占用
   lsof -i :8080
   ```

2. 检查 `.env.development` 中的 API 地址是否正确
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

3. 检查跨域配置（CORS）
   - 确保后端允许前端域名访问
   - Gin 示例：
   ```go
   router.Use(cors.New(cors.Config{
       AllowOrigins:     []string{"http://localhost:5173"},
       AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
       AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
       AllowCredentials: true,
   }))
   ```

### 问题2：登录后立即退出

**症状**：登录成功但立即被退回登录页

**解决方案**：
1. 检查 JWT Token 是否正确返回
   - 打开浏览器开发者工具 > Network
   - 查看登录接口响应

2. 检查 Token 格式是否符合前端预期
   ```json
   {
     "success": true,
     "data": {
       "user": {...},
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "refreshToken": "...",
       "expiresIn": 604800
     }
   }
   ```

### 问题3：数据格式错误

**症状**：页面显示数据但格式异常

**解决方案**：
1. 对照类型定义检查后端返回的数据格式
   - 参考 `src/types/auth.ts`
   - 参考 `src/types/medicalData.ts`

2. 确保分页数据格式正确
   ```json
   {
     "success": true,
     "data": {
       "items": [...],
       "total": 100,
       "page": 1,
       "pageSize": 20,
       "totalPages": 5
     }
   }
   ```

### 问题4：验证码发送失败

**症状**：点击"获取验证码"无响应或报错

**解决方案**：
1. 检查后端验证码服务是否配置
2. 检查手机号格式验证规则
3. 查看浏览器控制台和网络请求

---

## 📊 API 响应格式规范

### 统一响应格式

所有 API 必须返回以下格式：

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "code": number (可选)
}
```

### 成功响应示例

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应示例

```json
{
  "success": false,
  "message": "手机号已注册",
  "code": 409
}
```

### 分页数据格式

```json
{
  "success": true,
  "data": {
    "items": [...],      // 数据列表
    "total": 100,        // 总记录数
    "page": 1,           // 当前页码
    "pageSize": 20,      // 每页记录数
    "totalPages": 5      // 总页数
  }
}
```

---

## 🔍 调试技巧

### 1. 查看网络请求

打开浏览器开发者工具 > Network：
- 可以看到所有 API 请求
- 查看请求参数和响应数据
- 查看 HTTP 状态码

### 2. 查看控制台日志

开发环境下，每个请求都会打印日志：
```
🚀 发起请求: GET /api/patient/departments
✅ 响应成功: GET /api/patient/departments
```

### 3. 查看应用状态

Vue DevTools：
- 查看 Pinia Store 状态
- 查看组件数据
- 追踪事件

---

## 📚 参考文档

- [完整后端对接指南](./BACKEND_INTEGRATION_GUIDE.md)
- [API 接口文档](./vue-project/src/api/README.md)
- [模拟数据清理总结](./MOCK_DATA_CLEANUP_SUMMARY.md)
- [项目 README](./README.md)

---

## ✅ 对接检查清单

### 基础配置
- [ ] 创建 `.env.development` 文件
- [ ] 配置正确的 API 地址
- [ ] 后端服务已启动
- [ ] CORS 配置正确

### 认证模块
- [ ] 验证码发送接口正常
- [ ] 用户注册接口正常
- [ ] 用户登录接口正常
- [ ] Token 格式正确
- [ ] 获取用户信息接口正常

### 患者端接口
- [ ] 获取科室列表接口正常
- [ ] 注册科室接口正常
- [ ] 切换科室接口正常
- [ ] 获取医疗数据列表接口正常
- [ ] 获取授权请求列表接口正常
- [ ] 同意授权接口正常
- [ ] 拒绝授权接口正常
- [ ] 医生身份溯源接口正常

### 医生端接口
- [ ] 获取医疗数据列表接口正常
- [ ] 获取访问历史接口正常
- [ ] 获取统计数据接口正常
- [ ] 患者身份溯源接口正常

### 数据格式
- [ ] 所有响应符合统一格式
- [ ] 分页数据格式正确
- [ ] 日期时间格式统一
- [ ] 枚举值与前端一致

---

## 🎯 下一步

完成基础对接后，可以继续：

1. **实现文件上传功能**
   - 配置文件存储
   - 实现文件预览
   - 处理文件下载

2. **优化用户体验**
   - 添加加载动画
   - 优化错误提示
   - 添加操作确认

3. **测试与优化**
   - 编写单元测试
   - 进行性能优化
   - 修复已知问题

4. **部署上线**
   - 配置生产环境
   - 构建生产版本
   - 部署到服务器

---

**祝您对接顺利！** 🎉

如有问题，请查看详细文档或提交 Issue。

