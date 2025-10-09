<template>
  <div class="test-view">
    <div class="welcome-container">
      <h1 class="title">🏥 高效隐私保护的时空接触追溯系统</h1>
      <p class="subtitle">系统正在初始化中...</p>
      
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="goToLogin">
          进入登录页面
        </el-button>
        <el-button type="success" size="large" @click="goToRegister">
          进入注册页面
        </el-button>
      </div>
      
    </div>
  </div> 
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.test-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #4dd0e1 0%, #26a69a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-container {
  text-align: center;
  max-width: 900px;
  width: 100%;
}

.title {
  font-size: 32px;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 18px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 40px;
}

.action-buttons {
  margin-bottom: 40px;
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons :deep(.el-button) {
  min-width: 160px;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

.system-info {
  text-align: left;
}

.system-info :deep(.el-card) {
  background: rgba(255,255,255,0.95);
  border-radius: 16px;
}

.system-info h3 {
  color: #1890ff;
  margin-bottom: 16px;
}

.system-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.system-info li {
  padding: 8px 0;
  font-size: 16px;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons :deep(.el-button) {
    width: 100%;
    max-width: 280px;
  }
}
</style>

