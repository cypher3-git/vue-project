/**
 * 表格显示修复测试工具
 */

window.testTableFix = {
  /**
   * 检查数据字段
   */
  checkDataFields() {
    const files = localStorage.getItem('mock_medical_files')
    console.log('=== 数据字段检查 ===')
    
    if (!files) {
      console.log('❌ 无医疗文件数据')
      return
    }

    const data = JSON.parse(files)
    if (data.length === 0) {
      console.log('❌ 医疗文件数据为空')
      return
    }

    const firstFile = data[0]
    console.log('📋 数据字段结构:')
    
    // 检查关键字段
    const keyFields = ['title', 'category', 'uploadTime', 'fileSize', 'description']
    keyFields.forEach(field => {
      const value = firstFile[field]
      if (value !== undefined) {
        console.log(`  ✅ ${field}: ${value} (${typeof value})`)
      } else {
        console.log(`  ❌ ${field}: 缺失`)
      }
    })

    console.log('\n📊 所有字段:')
    Object.keys(firstFile).forEach(key => {
      console.log(`  - ${key}: ${firstFile[key]}`)
    })
    console.log('')
  },

  /**
   * 检查字段映射
   */
  checkFieldMapping() {
    console.log('=== 字段映射检查 ===')
    console.log('表格期望 → 数据实际:')
    console.log('  name → title')
    console.log('  type → category (使用 getCategoryLabel 转换)')
    console.log('  date → uploadTime (使用 formatDate 转换)')
    console.log('  size → fileSize (使用 formatFileSize 转换)')
    console.log('')
  },

  /**
   * 检查类型映射
   */
  checkCategoryMapping() {
    console.log('=== 类型映射检查 ===')
    console.log('标准 FileCategory 值:')
    console.log('  lab-report → 检验报告')
    console.log('  medical-image → 影像资料')
    console.log('  medication → 用药记录')
    console.log('  physical-exam → 体检报告')
    console.log('  other → 其他类型')
    console.log('')

    // 检查实际数据的 category 值
    const files = localStorage.getItem('mock_medical_files')
    if (files) {
      const data = JSON.parse(files)
      console.log('📊 实际数据的 category 值:')
      const categories = [...new Set(data.map(f => f.category))]
      categories.forEach(cat => {
        console.log(`  - ${cat}`)
      })
    }
    console.log('')
  },

  /**
   * 模拟表格数据处理
   */
  simulateTableDisplay() {
    const files = localStorage.getItem('mock_medical_files')
    if (!files) {
      console.log('❌ 无数据可模拟')
      return
    }

    const data = JSON.parse(files)
    console.log('=== 模拟表格显示 ===')
    
    // 模拟 getCategoryLabel 函数
    const getCategoryLabel = (category) => {
      const map = {
        'lab-report': '检验报告',
        'medical-image': '影像资料',
        'medication': '用药记录',
        'physical-exam': '体检报告',
        'other': '其他类型'
      }
      return map[category] || '未知类型'
    }

    // 模拟 formatDate 函数
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch {
        return dateString
      }
    }

    // 模拟 formatFileSize 函数
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    data.forEach((file, index) => {
      console.log(`\n📋 文件 ${index + 1}:`)
      console.log(`  名称: ${file.title || '❌ 空'}`)
      console.log(`  类型: ${getCategoryLabel(file.category) || '❌ 空'}`)
      console.log(`  日期: ${formatDate(file.uploadTime) || '❌ 空'}`)
      console.log(`  大小: ${formatFileSize(file.fileSize) || '❌ 空'}`)
      console.log(`  描述: ${file.description || '❌ 空'}`)
    })
    console.log('')
  },

  /**
   * 创建测试数据
   */
  createTestData() {
    console.log('🚀 创建测试数据...')
    
    const testFile = {
      id: `test_${Date.now()}`,
      title: '测试血常规报告',
      description: '这是一个测试数据，用于验证表格显示',
      fileName: 'blood_test.pdf',
      originalName: 'blood_test.pdf',
      fileSize: 204800, // 200KB
      fileType: 'pdf',
      mimeType: 'application/pdf',
      category: 'lab-report', // 标准值
      status: 'completed',
      uploadTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patientId: 'demo_patient_001',
      downloadCount: 0,
      viewCount: 0,
      authStatus: 'not-requested',
      authorizationCount: 0,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      patientName: '李靖',
      patientIdCard: '421181200303093232',
      patientPhone: '19972858976',
      patientGender: 'male',
      patientAge: 21
    }

    // 获取现有数据
    const existingFiles = localStorage.getItem('mock_medical_files')
    const files = existingFiles ? JSON.parse(existingFiles) : []
    
    // 添加测试数据
    files.push(testFile)
    localStorage.setItem('mock_medical_files', JSON.stringify(files))
    
    console.log('✅ 测试数据已创建')
    console.log('📄 测试文件:', testFile.title)
    console.log('📅 类型:', testFile.category)
    console.log('💡 请刷新页面查看表格显示')
    console.log('')
  },

  /**
   * 完整测试
   */
  fullTest() {
    console.clear()
    console.log('🔍 ===== 表格显示修复测试 =====\n')
    
    this.checkDataFields()
    this.checkFieldMapping()
    this.checkCategoryMapping()
    this.simulateTableDisplay()
    
    console.log('✅ ===== 测试完成 =====')
    console.log('💡 如果显示正常，说明修复成功！')
    console.log('🔄 如果仍有问题，请刷新页面重试')
  },

  /**
   * 帮助
   */
  help() {
    console.log(`
📖 表格显示修复测试工具:

基础检查:
  testTableFix.checkDataFields()     - 检查数据字段
  testTableFix.checkFieldMapping()   - 检查字段映射
  testTableFix.checkCategoryMapping() - 检查类型映射
  testTableFix.simulateTableDisplay() - 模拟表格显示

测试功能:
  testTableFix.createTestData()      - 创建测试数据
  testTableFix.fullTest()            - 完整测试

快速诊断:
  testTableFix.fullTest()            - 一键测试所有功能

预期结果:
  - 名称字段显示文件标题
  - 类型字段显示中文标签
  - 日期字段显示格式化日期
  - 大小字段显示格式化大小
  - 描述字段显示完整描述
    `)
  }
}

console.log('✅ 表格显示修复测试工具已加载！')
console.log('💡 输入 testTableFix.help() 查看使用说明')
console.log('🔍 快速测试: testTableFix.fullTest()')
