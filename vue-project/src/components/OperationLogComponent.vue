<template>
  <div class="operation-log-container">
    <!-- 简化的标题栏 -->
    <div class="compact-header">
      <div class="header-left">
        <h3 class="title">
          <el-icon class="title-icon"><List /></el-icon>
          操作记录日志
        </h3>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索..."
          :prefix-icon="Search"
          clearable
          size="small"
          style="width: 200px;"
          @input="handleSearch"
        />
        <el-button size="small" @click="refreshLogs" :icon="Refresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 操作记录列表 - 记事本格式 -->
    <div class="log-list-container" v-loading="loading">
      <div class="log-content">
        <div 
          v-for="(line, index) in paginatedLines" 
          :key="index"
          class="log-line"
        >
          <div class="log-line-content">
            <span class="log-text">{{ line }}</span>
          </div>
          <div class="log-line-number">{{ String(index + 1 + (currentPage - 1) * pageSize).padStart(3, '0') }}</div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="paginatedLines.length === 0" class="empty-logs">
          <el-empty description="暂无操作记录" :image-size="80" />
        </div>
      </div>
    </div>

    <!-- 简化分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 15, 20, 50]"
        :total="totalLogs"
        layout="total, prev, pager, next"
        size="small"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Search, 
  Refresh, 
  List
} from '@element-plus/icons-vue'

// Props
interface Props {
  userRole?: 'doctor' | 'patient' | 'all'
  customLines?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  userRole: 'all',
  customLines: () => []
})

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const dateRange = ref<[string, string] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

// =========================================================================================
// 📝 操作日志数据 - 直接输入每一行的文本内容
// =========================================================================================
const logLines = ref<string[]>(props.customLines.length > 0 ? props.customLines : [
  // '2025/10/20 19:17:46 id: 330101199001011234 恶意用户 已撤销',
  // '2025/10/20 19:10:25 密文 ZhDSPHfLEHcK1FYsrLfNDrGVWHgZcRPeAjw6g85NebYT 访问者 已被追溯',
  // '2025/10/20 19:10:23 密文 VMtMiFc72iTmtvV6hJ4q9rncMMfP3u5SUEREvxZr7BLb 访问者 已被追溯',
  // '2025/10/20 19:10:23 密文 UZrFGshMbAaU2EmAsTyLBPhoxHRT9BdHRqTJaqHQbVoM 访问者 已被追溯',
  // '2025/10/20 19:07:10 密文 ZhDSPHfLEHcK1FYsrLfNDrGVWHgZcRPeAjw6g85NebYT 拥有者 已被追溯',
  // '2025/10/20 19:05:17 密文 ZhDSPHfLEHcK1FYsrLfNDrGVWHgZcRPeAjw6g85NebYT 呼吸内科 已被访问',
  '2025/10/20 19:03:20 密文 ZhDSPHfLEHcK1FYsrLfNDrGVWHgZcRPeAjw6g85NebYT 呼吸内科 已被授权且患者已支付诊费',
  '2025/10/20 19:03:20 密文 ZhDSPHfLEHcK1FYsrLfNDrGVWHgZcRPeAjw6g85NebYT 呼吸内科 重加密密文验证成功',
  '2025/10/20 19:03:20 密文 ZhDSPHfLEHcK1FYsrLfNDrGVWHgZcRPeAjw6g85NebYT 呼吸内科 重加密密钥验证成功',
  '2025/10/20 19:01:33 呼吸内科 数据被申请访问',
  '2025/10/20 18:54:05 密文 ZhDSPHfLEHcK1FYsrLfNDrGVWHgZcRPeAjw6g85NebYT 呼吸内科 上传成功',//X光
  '2025/10/20 18:53:29 密文 X6fN3q4YXhinJtxgJFe16Mczxg5GzMRGVQXrBVXBK8Bb 呼吸内科 上传成功',//血常规
  '2025/10/20 18:53:07 密文 ajWG12wvAR7CuyzQy2R6GMvv7qiNgbeYkFoB3VwQmDVp 呼吸内科 上传成功',//处方单
  '2025/10/16 13:07:32 密文 ejTAdhY8aaiG3RkYyFSaAcHkYi5LcV45zg2dVDGLHfCe 呼吸内科 已被授权',
  '2025/10/16 13:07:32 密文 X6fN3q4YXhinJtxgJFe16Mczxg5GzMRGVQXrBVXBK8Bb 呼吸内科 已被授权',
  '2025/10/16 13:07:27 密文 UZrFGshMbAaU2EmAsTyLBPhoxHRT9BdHRqTJaqHQbVoM 呼吸内科 已被授权',
  '2025/10/16 13:07:22 密文 VMtMiFc72iTmtvV6hJ4q9rncMMfP3u5SUEREvxZr7BLb 呼吸内科 已被授权',
  '2025/10/16 13:07:19 密文 YY2Rr3V29uw5FLgz1RnnKUPmNkVcB8qVU7DkLxmcthcY 呼吸内科 已被授权',
  '2025/10/16 13:05:40 呼吸内科 数据被申请访问',
  '2025/10/16 09:44:06 密文 YY2Rr3V29uw5FLgz1RnnKUPmNkVcB8qVU7DkLxmcthcY 呼吸内科 上传成功',
  '2025/10/16 09:43:13 密文 UZrFGshMbAaU2EmAsTyLBPhoxHRT9BdHRqTJaqHQbVoM 呼吸内科 上传成功',
  '2025/10/16 09:42:14 密文 VMtMiFc72iTmtvV6hJ4q9rncMMfP3u5SUEREvxZr7BLb 呼吸内科 上传成功',
  '2025/10/16 09:40:42 密文 brR8gG2RxUH6qifLSF1G2dVG4mLgawWroHgC355nVd28 呼吸内科 上传成功',
  '2025/10/16 09:20:47 密文 TZmdQhjZo1sm1691urVXufiG2YatVSWPZux11dbvRmAr 呼吸内科 上传成功',
  '2025/10/16 09:18:46 密文 ejTAdhY8aaiG3RkYyFSaAcHkYi5LcV45zg2dVDGLHfCe 呼吸内科 上传成功',
  '2025/10/16 09:17:07 密文 cHM3yPjhEtzvuseGmNbb2iy1gDgheYGT6vnXaPEZpiCx 呼吸内科 上传成功',
  '2025/10/16 09:15:47 密文 X6fN3q4YXhinJtxgJFe16Mczxg5GzMRGVQXrBVXBK8Bb 呼吸内科 上传成功',
])

