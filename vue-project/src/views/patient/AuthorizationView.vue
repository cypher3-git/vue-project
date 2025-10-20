<template>
  <div class="authorization-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>授权管理</h2>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select 
            v-model="filters.status" 
            placeholder="请求状态" 
            clearable 
            style="width: 150px; margin-right: 16px;"
          >
            <el-option label="全部状态" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已同意" value="approved" />
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
          <el-input
            v-model="filters.keyword"
            placeholder="搜索医生姓名或数据名称"
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

    <!-- 统计信息 -->
    <el-card class="stats-card">
      <div class="stats-row">
        <div class="stats-left">
          <h3 class="view-title">授权申请管理</h3>
        </div>
        <div class="stats-right">
          <el-tag type="info" size="small">
            共 {{ totalDataCount }} 份数据，{{ filteredRequests.length }} 个申请
          </el-tag>
        </div>
      </div>
    </el-card>

    <!-- 数据分组视图 -->
    <el-card class="grouped-view-card">
      <div v-for="group in groupedRequests" :key="group.dataId" class="data-group">
        <!-- 数据组头部 -->
        <div class="group-header" @click="toggleGroup(group.dataId)">
          <div class="group-info">
            <div class="data-title">
              <el-icon class="expand-icon" :class="{ expanded: group.expanded }">
                <ArrowRight />
              </el-icon>
              <span class="data-name">{{ group.dataName }}</span>
              <el-tag size="small" type="info">{{ getDataTypeLabel(group.dataType) }}</el-tag>
            </div>
            <div class="group-stats">
              <el-tag v-if="group.pendingCount > 0" type="warning" size="small">
                {{ group.pendingCount }} 个待处理
              </el-tag>
              <el-tag v-if="group.approvedCount > 0" type="success" size="small">
                {{ group.approvedCount }} 个已同意
              </el-tag>
              <el-tag v-if="group.rejectedCount > 0" type="danger" size="small">
                {{ group.rejectedCount }} 个已拒绝
              </el-tag>
            </div>
          </div>
          <div class="group-actions">
            </div>
        </div>
        
        <!-- 展开的医生申请列表 -->
        <div v-show="group.expanded" class="group-content">
          <!-- 表头 -->
          <div class="group-table-header">
            <div class="header-col header-doctor-name">医生姓名</div>
            <div class="header-col header-doctor-id">医生身份证号</div>
            <div class="header-col header-reason">申请理由</div>
            <div class="header-col header-purpose">使用目的</div>
            <div class="header-col header-status">状态</div>
            <div class="header-col header-actions">操作</div>
            </div>
          
          <!-- 医生申请行 -->
          <div v-for="request in group.requests" :key="request.id" class="doctor-request-item">
            <div class="item-col col-doctor-name" data-label="医生姓名：">
              <div class="doctor-name">{{ getDisplayName(request) }}</div>
            </div>
            
            <div class="item-col col-doctor-id" data-label="身份证号：">
              <div class="doctor-id-card">{{ getDisplayIdCard(request) }}</div>
            </div>
            
            <div class="item-col col-reason" data-label="申请理由：">
              <div class="reason-text">{{ getRequestReasonOnly(request.reason) }}</div>
            </div>
            
            <div class="item-col col-purpose" data-label="使用目的：">
              <div class="purpose-text">{{ getRequestPurpose(request.reason, request.purpose) }}</div>
            </div>
            
            <div class="item-col col-status" data-label="状态：">
              <el-tag :type="getStatusType(request.status)" size="small">
                {{ getStatusText(request.status) }}
            </el-tag>
            </div>
        
            <div class="item-col col-actions">
            <div class="action-buttons">
              <!-- 第一行：同意/拒绝/身份溯源 -->
              <div class="action-row">
                <el-button 
                    v-if="request.status === 'pending'"
                  type="success" 
                  size="small" 
                    @click="approveRequest(request)"
                >
                  同意并支付
                </el-button>
                <el-button 
                    v-if="request.status === 'pending'"
                  type="danger" 
                  size="small" 
                    @click="rejectRequest(request)"
                >
                  拒绝
                </el-button>
                <el-button 
                    :type="getIdentityButtonType(request)" 
                  size="small" 
                    :disabled="!canRevealIdentity(request)"
                    @click="revealIdentity(request)"
                >
                    {{ getIdentityButtonText(request) }}
                </el-button>
              </div>
              <!-- 第二行：详情 -->
              <div class="action-row">
                <el-button 
                  type="text" 
                  size="small" 
                    @click="viewDetail(request)"
                >
                  详情
                </el-button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="groupedRequests.length === 0" class="empty-state">
        <el-empty description="暂无授权申请" />
      </div>
    </el-card>


    <!-- 授权详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="授权请求详情" width="700px">
      <div v-if="selectedRequest" class="request-detail">
        <el-alert
          title="提示"
          description="医生身份信息已隐藏，点击【身份溯源】查看医生详情和访问记录"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="请求数据">{{ selectedRequest.dataName }}</el-descriptions-item>
          <el-descriptions-item label="数据类型">{{ getDataTypeLabel(selectedRequest.dataType) }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDetailDateTime(selectedRequest.requestedAt) }}</el-descriptions-item>
          <el-descriptions-item label="使用目的">{{ getRequestPurpose(selectedRequest.reason, selectedRequest.purpose) }}</el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">
            {{ getRequestReasonOnly(selectedRequest.reason) }}
          </el-descriptions-item>
          <el-descriptions-item label="请求状态">
            <el-tag :type="getStatusType(selectedRequest.status)">
              {{ getStatusText(selectedRequest.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="selectedRequest.processedAt">
            {{ formatDetailDateTime(selectedRequest.processedAt) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="selectedRequest.status === 'rejected' && selectedRequest.rejectReason" style="margin-top: 20px;">
          <el-alert
            title="拒绝理由"
            :description="selectedRequest.rejectReason"
            type="warning"
            :closable="false"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedRequest && selectedRequest.status === 'pending'"
            type="success" 
            @click="approveRequest(selectedRequest)"
          >
            同意并支付
          </el-button>
          <el-button 
            v-if="selectedRequest && selectedRequest.status === 'pending'"
            type="danger" 
            @click="rejectRequest(selectedRequest)"
          >
            拒绝授权
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 同意授权对话框 -->
    <el-dialog v-model="approveDialogVisible" title="同意授权并支付" width="500px">
      <div v-if="selectedRequest" class="approve-content">
        <el-alert
          title="提示"
          description="授权后，该医生将能够查看此数据的详细内容。"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />
        
        <el-form :model="approveForm" label-width="100px">
          <el-form-item label="有效期">
            <el-select v-model="approveForm.expiresIn" style="width: 100%">
              <el-option label="7天" :value="7" />
              <el-option label="30天" :value="30" />
              <el-option label="90天" :value="90" />
              <el-option label="永久" :value="0" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="approveForm.notes"
              type="textarea"
              :rows="3"
              placeholder="可选，添加授权说明"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button type="success" @click="confirmApprove" :loading="submitting">
            确认授权并支付
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 拒绝授权对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝授权" width="500px">
      <div v-if="selectedRequest" class="reject-content">
        <el-alert
          title="提示"
          description="请说明拒绝授权的理由，以便医生了解情况。"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px;"
        />
        
        <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef" label-width="100px">
          <el-form-item label="拒绝理由" prop="reason">
            <el-input
              v-model="rejectForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入拒绝理由"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject" :loading="submitting">
            确认拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { patientApi } from '@/api'
import type { AuthorizationRequest, FileCategory } from '@/types/medicalData'
import { MEDICAL_DATA_TYPE_MAP } from '@/types/medicalData'
import { maskName, maskIdCard, displayByUnlockStatus } from '@/utils/privacy'

// 响应式数据
const loading = ref(false)
const detailDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const selectedRequest = ref<AuthorizationRequest | null>(null)
const submitting = ref(false)

// 视图模式控制

// 筛选条件
const filters = ref({
  status: '',
  dateRange: [] as any[],
  keyword: ''
})

// 分页配置
const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})

// 表单
const approveForm = ref({
  expiresIn: 30,
  notes: ''
})

const rejectFormRef = ref<FormInstance>()
const rejectForm = ref({
  reason: ''
})

const rejectRules: FormRules = {
  reason: [
    { required: true, message: '请输入拒绝理由', trigger: 'blur' },
    { min: 5, message: '拒绝理由至少5个字符', trigger: 'blur' }
  ]
}

// 请求列表
const requestList = ref<AuthorizationRequest[]>([])

// 分组展开状态
const expandedGroups = ref<Set<string>>(new Set())

// 加载授权请求列表
const loadRequests = async () => {
  loading.value = true
  try {
    // 调用真实API获取授权请求列表
    const response = await patientApi.getAuthorizationRequests({
      status: filters.value.status as any,
      page: pagination.value.current,
      pageSize: pagination.value.size
    })
    
    if (response.success && response.data) {
      requestList.value = response.data.items || []
      pagination.value.total = response.data.total || 0
    } else {
      requestList.value = []
      pagination.value.total = 0
      ElMessage.warning(response.message || '暂无授权请求数据')
    }
  } catch (error) {
    console.error('加载授权请求列表失败:', error)
    ElMessage.error('加载授权请求列表失败')
  } finally {
    loading.value = false
  }
}

// 过滤请求列表
const filteredRequests = computed(() => {
  let result = requestList.value

  // 按状态筛选
  if (filters.value.status) {
    result = result.filter(req => req.status === filters.value.status)
  }

  // 按关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(req => 
      req.doctorName.toLowerCase().includes(keyword) ||
      req.dataName.toLowerCase().includes(keyword)
    )
  }

  pagination.value.total = result.length
  return result
})

// 总数据数量统计
const totalDataCount = computed(() => {
  const dataIds = new Set(requestList.value.map(req => req.dataId))
  return dataIds.size
})

// 按数据分组的请求
const groupedRequests = computed(() => {
  const groups = new Map<string, {
    dataId: string
    dataName: string
    dataType: string
    requests: AuthorizationRequest[]
    pendingCount: number
    approvedCount: number
    rejectedCount: number
    expanded: boolean
  }>()

  // 对过滤后的请求进行分组
  filteredRequests.value.forEach(request => {
    const key = request.dataId
    if (!groups.has(key)) {
      groups.set(key, {
        dataId: request.dataId,
        dataName: request.dataName,
        dataType: request.dataType,
        requests: [],
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        expanded: expandedGroups.value.has(key)
      })
    }
    
    const group = groups.get(key)!
    group.requests.push(request)
    
    // 统计各状态数量
    switch (request.status) {
      case 'pending':
        group.pendingCount++
        break
      case 'approved':
        group.approvedCount++
        break
      case 'rejected':
        group.rejectedCount++
        break
    }
  })

  // 为每个数据组计算最近一次操作时间
  const groupsWithLatestTime = Array.from(groups.values()).map(group => {
    // 找到该组中最近的操作时间
    const latestTime = group.requests
      .map(request => {
        // 优先使用处理时间，没有则使用申请时间
        const timeStr = request.processedAt || request.requestedAt
        return new Date(timeStr).getTime()
      })
      .reduce((latest, current) => Math.max(latest, current), 0)
    
    return {
      ...group,
      latestOperationTime: latestTime
    }
  })
  
  // 按最近操作时间排序，越近的越靠前
  return groupsWithLatestTime.sort((a, b) => {
    return b.latestOperationTime - a.latestOperationTime
  })
})

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'approved': return '已同意'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
}

