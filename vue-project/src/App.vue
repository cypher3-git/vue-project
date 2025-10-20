<template>
  <div id="app">
    <!-- 添加加载状态提示 -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-content">
        <h2>🏥 面向Web3.0医疗数据可溯源共享系统</h2>
        <p>系统加载中，请稍候...</p>
      </div>
    </div>
    
    <!-- 路由视图 -->
    <router-view v-else />
    
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import '@/styles/main.css'

const isLoading = ref(true)


onMounted(async () => {
  try {
    console.log('🎯 App组件挂载成功')
    
    // 模拟加载时间，让用户看到加载状态
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 延迟初始化认证store，避免初始化错误
    try {
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      await authStore.initUser()
      console.log('✅ 认证系统初始化成功')
    } catch (error) {
      console.warn('⚠️ 认证系统初始化失败，继续加载应用:', error)
    }
    
    isLoading.value = false
    console.log('🚀 应用加载完成')
  } catch (error) {
    console.error('❌ 应用加载失败:', error)
    isLoading.value = false
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 加载屏幕 */
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-content h2 {
  font-size: 28px;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.loading-content p {
  font-size: 16px;
  opacity: 0.9;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.5; }
}

/* 全局过渡动画 */
.page-enter-active, .page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 路由视图容器 */
.router-view-container {
  min-height: 100vh;
}
</style>
