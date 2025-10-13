<template>
  <el-container class="app-layout">
    <el-header class="app-header" height="64px">
      <div class="header-left">
        <h1 class="app-title">医联可信·数据溯源系统</h1>
      </div>
      <div class="header-right">
        <!-- 患者科室切换按钮 -->
        <div v-if="userStore.isPatient" class="department-switch">
          <!-- 当前科室状态标签 -->
          <el-tag 
            v-if="userStore.currentDepartment" 
            type="info" 
            size="default"
            effect="light"
            class="current-department-tag"
          >
            当前科室: {{ userStore.currentDepartment }}
          </el-tag>
          <el-tag 
            v-else 
            type="warning" 
            size="default"
            effect="light"
            class="current-department-tag"
          >
            未选择科室
          </el-tag>
          
          <el-button 
            type="primary" 
            size="default"
            @click="showDepartmentDialog = true"
            :icon="OfficeBuilding"
          >
            {{ userStore.currentDepartment ? '切换科室' : '选择科室' }}
          </el-button>
        </div>
        
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="40" icon="User" />
            <span class="username">{{ userStore.user?.name }}</span>
            <el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人设置</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <el-container>
      <el-aside class="app-sidebar" :width="sidebarWidth">
        <el-menu
          :default-active="$route.path"
          class="sidebar-menu"
          :collapse="isCollapse"
          router
          background-color="#2c3e50"
          text-color="#bfcbd9"
          active-text-color="#4dd0e1"
          @select="handleMenuSelect"
        >
          <template v-for="item in menuItems" :key="item.path">
            <el-menu-item :index="item.path" v-if="!item.children">
              <el-icon><component :is="item.icon" /></el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>
            <el-sub-menu :index="item.path" v-else>
              <template #title>
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="child.path"
                :index="child.path"
              >
                <template #title>{{ child.title }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>
      
      <el-main class="app-main">
        <div class="main-content">
          <router-view />
        </div>
      </el-main>
    </el-container>
    
    <!-- 科室管理弹窗 -->
    <DepartmentDialog 
      v-model:visible="showDepartmentDialog"
      :departments="userStore.departments"
      :current-department="userStore.currentDepartment"
      @switch="handleSwitchDepartment"
      @register="handleRegisterDepartment"
    />
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  ArrowDown, 
  FolderOpened, 
  Share, 
  View,
  OfficeBuilding
} from '@element-plus/icons-vue'
import DepartmentDialog from '@/components/DepartmentDialog.vue'

const router = useRouter()
const userStore = useAuthStore()

const sidebarWidth = ref<string>('240px')
const isCollapse = ref<boolean>(false)
const showDepartmentDialog = ref<boolean>(false)

interface MenuItem {
  path: string
  title: string
  icon: any
  children?: MenuItem[]
}

// 根据用户角色动态生成菜单
const menuItems = computed((): MenuItem[] => {
  if (userStore.user?.role === 'patient') {
    return [
      {
        path: '/patient/data',
        title: '我的数据',
        icon: FolderOpened
      },
      {
        path: '/patient/authorization',
        title: '授权管理',
        icon: Share
      }
    ]
  } else if (userStore.user?.role === 'doctor') {
    return [
      {
        path: '/doctor/data',
        title: '数据管理',
        icon: FolderOpened
      }
    ]
  }
  return []
})

const handleMenuSelect = (index: string) => {
  console.log('Menu selected:', index)
  console.log('Current route:', router.currentRoute.value.path)
  console.log('User role:', userStore.user?.role)
  
  // 强制路由跳转
  router.push(index).then(() => {
    console.log('Navigation successful to:', index)
  }).catch(error => {
    console.error('Router navigation error:', error)
  })
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人设置页面
      break
    case 'logout':
      userStore.logout()
      router.push('/auth/login')
      break
  }
}

// 切换科室
const handleSwitchDepartment = async (departmentId: string) => {
  const success = await userStore.switchDepartment(departmentId)
  if (success) {
    showDepartmentDialog.value = false
  }
}

// 注册新科室
const handleRegisterDepartment = async (departmentName: string) => {
  const success = await userStore.registerNewDepartment(departmentName)
  if (success) {
    // 不关闭弹窗，让用户可以继续选择刚注册的科室
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 移除所有可点击元素的焦点轮廓 */
.app-layout :deep(button),
.app-layout :deep(.el-button),
.app-layout :deep(.el-menu-item),
.app-layout :deep(.el-sub-menu__title),
.app-layout :deep(.el-dropdown),
.app-layout :deep(.el-avatar) {
  outline: none;
}

/* 移除焦点时的默认轮廓 */
.app-layout :deep(button:focus),
.app-layout :deep(.el-button:focus),
.app-layout :deep(.el-menu-item:focus),
.app-layout :deep(.el-sub-menu__title:focus),
.app-layout :deep(.el-dropdown:focus) {
  outline: none;
}

/* 为键盘用户保留焦点指示 */
.app-layout :deep(button:focus-visible),
.app-layout :deep(.el-button:focus-visible),
.app-layout :deep(.el-menu-item:focus-visible) {
  outline: 2px solid #4dd0e1;
  outline-offset: 2px;
}

.app-header {
  background: linear-gradient(135deg, #4dd0e1 0%, #26a69a 100%);
  box-shadow: 0 2px 8px rgba(0, 21, 41, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.header-left .app-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.department-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 8px;
  height: 32px; /* 确保容器高度一致 */
}

.current-department-tag {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
  font-weight: 500;
  font-size: 13px;
  height: 32px !important;
  padding: 0 12px !important;
  border-radius: 6px;
  white-space: nowrap;
  display: inline-flex !important;
  align-items: center !important;
  line-height: 1 !important;
}

.current-department-tag.el-tag--warning {
  background: rgba(255, 193, 7, 0.15) !important;
  border-color: rgba(255, 193, 7, 0.4) !important;
  color: #fff3cd !important;
}

.department-switch .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
  height: 32px;
  padding: 0 15px;
}

.department-switch .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  outline: none;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info:focus {
  outline: none;
}

.username {
  font-size: 16px;
  color: #ffffff;
  font-weight: 500;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.app-sidebar {
  background: #2c3e50;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.sidebar-menu {
  border: none;
  height: 100%;
  width: 100% !important;
}

.app-main {
  background: #f8fafc;
  padding: 0;
}

.main-content {
  padding: 24px;
  min-height: calc(100vh - 64px);
}

/* 中老年用户友好设计 */
:deep(.el-menu-item), :deep(.el-sub-menu .el-sub-menu__title) {
  height: 56px !important;
  line-height: 56px !important;
  font-size: 16px;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

:deep(.el-menu-item i), :deep(.el-sub-menu .el-sub-menu__title i) {
  font-size: 18px;
}

/* 确保菜单文字不可选择 */
:deep(.el-menu-item span),
:deep(.el-sub-menu__title span),
:deep(.el-icon) {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

/* 移除菜单项的焦点轮廓 */
:deep(.el-menu-item:focus),
:deep(.el-sub-menu__title:focus) {
  outline: none !important;
  background-color: transparent !important;
}

/* 鼠标悬停效果优化 */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  cursor: pointer;
}
</style>