// 获取显示的医生姓名（脱敏/真实）
const getDisplayName = (request: AuthorizationRequest): string => {
  return displayByUnlockStatus(request.doctorName, request.isIdentityRevealed)
}

// 获取显示的医生身份证号（脱敏/真实）
const getDisplayIdCard = (request: AuthorizationRequest): string => {
  return displayByUnlockStatus(request.doctorIdCard, request.isIdentityRevealed)
}

// 判断是否可以进行身份溯源
const canRevealIdentity = (request: AuthorizationRequest): boolean => {
  // 只有已同意的授权且未溯源的才可以进行身份溯源
  return request.status === 'approved' && !request.isIdentityRevealed
}

// 获取身份溯源按钮类型（颜色）
const getIdentityButtonType = (request: AuthorizationRequest): string => {
  if (request.isIdentityRevealed) {
    return 'info'  // 已溯源：灰色
  } else if (request.status === 'approved') {
    return 'warning'  // 可溯源：橙色
  } else {
    return 'default'  // 不可溯源：暗灰色
  }
}

// 获取身份溯源按钮文本
const getIdentityButtonText = (request: AuthorizationRequest): string => {
  if (request.isIdentityRevealed) {
    return '已溯源'
  } else if (request.status === 'approved') {
    return '身份溯源'
  } else {
    return '身份溯源'  // 显示相同文本但不可点击
  }
}

