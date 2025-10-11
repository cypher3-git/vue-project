<template>
  <div class="patient-data">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h2>我的数据</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showUploadDialog">
          <el-icon><Plus /></el-icon>
          上传数据
        </el-button>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalData }}</div>
          <div class="stat-label">总数据条目</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ authorizedData }}</div>
          <div class="stat-label">授权中数据</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ recentUpload }}</div>
          <div class="stat-label">本月新增</div>
        </div>
      </el-card>
    </div>

    <!-- 筛选和搜索区域 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select 
            v-model="filters.type" 
            placeholder="数据类型" 
            clearable 
            style="width: 150px; margin-right: 16px;"
          >
            <el-option label="全部类型" value="" />
            <el-option label="检验报告" value="检验报告" />
            <el-option label="影像资料" value="影像资料" />
            <el-option label="病历记录" value="病历记录" />
            <el-option label="体检报告" value="体检报告" />
            <el-option label="用药记录" value="用药记录" />
          </el-select>
          
          <el-select 
            v-model="filters.authStatus" 
            placeholder="授权状态" 
            clearable 
            style="width: 150px; margin-right: 16px;"
          >
            <el-option label="全部状态" value="" />
            <el-option label="无授权请求" value="无授权请求" />
            <el-option label="待审批" value="待审批" />
            <el-option label="已授权" value="已授权" />
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
          <el-input
            v-model="filters.keyword"
            placeholder="搜索数据名称或描述"
            clearable
            style="width: 300px;"
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
        :data="filteredData" 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="数据名称" width="200">
          <template #default="scope">
            <div class="data-name">
              <el-icon class="file-icon">
                <Document v-if="scope.row.type === '检验报告'" />
                <Picture v-else-if="scope.row.type === '影像资料'" />
                <Folder v-else-if="scope.row.type === '病历记录'" />
                <Files v-else-if="scope.row.type === '体检报告'" />
                <Files v-else-if="scope.row.type === '用药记录'" />
                <Document v-else />
              </el-icon>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="数据类型" width="120" />
        
        <el-table-column prop="date" label="创建日期" width="120" />
        
        <el-table-column prop="size" label="大小" width="100" />
        
        <el-table-column label="授权状态" width="120">
          <template #default="scope">
            <el-tag 
              :type="getAuthStatusType(scope.row.authStatus)"
              size="small"
            >
              {{ getAuthStatusText(scope.row.authStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" />
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button 
              type="text" 
              size="small" 
              @click="viewData(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="downloadData(scope.row)"
            >
              下载
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              style="color: #f56c6c;" 
              @click="deleteData(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看数据详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="数据详情" width="700px" :close-on-click-modal="false">
      <div v-if="currentViewData" class="data-detail">
        <div class="detail-header">
          <div class="data-icon">
            <el-icon size="32">
              <Document v-if="currentViewData.type === '检验报告'" />
              <Picture v-else-if="currentViewData.type === '影像资料'" />
              <Folder v-else-if="currentViewData.type === '病历记录'" />
              <Files v-else-if="currentViewData.type === '体检报告'" />
              <Files v-else-if="currentViewData.type === '用药记录'" />
              <Document v-else />
            </el-icon>
          </div>
          <div class="data-title">
            <h3>{{ currentViewData.name }}</h3>
            <el-tag :type="getAuthStatusType(currentViewData.authStatus)" size="small">
              {{ getAuthStatusText(currentViewData.authStatus) }}
            </el-tag>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="数据类型">
              <el-tag>{{ currentViewData.type }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="文件大小">
              {{ currentViewData.size }}
            </el-descriptions-item>
            <el-descriptions-item label="创建日期">
              {{ currentViewData.date }}
            </el-descriptions-item>
            <el-descriptions-item label="授权状态">
              <el-tag :type="getAuthStatusType(currentViewData.authStatus)" size="small">
                {{ getAuthStatusText(currentViewData.authStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述信息" :span="2">
              {{ currentViewData.description }}
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 文件预览区域 -->
          <div class="file-preview" v-loading="previewLoading">
            <div class="preview-header">
              <h4>文件预览</h4>
              <div class="preview-controls" v-if="currentViewData.fileType === 'image'">
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
              <div class="preview-controls" v-else-if="currentViewData.fileType === 'pdf'">
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
              v-if="currentViewData.fileType === 'image'" 
              class="image-preview"
              :class="{ 'fullscreen': fullscreenMode }"
            >
              <div class="image-container" v-if="!imageError">
                <img 
                  :src="getFilePreviewUrl(currentViewData)" 
                  :alt="currentViewData.name"
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
                  <el-button @click="downloadData(currentViewData)" plain>下载查看</el-button>
                </el-empty>
              </div>
            </div>
            
            <!-- PDF预览 -->
            <div 
              v-else-if="currentViewData.fileType === 'pdf'" 
              class="pdf-preview"
              :class="{ 'fullscreen': fullscreenMode }"
            >
              <iframe 
                :src="`${getFilePreviewUrl(currentViewData)}#page=${pdfPageNum}&toolbar=0&navpanes=0&scrollbar=0`"
                frameborder="0"
                width="100%"
                height="500px"
                @load="handlePdfLoad"
              ></iframe>
            </div>
            
            <!-- 文本预览 -->
            <div 
              v-else-if="currentViewData.fileType === 'text'" 
              class="text-preview"
            >
              <div class="text-content">
                <pre>{{ getTextContent(currentViewData) }}</pre>
              </div>
            </div>
            
            <!-- 不支持的文件类型 -->
            <div v-else class="unsupported-preview">
              <el-empty 
                description="该文件类型暂不支持在线预览"
                :image-size="120"
              >
                <el-button @click="downloadData(currentViewData)" type="primary">
                  <el-icon><Download /></el-icon>
                  下载查看
                </el-button>
              </el-empty>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="downloadData(currentViewData)" type="primary" plain>
            <el-icon><Download /></el-icon>
            下载
          </el-button>
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 上传数据对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传数据" width="500px">
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
        <el-form-item label="数据类型" prop="type">
          <el-select 
            v-model="uploadForm.type" 
            placeholder="请选择数据类型" 
            style="width: 100%"
            @change="handleTypeChange"
          >
            <el-option label="检验报告" value="检验报告" />
            <el-option label="影像资料" value="影像资料" />
            <el-option label="病历记录" value="病历记录" />
            <el-option label="体检报告" value="体检报告" />
            <el-option label="用药记录" value="用药记录" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="数据名称" prop="name">
          <el-select 
            v-model="uploadForm.name" 
            placeholder="请选择数据名称" 
            style="width: 100%"
            filterable
            allow-create
            default-first-option
          >
            <el-option 
              v-for="option in availableNameOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value"
            />
          </el-select>
          <div class="name-tip">可从列表选择或输入自定义名称</div>
        </el-form-item>
        
        <el-form-item label="描述信息" prop="description">
          <el-input 
            v-model="uploadForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入数据描述"
          />
        </el-form-item>
        
        <el-form-item label="文件上传" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :before-remove="handleFileRemove"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">
                支持 PDF、DOC、JPG、PNG 等格式，文件大小不超过 10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpload">确定上传</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, 
  Search, 
  Document, 
  Picture, 
  Folder, 
  Files,
  Download,
  Share,
  CopyDocument,
  ZoomIn,
  ZoomOut,
  RefreshLeft,
  RefreshRight,
  FullScreen,
  Loading
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { useMedicalDataStore } from '@/stores/medicalData'

// Medical Data Store
const medicalDataStore = useMedicalDataStore()

// 响应式数据
const loading = computed(() => medicalDataStore.loading)
const uploadDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const currentViewData = ref<any>(null)

// 文件预览状态
const previewLoading = ref(false)
const imageScale = ref(1)
const imageRotate = ref(0)
const pdfPageNum = ref(1)
const pdfTotalPages = ref(0)
const fullscreenMode = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

// 统计数据
const totalData = computed(() => medicalDataStore.totalFiles)
const authorizedData = computed(() => {
  // 计算已授权或授权中的数据数量
  return medicalDataStore.files.filter((f: any) => f.authStatus === 'authorized' || f.authStatus === '待审批').length
})
const recentUpload = computed(() => medicalDataStore.recentFiles.length)

// 筛选条件
const filters = ref({
  type: '',
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

// 表单数据
const uploadFormRef = ref<FormInstance>()
const uploadForm = ref({
  name: '',
  type: '',
  description: '',
  file: null as UploadFile | null
})


// 科室列表
const departmentList = ref([
  { label: '心血管科', value: '心血管科' },
  { label: '内科', value: '内科' },
  { label: '骨科', value: '骨科' },
  { label: '神经科', value: '神经科' },
  { label: '外科', value: '外科' },
  { label: '呼吸内科', value: '呼吸内科' },
  { label: '消化内科', value: '消化内科' },
  { label: '泌尿科', value: '泌尿科' },
  { label: '妇产科', value: '妇产科' },
  { label: '儿科', value: '儿科' },
  { label: '内分泌科', value: '内分泌科' },
  { label: '肿瘤科', value: '肿瘤科' }
])

// 数据名称选项配置
const dataNameOptions = {
  '检验报告': [
    { label: '血常规检查报告', value: '血常规检查报告' },
    { label: '尿常规检查报告', value: '尿常规检查报告' },
    { label: '肝功能检查报告', value: '肝功能检查报告' },
    { label: '肾功能检查报告', value: '肾功能检查报告' },
    { label: '血脂检查报告', value: '血脂检查报告' },
    { label: '血糖检查报告', value: '血糖检查报告' },
    { label: '心肌酶检查报告', value: '心肌酶检查报告' },
    { label: '甲状腺功能检查', value: '甲状腺功能检查' },
    { label: '乙肝五项检查', value: '乙肝五项检查' },
    { label: '肿瘤标志物检查', value: '肿瘤标志物检查' },
    { label: '免疫功能检查', value: '免疫功能检查' },
    { label: '凝血功能检查', value: '凝血功能检查' }
  ],
  '影像资料': [
    { label: '胸部X光片', value: '胸部X光片' },
    { label: '腹部X光片', value: '腹部X光片' },
    { label: '头颅CT', value: '头颅CT' },
    { label: '胸部CT', value: '胸部CT' },
    { label: '腹部CT', value: '腹部CT' },
    { label: '头颅MRI', value: '头颅MRI' },
    { label: '脊柱MRI', value: '脊柱MRI' },
    { label: '心脏彩超', value: '心脏彩超' },
    { label: '腹部彩超', value: '腹部彩超' },
    { label: '甲状腺彩超', value: '甲状腺彩超' },
    { label: '乳腺彩超', value: '乳腺彩超' },
    { label: '心电图', value: '心电图' },
    { label: '24小时动态心电图', value: '24小时动态心电图' }
  ],
  '病历记录': [
    { label: '门诊病历', value: '门诊病历' },
    { label: '住院病历', value: '住院病历' },
    { label: '急诊病历', value: '急诊病历' },
    { label: '专科门诊病历', value: '专科门诊病历' },
    { label: '复诊病历', value: '复诊病历' },
    { label: '会诊记录', value: '会诊记录' },
    { label: '手术记录', value: '手术记录' },
    { label: '麻醉记录', value: '麻醉记录' },
    { label: '护理记录', value: '护理记录' },
    { label: '出院小结', value: '出院小结' }
  ],
  '体检报告': [
    { label: '入职体检报告', value: '入职体检报告' },
    { label: '年度健康体检报告', value: '年度健康体检报告' },
    { label: '专项体检报告', value: '专项体检报告' },
    { label: '职业病体检报告', value: '职业病体检报告' },
    { label: '驾驶员体检报告', value: '驾驶员体检报告' },
    { label: '学生体检报告', value: '学生体检报告' },
    { label: '老年人体检报告', value: '老年人体检报告' },
    { label: '妇科体检报告', value: '妇科体检报告' },
    { label: '男科体检报告', value: '男科体检报告' }
  ],
  '用药记录': [
    { label: '门诊处方记录', value: '门诊处方记录' },
    { label: '住院用药记录', value: '住院用药记录' },
    { label: '慢性病用药记录', value: '慢性病用药记录' },
    { label: '特殊用药记录', value: '特殊用药记录' },
    { label: '疫苗接种记录', value: '疫苗接种记录' },
    { label: '药物过敏记录', value: '药物过敏记录' },
    { label: '中药处方记录', value: '中药处方记录' },
    { label: '输液记录', value: '输液记录' }
  ]
}

// 计算可用的数据名称选项
const availableNameOptions = computed(() => {
  if (!uploadForm.value.type) {
    return []
  }
  return dataNameOptions[uploadForm.value.type as keyof typeof dataNameOptions] || []
})

// 表单验证规则
const uploadRules: FormRules = {
  name: [
    { required: true, message: '请选择或输入数据名称', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入描述信息', trigger: 'blur' }
  ]
}

// 使用Store中的数据
const medicalData = computed(() => medicalDataStore.files)

// 计算过滤后的数据
const filteredData = computed(() => {
  let result = medicalData.value

  // 按类型筛选
  if (filters.value.type) {
    result = result.filter(item => item.category === filters.value.type || item.fileType === filters.value.type)
  }

  // 按授权状态筛选
  if (filters.value.authStatus) {
    result = result.filter(item => item.authStatus === filters.value.authStatus)
  }

  // 按关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(item => 
      (item.title || item.fileName).toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }

  // 按日期范围筛选
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const [startDate, endDate] = filters.value.dateRange
    result = result.filter(item => {
      const itemDate = new Date(item.uploadTime)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return result
})


// 处理函数
const showUploadDialog = () => {
  uploadDialogVisible.value = true
  resetUploadForm()
}

const resetUploadForm = () => {
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields()
  }
  uploadForm.value = {
    name: '',
    type: '',
    description: '',
    file: null
  }
}

const handleFileChange = (file: UploadFile) => {
  uploadForm.value.file = file
}

const handleFileRemove = () => {
  uploadForm.value.file = null
  return true
}

// 处理数据类型变化
const handleTypeChange = () => {
  // 当数据类型改变时，清空已选择的数据名称
  uploadForm.value.name = ''
}

const handleUpload = async () => {
  if (!uploadFormRef.value) return
  
  try {
    await uploadFormRef.value.validate()
    
    if (!uploadForm.value.file) {
      ElMessage.warning('请选择要上传的文件')
      return
    }
    
    // 真实上传
    const file = uploadForm.value.file.raw as File
    
    // 映射类型到category
    const categoryMap: Record<string, any> = {
      '检验报告': 'report',
      '影像资料': 'image',
      '病历记录': 'report',
      '体检报告': 'report',
      '用药记录': 'prescription'
    }
    
    await medicalDataStore.uploadFile({
      file: file,
      title: uploadForm.value.name,
      description: uploadForm.value.description,
      category: categoryMap[uploadForm.value.type] || 'other'
    })
    
    // 关闭对话框并重置表单
    uploadDialogVisible.value = false
    uploadFormRef.value.resetFields()
    uploadForm.value.file = null
    
    // 重新加载数据
    await medicalDataStore.getFiles()
    
  } catch (error) {
    console.error('上传失败:', error)
  }
}

const viewData = (row: any) => {
  currentViewData.value = row
  viewDialogVisible.value = true
  
  // 重置预览状态
  resetPreviewState()
  
  // 如果是PDF，预加载获取总页数
  if (row.fileType === 'pdf') {
    loadPdfInfo(row)
  }
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

// 获取文件预览URL
const getFilePreviewUrl = (data: any) => {
  if (!data || !data.filePath) {
    return getPlaceholderImage(data?.fileType || 'unknown')
  }
  
  // 如果是用户上传的文件，直接返回blob URL
  if (data.isUploaded) {
    return data.filePath
  }
  
  // 预设数据的模拟URL映射
  const mockUrls = {
    '/api/files/blood-test-report.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '/api/files/ecg-report.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '/api/images/chest-xray.jpg': 'https://via.placeholder.com/600x400/4a90e2/ffffff?text=胸部X光片',
    '/api/files/liver-function-report.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '/api/files/full-medical-checkup.pdf': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    '/api/files/medication-history.txt': data.filePath
  }
  
  return mockUrls[data.filePath as keyof typeof mockUrls] || getPlaceholderImage(data.fileType)
}

// 获取文本内容
const getTextContent = (data: any) => {
  // 在真实项目中，这里应该从后端获取文本内容
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
   
4. 氯吡格雷 75mg - 每日1次
   适应症：抗血小板聚集

用药注意事项：
- 规律服药，不可随意停药
- 定期复查相关指标
- 如有不良反应及时就医

医师签名：张医生
日期：2024年1月15日`
  }
  
  return mockTextContent[data.name as keyof typeof mockTextContent] || '暂无文本内容'
}

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
const loadPdfInfo = async (data: any) => {
  // 模拟获取PDF信息
  setTimeout(() => {
    pdfTotalPages.value = Math.floor(Math.random() * 10) + 5 // 模拟5-15页
  }, 500)
}

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
  
  if (fullscreenMode.value) {
    // 进入全屏模式时，可以添加键盘事件监听
    document.addEventListener('keydown', handleKeydown)
  } else {
    // 退出全屏模式时，移除键盘事件监听
    document.removeEventListener('keydown', handleKeydown)
  }
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (!fullscreenMode.value) return
  
  switch (event.key) {
    case 'Escape':
      fullscreenMode.value = false
      document.removeEventListener('keydown', handleKeydown)
      break
    case 'ArrowLeft':
      if (currentViewData.value?.fileType === 'pdf') {
        prevPage()
      }
      break
    case 'ArrowRight':
      if (currentViewData.value?.fileType === 'pdf') {
        nextPage()
      }
      break
  }
}

// 图片加载事件
const handleImageLoad = () => {
  previewLoading.value = false
  imageLoaded.value = true
  imageError.value = false
  console.log('图片加载成功')
}

const handleImageError = (event: any) => {
  previewLoading.value = false
  imageLoaded.value = false
  imageError.value = true
  console.error('图片加载失败:', event)
  ElMessage.error('图片加载失败，请检查文件格式或网络连接')
}

// 重试图片加载
const retryImageLoad = () => {
  imageError.value = false
  imageLoaded.value = false
  previewLoading.value = true
  
  // 强制重新加载图片
  const img = new Image()
  img.onload = handleImageLoad
  img.onerror = handleImageError
  img.src = getFilePreviewUrl(currentViewData.value)
}

// PDF加载事件
const handlePdfLoad = () => {
  previewLoading.value = false
}

// 辅助函数：根据文件扩展名获取文件类型
const getFileTypeFromExtension = (filename: string) => {
  const ext = filename.toLowerCase().split('.').pop()
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
  const pdfExts = ['pdf']
  const textExts = ['txt', 'text', 'log']
  
  if (imageExts.includes(ext || '')) return 'image'
  if (pdfExts.includes(ext || '')) return 'pdf'
  if (textExts.includes(ext || '')) return 'text'
  
  return 'unknown'
}

// 辅助函数：获取文件扩展名
const getFileExtension = (filename: string) => {
  return filename.toLowerCase().split('.').pop() || 'txt'
}

// 辅助函数：格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 辅助函数：获取占位符图片
const getPlaceholderImage = (fileType: string) => {
  const placeholders = {
    image: 'https://via.placeholder.com/600x400/e3f2fd/1976d2?text=图片预览',
    pdf: 'https://via.placeholder.com/600x400/fce4ec/c2185b?text=PDF文档',
    text: 'https://via.placeholder.com/600x400/f3e5f5/7b1fa2?text=文本文件',
    unknown: 'https://via.placeholder.com/600x400/f5f5f5/9e9e9e?text=未知文件类型'
  }
  return placeholders[fileType as keyof typeof placeholders] || placeholders.unknown
}

// 辅助函数：ArrayBuffer转Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const downloadData = async (row: any) => {
  try {
    await medicalDataStore.downloadFile(row.id, row.fileName || row.title || row.name)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

const downloadDataOld = (row: any) => {
  ElMessage.info('正在准备下载...')
  
  if (row.isUploaded && row.originalFile) {
    // 如果是用户上传的文件，直接下载原始文件
    setTimeout(() => {
      const url = URL.createObjectURL(row.originalFile)
      const link = document.createElement('a')
      link.href = url
      link.download = row.originalFileName || `${row.name}.${getFileExtension(row.originalFileName || '')}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      ElMessage.success(`${row.name} 下载成功`)
    }, 500)
  } else {
    // 对于预设的示例数据，使用模拟下载
    setTimeout(() => {
      let blob: Blob
      let fileName: string
      
      if (row.fileType === 'image') {
        // 对于图片类型，尝试从网络URL下载
        downloadFromUrl(row.filePath || getFilePreviewUrl(row), `${row.name}.jpg`)
        return
      } else if (row.fileType === 'pdf') {
        // 对于PDF类型，尝试从网络URL下载
        downloadFromUrl(getFilePreviewUrl(row), `${row.name}.pdf`)
        return
      } else {
        // 对于文本类型，创建文本文件
        const content = getTextContent(row)
        blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        fileName = `${row.name}.txt`
      }
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      ElMessage.success(`${row.name} 下载成功`)
    }, 1000)
  }
}

// 从网络URL下载文件
const downloadFromUrl = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)
    
    ElMessage.success(`${filename} 下载成功`)
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

// 授权状态相关辅助函数
const getAuthStatusType = (status: string) => {
  switch (status) {
    case '无授权请求': return 'info'
    case '待审批': return 'warning'
    case '已授权': return 'success'
    case '已拒绝': return 'danger'
    default: return 'info'
  }
}

const getAuthStatusText = (status: string) => {
  return status || '无授权请求'
}

const deleteData = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${row.title || row.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await medicalDataStore.deleteFile(row.id)
    await medicalDataStore.getFiles()
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const deleteDataOld = async (row: any, index: number) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除数据"${row.name}"吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 注意：不能直接修改computed值，应该通过store来删除
    await medicalDataStore.deleteFile(row.id)
    ElMessage.success('数据已删除')
  } catch {
    // 用户取消操作
  }
}

const handleSizeChange = (size: number) => {
  pagination.value.size = size
}

const handleCurrentChange = (current: number) => {
  pagination.value.current = current
}

// 组件挂载时加载数据
onMounted(async () => {
  try {
    await medicalDataStore.getFiles()
    pagination.value.total = medicalData.value.length
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script>

<style scoped>
.patient-data {
  padding: 24px;
  background: #f8fafc;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 允许输入框和文本区域内文本选择 */
.patient-data :deep(input),
.patient-data :deep(textarea),
.patient-data :deep(.el-input__inner),
.patient-data :deep(.el-textarea__inner) {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* 移除所有可点击元素的焦点轮廓 */
.patient-data :deep(button),
.patient-data :deep(.el-button),
.patient-data :deep(.el-tag),
.patient-data :deep(.el-select),
.patient-data :deep(.el-radio),
.patient-data :deep(.el-checkbox) {
  outline: none;
}

/* 移除焦点时的默认轮廓，但保留键盘导航的可访问性 */
.patient-data :deep(button:focus),
.patient-data :deep(.el-button:focus),
.patient-data :deep(.el-tag:focus) {
  outline: none;
}

/* 为键盘用户保留焦点指示 */
.patient-data :deep(button:focus-visible),
.patient-data :deep(.el-button:focus-visible) {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
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
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  text-align: center;
  padding: 16px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 筛选区域 */
.filter-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
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
}

/* 数据列表 */
.data-list-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.data-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #1890ff;
}

.pagination-wrapper {
  margin-top: 24px;
  text-align: right;
}

/* 上传提示 */
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 数据名称提示 */
.name-tip {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

/* 数据详情对话框样式 */
.data-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
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

.data-title h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.detail-content {
  margin-top: 20px;
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
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 500px;
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
  min-height: 400px;
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
  max-height: 400px;
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

/* 全屏模式下的控制按钮 */
.fullscreen .preview-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  border-radius: 6px;
  z-index: 10000;
}

/* 预览加载状态 */
.file-preview .el-loading-mask {
  border-radius: 8px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .preview-controls {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .image-preview.fullscreen .image-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .pdf-preview.fullscreen iframe {
    width: 95vw !important;
    height: 95vh !important;
  }
}

/* 分享对话框样式 */
.share-content {
  max-height: 60vh;
  overflow-y: auto;
}

.share-info h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.share-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.share-options {
  margin: 16px 0;
}

.share-result {
  margin-top: 20px;
}

.share-result h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.share-url {
  width: 100%;
}


.doctor-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.doctor-dept {
  color: #999;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left {
    flex-direction: column;
  }
  
  .filter-right {
    justify-content: stretch;
  }
}
</style>
