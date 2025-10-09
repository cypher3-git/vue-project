# 医生注册简化修改说明

## 修改概述

根据需求，医生注册时现在只需要和患者相同的数据项，删除了医生专属的额外信息输入框。

## 修改内容

### 1. 类型定义修改 (`vue-project/src/types/auth.ts`)

#### 1.1 DoctorRegisterData 接口简化
- **删除字段**: 
  - `licenseNumber` (医师执业证号)
  - `hospital` (医院名称)
  - `department` (科室)
  - `title` (职称)

- **修改后**: 医生注册数据与患者注册数据完全相同，只包含基础字段：
  - `phone` (手机号)
  - `idCard` (身份证号)
  - `code` (验证码)
  - `role` (角色)
  - `agreeToTerms` (协议同意)

#### 1.2 DoctorUser 接口调整
- 将医生专属字段改为可选（`?`标记）：
  - `licenseNumber?`: 可选，注册时不收集
  - `hospital?`: 可选，注册时不收集
  - `department?`: 可选，注册时不收集

这些信息可以在医生注册后通过个人资料更新接口补充。

### 2. 注册表单修改 (`vue-project/src/views/auth/RegisterView.vue`)

#### 2.1 删除医生专属输入框
移除了以下表单项：
- 医师执业证号输入框
- 医院名称输入框
- 科室输入框
- 职称输入框（可选）

#### 2.2 删除不需要的图标导入
移除了以下图标（不再需要）：
- `Document`
- `OfficeBuilding`
- `Odometer`
- `Medal`

#### 2.3 简化表单数据结构
- 删除了 `registerForm` 中的医生专属字段
- 表单数据结构现在对患者和医生完全一致

#### 2.4 简化验证规则
- 移除了医生专属字段的验证规则
- 患者和医生使用相同的验证规则集

#### 2.5 简化注册逻辑
- 注册数据构建逻辑不再区分患者和医生
- 使用统一的数据结构提交注册请求

### 3. 后端集成文档更新 (`BACKEND_INTEGRATION_GUIDE.md`)

#### 3.1 医生注册API示例更新
更新了医生注册的请求示例，移除了额外字段，现在与患者注册格式一致：

```json
{
  "phone": "13800138001",
  "code": "123456",
  "idCard": "330101198001011234",
  "role": "doctor",
  "agreeToTerms": true
}
```

#### 3.2 数据模型定义更新
更新了 `DoctorUser` 模型的Go结构体定义，将相关字段改为可选：
- `LicenseNumber` → `json:"licenseNumber,omitempty" gorm:"unique"`
- `Hospital` → `json:"hospital,omitempty"`
- `Department` → `json:"department,omitempty"`

添加了说明：医生注册时只需提供基本信息，其他信息可在注册后补充。

## 影响范围

### 前端变更
1. ✅ 类型定义文件
2. ✅ 注册表单组件
3. ✅ 表单验证逻辑
4. ✅ 注册数据提交逻辑

### 后端文档变更
1. ✅ API请求示例
2. ✅ 数据模型定义
3. ✅ 添加相关说明

### 不受影响的部分
- 登录流程（患者和医生仍使用手机验证码登录）
- API路由结构
- 其他业务逻辑

## 后续工作建议

1. **后端实现**: 需要根据更新后的文档调整Go后端代码
   - 修改 DoctorUser 数据模型
   - 更新注册API处理逻辑
   - 调整数据库表结构（字段改为可空）

2. **医生信息补充**: 可以考虑：
   - 在医生首次登录后提示补充专业信息
   - 在个人中心提供信息完善入口
   - 根据信息完整度显示不同的认证状态

3. **医生认证流程**: 
   - 医生注册后可能需要单独的认证流程
   - 提交医师执业证、医院证明等材料进行认证
   - 认证通过后才能查看患者数据

## 测试验证

已完成的验证：
- ✅ TypeScript类型检查通过（注册相关文件）
- ✅ 无Linter错误
- ✅ 开发服务器正常启动

建议进行的测试：
- [ ] 医生注册流程端到端测试
- [ ] 患者注册流程回归测试
- [ ] 表单验证测试
- [ ] API集成测试（需要后端配合）

## 文件清单

修改的文件：
1. `/vue-project/src/types/auth.ts` - 类型定义
2. `/vue-project/src/views/auth/RegisterView.vue` - 注册表单
3. `/BACKEND_INTEGRATION_GUIDE.md` - 后端集成文档

未修改但相关的文件：
- `/vue-project/src/api/auth.ts` - API接口（使用更新后的类型）
- `/vue-project/src/stores/auth.ts` - 状态管理（使用更新后的类型）

---

**修改完成日期**: 2025-10-09  
**修改人**: AI Assistant  
**版本**: v1.0

