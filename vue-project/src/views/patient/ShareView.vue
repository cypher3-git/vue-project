<template>
  <div class="share-management">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h2>分享管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddShareDialog">
          <el-icon><Plus /></el-icon>
          新增分享权限
        </el-button>
        <el-button @click="showBatchDialog" :disabled="selectedShares.length === 0">
          <el-icon><Operation /></el-icon>
          批量管理
        </el-button>
      </div>
    </div>

    <!-- 分享权限统计 -->
    <div class="stats-row">
      <el-card class="stat-card active">
        <div class="stat-content">
          <div class="stat-number">{{ activeShares }}</div>
          <div class="stat-label">活跃分享</div>
        </div>
      </el-card>
      <el-card class="stat-card expired">
        <div class="stat-content">
          <div class="stat-number">{{ expiredShares }}</div>
          <div class="stat-label">已过期</div>
        </div>
      </el-card>
      <el-card class="stat-card total">
        <div class="stat-content">
          <div class="stat-number">{{ totalShares }}</div>
          <div class="stat-label">总计权限</div>
        </div>
      </el-card>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select 
            v-model="filters.status" 
            placeholder="权限状态" 
            clearable 
            style="width: 120px; margin-right: 16px;"
          >
            <el-option label="全部状态" value="" />
            <el-option label="活跃中" value="active" />
            <el-option label="即将过期" value="expiring" />
            <el-option label="已过期" value="expired" />
            <el-option label="已暂停" value="paused" />
          </el-select>
          
          <el-select 
            v-model="filters.department" 
            placeholder="医生科室" 
            clearable 
            style="width: 150px; margin-right: 16px;"
          >
            <el-option label="全部科室" value="" />
            <el-option label="心血管科" value="心血管科" />
            <el-option label="内科" value="内科" />
            <el-option label="骨科" value="骨科" />
            <el-option label="神经科" value="神经科" />
            <el-option label="外科" value="外科" />
          </el-select>
          
          <el-button @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <div class="filter-right">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索医生姓名"
            clearable
            style="width: 200px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- 分享权限列表 -->
    <el-card class="share-list-card">
      <el-table 
        :data="filteredShareList" 
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="数据信息" width="250">
          <template #default="scope">
            <div class="data-info">
              <el-icon class="data-icon">
                <Document v-if="scope.row.dataType === '检验报告'" />
                <Picture v-else-if="scope.row.dataType === '影像资料'" />
                <Folder v-else-if="scope.row.dataType === '病历记录'" />
                <Files v-else-if="scope.row.dataType === '体检报告'" />
                <Files v-else />
              </el-icon>
              <div class="data-details">
                <div class="data-name">{{ scope.row.dataName }}</div>
                <div class="data-type">{{ scope.row.dataType }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="doctorName" label="授权医生" width="100" />
        
        <el-table-column prop="department" label="科室" width="100" />
        
        <el-table-column label="权限级别" width="100">
          <template #default="scope">
            <el-tag 
              :type="getPermissionTagType(scope.row.permission)"
              size="small"
            >
              {{ getPermissionText(scope.row.permission) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="getStatusTagType(scope.row.status)"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="shareTime" label="分享时间" width="150" />
        
        <el-table-column label="过期时间" width="150">
          <template #default="scope">
            <span v-if="scope.row.expiry === 'permanent'">永久有效</span>
            <span v-else>{{ scope.row.expiryTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="访问次数" width="100">
          <template #default="scope">
            {{ scope.row.accessCount || 0 }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="text" 
              size="small" 
              @click="viewShareDetails(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="editShare(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="copyShareLink(scope.row)"
            >
              复制链接
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              style="color: #f56c6c;" 
              @click="revokeShare(scope.row)"
            >
              撤销
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

    <!-- 新增分享权限对话框 -->
    <el-dialog v-model="addShareDialogVisible" title="新增分享权限" width="600px">
      <el-form ref="addShareFormRef" :model="addShareForm" :rules="addShareRules" label-width="100px">
        <el-form-item label="选择数据" prop="dataId">
          <el-select v-model="addShareForm.dataId" placeholder="请选择要分享的数据" style="width: 100%">
            <el-option 
              v-for="data in availableData" 
              :key="data.id" 
              :label="data.name" 
              :value="data.id"
            >
              <div class="data-option">
                <span>{{ data.name }}</span>
                <el-tag size="small">{{ data.type }}</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="授权医生" prop="doctorId">
          <el-select 
            v-model="addShareForm.doctorId" 
            placeholder="请选择医生" 
            style="width: 100%"
            filterable
          >
            <el-option 
              v-for="doctor in doctorList" 
              :key="doctor.id" 
              :label="`${doctor.name} - ${doctor.department}`" 
              :value="doctor.id"
            >
              <div class="doctor-option">
                <span>{{ doctor.name }}</span>
                <span class="doctor-dept">{{ doctor.department }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="权限级别" prop="permission">
          <el-radio-group v-model="addShareForm.permission">
            <el-radio label="read">只读</el-radio>
            <el-radio label="download">可下载</el-radio>
            <el-radio label="full">完全访问</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="有效期" prop="expiry">
          <el-radio-group v-model="addShareForm.expiry">
            <el-radio label="1">1天</el-radio>
            <el-radio label="7">7天</el-radio>
            <el-radio label="30">30天</el-radio>
            <el-radio label="0">永久</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="访问密码">
          <el-input 
            v-model="addShareForm.password" 
            placeholder="可选，留空表示无密码"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item label="备注信息">
          <el-input 
            v-model="addShareForm.notes" 
            type="textarea" 
            :rows="3"
            placeholder="可选，添加备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addShareDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddShare" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量管理对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量管理" width="500px">
      <div class="batch-content">
        <p>已选择 {{ selectedShares.length }} 个分享权限</p>
        
        <el-divider />
        
        <div class="batch-actions">
          <el-button @click="batchUpdateExpiry" plain>
            <el-icon><Clock /></el-icon>
            批量延期
          </el-button>
          <el-button @click="batchUpdatePermission" plain>
            <el-icon><Key /></el-icon>
            批量修改权限
          </el-button>
          <el-button @click="batchPause" type="warning" plain>
            <el-icon><VideoPause /></el-icon>
            批量暂停
          </el-button>
          <el-button @click="batchRevoke" type="danger" plain>
            <el-icon><Delete /></el-icon>
            批量撤销
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分享详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="分享详情" width="600px">
      <div v-if="currentShareDetail" class="share-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="数据名称">
            {{ currentShareDetail.dataName }}
          </el-descriptions-item>
          <el-descriptions-item label="数据类型">
            {{ currentShareDetail.dataType }}
          </el-descriptions-item>
          <el-descriptions-item label="授权医生">
            {{ currentShareDetail.doctorName }}
          </el-descriptions-item>
          <el-descriptions-item label="医生科室">
            {{ currentShareDetail.department }}
          </el-descriptions-item>
          <el-descriptions-item label="权限级别">
            {{ getPermissionText(currentShareDetail.permission) }}
          </el-descriptions-item>
          <el-descriptions-item label="分享状态">
            {{ getStatusText(currentShareDetail.status) }}
          </el-descriptions-item>
          <el-descriptions-item label="分享时间">
            {{ currentShareDetail.shareTime }}
          </el-descriptions-item>
          <el-descriptions-item label="过期时间">
            {{ currentShareDetail.expiry === 'permanent' ? '永久有效' : currentShareDetail.expiryTime }}
          </el-descriptions-item>
          <el-descriptions-item label="访问次数">
            {{ currentShareDetail.accessCount || 0 }} 次
          </el-descriptions-item>
          <el-descriptions-item label="最后访问">
            {{ currentShareDetail.lastAccess || '未访问' }}
          </el-descriptions-item>
          <el-descriptions-item label="分享链接" :span="2">
            <el-input v-model="currentShareDetail.shareUrl" readonly>
              <template #append>
                <el-button @click="copyToClipboard(currentShareDetail.shareUrl)">
                  复制
                </el-button>
              </template>
            </el-input>
          </el-descriptions-item>
          <el-descriptions-item label="备注信息" :span="2">
            {{ currentShareDetail.notes || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Plus, 
  Operation, 
  Refresh, 
  Search, 
  Document, 
  Picture, 
  Folder, 
  Files,
  Clock,
  Key,
  VideoPause,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { shareApi, medicalDataApi } from '@/api'
import { useMedicalDataStore } from '@/stores/medicalData'
import { useAuthStore } from '@/stores/auth'

// Stores
const medicalDataStore = useMedicalDataStore()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const addShareDialogVisible = ref(false)
const batchDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedShares = ref<any[]>([])
const currentShareDetail = ref<any>(null)

// 真实分享数据（从API获取）
const shareList = ref<any[]>([])

// 统计数据
const activeShares = computed(() => shareList.value.filter(s => s.status === 'active').length)
const expiredShares = computed(() => shareList.value.filter(s => s.status === 'expired').length)
const totalShares = computed(() => shareList.value.length)

// 筛选条件
const filters = ref({
  status: '',
  department: '',
  keyword: ''
})

// 分页配置
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

// 表单数据
const addShareFormRef = ref<FormInstance>()
const addShareForm = ref({
  dataId: '',
  doctorId: '',
  permission: 'read',
  expiry: '7',
  password: '',
  notes: ''
})

// 表单验证规则
const addShareRules: FormRules = {
  dataId: [
    { required: true, message: '请选择要分享的数据', trigger: 'change' }
  ],
  doctorId: [
    { required: true, message: '请选择授权医生', trigger: 'change' }
  ],
  permission: [
    { required: true, message: '请选择权限级别', trigger: 'change' }
  ],
  expiry: [
    { required: true, message: '请选择有效期', trigger: 'change' }
  ]
}

// 医生列表
const doctorList = ref<any[]>([])

// 可分享的数据列表
const availableData = computed(() => medicalDataStore.files || [])

// 加载分享列表
const loadShareList = async () => {
  loading.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) {
      throw new Error('用户未登录')
    }
    
    const response = await shareApi.getSharesByPatientId(userId, {
      status: filters.value.status || undefined,
      page: pagination.value.current,
      pageSize: pagination.value.size
    })
    
    if (response.success && response.data) {
      shareList.value = response.data.shares || []
      pagination.value.total = response.data.total || shareList.value.length
    }
  } catch (error: any) {
    console.error('加载分享列表失败:', error)
    ElMessage.error('加载分享列表失败')
  } finally {
    loading.value = false
  }
}

// 模拟数据（保留一些以防API未实现时显示）
const mockShareList = ref([
  {
    id: 'mock-1',
    dataId: 1,
    dataName: '血常规检查报告',
    dataType: '检验报告',
    doctorId: 1,
    doctorName: '张医生',
    department: '心血管科',
    permission: 'full',
    status: 'active',
    shareTime: '2024-01-15 10:30',
    expiry: '7',
    expiryTime: '2024-01-22 10:30',
    accessCount: 3,
    lastAccess: '2024-01-18 14:20',
    shareUrl: 'https://example.com/share/medical-data/1',
    notes: '急诊检查结果，请及时查看'
  },
  {
    id: 2,
    dataId: 2,
    dataName: '心电图检查',
    dataType: '检验报告',
    doctorId: 1,
    doctorName: '张医生',
    department: '心血管科',
    permission: 'download',
    status: 'active',
    shareTime: '2024-01-12 15:45',
    expiry: '30',
    expiryTime: '2024-02-11 15:45',
    accessCount: 1,
    lastAccess: '2024-01-13 09:15',
    shareUrl: 'https://example.com/share/medical-data/2',
    notes: ''
  },
  {
    id: 3,
    dataId: 3,
    dataName: '胸部X光片',
    dataType: '影像资料',
    doctorId: 2,
    doctorName: '李医生',
    department: '呼吸内科',
    permission: 'read',
    status: 'expired',
    shareTime: '2024-01-05 09:20',
    expiry: '7',
    expiryTime: '2024-01-12 09:20',
    accessCount: 5,
    lastAccess: '2024-01-11 16:30',
    shareUrl: 'https://example.com/share/medical-data/3',
    notes: '复查结果对比'
  }
])

// 可用数据列表
// doctorList 保留模拟数据（可以后续从API获取）
// const doctorList = ref([
//   { id: 1, name: '张医生', department: '心血管科', phone: '138****1234' },
//   { id: 2, name: '李医生', department: '呼吸内科', phone: '139****5678' },
//   { id: 3, name: '王医生', department: '消化内科', phone: '137****9012' },
//   { id: 4, name: '赵医生', department: '神经内科', phone: '136****3456' },
//   { id: 5, name: '刘医生', department: '骨科', phone: '135****7890' }
// ])
// 注：doctorList 已在前面定义

// 计算过滤后的数据
const filteredShareList = computed(() => {
  let result = shareList.value

  // 按科室筛选（本地筛选，因为API可能不支持科室筛选）
  if (filters.value.department) {
    result = result.filter(item => item.department === filters.value.department)
  }

  // 按关键词搜索（本地搜索）
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(item => 
      (item.doctorName && item.doctorName.toLowerCase().includes(keyword)) ||
      (item.dataName && item.dataName.toLowerCase().includes(keyword))
    )
  }

  // 分页由API处理，这里返回全部
  return result
})

// 处理函数
const showAddShareDialog = () => {
  addShareDialogVisible.value = true
  resetAddShareForm()
}

const resetAddShareForm = () => {
  if (addShareFormRef.value) {
    addShareFormRef.value.resetFields()
  }
  addShareForm.value = {
    dataId: '',
    doctorId: '',
    permission: 'read',
    expiry: '7',
    password: '',
    notes: ''
  }
}

const handleAddShare = async () => {
  if (!addShareFormRef.value) return
  
  try {
    await addShareFormRef.value.validate()
    submitLoading.value = true
    
    const expiryDate = addShareForm.value.expiry === '0' 
      ? undefined 
      : new Date(Date.now() + parseInt(addShareForm.value.expiry) * 24 * 60 * 60 * 1000).toISOString()
    
    const response = await shareApi.createShare({
      fileId: addShareForm.value.dataId,
      doctorId: addShareForm.value.doctorId,
      permissions: [addShareForm.value.permission],
      expiresAt: expiryDate,
      accessPassword: addShareForm.value.password || undefined,
      shareReason: addShareForm.value.notes || undefined
    })
    
    if (response.success) {
      ElMessage.success('分享权限创建成功')
      addShareDialogVisible.value = false
      resetAddShareForm()
      await loadShareList() // 重新加载列表
    } else {
      throw new Error(response.message || '创建分享失败')
    }
    
  } catch (error: any) {
    console.error('创建分享失败:', error)
    ElMessage.error(error.message || '创建分享失败')
  } finally {
    submitLoading.value = false
  }
}

const calculateExpiryTime = (expiry: string) => {
  if (expiry === '0') return 'permanent'
  
  const days = parseInt(expiry)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + days)
  return expiryDate.toLocaleString()
}

const showBatchDialog = () => {
  batchDialogVisible.value = true
}

const handleSelectionChange = (selection: any[]) => {
  selectedShares.value = selection
}

const viewShareDetails = (row: any) => {
  currentShareDetail.value = row
  detailDialogVisible.value = true
}

const editShare = (row: any) => {
  ElMessage.info('编辑功能开发中')
}

const copyShareLink = async (row: any) => {
  try {
    await navigator.clipboard.writeText(row.shareUrl)
    ElMessage.success('分享链接已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const revokeShare = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要撤销对"${row.doctorName}"的分享权限吗？撤销后该医生将无法继续访问相关数据。`,
      '撤销分享权限',
      {
        confirmButtonText: '确定撤销',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    const response = await shareApi.revokeShare(row.id)
    
    if (response.success) {
      ElMessage.success('分享权限已撤销')
      await loadShareList() // 重新加载列表
    } else {
      throw new Error(response.message || '撤销失败')
    }
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('撤销分享失败:', error)
      ElMessage.error(error.message || '撤销分享失败')
    }
  } finally {
    loading.value = false
  }
}

// 批量操作
const batchUpdateExpiry = () => {
  ElMessage.info('批量延期功能开发中')
}

const batchUpdatePermission = () => {
  ElMessage.info('批量修改权限功能开发中')
}

const batchPause = () => {
  ElMessage.info('批量暂停功能开发中')
}

const batchRevoke = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要撤销所选的 ${selectedShares.value.length} 个分享权限吗？`,
      '批量撤销分享权限',
      {
        confirmButtonText: '确定撤销',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    selectedShares.value.forEach(share => {
      if (share.isRealShare) {
        // 如果是实际分享数据，从localStorage中删除
        removeFromLocalStorage(share.id)
        const realIndex = realShareList.value.findIndex(item => item.id === share.id)
        if (realIndex !== -1) {
          realShareList.value.splice(realIndex, 1)
        }
      } else {
        // 如果是模拟数据，从shareList中删除
        const index = shareList.value.findIndex(item => item.id === share.id)
        if (index !== -1) {
          shareList.value.splice(index, 1)
        }
      }
    })
    
    selectedShares.value = []
    batchDialogVisible.value = false
    ElMessage.success('批量撤销成功')
  } catch {
    // 用户取消操作
  }
}

const refreshData = async () => {
  try {
    await loadShareList()
    await medicalDataStore.getFiles() // 同时刷新医疗数据列表
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

const handleSizeChange = (size: number) => {
  pagination.value.size = size
  loadShareList() // 重新加载数据
}

const handleCurrentChange = (current: number) => {
  pagination.value.current = current
  loadShareList() // 重新加载数据
}

// 辅助函数
const getPermissionTagType = (permission: string) => {
  const types = {
    read: 'info',
    download: 'warning',
    full: 'success'
  }
  return types[permission as keyof typeof types] || 'info'
}

const getPermissionText = (permission: string) => {
  const texts = {
    read: '只读',
    download: '可下载',
    full: '完全访问'
  }
  return texts[permission as keyof typeof texts] || '只读'
}

const getStatusTagType = (status: string) => {
  const types = {
    active: 'success',
    expired: 'danger',
    paused: 'warning',
    expiring: 'warning'
  }
  return types[status as keyof typeof types] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    active: '活跃中',
    expired: '已过期',
    paused: '已暂停',
    expiring: '即将过期'
  }
  return texts[status as keyof typeof texts] || '未知'
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 从localStorage加载实际分享数据
const loadRealShareData = () => {
  const realShares: any[] = []
  
  // 遍历localStorage中的所有分享数据
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('medical_share_')) {
      try {
        const shareData = JSON.parse(localStorage.getItem(key) || '{}')
        
        if (shareData.data && shareData.shareInfo) {
          // 将localStorage中的数据转换为ShareView.vue期望的格式
          const convertedShare = {
            id: shareData.shareInfo.shareId || shareData.data.id,
            dataId: shareData.data.id,
            dataName: shareData.data.name,
            dataType: shareData.data.type,
            doctorId: shareData.shareInfo.doctorInfo?.id || null,
            doctorName: shareData.shareInfo.doctorInfo?.name || '未指定医生',
            department: shareData.shareInfo.doctorInfo?.department || '未指定',
            permission: shareData.shareInfo.permission || 'read',
            status: determineShareStatus(shareData.shareInfo),
            shareTime: formatDateTime(new Date(shareData.shareInfo.shareTime)),
            expiry: shareData.shareInfo.expiry === 'permanent' ? '0' : parseExpiryDays(shareData.shareInfo.expiry),
            expiryTime: shareData.shareInfo.expiry === 'permanent' ? 'permanent' : calculateFixedExpiryTime(shareData.shareInfo.shareTime, shareData.shareInfo.expiry),
            accessCount: 0, // localStorage中没有访问计数
            lastAccess: null,
            shareUrl: generateShareUrl(shareData.shareInfo.shareId, shareData.shareInfo.expiry, shareData.shareInfo.hasPassword),
            notes: shareData.shareInfo.notes || '',
            // 额外信息
            hasPassword: shareData.shareInfo.hasPassword,
            password: shareData.shareInfo.password,
            sharedBy: shareData.shareInfo.sharedBy,
            doctorInfo: shareData.shareInfo.doctorInfo,
            isRealShare: true // 标记为实际分享数据
          }
          
          realShares.push(convertedShare)
        }
      } catch (error) {
        console.error('解析分享数据失败:', key, error)
      }
    }
  }
  
  realShareList.value = realShares
}


// 根据分享信息确定分享状态
const determineShareStatus = (shareInfo: any) => {
  if (!shareInfo.expiry || shareInfo.expiry === 'permanent') {
    return 'active'
  }
  
  // 解析过期时间
  const expiryTime = parseExpiryTime(shareInfo.expiry)
  const now = new Date()
  
  if (expiryTime && expiryTime < now) {
    return 'expired'
  }
  
  // 检查是否即将过期（24小时内）
  if (expiryTime && (expiryTime.getTime() - now.getTime()) < 24 * 60 * 60 * 1000) {
    return 'expiring'
  }
  
  return 'active'
}

// 解析过期时间字符串（如 "7d"）
const parseExpiryTime = (expiry: string) => {
  if (expiry === 'permanent') return null
  
  const match = expiry.match(/^(\d+)d$/)
  if (match) {
    const days = parseInt(match[1])
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)
    return expiryDate
  }
  
  return null
}

// 从过期时间字符串提取天数
const parseExpiryDays = (expiry: string) => {
  if (expiry === 'permanent') return '0'
  
  const match = expiry.match(/^(\d+)d$/)
  return match ? match[1] : '7'
}

// 根据过期时间计算具体的过期时间
const calculateExpiryTimeFromExpiry = (expiry: string) => {
  const expiryTime = parseExpiryTime(expiry)
  return expiryTime ? expiryTime.toLocaleString() : '永久有效'
}

// 格式化时间为统一格式 YYYY-MM-DD HH:MM
const formatDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 基于分享时间计算固定的过期时间
const calculateFixedExpiryTime = (shareTime: string, expiry: string) => {
  if (expiry === 'permanent') return '永久有效'
  
  const shareDate = new Date(shareTime)
  const match = expiry.match(/^(\d+)d$/)
  if (match) {
    const days = parseInt(match[1])
    const expiryDate = new Date(shareDate)
    expiryDate.setDate(expiryDate.getDate() + days)
    return formatDateTime(expiryDate)
  }
  
  return '永久有效'
}

// 生成分享URL
const generateShareUrl = (shareId: string, expiry: string, hasPassword: boolean) => {
  const baseUrl = window.location.origin
  const passwordParam = hasPassword ? '&pwd=true' : ''
  return `${baseUrl}/share/medical-data/${shareId}?expiry=${expiry}${passwordParam}`
}

// 同步删除localStorage中的分享数据
const removeFromLocalStorage = (shareId: string) => {
  const shareKey = `medical_share_${shareId}`
  localStorage.removeItem(shareKey)
}

// Storage事件监听器，监听localStorage变化
const handleStorageChange = (event: StorageEvent) => {
  // 只监听medical_share_开头的key变化
  if (event.key && event.key.startsWith('medical_share_')) {
    console.log('检测到新的分享数据:', event.key)
    // 重新加载分享数据
    loadRealShareData()
    ElMessage.success('检测到新的分享记录，已自动更新列表')
  }
}

// 自定义事件监听器，监听分享事件
const handleMedicalDataShared = (event: CustomEvent) => {
  console.log('接收到分享事件:', event.detail)
  // 立即重新加载分享数据
  loadRealShareData()
  ElMessage.success('新的分享记录已添加到列表中')
}

// 组件挂载时初始化数据
onMounted(async () => {
  // 加载分享列表
  await loadShareList()
  // 加载医疗数据列表（用于分享时选择）
  await medicalDataStore.getFiles()
})

// 组件卸载时清理（如需要）
onUnmounted(() => {
  // 清理工作
})
</script>

<style scoped>
.share-management {
  padding: 24px;
  background: #f8fafc;
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

.stat-card.active {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
}

.stat-card.expired {
  background: linear-gradient(135deg, #f5222d, #cf1322);
  color: white;
}

.stat-card.total {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
}

.stat-content {
  text-align: center;
  padding: 16px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
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
  gap: 16px;
}

.filter-right {
  display: flex;
  align-items: center;
}

/* 分享列表 */
.share-list-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.data-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.data-icon {
  color: #1890ff;
  font-size: 20px;
}

.data-details {
  flex: 1;
}

.data-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.data-type {
  font-size: 12px;
  color: #999;
}

.pagination-wrapper {
  margin-top: 24px;
  text-align: right;
}

/* 对话框内容 */
.data-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.batch-content {
  text-align: center;
}

.batch-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.share-detail {
  max-height: 60vh;
  overflow-y: auto;
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
  
  .batch-actions {
    grid-template-columns: 1fr;
  }
}
</style>