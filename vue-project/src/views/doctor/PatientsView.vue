<template>
  <div class="patients-management">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <h2>患者管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddPatientDialog">
          <el-icon><Plus /></el-icon>
          添加患者
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 患者统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card total">
        <div class="stat-content">
          <div class="stat-number">{{ totalPatients }}</div>
          <div class="stat-label">授权患者总数</div>
        </div>
      </el-card>
      <el-card class="stat-card active">
        <div class="stat-content">
          <div class="stat-number">{{ activeAuthorizations }}</div>
          <div class="stat-label">活跃授权</div>
        </div>
      </el-card>
      <el-card class="stat-card expiring">
        <div class="stat-content">
          <div class="stat-number">{{ expiringAuthorizations }}</div>
          <div class="stat-label">即将过期</div>
        </div>
      </el-card>
      <el-card class="stat-card today">
        <div class="stat-content">
          <div class="stat-number">{{ todayAccessed }}</div>
          <div class="stat-label">今日已访问</div>
        </div>
      </el-card>
    </div>

    <!-- 筛选和搜索区域 -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select 
            v-model="filters.authStatus" 
            placeholder="授权状态" 
            clearable 
            style="width: 120px; margin-right: 16px;"
          >
            <el-option label="全部状态" value="" />
            <el-option label="已授权" value="active" />
            <el-option label="即将过期" value="expiring" />
            <el-option label="已过期" value="expired" />
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
          
          <el-date-picker
            v-model="filters.lastAccessDate"
            type="date"
            placeholder="最近访问日期"
            style="width: 160px; margin-right: 16px;"
          />
        </div>
        
        <div class="filter-right">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索患者姓名或身份证"
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

    <!-- 患者列表 -->
    <el-card class="patients-list-card">
      <el-table 
        :data="filteredPatients" 
        style="width: 100%"
        v-loading="loading"
        @row-click="viewPatientDetail"
      >
        <el-table-column label="患者信息" width="200">
          <template #default="scope">
            <div class="patient-info">
              <el-avatar :size="40" class="patient-avatar">
                {{ getDisplayName(scope.row).charAt(0) }}
              </el-avatar>
              <div class="patient-details">
                <div class="patient-name">{{ getDisplayName(scope.row) }}</div>
                <div class="patient-id">{{ getDisplayIdCard(scope.row) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="年龄" width="80" align="center">
          <template #default="scope">
            {{ getDisplayAge(scope.row) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.gender === '男' ? 'primary' : 'danger'" size="small">
              {{ scope.row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="授权数据类型" width="200">
          <template #default="scope">
            <el-tag 
              v-for="type in scope.row.authorizedDataTypes" 
              :key="type" 
              size="small" 
              style="margin-right: 4px; margin-bottom: 2px;"
            >
              {{ type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="授权状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getAuthStatusType(scope.row.authStatus)" size="small">
              {{ getAuthStatusText(scope.row.authStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="authExpireDate" label="授权到期" width="120" />
        
        <el-table-column prop="lastAccessTime" label="最近访问" width="120" />
        
        <el-table-column label="数据条目" width="100" align="center">
          <template #default="scope">
            <span class="data-count">{{ scope.row.dataCount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="text" size="small" @click.stop="accessPatientData(scope.row)">
                访问数据
              </el-button>
              <el-button type="text" size="small" @click.stop="viewAccessHistory(scope.row)">
                访问历史
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

    <!-- 患者详情对话框 -->
    <el-dialog v-model="patientDetailVisible" title="患者详细信息" width="800px">
      <div v-if="selectedPatient" class="patient-detail">
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="detail-avatar">
              <el-avatar :size="80">{{ getDisplayName(selectedPatient).charAt(0) }}</el-avatar>
            </div>
          </el-col>
          <el-col :span="16">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="姓名">{{ getDisplayName(selectedPatient) }}</el-descriptions-item>
              <el-descriptions-item label="年龄">{{ getDisplayAge(selectedPatient) }}{{ accessedPatients.has(selectedPatient.id) ? '岁' : '' }}</el-descriptions-item>
              <el-descriptions-item label="性别">{{ selectedPatient.gender }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ selectedPatient.phone }}</el-descriptions-item>
              <el-descriptions-item label="身份证" :span="2">
                {{ getDisplayIdCard(selectedPatient) }}
              </el-descriptions-item>
              <el-descriptions-item label="授权状态">
                <el-tag :type="getAuthStatusType(selectedPatient.authStatus)">
                  {{ getAuthStatusText(selectedPatient.authStatus) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="授权到期">{{ selectedPatient.authExpireDate }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        
        <el-divider>授权数据类型</el-divider>
        <div class="auth-data-types">
          <el-tag 
            v-for="type in selectedPatient.authorizedDataTypes" 
            :key="type" 
            size="large"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ type }}
          </el-tag>
        </div>
        
        <el-divider>最近访问记录</el-divider>
        <el-table :data="selectedPatient.recentAccess" size="small">
          <el-table-column prop="dataType" label="数据类型" width="120" />
          <el-table-column prop="accessTime" label="访问时间" width="150" />
          <el-table-column prop="duration" label="访问时长" width="100" />
          <el-table-column prop="operation" label="操作" />
        </el-table>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="patientDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="accessPatientData(selectedPatient)">
            访问数据
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 访问患者数据对话框 -->
    <el-dialog v-model="accessDataVisible" title="患者医疗数据" width="1200px" class="access-data-dialog">
      <div v-if="selectedPatient" class="access-data-content">
        <!-- 患者基本信息 -->
        <div class="patient-header">
          <el-avatar :size="60" class="patient-avatar">
            {{ getDisplayName(selectedPatient).charAt(0) }}
          </el-avatar>
          <div class="patient-info-header">
            <h3>{{ getDisplayName(selectedPatient) }}</h3>
            <p>{{ getDisplayAge(selectedPatient) }}{{ accessedPatients.has(selectedPatient.id) ? '岁' : '' }} {{ selectedPatient.gender }} | 身份证：{{ getDisplayIdCard(selectedPatient) }}</p>
          </div>
          <div class="access-time">
            <el-tag type="info" size="small">访问时间：{{ currentTime }}</el-tag>
          </div>
        </div>

        <!-- 数据类型选项卡 -->
        <el-tabs v-model="activeDataType" type="card" class="data-tabs">
          <el-tab-pane
            v-for="dataType in selectedPatient.authorizedDataTypes"
            :key="dataType"
            :label="dataType"
            :name="dataType"
          >
            <div class="data-list">
              <el-table 
                :data="getPatientDataByType(dataType)" 
                style="width: 100%"
                :show-header="true"
                height="400"
              >
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="title" label="项目名称" min-width="200" />
                <el-table-column prop="result" label="结果/描述" min-width="250" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '正常' ? 'success' : scope.row.status === '异常' ? 'danger' : 'warning'" size="small">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="hospital" label="医院" width="150" />
                <el-table-column label="操作" width="150" align="center">
                  <template #default="scope">
                    <el-button type="text" size="small" @click="viewDataDetail(scope.row)">
                      <el-icon><View /></el-icon>
                      查看详情
                    </el-button>
                    <el-button type="text" size="small" @click="downloadData(scope.row)">
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="accessDataVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportAllData">导出全部数据</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 访问历史对话框 -->
    <el-dialog v-model="accessHistoryVisible" title="访问历史记录" width="900px">
      <div v-if="selectedPatient" class="access-history">
        <!-- 统计信息 -->
        <div class="history-stats">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-statistic title="总访问次数" :value="accessHistory.length" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="本月访问" :value="getMonthlyAccess()" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="最近访问" :value="getLastAccessDays()" suffix="天前" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="总访问时长" :value="getTotalDuration()" suffix="分钟" />
            </el-col>
          </el-row>
        </div>

        <!-- 时间筛选 -->
        <div class="history-filter">
          <el-row :gutter="16" style="margin: 16px 0;">
            <el-col :span="8">
              <el-date-picker
                v-model="historyDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="6">
              <el-select v-model="historyDataType" placeholder="数据类型" clearable style="width: 100%">
                <el-option label="全部类型" value="" />
                <el-option 
                  v-for="type in selectedPatient.authorizedDataTypes" 
                  :key="type" 
                  :label="type" 
                  :value="type" 
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="historyOperation" placeholder="操作类型" clearable style="width: 100%">
                <el-option label="全部操作" value="" />
                <el-option label="查看" value="查看" />
                <el-option label="下载" value="下载" />
                <el-option label="分享" value="分享" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="filterHistory">筛选</el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 访问记录表格 -->
        <el-table :data="filteredHistory" style="width: 100%" height="400" border>
          <el-table-column prop="accessTime" label="访问时间" width="160" />
          <el-table-column prop="dataType" label="数据类型" width="120" />
          <el-table-column prop="dataTitle" label="具体项目" min-width="200" />
          <el-table-column prop="operation" label="操作" width="80" align="center">
            <template #default="scope">
              <el-tag :type="getOperationType(scope.row.operation)" size="small">
                {{ scope.row.operation }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="访问时长" width="100" align="center" />
          <el-table-column prop="ipAddress" label="IP地址" width="130" />
          <el-table-column prop="device" label="设备" width="100" />
        </el-table>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="accessHistoryVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportHistory">导出记录</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加患者对话框 -->
    <el-dialog v-model="addPatientVisible" title="添加患者授权" width="600px">
      <el-form ref="patientFormRef" :model="patientForm" :rules="patientRules" label-width="100px">
        <el-form-item label="患者姓名" prop="name">
          <el-input v-model="patientForm.name" placeholder="请输入患者姓名" />
        </el-form-item>
        
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="patientForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="patientForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="授权数据类型" prop="dataTypes">
          <el-checkbox-group v-model="patientForm.dataTypes">
            <el-checkbox value="检验报告">检验报告</el-checkbox>
            <el-checkbox value="影像资料">影像资料</el-checkbox>
            <el-checkbox value="病历记录">病历记录</el-checkbox>
            <el-checkbox value="体检报告">体检报告</el-checkbox>
            <el-checkbox value="用药记录">用药记录</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="授权到期" prop="expireDate">
          <el-date-picker
            v-model="patientForm.expireDate"
            type="date"
            placeholder="选择到期日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addPatientVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddPatient">确定添加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Refresh, Search, View, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { doctorApi } from '@/api'
import type { PatientInfo } from '@/api/doctor'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const patientDetailVisible = ref(false)
const addPatientVisible = ref(false)
const accessDataVisible = ref(false)
const accessHistoryVisible = ref(false)
const selectedPatient = ref<any>(null)
const currentTime = ref('')
const activeDataType = ref('')

// 统计数据
const statistics = ref({
  totalPatients: 0,
  activeAuthorizations: 0,
  expiringAuthorizations: 0,
  todayAccessed: 0
})

const totalPatients = computed(() => statistics.value.totalPatients)
const activeAuthorizations = computed(() => statistics.value.activeAuthorizations)
const expiringAuthorizations = computed(() => statistics.value.expiringAuthorizations)
const todayAccessed = computed(() => statistics.value.todayAccessed)

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await doctorApi.getDashboardStatistics()
    if (response.code === 200 && response.data) {
      statistics.value = {
        totalPatients: response.data.totalPatients || 0,
        activeAuthorizations: response.data.activeShares || 0,
        expiringAuthorizations: response.data.pendingRequests || 0,
        todayAccessed: response.data.todayAccess || 0
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用备用数据
    statistics.value = {
      totalPatients: 18,
      activeAuthorizations: 15,
      expiringAuthorizations: 3,
      todayAccessed: 5
    }
  }
}

// 筛选条件
const filters = ref({
  authStatus: '',
  dataType: '',
  lastAccessDate: '',
  keyword: ''
})

// 分页配置
const pagination = ref({
  current: 1,
  size: 20,
  total: 0
})

// 表单数据
const patientFormRef = ref<FormInstance>()
const patientForm = ref({
  name: '',
  idCard: '',
  phone: '',
  dataTypes: [] as string[],
  expireDate: ''
})


// 访问历史筛选
const historyDateRange = ref<Date[]>([])
const historyDataType = ref('')
const historyOperation = ref('')
const filteredHistory = ref<any[]>([])
const accessHistory = ref<any[]>([])

// 患者数据访问状态管理
const accessedPatients = ref(new Set<number>())

// 模拟医疗数据
const medicalDataByType: Record<string, any[]> = {
  '检验报告': [
    {
      id: 1,
      date: '2024-01-15',
      title: '血常规检查',
      result: '白细胞计数: 6.5×10⁹/L, 红细胞计数: 4.8×10¹²/L',
      status: '正常',
      hospital: '中山医院',
      patientId: 1
    },
    {
      id: 2,
      date: '2024-01-10',
      title: '肝功能检查',
      result: 'ALT: 45 U/L (偏高), AST: 38 U/L',
      status: '异常',
      hospital: '中山医院',
      patientId: 1
    }
  ],
  '影像资料': [
    {
      id: 3,
      date: '2024-01-12',
      title: '胸部X光',
      result: '肺部纹理清晰，未见明显异常',
      status: '正常',
      hospital: '中山医院',
      patientId: 1
    }
  ],
  '病历记录': [
    {
      id: 4,
      date: '2024-01-15',
      title: '门诊病历',
      result: '主诉：胸闷气短1周。既往史：高血压病史3年',
      status: '待复查',
      hospital: '中山医院',
      patientId: 1
    }
  ],
  '体检报告': [
    {
      id: 5,
      date: '2024-01-08',
      title: '年度体检',
      result: '身高170cm，体重75kg，BMI 26.0（偏高）',
      status: '注意',
      hospital: '中山医院',
      patientId: 1
    }
  ]
}

// 模拟访问历史数据
const mockAccessHistory = [
  {
    accessTime: '2024-01-15 10:30:25',
    dataType: '检验报告',
    dataTitle: '血常规检查',
    operation: '查看',
    duration: '5分钟',
    ipAddress: '192.168.1.100',
    device: 'PC端'
  },
  {
    accessTime: '2024-01-15 10:35:12',
    dataType: '检验报告',
    dataTitle: '肝功能检查',
    operation: '下载',
    duration: '2分钟',
    ipAddress: '192.168.1.100',
    device: 'PC端'
  },
  {
    accessTime: '2024-01-14 14:20:15',
    dataType: '影像资料',
    dataTitle: '胸部X光',
    operation: '查看',
    duration: '8分钟',
    ipAddress: '192.168.1.100',
    device: 'PC端'
  },
  {
    accessTime: '2024-01-14 09:15:30',
    dataType: '病历记录',
    dataTitle: '门诊病历',
    operation: '分享',
    duration: '3分钟',
    ipAddress: '192.168.1.100',
    device: 'PC端'
  },
  {
    accessTime: '2024-01-12 16:45:18',
    dataType: '体检报告',
    dataTitle: '年度体检',
    operation: '查看',
    duration: '12分钟',
    ipAddress: '192.168.1.100',
    device: 'PC端'
  }
]

// 表单验证规则
const patientRules: FormRules = {
  name: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  dataTypes: [
    { type: 'array', required: true, message: '请选择授权数据类型', trigger: 'change', min: 1 }
  ],
  expireDate: [
    { required: true, message: '请选择授权到期日期', trigger: 'change' }
  ]
}

// 患者数据
const patientsData = ref<any[]>([])

// 加载患者列表
const loadPatients = async () => {
  loading.value = true
  try {
    const response = await doctorApi.getPatientList({
      page: pagination.value.current,
      pageSize: pagination.value.size,
      keyword: filters.value.keyword || undefined
    })
    
    if (response.code === 200 && response.data) {
      patientsData.value = (response.data.items || []).map((patient: any) => ({
        id: patient.id,
        name: patient.name || '未知患者',
        age: patient.age || 0,
        gender: patient.gender || '未知',
        phone: patient.phone || '',
        idCard: patient.idCard || '',
        authorizedDataTypes: patient.authorizedDataTypes || [],
        authStatus: patient.authStatus || 'pending',
        authExpireDate: patient.authExpireDate || '',
        lastAccessTime: patient.lastAccessTime || '',
        dataCount: patient.dataCount || 0,
        recentAccess: patient.recentAccess || []
      }))
      
      pagination.value.total = response.data.total || patientsData.value.length
    }
  } catch (error) {
    console.error('加载患者列表失败:', error)
    ElMessage.error('加载患者列表失败')
    // 使用模拟数据作为后备方案
    patientsData.value = [
      {
        id: 1,
        name: '李阿姨',
        age: 56,
        gender: '女',
        phone: '138****1234',
        idCard: '310101196701234567',
        authorizedDataTypes: ['检验报告', '影像资料'],
        authStatus: 'active',
        authExpireDate: '2025-06-15',
        lastAccessTime: '2024-01-15',
        dataCount: 12,
        recentAccess: [
          {
            dataType: '检验报告',
            accessTime: '2024-01-15 10:30',
            duration: '5分钟',
            operation: '查看'
          }
        ]
      }
    ]
  } finally {
    loading.value = false
  }
}

// 计算过滤后的患者数据
const filteredPatients = computed(() => {
  let result = patientsData.value

  // 按授权状态筛选
  if (filters.value.authStatus) {
    result = result.filter(patient => patient.authStatus === filters.value.authStatus)
  }

  // 按数据类型筛选
  if (filters.value.dataType) {
    result = result.filter(patient => 
      patient.authorizedDataTypes.includes(filters.value.dataType)
    )
  }

  // 按关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    result = result.filter(patient => 
      patient.name.toLowerCase().includes(keyword) ||
      patient.idCard.includes(keyword)
    )
  }

  pagination.value.total = result.length
  return result
})

// 工具函数
const getAuthStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'expiring': return 'warning'
    case 'expired': return 'danger'
    default: return 'info'
  }
}

const getAuthStatusText = (status: string) => {
  switch (status) {
    case 'active': return '已授权'
    case 'expiring': return '即将过期'
    case 'expired': return '已过期'
    default: return '未知'
  }
}

// 获取显示的患者姓名（隐私保护）
const getDisplayName = (patient: any) => {
  return accessedPatients.value.has(patient.id) ? patient.name : '***'
}

// 获取显示的患者年龄（隐私保护）
const getDisplayAge = (patient: any) => {
  return accessedPatients.value.has(patient.id) ? patient.age : '**'
}

// 获取显示的患者身份证（隐私保护）
const getDisplayIdCard = (patient: any) => {
  return accessedPatients.value.has(patient.id) 
    ? patient.idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
    : '******************'
}

// 处理函数
const showAddPatientDialog = () => {
  addPatientVisible.value = true
  resetPatientForm()
}

const resetPatientForm = () => {
  if (patientFormRef.value) {
    patientFormRef.value.resetFields()
  }
  patientForm.value = {
    name: '',
    idCard: '',
    phone: '',
    dataTypes: [],
    expireDate: ''
  }
}

const refreshData = async () => {
  await loadPatients()
  ElMessage.success('数据已刷新')
}

const viewPatientDetail = (patient: any) => {
  selectedPatient.value = patient
  patientDetailVisible.value = true
}

// 访问患者数据
const accessPatientData = async (patient: any) => {
  try {
    // 获取患者文件列表
    const response = await doctorApi.getPatientFiles(patient.id, {
      page: 1,
      pageSize: 100
    })
    
    if (response.code === 200) {
      // 解锁患者信息显示
      accessedPatients.value.add(patient.id)
      
      selectedPatient.value = patient
      activeDataType.value = patient.authorizedDataTypes[0] || ''
      currentTime.value = new Date().toLocaleString('zh-CN')
      accessDataVisible.value = true
      
      ElMessage.success(`已解锁 ${patient.name} 的患者信息访问权限`)
    } else {
      ElMessage.warning(response.message || '无法访问患者数据')
    }
  } catch (error: any) {
    console.error('访问患者数据失败:', error)
    ElMessage.error(error.response?.data?.message || '访问患者数据失败')
  }
}


// 查看访问历史
const viewAccessHistory = async (patient: any) => {
  try {
    selectedPatient.value = patient
    
    // 获取该患者的访问历史
    const response = await doctorApi.getAccessHistory({
      patientId: patient.id,
      page: 1,
      pageSize: 100
    })
    
    if (response.code === 200 && response.data) {
      accessHistory.value = response.data.items || []
      filteredHistory.value = response.data.items || []
    } else {
      // 使用模拟数据作为后备
      accessHistory.value = mockAccessHistory
      filteredHistory.value = mockAccessHistory
    }
    
    accessHistoryVisible.value = true
  } catch (error) {
    console.error('加载访问历史失败:', error)
    // 使用模拟数据作为后备
    accessHistory.value = mockAccessHistory
    filteredHistory.value = mockAccessHistory
    accessHistoryVisible.value = true
  }
}

// 根据数据类型获取患者数据
const getPatientDataByType = (dataType: string) => {
  return medicalDataByType[dataType] || []
}

// 查看数据详情
const viewDataDetail = (data: any) => {
  ElMessage.success(`查看${data.title}详细信息`)
  // 这里可以打开数据详情对话框
}

// 下载数据
const downloadData = (data: any) => {
  ElMessage.success(`正在下载${data.title}...`)
  // 这里可以实现文件下载逻辑
}

// 导出全部数据
const exportAllData = () => {
  ElMessage.success(`正在导出${selectedPatient.value?.name}的全部医疗数据...`)
  accessDataVisible.value = false
}


// 获取本月访问次数
const getMonthlyAccess = () => {
  const currentMonth = new Date().getMonth()
  return accessHistory.value.filter((record: any) => {
    const recordDate = new Date(record.accessTime)
    return recordDate.getMonth() === currentMonth
  }).length
}

// 获取最近访问天数
const getLastAccessDays = () => {
  if (accessHistory.value.length === 0) return 0
  const lastAccess = new Date(accessHistory.value[0].accessTime)
  const today = new Date()
  return Math.floor((today.getTime() - lastAccess.getTime()) / (24 * 60 * 60 * 1000))
}

// 获取总访问时长
const getTotalDuration = () => {
  return accessHistory.value.length * 8 // 模拟平均8分钟
}

// 获取操作类型样式
const getOperationType = (operation: string) => {
  switch (operation) {
    case '查看': return 'info'
    case '下载': return 'success'
    case '分享': return 'warning'
    default: return 'info'
  }
}

// 筛选历史记录
const filterHistory = () => {
  let result = accessHistory.value
  
  // 按日期范围筛选
  if (historyDateRange.value && historyDateRange.value.length === 2) {
    const [startDate, endDate] = historyDateRange.value
    result = result.filter((record: any) => {
      const recordDate = new Date(record.accessTime)
      return recordDate >= startDate && recordDate <= endDate
    })
  }
  
  // 按数据类型筛选
  if (historyDataType.value) {
    result = result.filter((record: any) => record.dataType === historyDataType.value)
  }
  
  // 按操作类型筛选
  if (historyOperation.value) {
    result = result.filter((record: any) => record.operation === historyOperation.value)
  }
  
  filteredHistory.value = result
}

// 导出历史记录
const exportHistory = () => {
  ElMessage.success(`正在导出${selectedPatient.value?.name}的访问历史记录...`)
}

const handleAddPatient = async () => {
  if (!patientFormRef.value) return
  
  try {
    await patientFormRef.value.validate()
    
    // 调用API申请访问患者数据权限
    const response = await doctorApi.requestPatientDataAccess({
      patientId: patientForm.value.idCard, // 使用身份证作为患者标识
      requestReason: '诊疗需要',
      requestedPermissions: patientForm.value.dataTypes,
      expiresAt: patientForm.value.expireDate
    })
    
    if (response.code === 200) {
      addPatientVisible.value = false
      ElMessage.success('患者授权申请已提交，等待患者确认')
      
      // 重新加载患者列表
      await loadPatients()
      
      // 统计数据会在重新加载时更新
    } else {
      ElMessage.error(response.message || '申请失败')
    }
  } catch (error: any) {
    console.error('添加患者失败:', error)
    ElMessage.error(error.response?.data?.message || '申请失败，请稍后重试')
  }
}

const handleSizeChange = async (size: number) => {
  pagination.value.size = size
  await loadPatients()
}

const handleCurrentChange = async (current: number) => {
  pagination.value.current = current
  await loadPatients()
}

// 组件挂载时初始化
onMounted(async () => {
  await loadPatients()
})
</script>

<style scoped>
.patients-management {
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

.stat-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-card.expiring {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #8b4513;
}

.stat-card.today {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2c3e50;
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

/* 患者列表卡片 */
.patients-list-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 患者信息列 */
.patient-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.patient-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.patient-details {
  flex: 1;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.patient-id {
  font-size: 12px;
  color: #999;
}

.data-count {
  font-weight: 600;
  color: #409eff;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 患者详情对话框 */
.patient-detail {
  padding: 20px;
}

.detail-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.detail-avatar .el-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.auth-data-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

/* 对话框底部 */
.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .patients-management {
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
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
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

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .patient-info {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

/* 表格样式增强 */
:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f8f9ff !important;
  cursor: pointer;
}

:deep(.el-button--text) {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-button--text:hover) {
  background-color: #409eff;
  color: white;
}

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* 访问数据对话框样式 */
.access-data-dialog {
  max-height: 80vh;
}

.access-data-content {
  padding: 20px;
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 1px solid #b3e5fc;
}

.patient-info-header h3 {
  margin: 0 0 8px 0;
  color: #1976d2;
  font-size: 20px;
  font-weight: 600;
}

.patient-info-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.access-time {
  margin-left: auto;
}

.data-tabs {
  margin-bottom: 20px;
}

.data-tabs :deep(.el-tabs__header) {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 16px;
}

.data-tabs :deep(.el-tabs__item) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.data-tabs :deep(.el-tabs__item.is-active) {
  background: #409eff;
  color: white;
}

.data-list {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}


/* 访问历史对话框样式 */
.access-history {
  padding: 20px;
}

.history-stats {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.history-stats :deep(.el-statistic) {
  text-align: center;
}

.history-stats :deep(.el-statistic__head) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.history-stats :deep(.el-statistic__content) {
  color: white;
  font-weight: bold;
  font-size: 24px;
}

.history-filter {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* 响应式设计增强 */
@media (max-width: 1200px) {
  .access-data-dialog {
    width: 95vw !important;
  }
  
  .patient-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .access-time {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .history-stats :deep(.el-row) {
    flex-direction: column;
    gap: 16px;
  }
  
  .history-filter :deep(.el-row) {
    flex-direction: column;
    gap: 8px;
  }
  
  .data-tabs :deep(.el-tabs__header) {
    padding: 4px;
  }
}
</style>
