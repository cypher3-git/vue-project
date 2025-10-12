<template>
  <div class="access-records">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
    <h2>访问记录</h2>
      <div class="header-actions">
        <el-button @click="exportRecords">
          <el-icon><Download /></el-icon>
          导出记录
        </el-button>
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
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px; margin-right: 16px;"
          />
          
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
          </el-select>
          
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
          </el-select>
        </div>
        
        <div class="filter-right">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索医生姓名或访问目的"
            clearable
            style="width: 250px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- 访问记录列表 -->
    <el-card class="records-list-card">
      <template #header>
        <div class="card-header">
          <span>访问记录详情</span>
          <div class="view-toggle">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="table">表格视图</el-radio-button>
              <el-radio-button value="timeline">时间轴</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      
      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'">
        <el-table 
          :data="filteredRecords" 
          style="width: 100%"
          v-loading="loading"
          @row-click="viewRecordDetail"
        >
          <el-table-column label="访问时间" width="160">
            <template #default="scope">
              <div class="access-time">
                <div class="time-date">{{ formatDate(scope.row.accessTime) }}</div>
                <div class="time-clock">{{ formatTime(scope.row.accessTime) }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="访问医生" width="180">
            <template #default="scope">
              <div class="doctor-info">
                <el-avatar :size="32" class="doctor-avatar">
                  {{ scope.row.doctorName.charAt(0) }}
                </el-avatar>
                <div class="doctor-details">
                  <div class="doctor-name">{{ scope.row.doctorName }}</div>
                  <div class="doctor-dept">{{ scope.row.department }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="dataType" label="数据类型" width="120" />
          
          <el-table-column prop="dataName" label="访问数据" width="200" />
          
          <el-table-column prop="purpose" label="访问目的" />
          
          <el-table-column label="访问时长" width="100">
            <template #default="scope">
              <span class="access-duration">{{ scope.row.duration }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作记录" width="120">
            <template #default="scope">
              <el-tag 
                v-for="action in scope.row.actions" 
                :key="action" 
                size="small" 
                class="action-tag"
              >
                {{ action }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button 
                type="text" 
                size="small" 
                @click.stop="viewRecordDetail(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 时间轴视图 -->
      <div v-else class="timeline-view">
        <el-timeline>
          <el-timeline-item
            v-for="record in filteredRecords"
            :key="record.id"
            :timestamp="formatDateTime(record.accessTime)"
            placement="top"
          >
            <el-card class="timeline-card" @click="viewRecordDetail(record)">
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="doctor-name">{{ record.doctorName }}</span>
                  <span class="department">{{ record.department }}</span>
                </div>
                <div class="timeline-body">
                  <div class="data-info">
                    <span class="data-type">{{ record.dataType }}</span>
                    <span class="data-name">{{ record.dataName }}</span>
                  </div>
                  <div class="purpose">{{ record.purpose }}</div>
                </div>
                <div class="timeline-footer">
                  <span class="duration">访问时长: {{ record.duration }}</span>
                  <div class="actions">
                    <el-tag 
                      v-for="action in record.actions" 
                      :key="action" 
                      size="small"
                    >
                      {{ action }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 分页 -->
      <div v-if="viewMode === 'table'" class="pagination-wrapper">
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

    <!-- 访问详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="访问记录详情" width="600px">
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="访问时间">
            {{ formatDateTime(selectedRecord.accessTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="访问医生">
            {{ selectedRecord.doctorName }} ({{ selectedRecord.department }})
          </el-descriptions-item>
          <el-descriptions-item label="数据类型">
            {{ selectedRecord.dataType }}
          </el-descriptions-item>
          <el-descriptions-item label="访问数据">
            {{ selectedRecord.dataName }}
          </el-descriptions-item>
          <el-descriptions-item label="访问目的" :span="2">
            {{ selectedRecord.purpose }}
          </el-descriptions-item>
          <el-descriptions-item label="访问时长">
            {{ selectedRecord.duration }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedRecord.ipAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="操作记录" :span="2">
            <el-tag 
              v-for="action in selectedRecord.actions" 
              :key="action" 
              size="small" 
              style="margin-right: 8px;"
            >
              {{ action }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ selectedRecord.notes || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { accessApi, patientApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

// Stores
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const detailDialogVisible = ref(false)
const viewMode = ref('table')
const selectedRecord = ref(null)

// 筛选条件
const filters = ref({
  dateRange: [] as any[],
  department: '',
  dataType: '',
  keyword: ''
})

// 分页配置
const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})

// 访问记录数据
const accessRecords = ref<any[]>([])

// 加载访问记录
const loadAccessRecords = async () => {
  loading.value = true
  try {
    const response = await accessApi.getMyAccessRecords({
      page: pagination.value.current,
      pageSize: pagination.value.size,
      startDate: filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : undefined,
      endDate: filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : undefined,
      doctorName: filters.value.keyword || undefined,
      sortBy: 'accessTime',
      sortOrder: 'desc'
    })
    
    if (response.success && response.data) {
      accessRecords.value = (response.data.records || []).map((record: any) => ({
        id: record.id,
        accessTime: record.accessTime || record.createdAt,
        doctorName: record.doctorName || '未知医生',
        department: record.department || '未知科室',
        dataType: record.fileCategory || record.dataType || '未知类型',
        dataName: record.fileTitle || record.fileName || '未知文件',
        purpose: record.accessReason || record.purpose || '-',
        duration: record.duration || '-',
        actions: record.operations || ['查看'],
        ipAddress: record.ipAddress || '-',
        notes: record.notes || ''
      }))
      
      pagination.value.total = response.data.total || accessRecords.value.length
    }
  } catch (error) {
    console.error('加载访问记录失败:', error)
    ElMessage.error('加载访问记录失败')
  } finally {
    loading.value = false
  }
}

// 模拟访问记录数据（备用）
const mockAccessRecords = ref([
  {
    id: 'mock-1',
    accessTime: '2024-01-15T14:30:00',
    doctorName: '李医生',
    department: '心血管科',
    dataType: '检验报告',
    dataName: '心电图检查报告',
    purpose: '病情诊断评估',
    duration: '8分钟',
    actions: ['查看', '下载'],
    ipAddress: '192.168.1.100',
    notes: '常规心血管检查'
  },
  {
    id: 2,
    accessTime: '2024-01-14T09:15:00',
    doctorName: '王医生',
    department: '内科',
    dataType: '检验报告',
    dataName: '血液检查报告',
    purpose: '健康检查',
    duration: '5分钟',
    actions: ['查看'],
    ipAddress: '192.168.1.101',
    notes: '年度体检复查'
  },
  {
    id: 3,
    accessTime: '2024-01-12T16:45:00',
    doctorName: '张医生',
    department: '骨科',
    dataType: '影像资料',
    dataName: '腰椎X光片',
    purpose: '骨折复查',
    duration: '12分钟',
    actions: ['查看', '下载', '打印'],
    ipAddress: '192.168.1.102',
    notes: '骨折愈合情况良好'
  },
  {
    id: 4,
    accessTime: '2024-01-10T11:20:00',
    doctorName: '赵医生',
    department: '神经科',
    dataType: '影像资料',
    dataName: '头部MRI扫描',
    purpose: '神经系统检查',
    duration: '15分钟',
    actions: ['查看', '下载'],
    ipAddress: '192.168.1.103',
    notes: '神经功能正常'
  },
  {
    id: 5,
    accessTime: '2024-01-08T08:30:00',
    doctorName: '陈医生',
    department: '内科',
    dataType: '体检报告',
    dataName: '全身体检报告',
    purpose: '年度体检评估',
    duration: '20分钟',
    actions: ['查看', '下载'],
    ipAddress: '192.168.1.104',
    notes: '体检结果整体良好'
  }
])

// 计算过滤后的记录
const filteredRecords = computed(() => {
  let result = accessRecords.value

  // 按日期范围筛选
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const [startDate, endDate] = filters.value.dateRange
    result = result.filter(record => {
      const recordDate = new Date(record.accessTime)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // 按科室筛选
  if (filters.value.department) {
    result = result.filter(record => record.department === filters.value.department)
  }

  // 按数据类型筛选
  if (filters.value.dataType) {
    result = result.filter(record => record.dataType === filters.value.dataType)
  }

  // 按关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(record => 
      record.doctorName.toLowerCase().includes(keyword) ||
      record.purpose.toLowerCase().includes(keyword)
    )
  }

  pagination.value.total = result.length
  return result
})

// 格式化函数
const formatDate = (dateTime: string) => {
  return new Date(dateTime).toLocaleDateString('zh-CN')
}

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 处理函数
const refreshData = async () => {
  try {
    await loadAccessRecords()
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

const viewRecordDetail = (record: any) => {
  selectedRecord.value = record
  detailDialogVisible.value = true
}

const handleSizeChange = (size: number) => {
  pagination.value.size = size
  loadAccessRecords() // 重新加载数据
}

const handleCurrentChange = (current: number) => {
  pagination.value.current = current
  loadAccessRecords() // 重新加载数据
}

// 导出记录
const exportRecords = async () => {
  try {
    loading.value = true
    const response = await accessApi.exportAccessRecords({
      format: 'excel',
      startDate: filters.value.dateRange[0] ? new Date(filters.value.dateRange[0]).toISOString() : undefined,
      endDate: filters.value.dateRange[1] ? new Date(filters.value.dateRange[1]).toISOString() : undefined
    })
    
    if (response.success) {
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时初始化
onMounted(async () => {
  await loadAccessRecords()
})
</script>

<style scoped>
.access-records {
  padding: 24px;
  background: #f8fafc;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 允许输入框和文本区域内文本选择 */
.access-records :deep(input),
.access-records :deep(textarea),
.access-records :deep(.el-input__inner),
.access-records :deep(.el-textarea__inner) {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* 移除所有可点击元素的焦点轮廓 */
.access-records :deep(button),
.access-records :deep(.el-button),
.access-records :deep(.el-tag),
.access-records :deep(.el-select),
.access-records :deep(.el-radio),
.access-records :deep(.el-checkbox) {
  outline: none;
}

/* 移除焦点时的默认轮廓 */
.access-records :deep(button:focus),
.access-records :deep(.el-button:focus),
.access-records :deep(.el-tag:focus) {
  outline: none;
}

/* 为键盘用户保留焦点指示 */
.access-records :deep(button:focus-visible),
.access-records :deep(.el-button:focus-visible) {
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

/* 记录列表 */
.records-list-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 表格样式 */
.access-time {
  text-align: center;
}

.time-date {
  font-weight: 500;
  margin-bottom: 2px;
}

.time-clock {
  font-size: 12px;
  color: #666;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doctor-avatar {
  background: #1890ff;
  color: white;
  font-weight: bold;
}

.doctor-details {
  flex: 1;
}

.doctor-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.doctor-dept {
  font-size: 12px;
  color: #666;
}

.access-duration {
  color: #666;
  font-size: 12px;
}

.action-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

/* 时间轴样式 */
.timeline-view {
  padding: 20px 0;
}

.timeline-card {
  cursor: pointer;
  transition: all 0.3s;
}

.timeline-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.timeline-content {
  padding: 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header .doctor-name {
  font-weight: 600;
  color: #333;
}

.timeline-header .department {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.timeline-body {
  margin-bottom: 12px;
}

.data-info {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.data-type {
  font-size: 12px;
  color: #1890ff;
  background: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.data-name {
  font-weight: 500;
}

.purpose {
  color: #666;
  font-size: 14px;
}

.timeline-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.duration {
  font-size: 12px;
  color: #666;
}

.actions {
  display: flex;
  gap: 4px;
}

.pagination-wrapper {
  margin-top: 24px;
  text-align: right;
}

/* 详情对话框 */
.record-detail {
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left {
    flex-direction: column;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .timeline-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
