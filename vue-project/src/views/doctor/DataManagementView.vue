<template>
  <div class="data-management">
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
            <el-option label="未申请" value="not-requested" />
            <el-option label="待审批" value="pending" />
            <el-option label="已授权" value="authorized" />
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
        <el-table-column label="数据信息" width="300">
          <template #default="scope">
            <div class="data-info">
              <el-icon class="data-icon" :size="24">
                <Document v-if="scope.row.dataType === '检验报告'" />
                <Picture v-else-if="scope.row.dataType === '影像资料'" />
                <Folder v-else-if="scope.row.dataType === '病历记录'" />
                <Files v-else-if="scope.row.dataType === '体检报告'" />
                <Files v-else-if="scope.row.dataType === '用药记录'" />
                <Document v-else />
              </el-icon>
              <div class="data-details">
                <div class="data-name">{{ scope.row.dataName }}</div>
                <div class="data-type">{{ scope.row.dataType }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="uploadDate" label="上传日期" width="120" />
        
        <el-table-column prop="fileSize" label="文件大小" width="110" align="center" />
        
        <el-table-column label="授权状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getAuthStatusType(scope.row.authStatus)" size="small">
              {{ getAuthStatusText(scope.row.authStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="scope.row.authStatus === 'not-requested' || scope.row.authStatus === 'rejected'"
                type="primary" 
                size="small" 
                @click.stop="requestAuthorization(scope.row)"
              >
                发起授权
              </el-button>
              <el-button 
                v-if="scope.row.authStatus === 'pending'"
                type="warning" 
                size="small" 
                disabled
              >
                审批中
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                :disabled="scope.row.authStatus !== 'authorized'"
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
    <el-dialog v-model="authDialogVisible" title="发起授权申请" width="600px">
      <div v-if="selectedData" class="auth-dialog-content">
        <el-alert
          title="提示"
          type="info"
          description="申请授权后，需要等待患者审批通过才能查看数据详情。"
          :closable="false"
          style="margin-bottom: 20px;"
        />
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="数据名称">{{ selectedData.dataName }}</el-descriptions-item>
          <el-descriptions-item label="数据类型">{{ selectedData.dataType }}</el-descriptions-item>
          <el-descriptions-item label="数据ID">{{ selectedData.id }}</el-descriptions-item>
          <el-descriptions-item label="上传日期">{{ selectedData.uploadDate }}</el-descriptions-item>
        </el-descriptions>
        
        <el-form ref="authFormRef" :model="authForm" :rules="authRules" label-width="100px" style="margin-top: 20px;">
          <el-form-item label="申请理由" prop="reason">
            <el-input
              v-model="authForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请说明需要查看该数据的理由"
            />
          </el-form-item>
          
          <el-form-item label="使用目的" prop="purpose">
            <el-select v-model="authForm.purpose" placeholder="请选择使用目的" style="width: 100%">
              <el-option label="诊断治疗" value="diagnosis" />
              <el-option label="病情评估" value="evaluation" />
              <el-option label="医学研究" value="research" />
              <el-option label="会诊咨询" value="consultation" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="authDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAuthRequest" :loading="submitting">
            提交申请
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看数据对话框 -->
    <el-dialog v-model="viewDialogVisible" title="数据详情" width="900px">
      <div v-if="selectedData" class="data-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="数据名称">{{ selectedData.dataName }}</el-descriptions-item>
          <el-descriptions-item label="数据类型">{{ selectedData.dataType }}</el-descriptions-item>
          <el-descriptions-item label="所属患者">
            <span v-if="selectedData.authStatus === 'authorized'">
              {{ selectedData.patientName }} ({{ selectedData.patientId }})
            </span>
            <span v-else style="color: #999;">
              <el-icon style="margin-right: 4px;"><Lock /></el-icon>
              需授权后可见
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="上传日期">{{ selectedData.uploadDate }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ selectedData.fileSize }}</el-descriptions-item>
          <el-descriptions-item label="授权状态">
            <el-tag :type="getAuthStatusType(selectedData.authStatus)">
              {{ getAuthStatusText(selectedData.authStatus) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider>数据内容</el-divider>
        
        <div class="data-content">
          <p v-if="selectedData.description">{{ selectedData.description }}</p>
          <el-empty v-else description="暂无数据内容预览" />
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadData">下载数据</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, Search, Document, Picture, Folder, Files, Plus, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 响应式数据
const loading = ref(false)
const authDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const selectedData = ref<any>(null)
const submitting = ref(false)

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

// 授权申请表单
const authFormRef = ref<FormInstance>()
const authForm = ref({
  reason: '',
  purpose: ''
})

const authRules: FormRules = {
  reason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 10, message: '申请理由至少10个字符', trigger: 'blur' }
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
    // TODO: 调用 API 获取数据列表
    // const response = await doctorApi.getMedicalDataList({...})
    
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    dataList.value = [
      {
        id: '1',
        dataName: '血常规检查报告',
        dataType: '检验报告',
        patientId: 'P001',
        patientName: '李阿姨',
        uploadDate: '2024-01-15',
        fileSize: '2.5 MB',
        authStatus: 'not-requested',
        description: '血常规检查结果：白细胞计数正常，红细胞计数正常...'
      },
      {
        id: '2',
        dataName: '胸部X光片',
        dataType: '影像资料',
        patientId: 'P001',
        patientName: '李阿姨',
        uploadDate: '2024-01-14',
        fileSize: '5.8 MB',
        authStatus: 'pending',
        description: '胸部X光检查：肺部纹理清晰...'
      },
      {
        id: '3',
        dataName: '心电图检查',
        dataType: '检验报告',
        patientId: 'P002',
        patientName: '王大爷',
        uploadDate: '2024-01-13',
        fileSize: '1.2 MB',
        authStatus: 'authorized',
        description: '心电图检查：窦性心律，心率75次/分...'
      },
      {
        id: '4',
        dataName: '门诊病历',
        dataType: '病历记录',
        patientId: 'P002',
        patientName: '王大爷',
        uploadDate: '2024-01-12',
        fileSize: '0.8 MB',
        authStatus: 'rejected',
        description: '主诉：胸闷气短1周...'
      },
      {
        id: '5',
        dataName: '年度体检报告',
        dataType: '体检报告',
        patientId: 'P003',
        patientName: '张女士',
        uploadDate: '2024-01-10',
        fileSize: '3.5 MB',
        authStatus: 'authorized',
        description: '体检结果：身高165cm，体重60kg，BMI正常...'
      }
    ]
    
    pagination.value.total = dataList.value.length
  } catch (error) {
    console.error('加载数据列表失败:', error)
    ElMessage.error('加载数据列表失败')
  } finally {
    loading.value = false
  }
}

// 计算过滤后的数据列表
const filteredDataList = computed(() => {
  let result = dataList.value

  // 按数据类型筛选
  if (filters.value.dataType) {
    result = result.filter(data => data.dataType === filters.value.dataType)
  }

  // 按授权状态筛选
  if (filters.value.authStatus) {
    result = result.filter(data => data.authStatus === filters.value.authStatus)
  }

  // 按关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(data => 
      data.dataName.toLowerCase().includes(keyword)
    )
  }

  pagination.value.total = result.length
  return result
})

// 获取授权状态类型
const getAuthStatusType = (status: string) => {
  switch (status) {
    case 'not-requested': return 'info'
    case 'pending': return 'warning'
    case 'authorized': return 'success'
    case 'rejected': return 'danger'
    default: return 'info'
  }
}

// 获取授权状态文本
const getAuthStatusText = (status: string) => {
  switch (status) {
    case 'not-requested': return '未申请'
    case 'pending': return '待审批'
    case 'authorized': return '已授权'
    case 'rejected': return '已拒绝'
    default: return '未知'
  }
}

// 发起授权申请
const requestAuthorization = (data: any) => {
  selectedData.value = data
  authForm.value = {
    reason: '',
    purpose: ''
  }
  authDialogVisible.value = true
}

// 提交授权申请
const submitAuthRequest = async () => {
  if (!authFormRef.value) return
  
  try {
    await authFormRef.value.validate()
    
    submitting.value = true
    
    // TODO: 调用 API 提交授权申请
    // await doctorApi.requestDataAuthorization({...})
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('授权申请已提交，请等待患者审批')
    authDialogVisible.value = false
    
    // 更新数据状态
    if (selectedData.value) {
      const index = dataList.value.findIndex(d => d.id === selectedData.value.id)
      if (index !== -1) {
        dataList.value[index].authStatus = 'pending'
      }
    }
    
    await loadDataList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交授权申请失败:', error)
      ElMessage.error('提交授权申请失败')
    }
  } finally {
    submitting.value = false
  }
}

// 查看数据
const viewData = (data: any) => {
  if (data.authStatus !== 'authorized') {
    ElMessage.warning('该数据尚未授权，无法查看')
    return
  }
  
  selectedData.value = data
  viewDialogVisible.value = true
}

// 下载数据
const downloadData = () => {
  ElMessage.success('正在下载数据...')
  viewDialogVisible.value = false
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
  gap: 12px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .data-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
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


