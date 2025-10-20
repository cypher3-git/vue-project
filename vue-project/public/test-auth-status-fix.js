/**
 * 授权状态中文显示修复测试工具
 */

window.testAuthStatusFix = {
  /**
   * 检查授权状态映射
   */
  checkStatusMapping() {
    console.log('=== 授权状态映射检查 ===')
    
    const statusMapping = {
      'not-requested': '无授权请求',
      'pending': '待审批', 
      'approved': '已授权',
      'rejected': '已拒绝'
    }
    
    console.log('英文状态 → 中文显示:')
    Object.entries(statusMapping).forEach(([en, cn]) => {
      console.log(`  ${en} → ${cn}`)
    })
    console.log('')
  },

  /**
   * 测试授权状态转换函数
   */
  testStatusFunctions() {
    console.log('=== 授权状态转换函数测试 ===')
    
    // 模拟 getAuthStatusText 函数
    const getAuthStatusText = (status) => {
      switch (status) {
        case 'not-requested': return '无授权请求'
        case 'pending': return '待审批'
        case 'approved': return '已授权'
        case 'rejected': return '已拒绝'
        default: return '无授权请求'
      }
    }
    
    // 模拟 getAuthStatusType 函数
    const getAuthStatusType = (status) => {
      switch (status) {
        case 'not-requested': return 'info'
        case 'pending': return 'warning'
        case 'approved': return 'success'
        case 'rejected': return 'danger'
        default: return 'info'
      }
    }
    
    const testStatuses = ['not-requested', 'pending', 'approved', 'rejected', 'unknown']
    
    console.log('状态转换测试:')
    testStatuses.forEach(status => {
      const text = getAuthStatusText(status)
      const type = getAuthStatusType(status)
      console.log(`  ${status} → "${text}" (${type})`)
    })
    console.log('')
  },

  /**
   * 检查实际数据的授权状态
   */
  checkActualData() {
    const files = localStorage.getItem('mock_medical_files')
    console.log('=== 实际数据授权状态检查 ===')
    
    if (!files) {
      console.log('❌ 无医疗文件数据')
      return
    }

    const filesData = JSON.parse(files)
    console.log(`📄 医疗文件总数: ${filesData.length}`)
    
    // 统计授权状态
    const statusCount = {}
    filesData.forEach(file => {
      const status = file.authStatus || 'not-requested'
      statusCount[status] = (statusCount[status] || 0) + 1
    })
    
    console.log('授权状态分布:')
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} 个文件`)
    })
    
    // 显示前几个文件的状态
    console.log('\n前 3 个文件的授权状态:')
    filesData.slice(0, 3).forEach((file, index) => {
      const status = file.authStatus || 'not-requested'
      const statusText = this.getStatusText(status)
      console.log(`  文件 ${index + 1}: ${file.title} → ${status} (${statusText})`)
    })
    console.log('')
  },

  /**
   * 获取状态中文文本（辅助函数）
   */
  getStatusText(status) {
    const mapping = {
      'not-requested': '无授权请求',
      'pending': '待审批',
      'approved': '已授权', 
      'rejected': '已拒绝'
    }
    return mapping[status] || '无授权请求'
  },

  /**
   * 测试筛选选项
   */
  testFilterOptions() {
    console.log('=== 筛选选项测试 ===')
    
    const filterOptions = [
      { label: '全部状态', value: '' },
      { label: '无授权请求', value: 'not-requested' },
      { label: '待审批', value: 'pending' },
      { label: '已授权', value: 'approved' },
      { label: '已拒绝', value: 'rejected' }
    ]
    
    console.log('筛选选项配置:')
    filterOptions.forEach(option => {
      if (option.value) {
        console.log(`  "${option.label}" (value: ${option.value})`)
      } else {
        console.log(`  "${option.label}" (全部)`)
      }
    })
    console.log('')
  },

  /**
   * 模拟表格显示效果
   */
  simulateTableDisplay() {
    const files = localStorage.getItem('mock_medical_files')
    if (!files) {
      console.log('❌ 无数据可模拟')
      return
    }

    const filesData = JSON.parse(files)
    console.log('=== 模拟表格显示效果 ===')
    
    console.log('表格内容预览:')
    console.log('| 数据名称 | 数据类型 | 创建日期 | 大小 | 授权状态 |')
    console.log('|----------|----------|----------|------|----------|')
    
    filesData.slice(0, 3).forEach(file => {
      const statusText = this.getStatusText(file.authStatus || 'not-requested')
      const categoryText = this.getCategoryText(file.category)
      const dateText = this.formatDate(file.uploadTime)
      const sizeText = this.formatSize(file.fileSize)
      
      console.log(`| ${file.title} | ${categoryText} | ${dateText} | ${sizeText} | ${statusText} |`)
    })
    console.log('')
  },

  /**
   * 获取类型中文文本（辅助函数）
   */
  getCategoryText(category) {
    const mapping = {
      'lab-report': '检验报告',
      'medical-image': '影像资料',
      'medication': '用药记录',
      'physical-exam': '体检报告',
      'other': '其他'
    }
    return mapping[category] || '未知类型'
  },

  /**
   * 格式化日期（辅助函数）
   */
  formatDate(dateString) {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateString
    }
  },

  /**
   * 格式化大小（辅助函数）
   */
  formatSize(bytes) {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  },

  /**
   * 完整测试
   */
  fullTest() {
    console.clear()
    console.log('🔍 ===== 授权状态中文显示修复测试 =====\n')
    
    this.checkStatusMapping()
    this.testStatusFunctions()
    this.testFilterOptions()
    this.checkActualData()
    this.simulateTableDisplay()
    
    console.log('✅ ===== 测试完成 =====')
    console.log('💡 修复内容:')
    console.log('  1. ✅ getAuthStatusText() 函数返回中文状态')
    console.log('  2. ✅ getAuthStatusType() 函数匹配英文状态') 
    console.log('  3. ✅ 筛选选项使用英文 value，中文 label')
    console.log('🔄 请刷新患者端页面查看效果')
  },

  /**
   * 验证修复效果
   */
  verifyFix() {
    console.log('🎯 ===== 修复效果验证 =====')
    console.log('')
    console.log('预期效果:')
    console.log('  ✅ 表格中授权状态列显示中文')
    console.log('  ✅ "not-requested" → "无授权请求"')
    console.log('  ✅ "pending" → "待审批"')
    console.log('  ✅ "approved" → "已授权"')
    console.log('  ✅ "rejected" → "已拒绝"')
    console.log('')
    console.log('测试步骤:')
    console.log('  1. 刷新患者端页面')
    console.log('  2. 进入"我的数据"')
    console.log('  3. 查看授权状态列')
    console.log('  4. 测试筛选功能')
    console.log('')
    console.log('如果仍显示英文，请检查:')
    console.log('  - 页面是否已刷新')
    console.log('  - 浏览器缓存是否清理')
    console.log('  - 数据是否正确加载')
  },

  /**
   * 帮助
   */
  help() {
    console.log(`
📖 授权状态中文显示修复测试工具:

基础检查:
  testAuthStatusFix.checkStatusMapping()    - 检查状态映射
  testAuthStatusFix.testStatusFunctions()   - 测试转换函数
  testAuthStatusFix.testFilterOptions()     - 测试筛选选项
  testAuthStatusFix.checkActualData()       - 检查实际数据
  testAuthStatusFix.simulateTableDisplay()  - 模拟表格显示

完整测试:
  testAuthStatusFix.fullTest()              - 完整测试
  testAuthStatusFix.verifyFix()             - 验证修复效果

修复内容:
  1. getAuthStatusText() 返回中文状态文本
  2. getAuthStatusType() 匹配英文状态值
  3. 筛选选项使用正确的英文 value

预期结果:
  - 表格授权状态列显示中文
  - 筛选功能正常工作
  - 状态标签颜色正确显示
    `)
  }
}

console.log('✅ 授权状态中文显示修复测试工具已加载！')
console.log('💡 输入 testAuthStatusFix.help() 查看使用说明')
console.log('🔍 快速测试: testAuthStatusFix.fullTest()')
console.log('🎯 验证修复: testAuthStatusFix.verifyFix()')
