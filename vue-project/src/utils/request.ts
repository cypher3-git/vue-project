import axios, { type AxiosInstance, type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import mockBackend from '@/services/mockBackend'

// 是否启用模拟模式（可以通过环境变量控制）
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true // 默认启用模拟

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 模拟API路由映射
function getMockResponse(config: InternalAxiosRequestConfig): any {
  const method = config.method?.toUpperCase()
  const url = config.url || ''
  const data = config.data
  const params = config.params

  console.log(`🔄 模拟API请求: ${method} ${url}`, { params, data })

  // 医疗文件相关
  if (method === 'POST' && url.includes('/medical-data/files/upload')) {
    return mockBackend.uploadMedicalFile(data)
  }
  
  if (method === 'GET' && url.includes('/medical-data/files')) {
    return mockBackend.getPatientMedicalFiles(params)
  }
  
  if (method === 'DELETE' && url.includes('/medical-data/files/')) {
    // 从URL中提取文件ID
    const fileId = url.split('/').pop()
    if (fileId) {
      return mockBackend.deleteMedicalFile(fileId)
    }
  }

  // 医生端医疗数据
  if (method === 'GET' && url.includes('/doctor/medical-data')) {
    return mockBackend.getDoctorMedicalDataList(params)
  }

  // 授权请求相关
  if (method === 'POST' && url.match(/\/doctor\/medical-data\/.*\/request-authorization/)) {
    const dataId = url.split('/')[3]
    return mockBackend.requestAuthorization(dataId, data.reason)
  }

  if (method === 'GET' && url.includes('/patient/authorization-requests')) {
    return mockBackend.getPatientAuthorizationRequests(params)
  }

  if (method === 'POST' && url.match(/\/patient\/authorization-requests\/.*\/approve/)) {
    const requestId = url.split('/')[3]
    return mockBackend.approveAuthorizationRequest({
      requestId,
      expiresIn: data.expiresIn,
      notes: data.notes
    })
  }

  if (method === 'POST' && url.match(/\/patient\/authorization-requests\/.*\/reject/)) {
    const requestId = url.split('/')[3]
    return mockBackend.rejectAuthorizationRequest({
      requestId,
      reason: data.reason
    })
  }

  // 医生查看数据
  if (method === 'POST' && url.match(/\/doctor\/medical-data\/.*\/view/)) {
    const dataId = url.split('/')[3]
    return mockBackend.viewMedicalData(dataId)
  }

  // 访问记录
  if (method === 'GET' && url.includes('/access-records')) {
    return mockBackend.getAccessRecordsList(params)
  }

  // 身份溯源
  if (method === 'POST' && url.includes('/patient/authorization-requests/reveal-identity')) {
    return mockBackend.revealDoctorIdentity(data.requestId)
  }

  if (method === 'POST' && url.match(/\/doctor\/medical-data\/.*\/reveal-patient/)) {
    const dataId = url.split('/')[3]
    return mockBackend.revealPatientIdentity(dataId)
  }

  // 未匹配的API，返回null表示继续正常请求
  return null
}

// 请求拦截器
request.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 打印请求信息（开发环境）
    if (import.meta.env.DEV) {
      console.log(`🚀 发起请求: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      })
    }

    // 如果启用模拟模式，尝试使用模拟数据
    if (USE_MOCK) {
      const mockResponse = getMockResponse(config)
      if (mockResponse !== null) {
        // 返回一个被拒绝的Promise，但携带模拟数据
        // 这样可以在响应拦截器中捕获并返回模拟数据
        const error: any = new Error('MOCK_RESPONSE')
        error.config = config
        error.mockData = mockResponse
        return Promise.reject(error)
      }
    }
    
    return config
  },
  (error: AxiosError) => {
    ElMessage.error('请求配置错误')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 打印响应信息（开发环境）
    if (import.meta.env.DEV) {
      console.log(`✅ 响应成功: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    // 统一处理响应数据
    const { data } = response
    
    // 如果是文件下载请求，直接返回
    if (response.config.responseType === 'blob') {
      return response.data
    }
    
    // 处理业务错误
    if (data.code !== undefined && data.code !== 200 && data.code !== 0) {
      const errorMessage = data.message || '请求失败'
      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
    
    return data
  },
  async (error: AxiosError | any) => {
    // 处理模拟响应
    if (error.message === 'MOCK_RESPONSE' && error.mockData) {
      console.log('✅ 模拟API响应:', error.mockData)
      return error.mockData
    }

    // 打印错误信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('❌ 响应错误:', error)
    }
    
    const { response, message } = error
    
    if (!response) {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }
    
    const { status, data } = response
    
    switch (status) {
      case 400:
        ElMessage.error((data as any)?.message || '请求参数错误')
        break
      case 401:
        // token过期或无效
        ElMessage.error('登录已过期，请重新登录')
        
        // 清除本地token
        localStorage.removeItem('token')
        
        // 跳转到首页
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
        break
      case 403:
        ElMessage.error('您没有权限进行此操作')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 422:
        // 表单验证错误
        if ((data as any)?.errors) {
          const firstError = Object.values((data as any).errors)[0] as string[]
          ElMessage.error(firstError[0] || '表单验证失败')
        } else {
          ElMessage.error((data as any)?.message || '表单验证失败')
        }
        break
      case 429:
        ElMessage.error('请求过于频繁，请稍后重试')
        break
      case 500:
        ElMessage.error('服务器内部错误，请稍后重试')
        break
      case 502:
      case 503:
      case 504:
        ElMessage.error('服务器暂时不可用，请稍后重试')
        break
      default:
        if ((data as any)?.message) {
          ElMessage.error((data as any).message)
        } else if (message.includes('timeout')) {
          ElMessage.error('请求超时，请稍后重试')
        } else {
          ElMessage.error('网络异常，请稍后重试')
        }
    }
    
    return Promise.reject(error)
  }
)

// 导出常用的请求方法
export const http = {
  get<T = any>(url: string, config?: any): Promise<T> {
    return request.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return request.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return request.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: any): Promise<T> {
    return request.delete(url, config)
  },
  
  patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    return request.patch(url, data, config)
  },
  
  // 上传文件
  upload<T = any>(url: string, file: File, data?: Record<string, any>, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
    }
    
    return request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  },
  
  // 下载文件
  download(url: string, filename?: string, config?: any): Promise<void> {
    return request.get(url, {
      ...config,
      responseType: 'blob'
    }).then(response => {
      const blob = response as unknown as Blob
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
  }
}

export default request
