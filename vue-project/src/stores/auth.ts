import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { User, LoginCredentials, RegisterData } from '@/types/auth'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref<boolean>(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 初始化用户信息
  const initUser = async (): Promise<void> => {
    if (token.value && !user.value) {
      try {
        const response = await authApi.getCurrentUser()
        if (response.success && response.data) {
          user.value = response.data
        } else {
          logout()
        }
      } catch (error) {
        // token无效，清除本地存储
        logout()
      }
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
    localStorage.removeItem('token')
    
    ElMessage.success('已安全退出')
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

  // 修改密码（已废弃，系统不再使用密码）
  /** @deprecated 系统已移除密码功能 */
  const changePassword = async (passwordData: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> => {
    ElMessage.warning('系统已移除密码功能，使用手机验证码登录')
    throw new Error('系统已移除密码功能')
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
    
    // 计算属性
    isAuthenticated,
    
    // 方法
    initUser,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkTokenExpiration,
    refreshToken
  }
})

// 延迟初始化用户信息，避免在应用启动时立即执行
// 这将在App组件的onMounted中调用
