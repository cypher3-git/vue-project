<template>
  <div class="user-switcher">
    <el-dropdown 
      @command="handleUserSwitch"
      trigger="click"
      placement="bottom-end"
    >
      <el-button size="small" type="primary" text>
        <el-icon><User /></el-icon>
        {{ currentUserDisplay }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </el-button>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item disabled class="dropdown-title">切换用户</el-dropdown-item>
          <el-dropdown-item divided disabled class="dropdown-category">患者用户</el-dropdown-item>
          
          <el-dropdown-item 
            v-for="patient in patients" 
            :key="patient.id"
            :command="`${patient.id}:patient`"
            :class="{ 'is-active': isCurrentUser(patient.id, 'patient') }"
          >
            <el-icon><UserFilled /></el-icon>
            {{ patient.name }} ({{ patient.currentDepartment }})
          </el-dropdown-item>
          
          <el-dropdown-item divided disabled class="dropdown-category">医生用户</el-dropdown-item>
          
          <el-dropdown-item 
            v-for="doctor in doctors"
            :key="doctor.id" 
            :command="`${doctor.id}:doctor`"
            :class="{ 'is-active': isCurrentUser(doctor.id, 'doctor') }"
          >
            <el-icon><Operation /></el-icon>
            {{ doctor.name }} ({{ doctor.department }})
          </el-dropdown-item>
          
          <el-dropdown-item divided>
            <el-button size="small" type="danger" plain @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  ArrowDown, 
  UserFilled, 
  Operation, 
  SwitchButton 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import mockBackend from '@/services/mockBackend'
import type { PatientUser, DoctorUser } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

// 用户列表
const patients = ref<PatientUser[]>([])
const doctors = ref<DoctorUser[]>([])

// 当前用户显示文本
const currentUserDisplay = computed(() => {
  const user = authStore.user
  if (!user) return '未登录'
  
  if (user.role === 'patient') {
    return `${user.name} (患者)`
  } else {
    return `${user.name} (医生)`
  }
})

// 检查是否为当前用户
const isCurrentUser = (userId: string, role: string) => {
  return authStore.user?.id === userId && authStore.user?.role === role
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const response = await mockBackend.getAllUsers()
    if (response.success && response.data) {
      patients.value = response.data.patients
      doctors.value = response.data.doctors
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 处理用户切换
const handleUserSwitch = async (command: string) => {
  const [userId, role] = command.split(':')
  
  if (isCurrentUser(userId, role)) {
    return // 已经是当前用户，不需要切换
  }
  
  try {
    console.log(`🔄 切换用户: ${userId} (${role})`)
    
    const response = await mockBackend.switchUser(userId, role as 'patient' | 'doctor')
    
    if (!response.success) {
      ElMessage.error(`切换失败：${response.message}`)
      return
    }
    
    // 更新store
    const currentUser = response.data
    const mockToken = `switch_token_${userId}_${Date.now()}`
    
    authStore.user = currentUser
    authStore.token = mockToken
    
    // 如果是患者，设置departments
    if (role === 'patient' && currentUser.departments) {
      authStore.departments = currentUser.departments
    }
    
    ElMessage.success(`已切换到：${currentUser.name}`)
    
    // 跳转到对应页面
    const redirectPath = role === 'patient' ? '/patient/data' : '/doctor/data'
    router.push(redirectPath)
    
  } catch (error: any) {
    console.error('❌ 用户切换失败:', error)
    ElMessage.error('切换失败，请重试')
  }
}

// 退出登录
const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

// 组件挂载时加载用户列表
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-switcher {
  display: inline-block;
}

:deep(.el-dropdown-menu__item.dropdown-title) {
  font-weight: 600;
  color: #262626;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item.dropdown-category) {
  font-weight: 500;
  color: #666;
  font-size: 12px;
  background-color: #f8f9fa;
}

:deep(.el-dropdown-menu__item.is-active) {
  background-color: #e6f7ff;
  color: #1890ff;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 6px;
}

:deep(.el-dropdown-menu__item .el-button) {
  width: 100%;
  justify-content: flex-start;
}
</style>
