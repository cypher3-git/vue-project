# 模拟数据使用说明 📋

本文档说明如何使用和管理项目中的模拟数据系统。

## 📌 概述

为了方便前端开发和测试，项目集成了完整的模拟数据系统。通过简单的配置开关，您可以在"使用模拟数据"和"连接真实后端"之间快速切换。

## 🔧 快速开始

### 1. 启用/禁用模拟数据

打开文件：`src/config/mock.config.ts`

```typescript
export const MOCK_CONFIG = {
  // 设置为 true 启用模拟数据，设置为 false 连接真实后端
  USE_MOCK_DATA: true,
  
  // 模拟 API 延迟时间（毫秒）
  MOCK_DELAY: 300,
  
  // 是否在控制台打印模拟数据日志
  ENABLE_MOCK_LOG: true
}
```

### 2. 启动项目

```bash
npm run dev
```

当 `USE_MOCK_DATA = true` 时，所有 API 请求将返回模拟数据，无需后端服务器运行。

## 📦 模拟数据内容

### 患者端数据

- ✅ **医疗文件列表**：6 个示例文件（检验报告、影像资料、体检报告等）
- ✅ **分享记录**：4 条分享记录（包含活跃和过期状态）
- ✅ **访问记录**：5 条医生访问记录
- ✅ **统计数据**：文件数量、分享数量、访问次数等

### 医生端数据

- ✅ **授权患者列表**：5 位患者信息（包含不同授权状态）
- ✅ **可访问数据**：4 个患者数据文件
- ✅ **访问历史**：5 条访问记录
- ✅ **统计数据**：患者数量、授权状态、访问统计等

## 🎯 使用场景

### 场景 1：开发新功能

```typescript
// 在 mock.config.ts 中
USE_MOCK_DATA: true  // 启用模拟数据
```

✅ 优点：
- 无需后端即可开发
- 数据稳定可预测
- 响应速度快

### 场景 2：连接真实后端

```typescript
// 在 mock.config.ts 中
USE_MOCK_DATA: false  // 连接真实后端
```

✅ 优点：
- 测试真实 API 集成
- 验证数据流程
- 发现潜在问题

### 场景 3：混合模式（高级）

可以在特定 API 中选择性使用模拟数据：

```typescript
// 在 mockService.ts 中返回 null 即可跳过模拟
if (!MOCK_CONFIG.USE_MOCK_DATA) return null
```

## 🛠️ 管理模拟数据

### 在浏览器控制台中管理

项目已将模拟数据管理器挂载到 `window` 对象，在开发环境下可以直接使用：

```javascript
// 查看模拟数据统计
mockDataManager.showMockDataStats()

// 清除所有模拟数据
mockDataManager.clearAllMockData()

// 清除患者端数据
mockDataManager.clearPatientMockData()

// 清除医生端数据
mockDataManager.clearDoctorMockData()

// 导出模拟数据到文件
mockDataManager.downloadMockData()
```

### 在代码中管理

```typescript
import { mockDataManager } from '@/utils/mockDataManager'

// 确认后清除所有数据
await mockDataManager.confirmClearAll()

// 显示统计信息
const stats = mockDataManager.showMockDataStats()
console.log(stats)
```

## 📝 自定义模拟数据

### 修改现有数据

编辑对应的数据文件：

- **患者端**：`src/mock/data/patients.ts`
- **医生端**：`src/mock/data/doctors.ts`

```typescript
// 示例：添加新的医疗文件
export const mockPatientData = {
  medicalFiles: [
    {
      id: '7',
      name: '新的检查报告',
      type: '检验报告',
      category: 'lab-report',
      uploadDate: '2024-01-25',
      size: '3.0 MB',
      description: '最新检查结果',
      status: 'normal',
      sharedCount: 0
    },
    // ... 其他文件
  ]
}
```

### 添加新的 API 模拟

在 `src/mock/mockService.ts` 中添加新方法：

