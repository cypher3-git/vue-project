import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { 
  User,
  PatientUser,
  DoctorUser,
  LoginCredentials, 
  RegisterData,
  PatientDepartment
} from '@/types/auth'
import { authApi, patientApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | PatientUser | DoctorUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref<boolean>(false)
  const departments = ref<PatientDepartment[]>([]) // 患者已注册的科室列表

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isPatient = computed(() => user.value?.role === 'patient')
  const isDoctor = computed(() => user.value?.role === 'doctor')
  const currentDepartment = computed(() => {
    if (user.value?.role === 'patient') {
      return (user.value as PatientUser).currentDepartment
    } else if (user.value?.role === 'doctor') {
      return (user.value as DoctorUser).department
    }
    return undefined
  })

  // 初始化用户信息
  const initUser = async (): Promise<void> => {
    if (token.value && !user.value) {
      try {
        const response = await authApi.getCurrentUser()
        if (response.success && response.data) {
          user.value = response.data
          // 如果是患者，加载科室列表
          if (user.value.role === 'patient') {
            await loadDepartments()
          }
        } else {
          logout()
        }
      } catch (error) {
        // token无效，清除本地存储
        logout()
      }
    }
  }

  // 加载患者科室列表
  const loadDepartments = async (): Promise<void> => {
    try {
      const response = await patientApi.getPatientDepartments()
      if (response.success && response.data) {
        departments.value = response.data
      }
    } catch (error) {
      console.error('加载科室列表失败:', error)
    }
  }

  // 登录（手机号验证码登录）
  const login = async (credentials: LoginCredentials): Promise<void> => {
    loading.value = true
    try {
      const response = await authApi.login(credentials)
      
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        
        // 保存token到localStorage
        localStorage.setItem('token', response.data.token)
        
        // 如果是患者，加载科室列表
        if (user.value.role === 'patient') {
          await loadDepartments()
        }
        
        ElMessage.success('登录成功！')
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，请检查手机号和验证码')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 注册（身份证号+手机号+验证码）
  const register = async (data: RegisterData): Promise<void> => {
    loading.value = true
    try {
      const response = await authApi.register(data)
      
      if (response.success) {
        ElMessage.success('注册成功！请登录')
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败，请重试')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 退出登录
  const logout = (): void => {
    try {
      // 调用后端退出接口（可选）
      if (token.value) {
        authApi.logout().catch(() => {
          // 忽略退出接口错误
        })
      }
    } catch (error) {
      // 忽略错误，继续本地清理
    }
    
    // 清理本地状态
    user.value = null
    token.value = null
    departments.value = []
    localStorage.removeItem('token')
    
    ElMessage.success('已安全退出')
  }

  // 注册新科室
  const registerNewDepartment = async (departmentName: string): Promise<boolean> => {
    loading.value = true
    try {
      const response = await patientApi.registerNewDepartment({ 
        department: departmentName 
      })
      
      if (response.success && response.data) {
        // 重新加载科室列表
        await loadDepartments()
        ElMessage.success('科室注册成功！')
        return true
      } else {
        throw new Error(response.message || '注册科室失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '注册科室失败，请重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 切换科室
  const switchDepartment = async (departmentId: string): Promise<boolean> => {
    loading.value = true
    try {
      const response = await patientApi.switchDepartment({ departmentId })
      
      if (response.success) {
        // 重新加载科室列表和用户信息
        await loadDepartments()
        await initUser()
        ElMessage.success('科室切换成功！')
        return true
      } else {
        throw new Error(response.message || '切换科室失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '切换科室失败，请重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateProfile = async (profileData: any): Promise<void> => {
    loading.value = true
    try {
      const response = await authApi.updateProfile(profileData)
      
      if (response.success && response.data) {
        user.value = { ...user.value, ...response.data }
        ElMessage.success('个人信息更新成功')
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '更新个人信息失败')
      throw error
    } finally {
      loading.value = false
    }
  }


  // 检查token是否即将过期
  const checkTokenExpiration = (): boolean => {
    if (!token.value) return false
    
    try {
      // 解析JWT token（简单实现，生产环境建议使用专门的JWT库）
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      // 如果token在30分钟内过期，返回true
      return payload.exp - currentTime < 30 * 60
    } catch (error) {
      return true // 解析失败，认为已过期
    }
  }

  // 刷新token
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authApi.refreshToken()
      
      if (response.success && response.data) {
        token.value = response.data.token
        localStorage.setItem('token', response.data.token)
      } else {
        logout()
      }
    } catch (error) {
      logout()
    }
  }

  return {
    // 状态
    user,
    token,
    loading,
    departments,
    
    // 计算属性
    isAuthenticated,
    isPatient,
    isDoctor,
    currentDepartment,
    
    // 方法
    initUser,
    loadDepartments,
    login,
    register,
    logout,
    updateProfile,
    checkTokenExpiration,
    refreshToken,
    registerNewDepartment,
    switchDepartment
  }
})

// 延迟初始化用户信息，避免在应用启动时立即执行
// 这将在App组件的onMounted中调用
