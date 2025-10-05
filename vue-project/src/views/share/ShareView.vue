<template>
  <div class="share-view">
    <!-- 页面头部 -->
    <div class="share-header">
      <div class="header-content">
        <el-icon class="header-icon"><Share /></el-icon>
        <h1>医疗数据分享</h1>
        <p>安全可信的医疗数据分享平台</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="share-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 密码验证 -->
      <el-card v-else-if="needPassword && !passwordVerified" class="password-card">
        <template #header>
          <div class="card-header">
            <el-icon><Lock /></el-icon>
            <span>请输入访问密码</span>
          </div>
        </template>
        
        <el-form @submit.prevent="verifyPassword" class="password-form">
          <el-form-item>
            <el-input
              v-model="enteredPassword"
              type="password"
              placeholder="请输入密码"
              show-password
              size="large"
              @keyup.enter="verifyPassword"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="verifyPassword" size="large" style="width: 100%">
              验证密码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 分享已过期 -->
      <el-card v-else-if="isExpired" class="expired-card">
        <el-empty description="分享链接已过期" :image-size="200">
          <template #image>
            <el-icon size="100" color="#c0c4cc"><Clock /></el-icon>
          </template>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </el-empty>
      </el-card>

      <!-- 分享数据未找到 -->
      <el-card v-else-if="!shareData" class="not-found-card">
        <el-empty description="分享的数据不存在或已被删除" :image-size="200">
          <template #image>
            <el-icon size="100" color="#c0c4cc"><WarningFilled /></el-icon>
          </template>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </el-empty>
      </el-card>

      <!-- 分享数据内容 -->
      <div v-else class="share-data">
        <!-- 数据信息卡片 -->
        <el-card class="data-info-card">
          <template #header>
            <div class="data-header">
              <div class="data-icon">
                <el-icon size="32">
                  <Document v-if="shareData.type === '检验报告'" />
                  <Picture v-else-if="shareData.type === '影像资料'" />
                  <Folder v-else-if="shareData.type === '病历记录'" />
                  <Files v-else-if="shareData.type === '体检报告'" />
                  <Files v-else-if="shareData.type === '用药记录'" />
                  <Document v-else />
                </el-icon>
              </div>
              <div class="data-title">
                <h2>{{ shareData.name }}</h2>
                <el-tag>{{ shareData.type }}</el-tag>
              </div>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件大小">
              {{ shareData.size }}
            </el-descriptions-item>
            <el-descriptions-item label="创建日期">
              {{ shareData.date }}
            </el-descriptions-item>
            <el-descriptions-item label="描述信息" :span="2">
              {{ shareData.description }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 文件预览卡片 -->
        <el-card class="file-preview-card">
          <template #header>
            <div class="preview-header">
              <h3>文件预览</h3>
              <div class="preview-actions">
                <el-button @click="downloadFile" type="primary" plain>
                  <el-icon><Download /></el-icon>
                  下载文件
                </el-button>
              </div>
            </div>
          </template>

          <!-- 文件预览区域 -->
          <div class="file-preview" v-loading="previewLoading">
            <!-- 图片预览 -->
            <div v-if="shareData.fileType === 'image'" class="image-preview">
              <img 
                :src="getPreviewUrl()" 
                :alt="shareData.name"
                @load="handlePreviewLoad"
                @error="handlePreviewError"
              />
            </div>

            <!-- PDF预览 -->
            <div v-else-if="shareData.fileType === 'pdf'" class="pdf-preview">
              <iframe 
                :src="`${getPreviewUrl()}#toolbar=0&navpanes=0&scrollbar=1`"
                frameborder="0"
                width="100%"
                height="600px"
                @load="handlePreviewLoad"
              ></iframe>
            </div>

            <!-- 文本预览 -->
            <div v-else-if="shareData.fileType === 'text'" class="text-preview">
              <pre>{{ getTextContent() }}</pre>
            </div>

            <!-- 不支持预览 -->
            <div v-else class="unsupported-preview">
              <el-empty description="该文件类型不支持在线预览" :image-size="120">
                <el-button @click="downloadFile" type="primary">
                  <el-icon><Download /></el-icon>
                  下载查看
                </el-button>
              </el-empty>
            </div>
          </div>
        </el-card>

        <!-- 分享信息 -->
        <el-card class="share-info-card">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>分享信息</span>
            </div>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="分享时间">
              {{ shareInfo.shareTime }}
            </el-descriptions-item>
            <el-descriptions-item label="有效期" v-if="shareInfo.expiry !== 'permanent'">
              {{ getExpiryText() }}
            </el-descriptions-item>
            <el-descriptions-item label="有效期" v-else>
              永久有效
            </el-descriptions-item>
            <el-descriptions-item label="访问权限">
              {{ shareInfo.hasPassword ? '需要密码' : '公开访问' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </div>

    <!-- 页面底部 -->
    <div class="share-footer">
      <p>powered by 医联可信·数据溯源系统</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Share, 
  Lock, 
  Clock, 
  WarningFilled, 
  Document, 
  Picture, 
  Folder, 
  Files, 
  Download,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const shareData = ref<any>(null)
const shareInfo = ref<any>(null)
const needPassword = ref(false)
const passwordVerified = ref(false)
const enteredPassword = ref('')
const previewLoading = ref(false)

// 计算属性
const isExpired = computed(() => {
  if (!shareInfo.value || shareInfo.value.expiry === 'permanent') {
    return false
  }
  
  const shareTime = new Date(shareInfo.value.shareTime).getTime()
  const expiryDays = parseInt(shareInfo.value.expiry.replace('d', ''))
  const expiryTime = shareTime + (expiryDays * 24 * 60 * 60 * 1000)
  
  return Date.now() > expiryTime
})

// 生命周期
onMounted(() => {
  loadShareData()
})

// 方法
const loadShareData = () => {
  try {
    const dataId = route.params.id as string
    
    // 从localStorage获取分享数据
    const shareKey = `medical_share_${dataId}`
    const shareDataJson = localStorage.getItem(shareKey)
    
    if (!shareDataJson) {
      loading.value = false
      return
    }
    
    const sharedItem = JSON.parse(shareDataJson)
    shareData.value = sharedItem.data
    shareInfo.value = sharedItem.shareInfo
    
    // 检查是否需要密码
    const urlParams = new URLSearchParams(route.query as Record<string, string>)
    needPassword.value = urlParams.has('pwd') && shareInfo.value.password
    
    if (!needPassword.value) {
      passwordVerified.value = true
    }
    
    loading.value = false
  } catch (error) {
    console.error('加载分享数据失败:', error)
    ElMessage.error('加载分享数据失败')
    loading.value = false
  }
}

const verifyPassword = () => {
  if (!shareInfo.value.password) {
    passwordVerified.value = true
    return
  }
  
  if (enteredPassword.value === shareInfo.value.password) {
    passwordVerified.value = true
    ElMessage.success('密码验证成功')
  } else {
    ElMessage.error('密码错误，请重新输入')
    enteredPassword.value = ''
  }
}

const getPreviewUrl = () => {
  if (!shareData.value) return ''
  
  // 如果是用户上传的文件且有文件数据，从Base64创建预览URL
  if (shareData.value.isUploaded && shareData.value.fileData) {
    try {
      const fileData = shareData.value.fileData
      const arrayBuffer = base64ToArrayBuffer(fileData.content)
      const blob = new Blob([arrayBuffer], { type: fileData.type })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('创建预览URL失败:', error)
      return getPlaceholderImage(shareData.value.fileType)
    }
  }
  
  // 如果是用户上传的文件且有本地URL，使用本地URL（兼容旧版本）
  if (shareData.value.isUploaded && shareData.value.filePath && shareData.value.filePath.startsWith('blob:')) {
    return shareData.value.filePath
  }
  
  // 否则根据文件类型返回预览URL
  return getFilePreviewUrl(shareData.value)
}

const getFilePreviewUrl = (data: any) => {
  if (!data || !data.filePath) {
    return getPlaceholderImage(data?.fileType || 'unknown')
  }
  
  // 预设数据的模拟URL映射
  const mockUrls = {
    '/api/files/blood-test-report.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '/api/files/ecg-report.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '/api/images/chest-xray.jpg': 'https://via.placeholder.com/600x400/4a90e2/ffffff?text=胸部X光片',
    '/api/files/liver-function-report.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '/api/files/full-medical-checkup.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
  
  return mockUrls[data.filePath as keyof typeof mockUrls] || getPlaceholderImage(data.fileType)
}

const getPlaceholderImage = (fileType: string) => {
  const placeholders = {
    image: 'https://via.placeholder.com/600x400/e3f2fd/1976d2?text=图片预览',
    pdf: 'https://via.placeholder.com/600x400/fce4ec/c2185b?text=PDF文档',
    text: 'https://via.placeholder.com/600x400/f3e5f5/7b1fa2?text=文本文件',
    unknown: 'https://via.placeholder.com/600x400/f5f5f5/9e9e9e?text=未知文件类型'
  }
  return placeholders[fileType as keyof typeof placeholders] || placeholders.unknown
}

const getTextContent = () => {
  if (!shareData.value) return ''
  
  const mockTextContent = {
    '用药历史记录': `用药记录详情：

时间：2023年7月-2024年1月

常用药物：
1. 阿司匹林 100mg - 每日1次，餐后服用
   适应症：预防心血管疾病
   
2. 美托洛尔 25mg - 每日2次，早晚服用
   适应症：高血压控制
   
3. 瑞舒伐他汀 10mg - 每晚1次
   适应症：调节血脂

用药注意事项：
- 规律服药，不可随意停药
- 定期复查相关指标
- 如有不良反应及时就医

医师签名：张医生
日期：2024年1月15日`
  }
  
  return mockTextContent[shareData.value.name as keyof typeof mockTextContent] || '暂无文本内容'
}

const downloadFile = () => {
  if (!shareData.value) return
  
  ElMessage.info('正在准备下载...')
  
  if (shareData.value.isUploaded && shareData.value.fileData) {
    // 用户上传的原始文件（从Base64恢复）
    try {
      const fileData = shareData.value.fileData
      const arrayBuffer = base64ToArrayBuffer(fileData.content)
      const blob = new Blob([arrayBuffer], { type: fileData.type })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileData.name || shareData.value.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      ElMessage.success('文件下载成功')
    } catch (error) {
      console.error('文件下载失败:', error)
      ElMessage.error('文件下载失败，请稍后重试')
    }
  } else if (shareData.value.isUploaded && shareData.value.originalFile) {
    // 兼容旧版本：直接使用originalFile（如果还存在）
    const url = URL.createObjectURL(shareData.value.originalFile)
    const link = document.createElement('a')
    link.href = url
    link.download = shareData.value.originalFileName || shareData.value.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('文件下载成功')
  } else {
    // 模拟文件下载
    const content = shareData.value.fileType === 'text' 
      ? getTextContent() 
      : `这是 ${shareData.value.name} 的模拟数据内容\n类型：${shareData.value.type}\n描述：${shareData.value.description}\n日期：${shareData.value.date}`
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${shareData.value.name}.${getFileExtension(shareData.value.fileType)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('文件下载成功')
  }
}

const getFileExtension = (fileType: string) => {
  const extensions = {
    image: 'jpg',
    pdf: 'pdf',
    text: 'txt',
    unknown: 'txt'
  }
  return extensions[fileType as keyof typeof extensions] || 'txt'
}

const getExpiryText = () => {
  if (!shareInfo.value) return ''
  
  const shareTime = new Date(shareInfo.value.shareTime)
  const expiryDays = parseInt(shareInfo.value.expiry.replace('d', ''))
  const expiryTime = new Date(shareTime.getTime() + (expiryDays * 24 * 60 * 60 * 1000))
  
  return `${expiryTime.toLocaleDateString()} ${expiryTime.toLocaleTimeString()}`
}

const handlePreviewLoad = () => {
  previewLoading.value = false
}

const handlePreviewError = () => {
  previewLoading.value = false
  ElMessage.error('文件预览加载失败')
}

const goHome = () => {
  router.push('/')
}

// 辅助函数：Base64转ArrayBuffer
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}
</script>

<style scoped>
.share-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.share-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 40px 0;
  text-align: center;
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.share-header h1 {
  font-size: 32px;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.share-header p {
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
}

.share-content {
  flex: 1;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
  width: 100%;
}

.loading-container,
.password-card,
.expired-card,
.not-found-card {
  max-width: 500px;
  margin: 0 auto;
}

.password-card,
.expired-card,
.not-found-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.password-form {
  padding: 20px 0;
}

.share-data {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.data-info-card,
.file-preview-card,
.share-info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.data-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.data-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f0f9ff;
  border-radius: 12px;
  color: #1890ff;
}

.data-title h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.file-preview {
  min-height: 400px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.image-preview {
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pdf-preview {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.text-preview {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.text-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.unsupported-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.share-footer {
  text-align: center;
  padding: 30px 24px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-header {
    padding: 24px 0;
  }
  
  .header-icon {
    font-size: 48px;
  }
  
  .share-header h1 {
    font-size: 24px;
  }
  
  .share-content {
    margin: 24px auto;
    padding: 0 16px;
  }
  
  .data-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .preview-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