```typescript
class MockService {
  // 新增 API 模拟
  async getNewData() {
    if (!MOCK_CONFIG.USE_MOCK_DATA) return null
    
    mockLog('获取新数据')
    await mockDelay()
    
    return createMockResponse({
      data: '你的数据'
    })
  }
}
```

然后在对应的 API 文件中调用：

```typescript
export const getNewData = async () => {
  const mockResponse = await mockService.getNewData()
  if (mockResponse) return mockResponse
  
  return request.get('/api/new-data')
}
```

## 🔍 调试技巧

### 1. 查看模拟数据日志

确保 `ENABLE_MOCK_LOG: true`，然后在浏览器控制台查看：

```
[MOCK] 获取患者医疗数据列表 {page: 1, pageSize: 10}
[MOCK] 获取患者仪表板统计
```

### 2. 调整响应延迟

模拟真实网络延迟：

```typescript
MOCK_DELAY: 1000  // 增加到 1 秒
```

或关闭延迟：

```typescript
MOCK_DELAY: 0  // 即时响应
```

### 3. 测试不同状态

修改模拟数据的状态字段：

```typescript
status: 'active'   // 活跃状态
status: 'expired'  // 过期状态
status: 'pending'  // 待处理状态
```

## ⚠️ 注意事项

1. **生产环境禁用**
   - 确保在生产环境中 `USE_MOCK_DATA` 设置为 `false`
   - 或者在构建时从代码中移除模拟逻辑

2. **数据持久化**
   - 模拟数据存储在浏览器 localStorage
   - 清除浏览器缓存会删除所有模拟数据
   - 使用 `mockDataManager` 工具管理数据

3. **API 一致性**
   - 模拟数据的格式应与真实 API 响应保持一致
   - 定期检查和更新模拟数据结构

4. **性能考虑**
   - 大量模拟数据可能影响性能
   - 根据需要调整数据量

## 🚀 切换到真实后端

当后端准备就绪时，按以下步骤切换：

### 步骤 1：关闭模拟数据

```typescript
// src/config/mock.config.ts
USE_MOCK_DATA: false
```

### 步骤 2：清除本地模拟数据（可选）

```javascript
// 浏览器控制台
mockDataManager.clearAllMockData()
```

### 步骤 3：配置 API 基础 URL

```typescript
// src/utils/request.ts
const API_BASE_URL = 'http://your-backend-api.com/api'
```

### 步骤 4：测试 API 连接

访问各个页面，确保所有功能正常工作。

## 📚 文件结构

```
src/
├── config/
│   └── mock.config.ts          # 模拟数据配置
├── mock/
│   ├── data/
│   │   ├── patients.ts         # 患者端模拟数据
│   │   └── doctors.ts          # 医生端模拟数据
│   └── mockService.ts          # 模拟数据服务
├── utils/
│   └── mockDataManager.ts      # 模拟数据管理工具
└── api/
    ├── medicalData.ts          # 医疗数据 API（已集成模拟）
    ├── patient.ts              # 患者端 API（已集成模拟）
    ├── doctor.ts               # 医生端 API（已集成模拟）
    └── share.ts                # 分享管理 API（已集成模拟）
```

## 💡 常见问题

### Q: 如何添加更多模拟数据？
A: 编辑 `src/mock/data/` 目录下的对应文件，添加新的数据项。

### Q: 模拟数据在哪里存储？
A: 部分数据存储在浏览器 localStorage，部分在内存中。

### Q: 如何恢复默认模拟数据？
A: 清除所有数据后刷新页面，系统会重新加载默认数据。

### Q: 可以导出模拟数据吗？
A: 可以，使用 `mockDataManager.downloadMockData()` 导出为 JSON 文件。

### Q: 为什么有些 API 没有模拟数据？
A: 只有核心 API 集成了模拟数据。如需添加，请在 `mockService.ts` 中实现。

## 📞 支持

如有问题或建议，请联系开发团队或查阅项目文档。

---

**最后更新**：2024-01-21  
**版本**：1.0.0