// 查看详情
const viewDetail = (request: any) => {
  selectedRequest.value = request
  detailDialogVisible.value = true
}

// 同意授权
const approveRequest = (request: any) => {
  selectedRequest.value = request
  approveForm.value = {
    expiresIn: 30,
    notes: ''
  }
  detailDialogVisible.value = false
  approveDialogVisible.value = true
}

// 确认同意
const confirmApprove = async () => {
  if (!selectedRequest.value) return
  
  try {
    submitting.value = true
    
    // 调用 API 同意授权
    await patientApi.approveAuthorization({
      requestId: selectedRequest.value.id,
      expiresIn: approveForm.value.expiresIn,
      notes: approveForm.value.notes
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('已同意授权申请并支付诊费')
    approveDialogVisible.value = false
    
    // 更新列表中的状态
    const index = requestList.value.findIndex(r => r.id === selectedRequest.value?.id)
    if (index !== -1) {
      requestList.value[index].status = 'approved'
      requestList.value[index].processedAt = new Date().toLocaleString('zh-CN')
    }
    
  } catch (error) {
    console.error('同意授权失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 拒绝授权
const rejectRequest = (request: any) => {
  selectedRequest.value = request
  rejectForm.value = {
    reason: ''
  }
  detailDialogVisible.value = false
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectFormRef.value || !selectedRequest.value) return
  
  try {
    await rejectFormRef.value.validate()
    
    submitting.value = true
    
    // 调用 API 拒绝授权
    await patientApi.rejectAuthorization({
      requestId: selectedRequest.value.id,
      reason: rejectForm.value.reason
    })
    
    ElMessage.success('已拒绝授权申请')
    rejectDialogVisible.value = false
    
    // 重新加载列表
    await loadRequests()
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('拒绝授权失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

// 显示医生真实身份信息
const revealIdentity = async (request: AuthorizationRequest) => {
  // 检查是否可以进行身份溯源
  if (!canRevealIdentity(request)) {
    ElMessage.warning('只有已同意的授权才能进行身份溯源')
    return
  }

  try {
    loading.value = true
    
    // 调用简化的身份溯源API
    const response = await patientApi.revealDoctorIdentity(request.id)
    
    if (response.success) {
      // 更新请求对象的状态，显示真实身份信息
      const index = requestList.value.findIndex(r => r.id === request.id)
      if (index !== -1) {
        requestList.value[index].isIdentityRevealed = true
      }
      
      ElMessage.success('医生身份信息已显示')
    } else {
      ElMessage.error(response.message || '身份溯源失败')
    }
  } catch (error: any) {
    console.error('身份溯源失败:', error)
    ElMessage.error('身份溯源失败，请重试')
  } finally {
    loading.value = false
  }
}


// 获取数据类型标签
const getDataTypeLabel = (dataType: string): string => {
  return MEDICAL_DATA_TYPE_MAP[dataType as FileCategory] || dataType || '未知类型'
}

// 使用目的映射表
const PURPOSE_MAP: Record<string, string> = {
  'diagnosis': '诊断治疗',
  'evaluation': '病情评估', 
  'research': '医学研究',
  'consultation': '会诊咨询',
  'other': '其他',
  '诊断治疗': '诊断治疗',
  '病情评估': '病情评估',
  '医学研究': '医学研究', 
  '会诊咨询': '会诊咨询',
  '其他': '其他',
  // 添加更多可能的格式
  'treatment': '诊断治疗',
  'assess': '病情评估',
  'study': '医学研究',
  'consult': '会诊咨询'
}



// 格式化详情对话框时间 - 年月日时分秒一行显示
const formatDetailDateTime = (dateString: string): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
    
    const timeStr = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    return `${dateStr} ${timeStr}`
  } catch (error) {
    return '-'
  }
}

// 从申请理由中提取使用目的并转换为中文
const getRequestPurpose = (reason: string, directPurpose?: string): string => {
  // 优先使用直接的purpose字段
  if (directPurpose) {
    return PURPOSE_MAP[directPurpose] || directPurpose
  }
  
  if (!reason) {
    console.log('使用目的解析: reason为空')
    return '-'
  }
  
  // 调试信息
  console.log('使用目的解析 - reason内容:', reason)
  
  // 匹配使用目的行 - 支持多种格式
  const purposeMatch = reason.match(/使用目的[：:]\s*([^\n\r]+)/)
  if (!purposeMatch) {
    // 尝试匹配换行符分隔的格式
    const lines = reason.split('\n')
    console.log('使用目的解析 - 按行分割:', lines)
    
    for (const line of lines) {
      if (line.includes('使用目的')) {
        const match = line.match(/使用目的[：:]\s*(.+)/)
        if (match) {
          const purpose = match[1].trim()
          console.log('使用目的解析 - 找到目的:', purpose)
          return PURPOSE_MAP[purpose] || purpose || '-'
        }
      }
    }
    console.log('使用目的解析 - 未找到匹配')
    return '-'
  }
  
  const purpose = purposeMatch[1].trim()
  console.log('使用目的解析 - 直接匹配到目的:', purpose)
  return PURPOSE_MAP[purpose] || purpose || '-'
}

// 从申请理由中提取纯理由部分（去掉使用目的行）
const getRequestReasonOnly = (reason: string): string => {
  if (!reason) return '-'
  
  // 移除使用目的行，只保留理由内容
  // 使用更宽泛的正则表达式来匹配中文内容
  return reason
    .replace(/\n?使用目的[：:]\s*[^\n\r]*\n?/g, '')  // 移除换行中的使用目的行
    .replace(/^\s*使用目的[：:]\s*[^\n\r]*/g, '')   // 移除开头的使用目的
    .replace(/使用目的[：:]\s*[^\n\r]*/g, '')       // 移除任何位置的使用目的
    .trim() || '-'
}

// 分组展开/收起切换
const toggleGroup = (dataId: string) => {
  if (expandedGroups.value.has(dataId)) {
    expandedGroups.value.delete(dataId)
  } else {
    expandedGroups.value.add(dataId)
  }
}

// 简短时间格式化
const formatShortDateTime = (dateString: string): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    }
  } catch {
    return '-'
  }
}




// 组件挂载时初始化
onMounted(async () => {
  await loadRequests()
})
</script>

<style scoped>
.authorization-management {
  padding: 24px;
  background: #f5f7fa;
  padding-bottom: 340px; /* 为操作记录面板留出空间，320px + 20px间距 */
  box-sizing: border-box;
  transition: padding-bottom 0.3s ease; /* 平滑过渡 */
}


/* 页面头部 */
.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
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
}

/* 医生信息 */
.doctor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doctor-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.doctor-details {
  flex: 1;
}

.doctor-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.doctor-dept {
  font-size: 12px;
  color: #999;
}

/* 数据信息 */
.data-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-name {
  font-weight: 500;
  color: #2c3e50;
}

/* 理由文本 */
.reason-text {
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.action-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}


/* 对话框 */
.request-detail {
  padding: 20px 0;
}

.approve-content,
.reject-content {
  padding: 20px 0;
}

.dialog-footer {
  text-align: right;
}

/* 医生身份信息样式 */
.doctor-name {
  font-weight: 500;
  color: #2c3e50;
}

.doctor-id-card {
  font-family: monospace;
  color: #606266;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .authorization-management {
    padding: 16px;
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

.data-info, .doctor-name, .doctor-id-card, .reason-text, .purpose-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* 使用目的样式 */
.purpose-text {
  font-weight: 500;
  color: #409eff;
  font-size: 13px;
  padding: 4px 8px;
  background: #ecf5ff;
  border-radius: 4px;
  border: 1px solid #d9ecff;
}

/* 申请理由样式优化 */
.reason-text {
  line-height: 1.4;
  max-width: 160px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* 统计信息卡片样式 */
.stats-card {
  margin-bottom: 16px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.view-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.view-subtitle {
  font-size: 13px;
  color: #909399;
  font-weight: 400;
}

.stats-right {
  display: flex;
  align-items: center;
}

/* 分组视图样式 */
.grouped-view-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.data-group {
  border-bottom: 1px solid #f0f0f0;
}

.data-group:last-child {
  border-bottom: none;
}

.group-header {
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-header:hover {
  background-color: #f8f9fa;
}

.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  transition: transform 0.3s ease;
  color: #909399;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.data-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.group-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.group-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.group-content {
  background-color: #fafbfc;
  border-top: 1px solid #e9ecef;
}

/* 分组表格头部 */
.group-table-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  padding: 12px 20px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.header-col {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 8px;
}

.header-doctor-name {
  width: 120px;
}

.header-doctor-id {
  width: 160px;
}

.header-reason {
  flex: 1;
  min-width: 180px;
}

.header-purpose {
  width: 120px;
}

.header-status {
  width: 100px;
}

.header-actions {
  width: 280px;
}

/* 医生申请行 */
.doctor-request-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.doctor-request-item:hover {
  background-color: #f8f9fa;
}

.doctor-request-item:last-child {
  border-bottom: none;
}

.item-col {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 8px;
}

.col-doctor-name {
  width: 120px;
}

.col-doctor-id {
  width: 160px;
}

.col-reason {
  flex: 1;
  min-width: 180px;
}

.col-purpose {
  width: 120px;
}

.col-status {
  width: 100px;
}

.col-actions {
  width: 280px;
}

/* 内容样式 */
.doctor-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.doctor-id-card {
  font-family: monospace;
  color: #606266;
  font-size: 13px;
}

.reason-text {
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  text-align: left;
  width: 100%;
}

.purpose-text {
  font-weight: 500;
  color: #409eff;
  font-size: 13px;
  padding: 4px 8px;
  background: #ecf5ff;
  border-radius: 4px;
  border: 1px solid #d9ecff;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.action-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

/* 响应式设计 - 移动端调整操作记录面板间距 */
@media (max-width: 768px) {
  .authorization-management {
    padding: 16px;
    padding-bottom: 300px; /* 为移动端操作记录面板留出空间，280px + 20px间距 */
  }
  
  .stats-row {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .group-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .group-actions {
    justify-content: center;
  }
  
  .group-table-header {
    display: none; /* 移动端隐藏表头 */
  }
  
  .doctor-request-item {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 16px;
    border-radius: 8px;
    margin: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .item-col {
    width: auto !important;
    justify-content: flex-start;
    text-align: left;
    padding: 4px 0;
  }
  
  .col-reason .reason-text {
    text-align: left;
    -webkit-line-clamp: 3; /* 移动端允许更多行 */
    line-clamp: 3;
  }
  
  .col-purpose {
    justify-content: flex-start;
  }
  
  .col-status {
    justify-content: flex-start;
  }
  
  .col-actions {
    justify-content: center;
  }
  
  /* 移动端添加标签前缀 */
  .item-col::before {
    content: attr(data-label);
    font-weight: 600;
    color: #909399;
    font-size: 12px;
    margin-right: 8px;
    min-width: 80px;
  }
  
  .col-actions::before {
    display: none;
  }
}
</style>


