# 医疗数据管理系统 - 前端模拟后端使用指南

## 📖 概述

本系统使用 LocalStorage 模拟后端数据存储，实现了医患数据共享、授权管理和访问记录等核心功能。医生端和患者端共享同一个 LocalStorage，从而实现数据的实时同步。

## 🔧 启用模拟模式

模拟模式默认已启用。如需手动控制，可以修改 `src/utils/request.ts` 中的配置：

```typescript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true
```

或在 `.env` 文件中设置：

```env
VITE_USE_MOCK=true
```

## 📦 LocalStorage 数据结构

系统使用以下 LocalStorage 键存储数据：

- `mock_medical_files`: 医疗文件数据
- `mock_authorization_requests`: 授权请求记录
- `mock_access_records`: 访问记录
- `user`: 当前登录用户信息（由认证系统管理）

## 🎯 核心功能流程

### 1️⃣ 患者上传医疗数据

患者上传医疗数据后，数据会立即出现在患者端的"我的数据"列表中，同时医生端也能看到该数据（但无法查看详情，需要先申请授权）。

```typescript
import { uploadMedicalFile } from '@/api/medicalData'

// 患者上传医疗数据
const uploadData = {
  file: fileObject,  // File 对象
  title: '血常规检查报告',
  description: '2024年10月体检血常规',
  category: 'lab-report'  // 检验报告
}

const response = await uploadMedicalFile(uploadData)
if (response.success) {
  console.log('上传成功:', response.data)
}
```

**支持的数据类别：**
- `lab-report`: 检验报告
- `medical-image`: 影像资料
- `medication`: 用药记录
- `physical-exam`: 体检报告
- `other`: 其他类型

### 2️⃣ 患者查看自己的医疗数据

```typescript
import { getMedicalFiles } from '@/api/medicalData'

// 获取所有医疗数据
const response = await getMedicalFiles()

// 按类别筛选
const response = await getMedicalFiles({
  category: 'lab-report',  // 只看检验报告
  page: 1,
  pageSize: 20
})

// 按授权状态筛选
const response = await getMedicalFiles({
  authStatus: 'pending',  // 只看待授权的数据
})

// 关键词搜索
const response = await getMedicalFiles({
  keyword: '血常规'
})
```

### 3️⃣ 医生查看医疗数据列表

医生可以看到所有患者上传的医疗数据，但根据授权状态显示不同的信息：

```typescript
import { getMedicalDataList } from '@/api/doctor'

// 获取所有医疗数据
const response = await getMedicalDataList()

// 按授权状态筛选
const response = await getMedicalDataList({
  authStatus: 'not-requested',  // 未申请授权的数据
})

const response = await getMedicalDataList({
  authStatus: 'pending',  // 待审批的数据
})

const response = await getMedicalDataList({
  authStatus: 'approved',  // 已授权的数据
})

const response = await getMedicalDataList({
  authStatus: 'rejected',  // 已拒绝的数据
})
```

**授权状态说明：**
- `not-requested`: 未申请授权（患者信息隐藏）
- `pending`: 待审批（患者信息隐藏）
- `approved`: 已授权（可以查看数据，需溯源才能看到患者信息）
- `rejected`: 已拒绝（患者信息隐藏）

### 4️⃣ 医生发起授权请求

医生看到感兴趣的医疗数据后，可以向患者发起授权请求：

```typescript
import { requestAuthorization } from '@/api/doctor'

const dataId = 'file_xxx'  // 医疗数据ID
const reason = '需要查看患者病历以便进行准确诊断和治疗方案制定'

const response = await requestAuthorization(dataId, reason)
if (response.success) {
  console.log('授权请求已发送')
}
```

授权请求发送后：
- 文件的授权状态变为 `pending`
- 患者端"授权管理"页面会显示该请求

### 5️⃣ 患者查看授权请求

患者可以查看所有收到的授权请求：

```typescript
import { getAuthorizationRequests } from '@/api/patient'

// 获取所有授权请求
const response = await getAuthorizationRequests()

// 只看待审批的请求
const response = await getAuthorizationRequests({
  status: 'pending',
  page: 1,
  pageSize: 10
})

// 查看已同意的请求
const response = await getAuthorizationRequests({
  status: 'approved'
})

// 查看已拒绝的请求
const response = await getAuthorizationRequests({
  status: 'rejected'
})
```

### 6️⃣ 患者审批授权请求

患者可以同意或拒绝医生的授权请求：

**同意授权：**

