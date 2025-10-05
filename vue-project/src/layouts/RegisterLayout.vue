<template>
  <div class="register-layout">
    <div class="register-container">
      <RegisterView />
    </div>
    
    <!-- 底部版权信息 -->
    <div class="footer">
      <p class="copyright">© 2025 高效隐私保护的时空接触追溯系统</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 专门为注册页面设计的简洁布局
import RegisterView from '@/views/auth/RegisterView.vue'
</script>

<style scoped>
.register-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4dd0e1 0%, #26a69a 100%);
  padding: 40px 20px;
  position: relative;
  overflow-y: auto;
}

.register-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.register-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  padding: 48px 40px;
  margin: 0 auto;
}

/* 底部版权信息 */
.footer {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.copyright {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin: 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .register-container {
    max-width: 440px;
    padding: 40px 32px;
  }
}

@media (max-width: 768px) {
  .register-layout {
    padding: 20px 16px;
    justify-content: flex-start;
    padding-top: 60px;
  }
  
  .register-container {
    max-width: 100%;
    padding: 32px 24px;
    margin: 0 auto 80px;
    border-radius: 12px;
  }
  
  .footer {
    bottom: 16px;
  }
}

@media (max-width: 480px) {
  .register-layout {
    padding: 16px 12px;
    padding-top: 40px;
  }
  
  .register-container {
    padding: 28px 20px;
    margin-bottom: 60px;
    border-radius: 8px;
  }
  
  .footer {
    bottom: 12px;
  }
}

/* PC端大屏幕优化 */
@media (min-width: 1400px) {
  .register-container {
    max-width: 520px;
    padding: 56px 48px;
  }
}
</style>
