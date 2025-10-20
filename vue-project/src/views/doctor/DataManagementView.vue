<template>
  <div class="data-management">
    <!-- 医生欢迎信息模块 -->
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <div class="welcome-left">
          <div class="welcome-avatar">
            <el-avatar :size="60" class="doctor-avatar">
              <el-icon size="30"><UserFilled /></el-icon>
            </el-avatar>
          </div>
          <div class="welcome-info">
            <h3 class="welcome-title">您好，{{ getDoctorDepartment() }}{{ getDoctorName() }}</h3>
            <div class="welcome-tags">
              <el-tag type="success" size="small" effect="light">
                <el-icon class="tag-icon"><OfficeBuilding /></el-icon>
                {{ getDoctorDepartment() }}
              </el-tag>
              <el-tag type="primary" size="small" effect="light">
                <el-icon class="tag-icon"><User /></el-icon>
                医生
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h2>数据管理</h2>
      <div class="header-actions">
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select 
            v-model="filters.dataType" 
            placeholder="数据类型" 
            clearable 
            style="width: 150px; margin-right: 16px;"
          >
            <el-option
              v-for="option in MEDICAL_DATA_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          
          <el-select 
            v-model="filters.authStatus" 
            placeholder="授权状态" 
            clearable 
            style="width: 150px; margin-right: 16px;"
          >
            <el-option label="全部状态" value="" />
            <el-option label="未申请" value="not-requested" />
            <el-option label="待审批" value="pending" />
            <el-option label="已授权" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px; margin-right: 16px;"
          />
        </div>
        
        <div class="filter-right">
          <el-button 
            type="primary" 
            size="large"
            class="apply-button"
            @click="openBatchApplyDialog"
            :disabled="!hasUnrequestedData"
          >
            <el-icon><Document /></el-icon>
            申请
            <span class="batch-count">({{ unrequestedDataList.length }})</span>
          </el-button>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索数据名称"
            clearable
            style="width: 280px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="data-list-card">
      <el-table 
        :data="filteredDataList" 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column label="数据信息" width="300" align="center">
          <template #default="scope">
            <div class="data-info">
              <el-icon class="data-icon" :size="24">
                <Document v-if="scope.row.category === 'lab-report'" />
                <Picture v-else-if="scope.row.category === 'medical-image'" />
                <Files v-else-if="scope.row.category === 'physical-exam'" />
                <Files v-else-if="scope.row.category === 'medication'" />
                <Document v-else />
              </el-icon>
              <div class="data-details">
                <div class="data-name">{{ scope.row.title }}</div>
                <div class="data-type">{{ MEDICAL_DATA_TYPE_MAP[scope.row.category as FileCategory] || scope.row.category }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="上传时间" width="160" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.uploadTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="文件大小" width="110" align="center">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        
        <el-table-column label="授权状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getAuthStatusType(scope.row.authStatus)" size="small">
              {{ getAuthStatusText(scope.row.authStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                type="text" 
                size="small" 
                :disabled="scope.row.authStatus !== 'approved'"
                @click.stop="viewData(scope.row)"
              >
                查看数据
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>


    <!-- 授权申请对话框 -->
    <el-dialog v-model="batchApplyDialogVisible" title="授权申请" width="700px">
      <div class="batch-apply-content">
        <el-alert
          title="将对以下未申请的数据发起授权申请"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />
        
        <div class="data-preview">
          <div class="data-list">
            <el-tag 
              v-for="data in unrequestedDataList" 
              :key="data.id" 
              style="margin: 4px;"
              effect="light"
            >
              {{ data.title }}
            </el-tag>
          </div>
          <div class="data-count">共 {{ unrequestedDataList.length }} 条数据</div>
        </div>
        
        <el-form 
          ref="batchApplyFormRef" 
          :model="batchApplyForm" 
          :rules="batchApplyRules" 
          label-width="100px"
          style="margin-top: 20px;"
        >
          <el-form-item label="申请理由" prop="reason">
            <el-input
              v-model="batchApplyForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请说明需要查看这些数据的理由"
            />
          </el-form-item>
          
          <el-form-item label="使用目的" prop="purpose">
            <el-select v-model="batchApplyForm.purpose" placeholder="请选择使用目的" style="width: 100%">
              <el-option label="诊断治疗" value="诊断治疗" />
              <el-option label="病情评估" value="病情评估" />
              <el-option label="医学研究" value="医学研究" />
              <el-option label="会诊咨询" value="会诊咨询" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchApplyDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitBatchApply" 
            :loading="batchSubmitting"
          >
            <template v-if="batchSubmitting">
              <el-icon><Loading /></el-icon>
              提交中...
            </template>
            <template v-else>
              提交申请 ({{ unrequestedDataList.length }}条)
            </template>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看数据对话框 -->
    <el-dialog v-model="viewDialogVisible" title="数据详情" width="700px">
      <div v-if="selectedData" class="data-detail">
        <el-descriptions :column="2" border class="data-descriptions">
          <el-descriptions-item label="数据名称" class="double-height-row">{{ selectedData.title || selectedData.dataName }}</el-descriptions-item>
          <el-descriptions-item label="数据类型" class="double-height-row">{{ MEDICAL_DATA_TYPE_MAP[selectedData.category as FileCategory] || MEDICAL_DATA_TYPE_MAP[selectedData.dataType as FileCategory] || selectedData.dataType || selectedData.category }}</el-descriptions-item>
          <el-descriptions-item label="上传时间" class="double-height-row">{{ formatDateTime(selectedData.uploadTime || selectedData.uploadDate) }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(selectedData.fileSize) }}</el-descriptions-item>
          <el-descriptions-item label="授权状态">
            <el-tag :type="getAuthStatusType(selectedData.authStatus)">
              {{ getAuthStatusText(selectedData.authStatus) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 患者身份信息 -->
        <div v-if="selectedData?.authStatus === 'approved'" class="patient-identity-info">
          <el-divider>患者身份信息</el-divider>
          <el-descriptions :column="2" border class="patient-descriptions">
            <el-descriptions-item label="患者姓名">
              {{ getDisplayPatientName(selectedData) }}
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">
              {{ getDisplayPatientIdCard(selectedData) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <el-divider>数据内容</el-divider>
        
        <!-- 文件预览区域 -->
        <div class="file-preview" v-loading="previewLoading">
          <div class="preview-header">
            <h4>文件预览</h4>
            <div class="preview-controls" v-if="selectedData.fileType === 'image'">
              <el-button-group size="small">
                <el-button @click="zoomIn" :disabled="imageScale >= 3">
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
                <el-button @click="zoomOut" :disabled="imageScale <= 0.5">
                  <el-icon><ZoomOut /></el-icon>
                </el-button>
                <el-button @click="rotateLeft">
                  <el-icon><RefreshLeft /></el-icon>
                </el-button>
                <el-button @click="rotateRight">
                  <el-icon><RefreshRight /></el-icon>
                </el-button>
                <el-button @click="resetView">重置</el-button>
                <el-button @click="toggleFullscreen" type="primary">
                  <el-icon><FullScreen /></el-icon>
                </el-button>
              </el-button-group>
            </div>
            <div class="preview-controls" v-else-if="selectedData.fileType === 'pdf'">
              <el-button-group size="small">
                <el-button @click="prevPage" :disabled="pdfPageNum <= 1">上一页</el-button>
                <span class="page-info">{{ pdfPageNum }} / {{ pdfTotalPages || '?' }}</span>
                <el-button @click="nextPage" :disabled="pdfPageNum >= pdfTotalPages">下一页</el-button>
                <el-button @click="toggleFullscreen" type="primary">
                  <el-icon><FullScreen /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
          
          <!-- 图片预览 -->
          <div 
            v-if="selectedData.fileType === 'image'" 
            class="image-preview"
            :class="{ 'fullscreen': fullscreenMode }"
          >
            <div class="image-container" v-if="!imageError">
              <img 
                :src="getFilePreviewUrl(selectedData)" 
                :alt="selectedData.title"
                :style="{
                  transform: `scale(${imageScale}) rotate(${imageRotate}deg)`,
                  transition: 'transform 0.3s ease',
                  opacity: imageLoaded ? 1 : 0
                }"
                @load="handleImageLoad"
                @error="handleImageError"
              />
              <div v-if="!imageLoaded" class="image-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <p>图片加载中...</p>
              </div>
            </div>
            
            <!-- 图片加载失败时显示 -->
            <div v-else class="image-error">
              <el-empty 
                description="图片加载失败"
                :image-size="120"
              >
                <el-button @click="retryImageLoad" type="primary">重新加载</el-button>
                <el-button @click="downloadData" plain>下载查看</el-button>
              </el-empty>
            </div>
          </div>
          
          <!-- PDF预览 -->
          <div 
            v-else-if="selectedData.fileType === 'pdf'" 
            class="pdf-preview"
            :class="{ 'fullscreen': fullscreenMode }"
          >
              <iframe 
                :src="`${getFilePreviewUrl(selectedData)}#page=${pdfPageNum}&toolbar=0&navpanes=0&scrollbar=0`"
                frameborder="0"
                width="100%"
                height="350px"
                @load="handlePdfLoad"
              ></iframe>
          </div>
          
          <!-- 文本预览 -->
          <div 
            v-else-if="selectedData.fileType === 'text'" 
            class="text-preview"
          >
            <div class="text-content">
              <pre>{{ getTextContent(selectedData) }}</pre>
            </div>
          </div>
          
          <!-- 不支持的文件类型 -->
          <div v-else class="unsupported-preview">
            <el-empty 
              description="该文件类型暂不支持在线预览"
              :image-size="120"
            >
              <el-button @click="downloadData" type="primary">
                <el-icon><Download /></el-icon>
                下载查看
              </el-button>
            </el-empty>
          </div>
        </div>

      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedData?.authStatus === 'approved'"
            :type="selectedData.isPatientIdentityRevealed ? 'info' : 'warning'" 
            :disabled="selectedData.isPatientIdentityRevealed"
            :loading="isTracing"
            @click="handleRevealPatient"
          >
            <el-icon style="margin-right: 4px;"><UserFilled /></el-icon>
            {{ selectedData.isPatientIdentityRevealed ? '已溯源' : '患者身份溯源' }}
          </el-button>
          <el-button type="primary" @click="downloadData">下载数据</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Refresh, 
  Search, 
  Document, 
  Picture, 
  Folder, 
  Files, 
  Plus, 
  Lock, 
  UserFilled,
  ZoomIn,
  ZoomOut,
  RefreshLeft,
  RefreshRight,
  FullScreen,
  Loading,
  Download,
  OfficeBuilding,
  User
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { tracePatientIdentity, revealPatientIdentity } from '@/api/doctor'
import type { DoctorTracePatientResponse, MedicalFile } from '@/types/medicalData'
import { maskName, maskIdCard, maskPhone, displayByUnlockStatus } from '@/utils/privacy'
import { 
  MEDICAL_DATA_TYPE_OPTIONS,
  MEDICAL_DATA_TYPE_MAP,
  type FileCategory 
} from '@/types/medicalData'
import { useAuthStore } from '@/stores/auth'

// 用户存储
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const viewDialogVisible = ref(false)
const selectedData = ref<MedicalFile | any>(null)
const isTracing = ref(false)
const tracedPatientInfo = ref<DoctorTracePatientResponse | null>(null)

// 批量申请相关状态
const batchApplyDialogVisible = ref(false)
const batchSubmitting = ref(false)
const batchApplyFormRef = ref<FormInstance>()
const batchApplyForm = ref({
  reason: '',
  purpose: ''
})

// 文件预览状态
const previewLoading = ref(false)
const imageScale = ref(1)
const imageRotate = ref(0)
const pdfPageNum = ref(1)
const pdfTotalPages = ref(0)
const fullscreenMode = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

// 筛选条件
const filters = ref({
  dataType: '',
  authStatus: '',
  dateRange: [] as any[],
  keyword: ''
})

// 分页配置
const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})


// 批量申请表单验证规则
const batchApplyRules: FormRules = {
  reason: [
    { required: true, message: '申请理由不能为空', trigger: 'blur' }
  ],
  purpose: [
    { required: true, message: '请选择使用目的', trigger: 'change' }
  ]
}

// 数据列表
const dataList = ref<any[]>([])

// 加载数据列表
const loadDataList = async () => {
  loading.value = true
  try {
    // 调用真实API获取医生可访问的医疗数据列表
    const { doctorApi } = await import('@/api')
    const response = await doctorApi.getMedicalDataList({
      dataType: filters.value.dataType as any,
      authStatus: filters.value.authStatus as any,
      keyword: filters.value.keyword,
      page: pagination.value.current,
      pageSize: pagination.value.size
    })
    
    if (response.success && response.data) {
      dataList.value = response.data.files || response.data.items || []
      pagination.value.total = response.data.total || 0
    } else {
      dataList.value = []
      pagination.value.total = 0
      ElMessage.warning(response.message || '暂无可访问的医疗数据')
    }
  } catch (error) {
    console.error('加载数据列表失败:', error)
    dataList.value = []
    pagination.value.total = 0
    ElMessage.error('加载数据列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 获取医生姓名
const getDoctorName = (): string => {
  return authStore.user?.name || '医生'
}

// 获取医生科室
const getDoctorDepartment = (): string => {
  return authStore.currentDepartment || '未知科室'
}


// 计算过滤后的数据列表
const filteredDataList = computed(() => {
  let result = dataList.value

  // 按数据类型筛选
  if (filters.value.dataType) {
    result = result.filter(data => data.category === filters.value.dataType)
  }

  // 按授权状态筛选
  if (filters.value.authStatus) {
    result = result.filter(data => data.authStatus === filters.value.authStatus)
  }

  // 按关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(data => 
      data.title.toLowerCase().includes(keyword) ||
      data.description.toLowerCase().includes(keyword)
    )
  }

  pagination.value.total = result.length
  return result
})

// 获取所有未申请的数据
const unrequestedDataList = computed(() => {
  return dataList.value.filter(data => 
    data.authStatus === 'not-requested' || data.authStatus === 'rejected'
  )
})

// 检查是否有未申请的数据
const hasUnrequestedData = computed(() => {
  return unrequestedDataList.value.length > 0
})

// 获取授权状态类型
const getAuthStatusType = (status: string) => {
  switch (status) {
    case 'not-requested': return 'info'
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    default: return 'info'
  }
}

// 获取授权状态文本
const getAuthStatusText = (status: string) => {
  switch (status) {
    case 'not-requested': return '未申请'
    case 'pending': return '待审批'
    case 'approved': return '已授权'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
}


// 打开批量申请对话框
const openBatchApplyDialog = () => {
  if (unrequestedDataList.value.length === 0) {
    ElMessage.warning('当前没有需要申请授权的数据')
    return
  }
  
  // 重置表单
  batchApplyForm.value = {
    reason: '',
    purpose: ''
  }
  
  batchApplyDialogVisible.value = true
}

// 批量提交申请
const submitBatchApply = async () => {
  if (!batchApplyFormRef.value) return
  
  try {
    await batchApplyFormRef.value.validate()
    
    batchSubmitting.value = true
    
    const { doctorApi } = await import('@/api')
    const reason = `${batchApplyForm.value.reason}\n使用目的：${batchApplyForm.value.purpose}`
    
    // 批量发送申请
    const promises = unrequestedDataList.value.map(data => 
      doctorApi.requestAuthorization(data.id, reason)
        .then(response => ({ success: response.success, dataTitle: data.title }))
        .catch(error => ({ success: false, dataTitle: data.title, error }))
    )
    
    const results = await Promise.all(promises)
    
    // 统计结果
    const successResults = results.filter(result => result.success)
    const failureResults = results.filter(result => !result.success)
    
    // 显示结果
    if (failureResults.length === 0) {
      ElMessage.success(`批量申请成功！共提交 ${successResults.length} 条申请`)
    } else if (successResults.length > 0) {
      ElMessage.warning(`部分申请成功：${successResults.length} 条成功，${failureResults.length} 条失败`)
      console.warn('失败的申请:', failureResults)
    } else {
      ElMessage.error(`批量申请失败：${failureResults.length} 条申请提交失败`)
      console.error('失败的申请:', failureResults)
    }
    
    batchApplyDialogVisible.value = false
    
    // 重新加载数据列表
    await loadDataList()
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量申请失败:', error)
      ElMessage.error('批量申请失败，请检查网络连接')
    }
  } finally {
    batchSubmitting.value = false
  }
}

// 删除原来的 viewData 函数，使用下面更完整的版本

// 格式化文件大小
const formatFileSize = (size: number | string): string => {
  if (typeof size === 'string') return size
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 格式化日期时间（包含时分秒）
const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch {
    return dateString
  }
}

// 获取显示的患者姓名（脱敏/真实）
const getDisplayPatientName = (data: MedicalFile): string => {
  return displayByUnlockStatus(data.patientName, data.isPatientIdentityRevealed)
}

// 获取显示的患者身份证号（脱敏/真实）
const getDisplayPatientIdCard = (data: MedicalFile): string => {
  return displayByUnlockStatus(data.patientIdCard, data.isPatientIdentityRevealed)
}

// 获取显示的患者手机号（脱敏/真实）
const getDisplayPatientPhone = (data: MedicalFile): string => {
  return displayByUnlockStatus(data.patientPhone, data.isPatientIdentityRevealed)
}

// 获取显示的患者性别年龄
const getDisplayPatientGenderAge = (data: MedicalFile): string => {
  if (data.isPatientIdentityRevealed) {
    if (!data.patientGender && !data.patientAge) return '暂无信息'
    const gender = data.patientGender || '未知'
    const age = data.patientAge ? `${data.patientAge}岁` : '未知'
    return `${gender} / ${age}`
  } else {
    // 未解锁时显示"-"
    return '-'
  }
}

// 患者身份溯源（原版本，保留兼容性）
const handleTracePatient = async () => {
  if (!selectedData.value) return
  
  isTracing.value = true
  try {
    const response = await tracePatientIdentity(selectedData.value.id)
    
    if (response.success && response.data) {
      tracedPatientInfo.value = response.data
      ElMessage.success('患者身份溯源成功')
    } else {
      ElMessage.error(response.message || '患者身份溯源失败')
    }
  } catch (error: any) {
    console.error('患者身份溯源失败:', error)
    ElMessage.error(error.message || '患者身份溯源失败，请稍后重试')
  } finally {
    isTracing.value = false
  }
}

// 显示患者真实身份信息（新版本）
const handleRevealPatient = async () => {
  if (!selectedData.value) return
  
  isTracing.value = true
  try {
    const response = await revealPatientIdentity(selectedData.value.id)
    
    if (response.success) {
      // 更新当前选中数据的状态
      selectedData.value.isPatientIdentityRevealed = true
      
      // 同时更新数据列表中对应的项目
      const dataIndex = dataList.value.findIndex(item => item.id === selectedData.value.id)
      if (dataIndex !== -1) {
        dataList.value[dataIndex].isPatientIdentityRevealed = true
      }
      
      ElMessage.success('患者身份信息已显示')
    } else {
      ElMessage.error(response.message || '患者身份溯源失败')
    }
  } catch (error: any) {
    console.error('患者身份溯源失败:', error)
    ElMessage.error(error.message || '患者身份溯源失败，请稍后重试')
  } finally {
    isTracing.value = false
  }
}

// 下载数据
const downloadData = async () => {
  if (!selectedData.value) return
  
  if (selectedData.value.authStatus !== 'approved') {
    ElMessage.warning('该数据尚未授权，无法下载')
    return
  }
  
  try {
    // TODO: 实现数据下载API
    // 暂时提示功能开发中，待后端API开发完成后替换
    ElMessage.success('数据下载功能开发中，敬请期待')
    viewDialogVisible.value = false
  } catch (error: any) {
    console.error('数据下载失败:', error)
    ElMessage.error('数据下载失败，请检查网络连接')
  }
}

// 刷新数据
const refreshData = async () => {
  await loadDataList()
  ElMessage.success('数据已刷新')
}

// 分页处理
const handleSizeChange = async (size: number) => {
  pagination.value.size = size
  await loadDataList()
}

const handleCurrentChange = async (current: number) => {
  pagination.value.current = current
  await loadDataList()
}

// 文件预览相关函数
// 图片操作函数
const zoomIn = () => {
  if (imageScale.value < 3) {
    imageScale.value = Math.min(3, imageScale.value + 0.2)
  }
}

const zoomOut = () => {
  if (imageScale.value > 0.5) {
    imageScale.value = Math.max(0.5, imageScale.value - 0.2)
  }
}

const rotateLeft = () => {
  imageRotate.value -= 90
}

const rotateRight = () => {
  imageRotate.value += 90
}

const resetView = () => {
  imageScale.value = 1
  imageRotate.value = 0
}

// PDF操作函数
const prevPage = () => {
  if (pdfPageNum.value > 1) {
    pdfPageNum.value--
  }
}

const nextPage = () => {
  if (pdfPageNum.value < pdfTotalPages.value) {
    pdfPageNum.value++
  }
}

// 全屏模式
const toggleFullscreen = () => {
  fullscreenMode.value = !fullscreenMode.value
}

// 图片加载事件
const handleImageLoad = () => {
  previewLoading.value = false
  imageLoaded.value = true
  imageError.value = false
}

const handleImageError = () => {
  previewLoading.value = false
  imageLoaded.value = false
  imageError.value = true
  ElMessage.error('图片加载失败')
}

// 重试图片加载
const retryImageLoad = () => {
  imageError.value = false
  imageLoaded.value = false
  previewLoading.value = true
}

// PDF加载事件
const handlePdfLoad = () => {
  previewLoading.value = false
}

// 获取文件预览URL
const getFilePreviewUrl = (data: any) => {
  // 优先使用用户上传的真实文件数据
  if (data?.isUploaded) {
    // 使用filePreviewUrl或filePath（真实的文件数据）
    if (data.filePreviewUrl) {
      return data.filePreviewUrl
    }
    if (data.filePath) {
      return data.filePath
    }
  }
  
  // 优先使用处理后的previewUrl
  if (data?.previewUrl) {
    return data.previewUrl
  }
  
  // fallback到模拟预览
  return generatePreviewUrl(data)
}

// 生成模拟预览URL（作为fallback）
const generatePreviewUrl = (data: any): string => {
  // 模拟文件预览URL
  const category = data.category || data.type
  const fileName = data.fileName || data.filePath || data.title || ''
  
  if (!fileName) {
    return getPlaceholderUrl(category)
  }
  
  // 根据类别和文件类型生成模拟预览URL
  const fileType = getFileType(fileName)
  
  if (fileType === 'image') {
    // 使用更可靠的图片服务，确保图片能正常加载
    const imageUrls = [
      'https://picsum.photos/600/400?random=1',
      'https://picsum.photos/600/400?random=2', 
      'https://picsum.photos/600/400?random=3',
      'https://picsum.photos/600/400?random=4',
      'https://picsum.photos/600/400?random=5'
    ]
    
    // 根据fileId或文件名选择一个固定的图片
    const index = Math.abs((data.id || fileName).split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)) % imageUrls.length
    return imageUrls[index]
  } else if (fileType === 'pdf') {
    // 使用可靠的PDF测试文件
    return 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  }
  
  return getPlaceholderUrl(category)
}

// 获取占位符URL
const getPlaceholderUrl = (category: string): string => {
  // 使用picsum作为占位图，更可靠
  switch (category) {
    case 'medical-image':
      return 'https://picsum.photos/600/400?random=medical'
    case 'lab-report':
      return 'https://picsum.photos/600/400?random=lab'
    case 'medication':
      return 'https://picsum.photos/600/400?random=med'
    case 'physical-exam':
      return 'https://picsum.photos/600/400?random=exam'
    default:
      return 'https://picsum.photos/600/400?random=default'
  }
}

// 根据文件名判断文件类型
const getFileType = (fileName: string): string => {
  if (!fileName) return 'unknown'
  
  const extension = fileName.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'pdf':
      return 'pdf'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return 'image'
    case 'doc':
    case 'docx':
      return 'document'
    case 'txt':
      return 'text'
    default:
      return 'unknown'
  }
}

// 获取文本内容
const getTextContent = (data: any) => {
  const category = data.category || data.type
  const title = data.title || data.dataName
  
  switch (category) {
    case 'medication':
      return `【${title}】

用药记录详情：
时间：${formatDateTime(data.uploadTime || data.uploadDate)}

常用药物：
1. 阿司匹林 100mg - 每日1次，餐后服用
   适应症：预防心血管疾病
   
2. 美托洛尔 25mg - 每日2次，早晚服用
   适应症：高血压控制

用药注意事项：
- 规律服药，不可随意停药
- 定期复查相关指标
- 如有不良反应及时就医

记录日期：${new Date().toLocaleDateString('zh-CN')}`

    case 'lab-report':
      return `【${title}】

检验报告摘要：
检验时间：${formatDateTime(data.uploadTime || data.uploadDate)}

主要指标：
- 白细胞计数：正常范围内
- 红细胞计数：正常范围内  
- 血红蛋白：正常范围内
- 血小板计数：正常范围内

检验结论：
各项指标均在正常范围内，建议定期复查。`

    default:
      return `【${title}】

文档内容摘要：
创建时间：${formatDateTime(data.uploadTime || data.uploadDate)}
文件大小：${formatFileSize(data.fileSize)}

${data.description || '这是一份医疗相关的文档文件，包含重要的健康信息。'}`
  }
}

// 查看数据时处理文件类型
const viewData = (data: any) => {
  if (data.authStatus !== 'approved') {
    ElMessage.warning('该数据尚未授权，无法查看')
    return
  }
  
  // 处理数据字段映射和文件类型检测
  const processedData = {
    ...data,
    // 确保字段兼容性
    name: data.title || data.dataName || data.name,
    type: data.category || data.dataType || data.type,
    // 根据文件扩展名判断文件类型
    fileType: getFileType(data.fileName || data.filePath || data.title || ''),
    // 确保文件预览相关字段存在
    isUploaded: data.isUploaded || false,
    filePath: data.filePath || data.fileUrl,
    filePreviewUrl: data.filePreviewUrl || data.previewUrl,
    // 生成预览所需的数据
    previewUrl: data.previewUrl || generatePreviewUrl(data)
  }
  
  selectedData.value = processedData
  viewDialogVisible.value = true
  
  // 重置预览状态
  resetPreviewState()
  
  // 如果是PDF，预加载获取总页数
  if (processedData.fileType === 'pdf') {
    loadPdfInfo(processedData)
  }
}

// 加载PDF信息
const loadPdfInfo = async (data: any) => {
  // 模拟获取PDF信息
  setTimeout(() => {
    pdfTotalPages.value = Math.floor(Math.random() * 10) + 5 // 模拟5-15页
  }, 500)
}

// 重置预览状态
const resetPreviewState = () => {
  imageScale.value = 1
  imageRotate.value = 0
  pdfPageNum.value = 1
  pdfTotalPages.value = 0
  fullscreenMode.value = false
  previewLoading.value = false
  imageLoaded.value = false
  imageError.value = false
}

// 组件挂载时初始化
onMounted(async () => {
  await loadDataList()
})
</script>

<style scoped>
.data-management {
  padding: 24px;
  background: #f5f7fa;
}

/* 医生欢迎信息模块 */
.welcome-card {
  margin-bottom: 24px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);
  overflow: hidden;
}

.welcome-card :deep(.el-card__body) {
  padding: 0;
}

.welcome-content {
  display: flex;
  align-items: center;
  padding: 32px;
  color: white;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-avatar {
  position: relative;
}

.doctor-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.doctor-avatar:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.welcome-info {
  flex: 1;
}

.welcome-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.welcome-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.welcome-tags .el-tag {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
}

.tag-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 申请按钮样式优化 */
.apply-button {
  font-size: 16px !important;
  font-weight: 600 !important;
  padding: 12px 24px !important;
  width: 140px !important;
  height: 44px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3) !important;
  transition: all 0.3s ease !important;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%) !important;
  border: none !important;
}

.apply-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4) !important;
  background: linear-gradient(135deg, #67c23a 0%, #409eff 100%) !important;
}