// 计算属性
const filteredLines = computed(() => {
  let filtered = logLines.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(line => 
      line.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

const totalLogs = computed(() => filteredLines.value.length)

// 分页数据
const paginatedLines = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLines.value.slice(start, end)
})

// 方法

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const refreshLogs = () => {
  loading.value = true
  // 模拟刷新
  setTimeout(() => {
    loading.value = false
  }, 1000)
}


// 生命周期
onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<style scoped>
.operation-log-container {
  background: #ffffff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.compact-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  flex-shrink: 0;
}

.header-left {
  flex: 1;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 18px;
}


.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
}

/* 记事本风格的日志列表容器 */
.log-list-container {
  flex: 1;
  background: #ffffff;
  color: #333333;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  border-radius: 4px;
  margin: 8px;
  border: 1px solid #e0e0e0;
}

.log-content {
  height: 240px;
  overflow-y: auto;
  padding: 8px 0 32px 0; /* 增加底部内边距至32px，确保最后一行完整显示 */
  scroll-behavior: smooth; /* 添加平滑滚动 */
}

/* 每行日志的样式 */
.log-line {
  display: flex;
  align-items: center;
  padding: 6px 12px 6px 0; /* 增加上下内边距，给每行更多空间 */
  border-left: 3px solid transparent;
  min-height: 28px; /* 增加最小高度，确保内容完整显示 */
  transition: background-color 0.2s ease;
}

.log-line:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-left-color: #409eff;
}

.log-line:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.02);
}

.log-line-number {
  width: 40px;
  text-align: right;
  color: #888888;
  font-size: 12px;
  margin-left: 16px;
  flex-shrink: 0;
  user-select: none;
  border-left: 1px solid #d0d0d0;
  padding-left: 8px;
}

.log-line-content {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

/* 日志文本内容 */
.log-text {
  color: #333333;
  flex: 1;
  line-height: 1.5;
  word-wrap: break-word;
  font-size: 15px;
}

/* 空状态 */
.empty-logs {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666666;
}

.empty-logs :deep(.el-empty__description p) {
  color: #666666;
}

.pagination-container {
  padding: 8px 16px;
  display: flex;
  justify-content: center;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .compact-header {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    min-height: auto;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .title {
    font-size: 14px;
  }
  
  .title-icon {
    font-size: 16px;
  }
  
  /* 移动端日志行样式调整 */
  .log-list-container {
    font-size: 12px;
    margin: 4px;
  }
  
  .log-content {
    height: 200px;
    padding: 8px 0 32px 0; /* 移动端也增加底部内边距至32px */
  }
  
  .log-line {
    padding: 6px 8px 6px 0; /* 移动端也增加上下内边距 */
    min-height: 30px; /* 移动端适当增加最小高度 */
  }
  
  .log-line-number {
    width: 30px;
    font-size: 11px;
    margin-left: 8px;
    padding-left: 4px;
    border-left: 1px solid #d0d0d0;
  }
  
  .log-line-content {
    gap: 4px;
  }
  
  .log-text {
    font-size: 14px;
    line-height: 1.4;
  }
}
</style>
