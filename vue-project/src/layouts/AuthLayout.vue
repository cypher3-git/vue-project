<template>
  <div class="auth-layout">
    <!-- 左侧品牌展示区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo-section">
          <div class="logo-icon">
            <el-icon size="80" color="#ffffff">
              <DataAnalysis />
            </el-icon>
          </div>
          <h1 class="brand-subtitle">面向Web3.0医疗数据可溯源共享系统</h1>
        </div>
        
        <div class="brand-features">
          <div class="feature-item">
            <el-icon size="24" color="#ffffff"><Lock /></el-icon>
            <span>隐私保护</span>
          </div>
          <div class="feature-item">
            <el-icon size="24" color="#ffffff"><Link /></el-icon>
            <span>身份追溯</span>
          </div>
          <div class="feature-item">
            <el-icon size="24" color="#ffffff"><TrendCharts /></el-icon>
            <span>数据共享</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧登录表单区域 -->
    <div class="form-section">
      <div class="form-container">
        <LoginView />
        
        <!-- 底部版权信息 -->
        <div class="auth-footer">
          <p class="copyright">© 2025 面向Web3.0医疗数据可溯源共享系统</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis, Lock, Link, TrendCharts } from '@element-plus/icons-vue'
import LoginView from '@/views/auth/LoginView.vue'
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  background: #f5f7fa;
}

/* 左侧品牌展示区域 */
.brand-section {
  flex: 1;
  background: url('@/assets/background.jpg') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 40px;
}

.logo-section {
  margin-bottom: 60px;
}

.logo-icon {
  margin-bottom: 24px;
}

.brand-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
}

.brand-subtitle {
  font-size: 30px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  opacity: 0.9;
}

/* 右侧表单区域 */
.form-section {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-width: 500px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.auth-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.copyright {
  color: #999;
  font-size: 12px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .auth-layout {
    flex-direction: column;
  }
  
  .brand-section {
    min-height: 300px;
    flex: none;
  }
  
  .brand-content {
    padding: 30px;
  }
  
  .brand-title {
    font-size: 36px;
  }
  
  .brand-features {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .form-section {
    min-width: auto;
    padding: 30px 20px;
  }
}

@media (max-width: 768px) {
  .brand-section {
    min-height: 250px;
  }
  
  .brand-title {
    font-size: 28px;
  }
  
  .brand-subtitle {
    font-size: 16px;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .form-container {
    max-width: 100%;
  }
}
</style>