.apply-button:active {
  transform: translateY(0) !important;
}

.apply-button:disabled {
  width: 140px !important;
  height: 44px !important;
  background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%) !important;
  box-shadow: 0 2px 6px rgba(144, 147, 153, 0.2) !important;
  transform: none !important;
  cursor: not-allowed !important;
  opacity: 0.8 !important;
}

.apply-button:disabled:hover {
  transform: none !important;
  width: 140px !important;
  height: 44px !important;
}

.apply-button .el-icon {
  font-size: 18px !important;
  margin-right: 8px !important;
}

.batch-count {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 申请对话框样式 */
.batch-apply-content {
  .data-preview {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e9ecef;
    
    .data-list {
      .el-tag {
        margin: 2px 4px 2px 0;
      }
    }
    
    .data-count {
      margin-top: 12px;
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      text-align: center;
      padding: 8px;
      background: rgba(64, 158, 255, 0.1);
      border-radius: 4px;
    }
  }
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 16px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 数据列表卡片 */
.data-list-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 数据信息列 */
.data-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-icon {
  color: #409eff;
}

.data-details {
  flex: 1;
}

.data-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.data-type {
  font-size: 12px;
  color: #999;
}

/* 患者信息 */
.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.patient-id {
  font-size: 12px;
  color: #999;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 对话框 */
.auth-dialog-content {
  padding: 20px 0;
}

.data-detail {
  padding: 20px 0;
}

.data-content {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  min-height: 200px;
}

.dialog-footer {
  text-align: right;
}

/* 患者身份溯源结果展示 */
.traced-patient-info {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f9ff 0%, #f0f7ff 100%);
  border-radius: 12px;
  border: 1px solid #d0e6ff;
}

.traced-patient-info .el-divider {
  margin-top: 0;
  margin-bottom: 16px;
}

.traced-patient-info .patient-descriptions {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.traced-patient-info .el-descriptions :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #409eff;
}

.traced-patient-info .el-descriptions :deep(.el-descriptions__content) {
  color: #2c3e50;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-management {
    padding: 16px;
  }
  
  /* 欢迎模块响应式 */
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
    padding: 24px 16px;
  }
  
  .welcome-left {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .welcome-title {
    font-size: 20px;
  }
  
  .welcome-subtitle {
    font-size: 13px;
  }
  
  .welcome-tags {
    justify-content: center;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
    gap: 12px;
    
    .el-button {
      flex: 1;
      max-width: 150px;
    }
  }
  
  /* 申请对话框移动端适配 */
  .batch-apply-content {
    .data-preview {
      max-height: 150px;
    }
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left {
    justify-content: center;
  }
  
  .filter-right {
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .filter-right .el-input {
    width: 240px !important;
  }
  
  .filter-right .apply-button {
    width: 120px !important;
    height: 40px !important;
    font-size: 15px !important;
    padding: 10px 20px !important;
  }
  
  .filter-right .apply-button:disabled {
    width: 120px !important;
    height: 40px !important;
  }
  
  .filter-right .apply-button:disabled:hover {
    width: 120px !important;
    height: 40px !important;
    transform: none !important;
  }
}

/* 表格样式优化 - 数据居中显示 */
:deep(.el-table) {
  .el-table__cell {
    text-align: center !important;
  }
  
  .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
  }
}

.data-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 4px;
}

.data-icon {
  margin-bottom: 4px;
}

.data-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.data-category {
  font-size: 12px;
  color: #999;
}

/* 文件预览样式 */
.file-preview {
  margin-top: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  position: relative;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-info {
  padding: 0 12px;
  color: #666;
  font-size: 14px;
}

/* 图片预览样式 */
.image-preview {
  position: relative;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 350px;
  overflow: auto;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  cursor: move;
  user-select: none;
  transition: opacity 0.3s ease;
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666;
}

.image-loading .el-icon {
  font-size: 32px;
  color: #1890ff;
}

.image-loading p {
  margin: 0;
  font-size: 14px;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

/* PDF预览样式 */
.pdf-preview {
  position: relative;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;
}

.pdf-preview iframe {
  display: block;
  border: none;
}

/* 文本预览样式 */
.text-preview {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  max-height: 300px;
  overflow-y: auto;
}

.text-content {
  padding: 20px;
}

.text-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

/* 不支持预览的文件类型 */
.unsupported-preview {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* 全屏模式样式 */
.image-preview.fullscreen,
.pdf-preview.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  border-radius: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview.fullscreen .image-container {
  max-width: 90vw;
  max-height: 90vh;
}

.pdf-preview.fullscreen iframe {
  width: 90vw !important;
  height: 90vh !important;
}

/* 数据详情对话框前三行双倍行高样式 */
.data-descriptions :deep(.double-height-row) {
  line-height: 2;
}

.data-descriptions :deep(.double-height-row .el-descriptions__label),
.data-descriptions :deep(.double-height-row .el-descriptions__content) {
  padding-top: 24px !important;
  padding-bottom: 24px !important;
  line-height: 1.5;
}
</style>


