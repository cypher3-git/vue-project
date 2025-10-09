# 医生注册科室字段添加说明

## 修改概述

根据需求调整，医生注册时需要添加科室选择功能，作为必填项。

## 修改内容

### 1. 类型定义修改 (`vue-project/src/types/auth.ts`)

#### 1.1 DoctorRegisterData 接口更新
- **新增字段**: `department` (科室 - 必填)

修改后的医生注册数据包含：
- `phone` (手机号)
- `idCard` (身份证号)
- `code` (验证码)
- `role` (角色: doctor)
- `department` (科室 - 必填)
- `agreeToTerms` (协议同意)

### 2. 注册表单修改 (`vue-project/src/views/auth/RegisterView.vue`)

#### 2.1 添加科室选择下拉框
- 新增科室选择下拉框，仅在选择"医生"角色时显示
- 使用 Element Plus 的 `el-select` 组件
- 支持筛选功能 (`filterable`)
- 添加 `OfficeBuilding` 图标

#### 2.2 科室选项列表
提供以下24个常见科室选项：
- 内科、外科、儿科、妇产科
- 心血管科、神经内科、神经外科、骨科
- 呼吸科、消化科、肾内科、内分泌科
- 血液科、肿瘤科、皮肤科、眼科
- 耳鼻喉科、口腔科、中医科、康复科
- 麻醉科、急诊科、ICU、其他科室

#### 2.3 表单验证规则
- 当角色为"医生"时，科室字段为必填
- 验证信息："请选择科室"

#### 2.4 表单数据结构
- 在 `registerForm` 中添加 `department` 字段
- 初始值为空字符串

#### 2.5 角色切换逻辑
- 当从"医生"切换到"患者"时，自动清空科室选择
- 清除验证状态

#### 2.6 注册数据提交
- 医生注册时，包含 `department` 字段
- 患者注册时，不包含此字段

#### 2.7 表单重置
- 重置表单时，清空科室选择

### 3. 后端集成文档更新 (`BACKEND_INTEGRATION_GUIDE.md`)

#### 3.1 医生注册API示例更新
更新了医生注册的请求示例，添加科室字段：

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

#### 3.2 数据模型定义更新
更新了 `DoctorUser` 模型的Go结构体定义：
- `Department` 字段：`json:"department" gorm:"not null"` - 注册时必填
- 其他字段保持为可选，可在注册后补充

添加了说明：医生注册时需要选择科室（必填），其他信息可在注册后补充。

## 用户体验优化

1. **科室筛选**: 支持输入关键字快速筛选科室
2. **清空功能**: 支持快速清空已选择的科室
3. **角色切换**: 切换角色时自动清理相关字段
4. **验证提示**: 提交时如未选择科室，显示清晰的错误提示

## 后端实现要点

1. **数据库表结构**: 
   - `DoctorUser` 表的 `department` 字段应设为 NOT NULL
   - 字符串类型，存储科室名称

2. **注册接口处理**:
   - 验证医生注册时必须包含 `department` 字段
   - 验证科室名称不能为空
   - 存储到 `DoctorUser` 扩展表

3. **数据验证**:
   ```go
   if userData.Role == "doctor" {
       if userData.Department == "" {
           return errors.New("医生注册时科室为必填项")
       }
   }
   ```

## 测试验证

已完成的验证：
- ✅ TypeScript类型检查通过
- ✅ 无Linter错误
- ✅ 表单验证规则正确
- ✅ 角色切换逻辑正常

建议进行的测试：
- [ ] 医生注册流程（包含科室选择）
- [ ] 患者注册流程（确保不受影响）
- [ ] 科室筛选功能测试
- [ ] 表单验证测试（空科室、角色切换等）
- [ ] API集成测试（需要后端配合）

## 文件清单

修改的文件：
1. `/vue-project/src/types/auth.ts` - 添加 department 字段到 DoctorRegisterData
2. `/vue-project/src/views/auth/RegisterView.vue` - 添加科室选择表单项
3. `/BACKEND_INTEGRATION_GUIDE.md` - 更新后端集成说明

## 科室列表数据

当前科室列表硬编码在组件中，包含24个选项。如果需要从后端动态获取，可以：

1. 创建科室配置API: `GET /api/config/departments`
2. 在组件初始化时加载科室列表
3. 缓存到本地或Pinia状态管理

示例代码：
```typescript
const departments = ref<string[]>([])

onMounted(async () => {
  const response = await configApi.getDepartments()
  if (response.success) {
    departments.value = response.data
  }
})
```

## 与之前修改的关系

这次修改是对之前"删除医生专属字段"的调整：
- 之前：删除了所有医生专属字段
- 现在：保留科室字段作为必填项
- 其他字段（医师执业证号、医院名称、职称）仍然不在注册时收集

---

**修改完成日期**: 2025-10-09  
**修改人**: AI Assistant  
**版本**: v2.0 (在v1.0基础上添加科室功能)

