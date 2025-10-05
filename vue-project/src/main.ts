import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'

// 添加错误处理
console.log('🚀 开始初始化应用...')

try {
  const app = createApp(App)
  
  console.log('✅ Vue应用创建成功')

  // 注册Element Plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  console.log('✅ Element Plus图标注册成功')

  // 先创建Pinia实例
  const pinia = createPinia()
  app.use(pinia)
  console.log('✅ Pinia状态管理初始化成功')

  // 再注册路由
  app.use(router)
  console.log('✅ 路由系统初始化成功')

  // 最后注册Element Plus
  app.use(ElementPlus, {
    locale: zhCn,
  })
  console.log('✅ Element Plus UI库初始化成功')

  // 挂载应用
  app.mount('#app')
  console.log('🎉 应用挂载成功！')
  
} catch (error) {
  console.error('❌ 应用初始化失败:', error)
}
