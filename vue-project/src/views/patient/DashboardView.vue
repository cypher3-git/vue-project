<template>
  <div class="patient-dashboard">
    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <el-card class="stat-card my-data">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40"><FolderOpened /></el-icon>
          </div>
          <div class="stat-info">
            <h3>我的数据量</h3>
            <div class="stat-number">{{ statistics.myDataCount }}</div>
            <div class="stat-desc">包含医疗记录、检测报告等</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card shared-data">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40"><Share /></el-icon>
          </div>
          <div class="stat-info">
            <h3>已分享数据</h3>
            <div class="stat-number">{{ statistics.sharedDataCount }}</div>
            <div class="stat-desc">与医生共享的数据条目</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card access-count">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40"><View /></el-icon>
          </div>
          <div class="stat-info">
            <h3>本月访问次数</h3>
            <div class="stat-number">{{ statistics.monthlyAccessCount }}</div>
            <div class="stat-desc">医生访问我的数据次数</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近数据访问记录 -->
    <el-card class="data-table-card">
      <template #header>
        <h3>最近数据访问记录</h3>
      </template>
      
      <el-table :data="accessData" style="width: 100%">
        <el-table-column prop="date" label="访问时间" width="180" />
        <el-table-column prop="doctor" label="访问医生" width="120" />
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="dataType" label="访问数据类型" width="150" />
        <el-table-column prop="purpose" label="访问目的" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已授权' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 数据分享管理 -->
    <el-card class="data-table-card">
      <template #header>
        <h3>我的数据分享设置</h3>
      </template>
      
      <el-table :data="shareData" style="width: 100%">
        <el-table-column prop="department" label="授权科室" width="150" />
        <el-table-column prop="dataTypes" label="分享数据类型" width="200" />
        <el-table-column label="授权到期时间" width="180">
          <template #default="scope">
            {{ formatExpireDate(scope.row.expireDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editShare(scope.row, scope.$index)">修改</el-button>
            <el-button type="danger" size="small" @click="revokeShare(scope.row, scope.$index)">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑分享对话框 -->
    <el-dialog 
      v-model="shareDialogVisible" 
      :title="isEditMode ? '修改分享设置' : '添加分享设置'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form 
        ref="shareFormRef" 
        :model="shareForm" 
        :rules="shareRules" 
        label-width="120px"
      >
        <el-form-item label="授权科室" prop="department">
          <el-select v-model="shareForm.department" placeholder="请选择科室" style="width: 100%">
            <el-option label="心血管科" value="心血管科" />
            <el-option label="内科" value="内科" />
            <el-option label="骨科" value="骨科" />
            <el-option label="神经科" value="神经科" />
            <el-option label="外科" value="外科" />
            <el-option label="呼吸内科" value="呼吸内科" />
            <el-option label="消化内科" value="消化内科" />
            <el-option label="泌尿科" value="泌尿科" />
            <el-option label="妇产科" value="妇产科" />
            <el-option label="儿科" value="儿科" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分享数据类型" prop="dataTypes">
          <el-checkbox-group v-model="shareForm.dataTypesList">
            <el-checkbox value="心电图">心电图</el-checkbox>
            <el-checkbox value="血液检查">血液检查</el-checkbox>
            <el-checkbox value="X光片">X光片</el-checkbox>
            <el-checkbox value="CT扫描">CT扫描</el-checkbox>
            <el-checkbox value="MRI">MRI</el-checkbox>
            <el-checkbox value="体检报告">体检报告</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="授权到期时间" prop="expireDate">
          <el-date-picker
            v-model="shareForm.expireDate"
            type="date"
            placeholder="选择到期日期"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleShareSubmit">
            {{ isEditMode ? '保存修改' : '添加分享' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FolderOpened, Share, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { patientApi, accessApi } from '@/api'
import { useMedicalDataStore } from '@/stores/medicalData'
import { useAuthStore } from '@/stores/auth'

// Stores
const medicalDataStore = useMedicalDataStore()
const authStore = useAuthStore()

// 统计数据
const statistics = ref({
  myDataCount: 0,
  sharedDataCount: 0,
  monthlyAccessCount: 0
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await patientApi.getPatientDashboardStatistics()
    if (response.success && response.data) {
      statistics.value = {
        myDataCount: response.data.totalFiles || 0,
        sharedDataCount: response.data.sharedFiles || 0,
        monthlyAccessCount: response.data.monthlyAccessCount || 0
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 对话框状态
const shareDialogVisible = ref(false)
const isEditMode = ref(false)
const editingIndex = ref(-1)

// 表单引用
const shareFormRef = ref<FormInstance>()

// 表单数据
const shareForm = ref({
  department: '',
  dataTypesList: [] as string[],
  expireDate: '' as string | Date
})

// 表单验证规则
const shareRules: FormRules = {
  department: [
    { required: true, message: '请选择授权科室', trigger: 'change' }
  ],
  dataTypesList: [
    { 
      type: 'array', 
      required: true, 
      message: '请至少选择一种数据类型', 
      trigger: 'change',
      min: 1
    }
  ],
  expireDate: [
    { required: true, message: '请选择到期日期', trigger: 'change' }
  ]
}

// 访问记录数据
const accessData = ref<any[]>([])

// 加载访问记录
const loadAccessRecords = async () => {
  try {
    const response = await patientApi.getAccessRecords({
      page: 1,
      pageSize: 5,
      sortBy: 'accessTime',
      sortOrder: 'desc'
    })
    
    if (response.success && response.data) {
      accessData.value = (response.data.records || []).map((record: any) => ({
        date: record.accessTime || record.createdAt,
        doctor: record.doctorName || '未知医生',
        department: record.department || '未知科室',
        dataType: record.fileTitle || record.fileName || '未知类型',
        purpose: record.accessReason || record.purpose || '-',
        status: record.status === 'granted' ? '已授权' : '待审核'
      }))
    }
  } catch (error) {
    console.error('加载访问记录失败:', error)
  }
}

// 分享设置数据
const shareData = ref<any[]>([])

// 加载分享记录
const loadShareRecords = async () => {
  try {
    const response = await patientApi.getShareRecords({
      page: 1,
      pageSize: 10,
      status: 'active'
    })
    
    if (response.success && response.data) {
      shareData.value = (response.data.shares || []).map((share: any) => ({
        id: share.id,
        doctor: share.doctorName || '未知医生',
        department: share.department || '未知科室',
        dataTypes: share.fileTitle || share.permissions?.join('、') || '未知类型',
        expireDate: share.expiresAt || '永久'
      }))
    }
  } catch (error) {
    console.error('加载分享记录失败:', error)
  }
}

// 处理函数
// 编辑分享设置
const editShare = (row: any, index: number) => {
  isEditMode.value = true
  editingIndex.value = index
  
  // 填充表单数据
  shareForm.value.department = row.department
  shareForm.value.dataTypesList = row.dataTypes.split('、')
  
  // 确保日期格式正确
  if (row.expireDate) {
    try {
      shareForm.value.expireDate = new Date(row.expireDate)
    } catch {
      shareForm.value.expireDate = row.expireDate
    }
  } else {
    shareForm.value.expireDate = ''
  }
  
  shareDialogVisible.value = true
}

// 撤销分享
const revokeShare = async (row: any, index: number) => {
  try {
    await ElMessageBox.confirm(
      `确定要撤销对 ${row.department} 的数据分享权限吗？`,
      '撤销确认',
      {
        confirmButtonText: '确定撤销',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    shareData.value.splice(index, 1)
    ElMessage.success('分享权限已撤销')
  } catch {
    // 用户取消操作
  }
}

// 关闭对话框
const handleDialogClose = () => {
  shareDialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (shareFormRef.value) {
    shareFormRef.value.resetFields()
  }
  shareForm.value = {
    department: '',
    dataTypesList: [],
    expireDate: '' as string | Date
  }
}

// 提交分享设置
const handleShareSubmit = async () => {
  if (!shareFormRef.value) return
  
  try {
    await shareFormRef.value.validate()
    
    // 格式化到期日期为ISO字符串格式
    let formattedExpireDate = shareForm.value.expireDate
    if (shareForm.value.expireDate && typeof shareForm.value.expireDate === 'object' && 'toISOString' in shareForm.value.expireDate) {
      // 如果是Date对象
      formattedExpireDate = (shareForm.value.expireDate as Date).toISOString()
    } else if (typeof shareForm.value.expireDate === 'string' && shareForm.value.expireDate) {
      // 如果是字符串日期，尝试转换为ISO格式
      const date = new Date(shareForm.value.expireDate)
      if (!isNaN(date.getTime())) {
        formattedExpireDate = date.toISOString()
      }
    }

    const formData = {
      department: shareForm.value.department,
      dataTypes: shareForm.value.dataTypesList.join('、'),
      expireDate: String(formattedExpireDate)
    }
    
    if (isEditMode.value) {
      // 编辑模式：更新现有数据
      shareData.value[editingIndex.value] = formData
      ElMessage.success('分享设置已更新')
    } else {
      // 添加模式：检查是否已存在相同科室的分享
      const existingIndex = shareData.value.findIndex(item => 
        item.department === formData.department
      )
      
      if (existingIndex >= 0) {
        ElMessage.warning('已存在对该科室的分享设置，请选择修改现有设置')
        return
      }
      
      // 添加新的分享设置
      shareData.value.push(formData)
      ElMessage.success('分享设置已添加')
    }
    
    handleDialogClose()
  } catch {
    // 表单验证失败
  }
}

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 格式化到期日期为中文格式
const formatExpireDate = (dateStr: string) => {
  if (!dateStr) return ''
  
  try {
    const date = new Date(dateStr)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return dateStr // 如果无法解析，返回原始字符串
    }
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    
    // 格式化时间部分，确保小时和分钟都是两位数
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    return `${year}年${month}月${day}日 ${timeStr}`
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dateStr // 出错时返回原始字符串
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await Promise.all([
    loadStatistics(),
    loadAccessRecords(),
    loadShareRecords()
  ])
})
</script>

<style scoped>
.patient-dashboard {
  padding: 24px;
  background: #f8fafc;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
}

.stat-card.my-data {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
}

.stat-card.shared-data {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
}

.stat-card.access-count {
  background: linear-gradient(135deg, #fa8c16, #d46b08);
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  opacity: 0.9;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: normal;
  opacity: 0.9;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 12px;
  opacity: 0.8;
}

/* 数据表格卡片 */
.data-table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 24px;
}

.data-table-card:last-child {
  margin-bottom: 0;
}

.data-table-card :deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.data-table-card h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
