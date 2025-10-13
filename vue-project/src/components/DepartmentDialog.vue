<template>
  <el-dialog
    v-model="dialogVisible"
    title="科室管理"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="department-dialog-content">
      <!-- 当前科室显示 -->
      <div class="current-department" v-if="currentDepartment">
        <el-alert
          :title="`当前科室：${currentDepartment}`"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 已注册科室列表 -->
      <div class="department-list">
        <h3 class="section-title">
          <el-icon><List /></el-icon>
          已注册的科室
        </h3>
        
        <el-empty 
          v-if="!departments || departments.length === 0" 
          description="暂无已注册科室"
        />
        
        <div v-else class="department-items">
          <div 
            v-for="dept in departments" 
            :key="dept.id"
            class="department-item"
            :class="{ active: isCurrentDepartment(dept.department) }"
          >
            <div class="dept-info">
              <el-icon class="dept-icon"><OfficeBuilding /></el-icon>
              <div class="dept-details">
                <span class="dept-name">{{ dept.department }}</span>
              </div>
            </div>
            <div class="dept-actions">
              <el-tag v-if="isCurrentDepartment(dept.department)" type="success" size="small">当前科室</el-tag>
              <el-button
                v-else
                type="primary"
                size="small"
                @click="handleSwitch(dept.id)"
              >
                切换
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 注册新科室 -->
      <el-divider />
      
      <div class="register-department">
        <h3 class="section-title">
          <el-icon><Plus /></el-icon>
          注册新科室
        </h3>
        
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef">
          <el-form-item prop="department">
            <el-select
              v-model="registerForm.department"
              placeholder="请选择要注册的科室"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="option in DEPARTMENT_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        
        <el-button
          type="success"
          @click="handleRegister"
          :disabled="!registerForm.department"
          style="width: 100%"
        >
          <el-icon><Plus /></el-icon>
          注册新科室
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  OfficeBuilding, 
  List, 
  Plus 
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { PatientDepartment } from '@/types/auth'
import { DEPARTMENT_OPTIONS } from '@/types/auth'

interface Props {
  visible: boolean
  departments: PatientDepartment[]
  currentDepartment?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'switch', departmentId: string): void
  (e: 'register', departmentName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const registerFormRef = ref<FormInstance>()

// 控制对话框显示
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 注册表单
const registerForm = ref({
  department: ''
})

// 验证规则
const registerRules: FormRules = {
  department: [
    { required: true, message: '请选择科室', trigger: 'change' }
  ]
}

// 判断是否为当前科室
const isCurrentDepartment = (departmentName: string) => {
  return props.currentDepartment === departmentName
}

// 切换科室
const handleSwitch = (departmentId: string) => {
  emit('switch', departmentId)
}

// 注册新科室
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    
    // 检查是否已注册该科室
    const exists = props.departments.some(
      d => d.department === registerForm.value.department
    )
    
    if (exists) {
      ElMessage.warning('该科室已注册，请直接切换')
      return
    }
    
    emit('register', registerForm.value.department)
    
    // 清空表单
    registerForm.value.department = ''
    registerFormRef.value.resetFields()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  // 清空表单
  registerForm.value.department = ''
  registerFormRef.value?.resetFields()
}

// 监听对话框关闭
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    handleClose()
  }
})
</script>

<style scoped>
.department-dialog-content {
  padding: 8px 0;
}

.current-department {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.section-title .el-icon {
  font-size: 18px;
  color: #4dd0e1;
}

.department-list {
  margin-bottom: 24px;
}

.department-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.department-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
}

.department-item:hover {
  background: #f0f9ff;
  border-color: #4dd0e1;
}

.department-item.active {
  background: linear-gradient(135deg, #e0f7fa 0%, #f0f9ff 100%);
  border-color: #4dd0e1;
  box-shadow: 0 2px 8px rgba(77, 208, 225, 0.15);
}

.dept-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dept-icon {
  font-size: 24px;
  color: #4dd0e1;
}

.dept-details {
  display: flex;
  flex-direction: column;
}

.dept-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.dept-actions {
  display: flex;
  align-items: center;
}

.register-department {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .department-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .dept-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