```typescript
import { approveAuthorization } from '@/api/patient'

const approveData = {
  requestId: 'auth_req_xxx',
  expiresIn: 30,  // 授权有效期（天数）：7、30、90等
  notes: '请妥善保管我的医疗数据'  // 备注（可选）
}

const response = await approveAuthorization(approveData)
if (response.success) {
  console.log('授权成功')
}
```

**拒绝授权：**

```typescript
import { rejectAuthorization } from '@/api/patient'

const rejectData = {
  requestId: 'auth_req_xxx',
  reason: '暂时不需要就诊，谢谢'  // 拒绝理由（必填）
}

const response = await rejectAuthorization(rejectData)
if (response.success) {
  console.log('已拒绝授权申请')
}
```

授权审批后：
- 授权请求状态更新为 `approved` 或 `rejected`
- 文件的授权状态相应更新
- 医生端可以看到授权状态的变化

### 7️⃣ 医生查看已授权的数据

医生获得授权后，可以查看医疗数据详情，系统会自动记录访问日志：

```typescript
import { viewMedicalData } from '@/api/doctor'

const dataId = 'file_xxx'

const response = await viewMedicalData(dataId)
if (response.success) {
  console.log('医疗数据详情:', response.data)
  // 访问记录已自动保存到 LocalStorage
}
```

**注意：**
- 只能查看已授权（`approved`）的数据
- 每次查看都会记录访问日志
- 访问记录包括：访问时间、访问类型、IP地址等

### 8️⃣ 患者身份溯源（患者端）

患者可以对授权请求进行身份溯源，查看医生的真实身份信息和访问记录：

```typescript
import { revealDoctorIdentity } from '@/api/patient'

const requestId = 'auth_req_xxx'

const response = await revealDoctorIdentity(requestId)
if (response.success) {
  console.log('医生信息:', response.data.doctor)
  console.log('访问记录:', response.data.accessRecords)
  console.log('总访问次数:', response.data.totalAccess)
}
```

溯源后可以看到：
- 医生的完整信息（姓名、医院、科室、身份证号等）
- 该医生对此数据的所有访问记录
- 总访问次数和最后访问时间

### 9️⃣ 医生身份溯源（医生端）

医生在已授权的情况下，可以对患者身份进行溯源：

```typescript
import { revealPatientIdentity } from '@/api/doctor'

const dataId = 'file_xxx'

const response = await revealPatientIdentity(dataId)
if (response.success) {
  console.log('患者信息:', response.data.patient)
  console.log('数据信息:', response.data.dataInfo)
  console.log('溯源时间:', response.data.traceTime)
}
```

溯源后可以看到：
- 患者的完整信息（姓名、性别、年龄、联系方式等）
- 相关的医疗数据信息
- 溯源操作也会被记录到访问日志

### 🔟 查看访问记录

访问记录用于审计和追溯，患者和医生都可以查看：

```typescript
import { getAccessRecordsList } from '@/services/mockBackend'

// 患者端：查看谁访问了我的数据
const response = getAccessRecordsList({
  page: 1,
  pageSize: 20
})

// 医生端：查看我的访问历史
const response = getAccessRecordsList({
  page: 1,
  pageSize: 20
})

// 按文件筛选
const response = getAccessRecordsList({
  fileId: 'file_xxx'
})
```

## 📊 完整流程示例

以下是一个完整的患者-医生数据共享流程：

```typescript
// ========== 第1步：患者上传数据 ==========
// 患者登录后上传医疗数据
const uploadResponse = await uploadMedicalFile({
  file: myFile,
  title: 'CT影像报告',
  description: '胸部CT检查',
  category: 'medical-image'
})
const fileId = uploadResponse.data.id
console.log('✅ 患者上传数据成功，文件ID:', fileId)

// ========== 第2步：医生查看数据列表 ==========
// 切换到医生账号登录
// 医生可以看到该数据，但患者信息被隐藏
const doctorListResponse = await getMedicalDataList()
console.log('✅ 医生看到数据列表，但看不到患者信息')

// ========== 第3步：医生发起授权请求 ==========
const authRequestResponse = await requestAuthorization(
  fileId,
  '需要查看影像资料进行诊断'
)
console.log('✅ 医生发起授权请求')

// ========== 第4步：患者查看授权请求 ==========
// 切换回患者账号
const patientAuthRequests = await getAuthorizationRequests({ status: 'pending' })
const requestId = patientAuthRequests.data.items[0].id
console.log('✅ 患者看到授权请求')

// ========== 第5步：患者同意授权 ==========
await approveAuthorization({
  requestId: requestId,
  expiresIn: 30,  // 30天有效期
  notes: '同意查看'
})
console.log('✅ 患者同意授权')

// ========== 第6步：医生查看数据 ==========
// 切换回医生账号
const viewResponse = await viewMedicalData(fileId)
console.log('✅ 医生查看数据成功，访问已记录')

// ========== 第7步：医生溯源患者身份 ==========
const traceResponse = await revealPatientIdentity(fileId)
console.log('✅ 医生溯源患者身份:', traceResponse.data.patient)

// ========== 第8步：患者查看访问记录 ==========
// 切换回患者账号
const accessRecords = getAccessRecordsList({ fileId })
console.log('✅ 患者查看访问记录:', accessRecords.data.items)
```

