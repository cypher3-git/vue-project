<template>
  <div class="authorization-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>授权管理</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card pending">
        <div class="stat-content">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">待处理请求</div>
        </div>
      </el-card>
      <el-card class="stat-card approved">
        <div class="stat-content">
          <div class="stat-number">{{ approvedCount }}</div>
          <div class="stat-label">已授权</div>
        </div>
      </el-card>
      <el-card class="stat-card rejected">
        <div class="stat-content">
          <div class="stat-number">{{ rejectedCount }}</div>
          <div class="stat-label">已拒绝</div>
        </div>
      </el-card>
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
        <el-table-column label="医生信息" width="180">
          <template #default="scope">
            <div class="doctor-info">
              <el-avatar :size="40" class="doctor-avatar">
                {{ scope.row.doctorName.charAt(0) }}
              </el-avatar>
              <div class="doctor-details">
                <div class="doctor-name">{{ scope.row.doctorName }}</div>
                <div class="doctor-dept">{{ scope.row.doctorDepartment }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="请求数据" width="250">
          <template #default="scope">
            <div class="data-info">
              <div class="data-name">{{ scope.row.dataName }}</div>
              <el-tag size="small" type="info">{{ scope.row.dataType }}</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="申请理由" min-width="200">
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
        
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
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
                type="text" 
                size="small" 
                @click="viewDetail(scope.row)"
              >
                详情
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

    <!-- 授权详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="授权请求详情" width="700px">
      <div v-if="selectedRequest" class="request-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="医生姓名">{{ selectedRequest.doctorName }}</el-descriptions-item>
          <el-descriptions-item label="所属科室">{{ selectedRequest.doctorDepartment }}</el-descriptions-item>
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

// 响应式数据
const loading = ref(false)
const detailDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const selectedRequest = ref<any>(null)
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
const requestList = ref<any[]>([])

// 统计数据
const pendingCount = computed(() => requestList.value.filter(r => r.status === 'pending').length)
const approvedCount = computed(() => requestList.value.filter(r => r.status === 'approved').length)
const rejectedCount = computed(() => requestList.value.filter(r => r.status === 'rejected').length)

// 加载授权请求列表
const loadRequests = async () => {
  loading.value = true
  try {
    // TODO: 调用 API 获取授权请求列表
    // const response = await patientApi.getAuthorizationRequests({...})
    
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    requestList.value = [
      {
        id: '1',
        doctorId: 'D001',
        doctorName: '张医生',
        doctorDepartment: '心血管科',
        dataId: 'DATA001',
        dataName: '血常规检查报告',
        dataType: '检验报告',
        reason: '需要查看您的血常规检查结果以评估当前病情发展情况，为后续治疗方案提供参考。',
        purpose: 'diagnosis',
        requestedAt: '2024-01-20 14:30:00',
        status: 'pending'
      },
      {
        id: '2',
        doctorId: 'D002',
        doctorName: '李医生',
        doctorDepartment: '呼吸内科',
        dataId: 'DATA002',
        dataName: '胸部X光片',
        dataType: '影像资料',
        reason: '根据您的症状，需要查看胸部X光片进行肺部检查。',
        purpose: 'diagnosis',
        requestedAt: '2024-01-19 10:15:00',
        status: 'approved',
        processedAt: '2024-01-19 11:20:00'
      },
      {
        id: '3',
        doctorId: 'D003',
        doctorName: '王医生',
        doctorDepartment: '内分泌科',
        dataId: 'DATA003',
        dataName: '血糖检查报告',
        dataType: '检验报告',
        reason: '需要评估您的血糖控制情况。',
        purpose: 'evaluation',
        requestedAt: '2024-01-18 16:45:00',
        status: 'rejected',
        processedAt: '2024-01-18 17:00:00',
        rejectReason: '该数据不适合分享'
      },
      {
        id: '4',
        doctorId: 'D001',
        doctorName: '张医生',
        doctorDepartment: '心血管科',
        dataId: 'DATA004',
        dataName: '心电图检查',
        dataType: '检验报告',
        reason: '会诊需要，需要查看完整的心电图数据。',
        purpose: 'consultation',
        requestedAt: '2024-01-17 09:20:00',
        status: 'pending'
      }
    ]
    
    pagination.value.total = requestList.value.length
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
    
    // TODO: 调用 API 同意授权
    // await patientApi.approveAuthorization(selectedRequest.value.id, approveForm.value)
    
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
    
    // TODO: 调用 API 拒绝授权
    // await patientApi.rejectAuthorization(selectedRequest.value.id, rejectForm.value)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('已拒绝授权申请')
    rejectDialogVisible.value = false
    
    // 更新列表中的状态
    const index = requestList.value.findIndex(r => r.id === selectedRequest.value.id)
    if (index !== -1) {
      requestList.value[index].status = 'rejected'
      requestList.value[index].processedAt = new Date().toLocaleString('zh-CN')
      requestList.value[index].rejectReason = rejectForm.value.reason
    }
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('拒绝授权失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  } finally {
    submitting.value = false
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

/* 统计卡片行 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.pending {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #8b4513;
}

.stat-card.approved {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2c3e50;
}

.stat-card.rejected {
  background: linear-gradient(135deg, #fccf31 0%, #f55555 100%);
  color: white;
}

.stat-content {
  text-align: center;
  padding: 8px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .authorization-management {
    padding: 16px;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
    gap: 12px;
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


