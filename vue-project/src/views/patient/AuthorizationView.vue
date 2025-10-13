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

    <!-- 授权请求列表 -->
    <el-card class="request-list-card">
      <el-table 
        :data="filteredRequests" 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column label="请求数据" width="200">
          <template #default="scope">
            <div class="data-info">
              <div class="data-name">{{ scope.row.dataName }}</div>
              <el-tag size="small" type="info">{{ scope.row.dataType }}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="医生姓名" width="120">
          <template #default="scope">
            <div class="doctor-name">
              {{ getDisplayName(scope.row) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="医生身份证" width="160">
          <template #default="scope">
            <div class="doctor-id-card">
              {{ getDisplayIdCard(scope.row) }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="申请理由" min-width="180">
          <template #default="scope">
            <div class="reason-text">{{ scope.row.reason }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="requestedAt" label="申请时间" width="160" />
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <!-- 第一行：同意/拒绝/身份溯源 -->
              <div class="action-row">
                <el-button 
                  v-if="scope.row.status === 'pending'"
                  type="success" 
                  size="small" 
                  @click="approveRequest(scope.row)"
                >
                  同意
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'pending'"
                  type="danger" 
                  size="small" 
                  @click="rejectRequest(scope.row)"
                >
                  拒绝
                </el-button>
                <el-button 
                  :type="getIdentityButtonType(scope.row)" 
                  size="small" 
                  :disabled="!canRevealIdentity(scope.row)"
                  @click="revealIdentity(scope.row)"
                >
                  {{ getIdentityButtonText(scope.row) }}
                </el-button>
              </div>
              <!-- 第二行：详情 -->
              <div class="action-row">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="viewDetail(scope.row)"
                >
                  详情
                </el-button>
              </div>
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
          <el-descriptions-item label="数据类型">{{ selectedRequest.dataType }}</el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="2">{{ selectedRequest.requestedAt }}</el-descriptions-item>
          <el-descriptions-item label="使用目的" :span="2">{{ selectedRequest.purpose }}</el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">
            {{ selectedRequest.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="请求状态">
            <el-tag :type="getStatusType(selectedRequest.status)">
              {{ getStatusText(selectedRequest.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="selectedRequest.processedAt">
            {{ selectedRequest.processedAt }}
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
            同意授权
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
    <el-dialog v-model="approveDialogVisible" title="同意授权" width="500px">
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
            确认授权
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
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { patientApi } from '@/api'
import type { AuthorizationRequest } from '@/types/medicalData'
import { maskName, maskIdCard } from '@/utils/privacy'

// 响应式数据
const loading = ref(false)
const detailDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const selectedRequest = ref<AuthorizationRequest | null>(null)
const submitting = ref(false)

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
  if (request.isIdentityRevealed) {
    return request.doctorName
  } else {
    return maskName(request.doctorName)
  }
}

// 获取显示的医生身份证号（脱敏/真实）
const getDisplayIdCard = (request: AuthorizationRequest): string => {
  if (request.isIdentityRevealed) {
    return request.doctorIdCard
  } else {
    return maskIdCard(request.doctorIdCard)
  }
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
    
    ElMessage.success('已同意授权申请')
    approveDialogVisible.value = false
    
    // 更新列表中的状态
    const index = requestList.value.findIndex(r => r.id === selectedRequest.value.id)
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


// 分页处理
const handleSizeChange = async (size: number) => {
  pagination.value.size = size
}

const handleCurrentChange = async (current: number) => {
  pagination.value.current = current
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

/* 请求列表卡片 */
.request-list-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
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
</style>


