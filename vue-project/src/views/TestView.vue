<template>
  <div class="test-view">
    <div class="welcome-container">
      <!-- Logo 和主标题区域 -->
      <div class="hero-section">
        <div class="logo-wrapper">
          <el-icon :size="120" color="#ffffff" class="logo-icon">
            <DataAnalysis />
          </el-icon>
        </div>
        <h1 class="main-title">高效隐私保护的时空接触追溯系统</h1>
        <p class="main-subtitle">基于区块链技术的医疗数据安全追溯平台</p>
        
        <div class="action-buttons">
          <el-button type="primary" size="large" class="primary-btn" @click="goToLogin">
            <el-icon class="btn-icon"><UserFilled /></el-icon>
            立即登录
          </el-button>
          <el-button class="secondary-btn" size="large" @click="goToRegister">
            <el-icon class="btn-icon"><EditPen /></el-icon>
            注册账号
          </el-button>
        </div>
      </div>
      
      <!-- 特色功能展示 -->
      <div class="features-section">
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon :size="40" color="#1890ff"><Lock /></el-icon>
          </div>
          <h3 class="feature-title">数据安全</h3>
          <p class="feature-desc">端到端加密保护，确保医疗数据隐私安全</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <el-icon :size="40" color="#1890ff"><Link /></el-icon>
          </div>
          <h3 class="feature-title">区块链追溯</h3>
          <p class="feature-desc">全流程可追溯，数据访问记录不可篡改</p>
        </div>
      </div>
    </div>
    
    <!-- 底部信息 -->
    <div class="footer-info">
      <p>面向Web3.0医疗数据可溯源共享系统</p>
    </div>
  </div> 
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DataAnalysis, Lock, Link, UserFilled, EditPen } from '@element-plus/icons-vue'

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
  background: url('@/assets/background.jpg') center/cover no-repeat fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
}

.test-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.40);
  backdrop-filter: blur(3px);
}

.welcome-container {
  text-align: center;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* Hero 区域 */
.hero-section {
  margin-bottom: 80px;
}

.logo-wrapper {
  margin-bottom: 30px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-icon {
  filter: drop-shadow(0 4px 12px rgba(255, 255, 255, 0.3));
}

.main-title {
  font-size: 52px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
  letter-spacing: 2px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
}

.main-subtitle {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 50px 0;
  font-weight: 300;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.action-buttons {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons :deep(.el-button) {
  min-width: 180px;
  height: 56px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 28px;
  transition: all 0.3s ease;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(24, 144, 255, 0.6);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #1890ff;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
}

.secondary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.5);
  background: #ffffff;
}

.btn-icon {
  margin-right: 8px;
}

/* 特色功能区域 */
.features-section {
  display: flex;
  gap: 40px;
  max-width: 700px;
  margin: 0 auto;
  justify-content: center;
}

.feature-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  max-width: 320px;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 12px 0;
}

.feature-desc {
  font-size: 15px;
  color: #595959;
  line-height: 1.6;
  margin: 0;
}

/* 底部信息 */
.footer-info {
  position: relative;
  z-index: 1;
  margin-top: 60px;
  text-align: center;
}

.footer-info p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 36px;
  }
  
  .main-subtitle {
    font-size: 18px;
  }
  
  .logo-wrapper :deep(.el-icon) {
    font-size: 80px !important;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .action-buttons :deep(.el-button) {
    width: 100%;
    max-width: 320px;
  }
  
  .features-section {
    flex-direction: column;
    gap: 20px;
    max-width: 400px;
  }
  
  .feature-card {
    padding: 32px 24px;
    max-width: 100%;
  }
  
  .hero-section {
    margin-bottom: 60px;
  }
}

@media (max-width: 480px) {
  .test-view {
    padding: 30px 16px;
  }
  
  .main-title {
    font-size: 28px;
  }
  
  .main-subtitle {
    font-size: 16px;
    margin-bottom: 40px;
  }
  
  .logo-wrapper :deep(.el-icon) {
    font-size: 60px !important;
  }
  
  .action-buttons :deep(.el-button) {
    height: 50px;
    font-size: 16px;
  }
}
</style>

