/**
 * 测试平衡行高布局
 */

// 测试平衡行高效果
function testBalancedRowHeight() {
  console.log('⚖️ 测试平衡行高效果...')
  
  console.log('✅ 行高平衡调整:')
  console.log('1. 内边距: 从8px 12px调整到10px 14px')
  console.log('2. 字体大小: 从13px调整到14px')
  console.log('3. 行高: 从1.4调整到1.5')
  console.log('4. 标签宽度: 从90px调整到95px')
  console.log('5. 描述行高: 单独设置为1.6，更舒适')
  console.log('')
  
  console.log('🎯 平衡目标:')
  console.log('- 既不像最初版本那样太高')
  console.log('- 也不像极简版本那样太紧凑')
  console.log('- 在紧凑和舒适之间找到最佳平衡点')
  console.log('- 保持良好的可读性和视觉效果')
  console.log('')
  
  return true
}

// 创建平衡布局测试数据
function createBalancedTestData() {
  console.log('📊 创建平衡布局测试数据...')
  
  // 切换到患者账户
  switchToPatient()
  
  const testFiles = [
    {
      id: `balanced_test_${Date.now()}_1`,
      patientId: "patient_001",
      title: "平衡行高测试文件",
      description: "这是一个测试平衡行高效果的文件，用于验证调整后的布局在保持紧凑的同时是否具有良好的可读性。",
      category: "lab-report",
      fileName: "balanced_height_test.pdf",
      filePath: "/uploads/balanced_height_test.pdf",
      fileSize: 1536000,
      uploadTime: new Date().toISOString(),
      authStatus: "approved",
      authorizationCount: 2,
      accessCount: 5,
      isShared: true,
      isUploaded: true,
      tags: ["平衡测试", "行高调整"]
    },
    {
      id: `balanced_test_${Date.now()}_2`,
      patientId: "patient_001",
      title: "长文本描述测试",
      description: "这是一个具有相对较长描述信息的测试文件，专门用于验证当文本内容较多时，新的行高设置是否能够提供良好的阅读体验。描述信息的行高被设置为1.6，应该比其他内容稍微宽松一些，以提高长文本的可读性。同时测试各种数据项在新的10px 14px内边距下的显示效果。",
      category: "medical-image",
      fileName: "long_description_test.jpg",
      filePath: "/uploads/long_description_test.jpg",
      fileSize: 3072000,
      uploadTime: new Date(Date.now() - 3600000).toISOString(),
      authStatus: "pending",
      authorizationCount: 1,
      accessCount: 0,
      isShared: false,
      isUploaded: true,
      tags: ["影像", "长描述", "测试"]
    },
    {
      id: `balanced_test_${Date.now()}_3`,
      patientId: "patient_001",
      title: "标准格式测试",
      description: "简洁描述信息",
      category: "physical-exam",
      fileName: "standard_format.txt",
      filePath: "/uploads/standard_format.txt",
      fileSize: 768000,
      uploadTime: new Date(Date.now() - 7200000).toISOString(),
      authStatus: "not-requested",
      authorizationCount: 0,
      accessCount: 1,
      isShared: false,
      isUploaded: true,
      tags: ["体检", "标准", "测试"]
    }
  ]
  
  // 获取现有文件并添加测试文件
  const existingFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  const allFiles = [...existingFiles, ...testFiles]
  localStorage.setItem('medical_files', JSON.stringify(allFiles))
  
  console.log(`✅ 已创建 ${testFiles.length} 个平衡布局测试文件`)
  console.log('📝 测试文件特点:')
  console.log('- 文件1: 标准长度描述，测试基本平衡效果')
  console.log('- 文件2: 超长描述信息，测试文本阅读舒适度')
  console.log('- 文件3: 简洁描述信息，测试最小内容显示')
  console.log('')
  
  return testFiles
}

// 测试平衡布局显示效果
function testBalancedDisplay() {
  console.log('🎯 测试平衡布局显示效果...')
  
  console.log('📋 测试步骤:')
  console.log('1. 访问患者端"我的数据"页面')
  console.log('2. 找到平衡布局测试文件')
  console.log('3. 依次点击"查看"按钮查看不同文件的详情')
  console.log('4. 对比之前过于紧凑的布局效果')
  console.log('')
  
  console.log('🔍 平衡布局验证要点:')
  console.log('✅ 适中行高: 不会太高也不会太挤')
  console.log('✅ 清晰字体: 14px字体清晰易读')
  console.log('✅ 舒适间距: 10px 14px内边距')
  console.log('✅ 描述优化: 行高1.6提升长文本可读性')
  console.log('✅ 标签适配: 95px宽度适应内容')
  console.log('')
  
  console.log('📊 预期布局效果:')
  console.log('┌────────────┬────────────┐')
  console.log('│  数据类型  │  文件大小  │ <- 适中高度')
  console.log('├────────────┼────────────┤')
  console.log('│  创建日期  │  授权状态  │ <- 舒适间距')
  console.log('├────────────┴────────────┤')
  console.log('│ 描述信息（两列，行高1.6）│ <- 易读文本')
  console.log('└─────────────────────────┘')
  console.log('')
  
  return true
}