## 🗂️ 数据管理

### 查看 LocalStorage 数据

可以在浏览器控制台中查看存储的数据：

```javascript
// 查看所有医疗文件
console.log(JSON.parse(localStorage.getItem('mock_medical_files')))

// 查看所有授权请求
console.log(JSON.parse(localStorage.getItem('mock_authorization_requests')))

// 查看所有访问记录
console.log(JSON.parse(localStorage.getItem('mock_access_records')))
```

### 清空模拟数据

```javascript
// 清空所有模拟数据
localStorage.removeItem('mock_medical_files')
localStorage.removeItem('mock_authorization_requests')
localStorage.removeItem('mock_access_records')
```

### 初始化模拟数据

```typescript
import { initMockData } from '@/services/mockBackend'

// 初始化模拟数据（可选）
initMockData()
```

## ⚙️ 配置说明

### 授权有效期

患者在同意授权时可以设置有效期：
- 7天：短期授权
- 30天：中期授权
- 90天：长期授权
- 自定义天数

### 授权状态流转

```
not-requested (未申请)
    ↓ 医生发起授权请求
pending (待审批)
    ↓ 患者审批
    ├─ approved (已批准) → 授权过期 → expired (已过期)
    └─ rejected (已拒绝)
```

## 🔒 安全特性

1. **患者隐私保护**：未授权时，医生看不到患者信息
2. **访问记录**：所有数据访问都有记录，可追溯
3. **授权过期**：授权有时间限制，过期需重新申请
4. **身份溯源**：患者和医生都可以溯源对方身份
5. **审计日志**：完整的操作日志用于审计

## 🐛 常见问题

### Q1: 为什么医生看不到患者信息？
A: 需要先发起授权请求，患者同意后才能看到。这是隐私保护机制。

### Q2: 如何切换医生和患者账号？
A: 退出当前账号，使用不同角色的账号重新登录即可。

### Q3: 数据在浏览器关闭后还在吗？
A: 是的，LocalStorage 数据会持久保存，除非手动清除。

### Q4: 多个浏览器标签页数据会同步吗？
A: 会的，所有标签页共享同一个 LocalStorage，数据是实时同步的。

### Q5: 如何模拟多个患者和医生？
A: 注册不同的账号，分别上传数据和发起授权即可。

## 📝 API 列表

### 患者端 API

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| uploadMedicalFile | POST | /medical-data/files/upload | 上传医疗数据 |
| getMedicalFiles | GET | /medical-data/files | 获取医疗文件列表 |
| getAuthorizationRequests | GET | /patient/authorization-requests | 获取授权请求列表 |
| approveAuthorization | POST | /patient/authorization-requests/:id/approve | 同意授权 |
| rejectAuthorization | POST | /patient/authorization-requests/:id/reject | 拒绝授权 |
| revealDoctorIdentity | POST | /patient/authorization-requests/reveal-identity | 医生身份溯源 |

### 医生端 API

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| getMedicalDataList | GET | /doctor/medical-data | 获取医疗数据列表 |
| requestAuthorization | POST | /doctor/medical-data/:id/request-authorization | 发起授权请求 |
| viewMedicalData | POST | /doctor/medical-data/:id/view | 查看医疗数据 |
| revealPatientIdentity | POST | /doctor/medical-data/:id/reveal-patient | 患者身份溯源 |

## 🎉 总结

本模拟系统完整实现了医疗数据管理的核心流程：

1. ✅ 患者上传数据
2. ✅ 医生查看数据列表
3. ✅ 医生发起授权请求
4. ✅ 患者审批授权
5. ✅ 医生查看已授权数据
6. ✅ 记录访问日志
7. ✅ 身份溯源

所有数据通过 LocalStorage 在医生端和患者端之间共享，实现了完整的数据流转和权限管理。

