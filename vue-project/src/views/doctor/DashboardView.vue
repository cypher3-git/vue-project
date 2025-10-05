<template>
  <div class="doctor-dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h2>欢迎回来，{{ doctorInfo.name }}医生</h2>
        <p>{{ doctorInfo.department }} • {{ getCurrentTime() }}</p>
      </div>
      <div class="quick-actions">
        <el-button type="primary" @click="goToPatients">
          <el-icon><UserFilled /></el-icon>
          患者管理
        </el-button>
      </div>
    </div>

    <!-- 工作统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card authorized-patients">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40"><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <h3>授权患者</h3>
            <div class="stat-number">{{ authorizedPatients }}</div>
            <div class="stat-desc">可访问数据的患者数量</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card today-access">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40"><View /></el-icon>
          </div>
          <div class="stat-info">
            <h3>今日访问</h3>
            <div class="stat-number">{{ todayAccess }}</div>
            <div class="stat-desc">今天访问患者数据次数</div>
          </div>
        </div>
      </el-card>


      <el-card class="stat-card data-volume">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="40"><FolderOpened /></el-icon>
          </div>
          <div class="stat-info">
            <h3>可访问数据</h3>
            <div class="stat-number">{{ accessibleData }}</div>
            <div class="stat-desc">有权限访问的数据条目</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 内容区域 -->
    <div class="content-grid">
      <!-- 最近访问的患者数据 -->
      <el-card class="recent-access-card">
        <template #header>
          <div class="card-header">
            <h3>最近访问记录</h3>
            <el-button type="text" size="small" @click="viewAllAccess">查看全部</el-button>
          </div>
        </template>
        
        <el-table :data="recentAccess" style="width: 100%" size="small">
          <el-table-column label="患者" width="120">
            <template #default="scope">
              <div class="patient-info">
                <el-avatar :size="32">{{ scope.row.patientName.charAt(0) }}</el-avatar>
                <span class="patient-name">{{ scope.row.patientName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="dataType" label="数据类型" width="100" />
          <el-table-column prop="accessTime" label="访问时间" width="120" />
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button type="text" size="small" @click="accessPatientData(scope.row)">
                访问
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

    </div>

    <!-- 快捷操作区域 -->
    <el-card class="quick-operations-card">
      <template #header>
        <h3>快捷操作</h3>
      </template>
      
      <div class="operations-grid">
        <div class="operation-item" @click="searchPatient">
          <el-icon size="24"><Search /></el-icon>
          <span>搜索患者</span>
        </div>
        <div class="operation-item" @click="viewReports">
          <el-icon size="24"><Document /></el-icon>
          <span>查看报告</span>
        </div>
        <div class="operation-item" @click="requestAccess">
          <el-icon size="24"><Plus /></el-icon>
          <span>申请权限</span>
        </div>
        <div class="operation-item" @click="viewStatistics">
          <el-icon size="24"><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  UserFilled, 
  View, 
  FolderOpened, 
  Search, 
  Document, 
  Plus, 
  DataAnalysis 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { doctorApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 医生信息
const doctorInfo = computed(() => ({
  name: authStore.user?.name || '演示医生',
  department: '心血管科' // 临时硬编码，后续可以从用户信息扩展
}))

// 统计数据
const statistics = ref({
  authorizedPatients: 0,
  todayAccess: 0,
  accessibleData: 0
})

const authorizedPatients = computed(() => statistics.value.authorizedPatients)
const todayAccess = computed(() => statistics.value.todayAccess)
const accessibleData = computed(() => statistics.value.accessibleData)

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await doctorApi.getDashboardStatistics()
    if (response.code === 200 && response.data) {
      statistics.value = {
        authorizedPatients: response.data.totalPatients || 0,
        todayAccess: response.data.todayAccess || 0,
        accessibleData: response.data.activeShares || 0
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 最近访问记录
const recentAccess = ref<any[]>([])

// 加载最近访问记录
const loadRecentAccess = async () => {
  try {
    const response = await doctorApi.getAccessHistory({
      page: 1,
      pageSize: 5
    })
    
    if (response.code === 200 && response.data) {
      recentAccess.value = (response.data.items || []).map((record: any) => ({
        id: record.id,
        patientName: record.patientName || '未知患者',
        dataType: record.fileCategory || record.dataType || '未知类型',
        accessTime: formatTime(record.accessedAt || record.createdAt),
        patientId: record.patientId,
        fileId: record.fileId
      }))
    }
  } catch (error) {
    console.error('加载访问记录失败:', error)
    // 使用模拟数据作为后备方案
    recentAccess.value = [
      {
        id: 'mock-1',
        patientName: '李阿姨',
        dataType: '心电图',
        accessTime: '10:30',
        patientId: 'patient-1',
        fileId: 'file-1'
      },
      {
        id: 'mock-2',
        patientName: '王大爷',
        dataType: '血液检查',
        accessTime: '09:15',
        patientId: 'patient-2',
        fileId: 'file-2'
      },
      {
        id: 'mock-3',
        patientName: '张女士',
        dataType: 'X光片',
        accessTime: '08:45',
        patientId: 'patient-3',
        fileId: 'file-3'
      }
    ]
  }
}

// 格式化时间
const formatTime = (dateTime: string) => {
  const date = new Date(dateTime)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}


// 获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  const hour = now.getHours()
  if (hour < 12) {
    return '上午好'
  } else if (hour < 18) {
    return '下午好'
  } else {
    return '晚上好'
  }
}

// 导航函数
const goToPatients = () => {
  router.push('/doctor/patients')
}

const viewAllAccess = () => {
  router.push('/doctor/access-records')
}

// 访问患者数据
const accessPatientData = async (record: any) => {
  try {
    if (record.patientId && record.fileId) {
      // 实际访问患者数据的逻辑
      router.push(`/doctor/patient/${record.patientId}/file/${record.fileId}`)
    } else {
      ElMessage.info(`访问${record.patientName}的${record.dataType}数据`)
    }
  } catch (error) {
    console.error('访问患者数据失败:', error)
    ElMessage.error('访问患者数据失败')
  }
}

// 快捷操作
const searchPatient = () => {
  router.push('/doctor/patients?search=true')
}

const viewReports = () => {
  router.push('/doctor/reports')
}

const requestAccess = () => {
  router.push('/doctor/access-requests')
}

const viewStatistics = () => {
  router.push('/doctor/statistics')
}

// 组件挂载时初始化
onMounted(async () => {
  await Promise.all([
    loadStatistics(),
    loadRecentAccess()
  ])
})
</script>

<style scoped>
.doctor-dashboard {
  padding: 24px;
  background: #f8fafc;
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.2);
}

.welcome-content h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.quick-actions {
  display: flex;
  gap: 12px;
}

.quick-actions .el-button {
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.quick-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.request-badge {
  margin-left: 8px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
}

.stat-card.authorized-patients {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
}

.stat-card.today-access {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: white;
}


.stat-card.data-volume {
  background: linear-gradient(135deg, #722ed1, #531dab);
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

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

/* 卡片公共样式 */
.recent-access-card,
.quick-operations-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

/* 最近访问记录 */
.patient-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patient-name {
  font-weight: 500;
}

/* 权限申请概览 */
.no-requests {
  padding: 40px 0;
  text-align: center;
}

.requests-list {
  max-height: 300px;
  overflow-y: auto;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.request-item:hover {
  background-color: #fafafa;
}

.request-item:last-child {
  border-bottom: none;
}

.request-info .patient-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.request-type {
  color: #1890ff;
  font-size: 12px;
  margin-bottom: 4px;
}

.request-time {
  color: #666;
  font-size: 11px;
}

.request-actions {
  display: flex;
  gap: 8px;
}

/* 快捷操作 */
.operations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.operation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.operation-item:hover {
  border-color: #1890ff;
  background-color: #f6f8ff;
  transform: translateY(-2px);
}

.operation-item span {
  font-size: 14px;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .operations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .operations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