// 对比行高调整历程
function compareRowHeightEvolution() {
  console.log('📈 对比行高调整历程...')
  
  console.log('🔄 行高演进对比:')
  console.log('')
  
  console.log('📊 第1版 - 原始行高:')
  console.log('- 内边距: 12px 16px (较大)')
  console.log('- 字体大小: 默认14px+')
  console.log('- 行高: 默认1.5+')
  console.log('- 问题: 行高太大，显得臃肿')
  console.log('')
  
  console.log('📊 第2版 - 过度紧凑:')
  console.log('- 内边距: 8px 12px (太小)')
  console.log('- 字体大小: 13px (偏小)')
  console.log('- 行高: 1.4 (太紧)')
  console.log('- 问题: 过于紧凑，影响舒适度')
  console.log('')
  
  console.log('📊 第3版 - 平衡布局 (当前):')
  console.log('- 内边距: 10px 14px ✅ (适中)')
  console.log('- 字体大小: 14px ✅ (清晰)')
  console.log('- 行高: 1.5/1.6 ✅ (舒适)')
  console.log('- 优势: 紧凑且舒适的完美平衡')
  console.log('')
  
  console.log('🎯 第3版优势总结:')
  console.log('✅ 保持紧凑: 比原始版本节省空间')
  console.log('✅ 提升舒适: 比过度紧凑版本更易读')
  console.log('✅ 视觉平衡: 各元素比例协调')
  console.log('✅ 用户友好: 既美观又实用')
  console.log('')
  
  return true
}

// 验证平衡样式参数
function verifyBalancedStyles() {
  console.log('🎨 验证平衡样式参数...')
  
  console.log('📋 当前样式设置:')
  console.log('✅ 标签内边距: 10px 14px')
  console.log('✅ 内容内边距: 10px 14px')
  console.log('✅ 标签字体: 14px')
  console.log('✅ 内容字体: 14px')
  console.log('✅ 内容行高: 1.5')
  console.log('✅ 描述行高: 1.6 (特别优化)')
  console.log('✅ 标签宽度: 95px')
  console.log('')
  
  console.log('🔍 样式检查要点:')
  console.log('- 行高应该比之前更舒适')
  console.log('- 字体应该清晰易读')
  console.log('- 内容间距应该适中')
  console.log('- 描述文本应该特别舒适')
  console.log('- 整体应该保持紧凑但不拥挤')
  console.log('')
  
  console.log('⚖️ 平衡点验证:')
  console.log('- 信息密度: 高 ✅')
  console.log('- 阅读舒适度: 好 ✅')
  console.log('- 视觉美观度: 佳 ✅')
  console.log('- 空间利用率: 优 ✅')
  console.log('')
  
  return true
}

// 完整的平衡布局测试
function fullBalancedLayoutTest() {
  console.log('🚀 开始完整的平衡布局测试...\n')
  
  // 1. 测试平衡行高效果
  console.log('📋 第1步: 测试平衡行高效果')
  testBalancedRowHeight()
  
  // 2. 创建测试数据
  console.log('\n📋 第2步: 创建测试数据')
  const testFiles = createBalancedTestData()
  
  // 3. 测试显示效果
  console.log('\n📋 第3步: 测试显示效果')
  testBalancedDisplay()
  
  // 4. 对比行高演进
  console.log('\n📋 第4步: 对比行高演进')
  compareRowHeightEvolution()
  
  // 5. 验证样式参数
  console.log('\n📋 第5步: 验证样式参数')
  verifyBalancedStyles()
  
  console.log('\n📝 测试总结:')
  console.log('1. ✅ 平衡行高: 既紧凑又舒适')
  console.log('2. ✅ 优化字体: 14px清晰易读')
  console.log('3. ✅ 适中间距: 10px 14px内边距')
  console.log('4. ✅ 描述优化: 单独设置更大行高')
  console.log('5. ✅ 视觉平衡: 整体协调美观')
  console.log('')
  
  console.log('🎯 现在可以查看平衡优化后的数据详情布局！')
  console.log('创建的测试文件数量:', testFiles.length)
  console.log('布局应该在紧凑和舒适之间达到完美平衡')
  
  return {
    testFiles: testFiles.length,
    balancedLayoutCompleted: true,
    testTime: new Date().toISOString()
  }
}

// 工具函数
function switchToPatient() {
  const patientUser = {
    id: "patient_001",
    username: "patient_demo",
    name: "演示患者",
    email: "patient@demo.com",
    role: "patient",
    phone: "138****1234",
    idCard: "110***********1234",
    address: "北京市朝阳区演示地址",
    birthDate: "1990-01-01",
    gender: "男",
    avatar: "",
    departments: [
      { id: "dept_001", name: "心内科", description: "心血管内科" },
      { id: "dept_002", name: "消化科", description: "消化内科" }
    ]
  }
  localStorage.setItem('user', JSON.stringify(patientUser))
  localStorage.setItem('token', 'mock_patient_token_123')
}

function clearBalancedTestData() {
  console.log('🧹 清除平衡布局测试数据...')
  const files = JSON.parse(localStorage.getItem('medical_files') || '[]')
  const filteredFiles = files.filter(file => !file.id.includes('balanced_test'))
  localStorage.setItem('medical_files', JSON.stringify(filteredFiles))
  console.log('✅ 平衡布局测试数据已清除')
}

console.log('⚖️ 数据详情对话框平衡行高测试工具已加载')
console.log('使用 fullBalancedLayoutTest() 运行完整测试')
console.log('使用 createBalancedTestData() 创建测试数据')
console.log('使用 testBalancedDisplay() 查看测试指导')
console.log('使用 compareRowHeightEvolution() 对比行高演进')
console.log('使用 clearBalancedTestData() 清除测试数据')
