import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: {
      title: '用户登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/layouts/RegisterLayout.vue'),
    meta: {
      title: '用户注册',
      requiresAuth: false
    }
  },
  {
    path: '/patient',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true, role: 'patient' },
    redirect: '/patient/data',
    children: [
      {
        path: 'data',
        name: 'PatientData',
        component: () => import('@/views/patient/DataView.vue'),
        meta: {
          title: '我的数据',
          requiresAuth: true,
          role: 'patient'
        }
      },
      {
        path: 'authorization',
        name: 'PatientAuthorization',
        component: () => import('@/views/patient/AuthorizationView.vue'),
        meta: {
          title: '授权管理',
          requiresAuth: true,
          role: 'patient'
        }
      }
    ]
  },
  {
    path: '/doctor',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true, role: 'doctor' },
    redirect: '/doctor/data',
    children: [
      {
        path: 'data',
        name: 'DoctorDataManagement',
        component: () => import('@/views/doctor/DataManagementView.vue'),
        meta: {
          title: '数据管理',
          requiresAuth: true,
          role: 'doctor'
        }
      }
    ]
  },
  {
    path: '/share/medical-data/:id',
    name: 'ShareView',
    component: () => import('@/views/share/ShareView.vue'),
    meta: {
      title: '医疗数据分享',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/TestView.vue'),
    meta: {
      title: '医联可信·数据溯源系统'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/NotFoundView.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 医联可信·数据溯源系统`
  }
  
  // 如果不需要认证，直接放行
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  
  try {
    const authStore = useAuthStore()
    
    // 检查是否已登录
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      next('/login')
      return
    }
    
    // 检查角色权限
    if (to.meta.role && authStore.user?.role !== to.meta.role) {
      ElMessage.error('您没有权限访问该页面')
      const redirectPath = authStore.user?.role === 'patient' ? '/patient/data' : '/doctor/data'
      next(redirectPath)
      return
    }
    
    next()
  } catch (error) {
    // Store未初始化时，跳转到登录页
    console.warn('Auth store not initialized, redirecting to login')
    next('/login')
  }
})

// 全局后置钩子
router.afterEach((to) => {
  // 记录页面访问日志（可选）
  console.log(`访问页面: ${to.path}`)
})

export default router
