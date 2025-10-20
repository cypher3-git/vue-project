/**
 * 测试授权请求详情对话框布局调整
 */

// 测试详情对话框布局调整
function testDetailLayoutFix() {
  console.log('🔧 测试授权请求详情对话框布局调整...')
  
  // 切换到患者账户
  switchToPatient()
  
  console.log('📋 布局调整:')
  console.log('✅ 现在的布局:')
  console.log('  第1行: 请求数据 | 数据类型')
  console.log('  第2行: 申请时间 | 使用目的  ← 新调整')
  console.log('  第3行: 申请理由（占整行）')
  console.log('  第4行: 请求状态 | 处理时间')
  
  console.log('\n📋 修改说明:')
  console.log('- 申请时间和使用目的现在在同一行显示')
  console.log('- 申请理由仍占整行，保持内容的完整性')
  console.log('- 整体布局更紧凑，信息展示更高效')
  
  return true
}

// 创建详情对话框测试数据
function createDetailDialogTestData() {
  console.log('📊 创建授权请求详情对话框测试数据...')
  
  // 确保有医疗文件
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  if (medicalFiles.length === 0) {
    const testFile = {
      id: `file_${Date.now()}`,
      patientId: "patient_001",
      title: "肝功能检查报告",
      description: "肝功能生化检查报告",
      category: "lab-report",
      fileName: "liver_function_test.pdf",
      filePath: "/uploads/liver_function_test.pdf",
      fileSize: 768000,
      uploadTime: new Date().toISOString(),
      authStatus: "pending",
      authorizationCount: 1,
      accessCount: 0,
      isShared: false,
      tags: ["肝功能", "生化检查"]
    }
    medicalFiles.push(testFile)
    localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  }
  
  // 创建包含完整信息的授权请求
  const testRequests = [
    {
      id: `auth_req_${Date.now()}_1`,
      dataId: medicalFiles[0].id,
      dataName: "肝功能检查报告",
      dataType: "lab-report",
      doctorId: "doctor_001",
      doctorName: "陈医生",
      doctorDepartment: "消化内科",
      doctorHospital: "演示医院",
      doctorIdCard: "110101198503151234",
      reason: `患者肝区不适需要查看肝功能指标评估肝脏健康状态，制定相应的治疗方案\n使用目的：diagnosis`,
      status: "pending",
      requestedAt: "2025-10-14T10:30:45.123Z",
      isIdentityRevealed: false
    },
    {
      id: `auth_req_${Date.now()}_2`,
      dataId: medicalFiles[0].id,
      dataName: "血脂检查报告",
      dataType: "lab-report", 
      doctorId: "doctor_002",
      doctorName: "王医生",
      doctorDepartment: "心内科",
      doctorHospital: "演示医院",
      doctorIdCard: "320102198708206789",
      reason: `评估患者心血管疾病风险需要分析血脂水平变化趋势\n使用目的：evaluation`,
      status: "approved",
      requestedAt: "2025-10-13T14:15:30.456Z",
      processedAt: "2025-10-14T09:20:15.789Z",
      isIdentityRevealed: true
    },
    {
      id: `auth_req_${Date.now()}_3`,
      dataId: medicalFiles[0].id,
      dataName: "甲状腺功能检查",
      dataType: "lab-report",
      doctorId: "doctor_003",
      doctorName: "李医生", 
      doctorDepartment: "内分泌科",
      doctorHospital: "演示医院",
      doctorIdCard: "440301199205128765",
      reason: `参与内分泌代谢疾病流行病学研究项目，需要收集甲状腺功能数据进行分析\n使用目的：research`,
      status: "rejected",
      requestedAt: "2025-10-12T16:45:20.012Z",
      processedAt: "2025-10-13T11:30:10.345Z",
      rejectReason: "研究项目暂停，无法使用患者数据",
      isIdentityRevealed: false
    }
  ]
  
  // 保存授权请求
  const existingRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  const updatedRequests = [...existingRequests, ...testRequests]
  localStorage.setItem('authorization_requests', JSON.stringify(updatedRequests))
  
  console.log(`✅ 已创建 ${testRequests.length} 个授权请求详情测试数据`)
  console.log('📝 数据特点:')
  console.log('- 包含完整的申请时间和使用目的信息')
  console.log('- 包含不同状态: pending、approved、rejected')
  console.log('- 包含处理时间（approved和rejected状态）')
  console.log('- 申请理由较长，适合测试布局效果')
  
  return testRequests
}

// 验证详情对话框布局
function verifyDetailDialogLayout() {
  console.log('📋 验证详情对话框布局...')
  
  console.log('✅ 详情对话框布局结构:')
  console.log('┌─────────────────────┬─────────────────────┐')
  console.log('│      请求数据       │      数据类型       │')
  console.log('├─────────────────────┼─────────────────────┤')
  console.log('│      申请时间       │      使用目的       │  ← 关键调整')
  console.log('├─────────────────────┴─────────────────────┤')
  console.log('│              申请理由（整行）               │')
  console.log('├─────────────────────┬─────────────────────┤')
  console.log('│      请求状态       │      处理时间       │')
  console.log('└─────────────────────┴─────────────────────┘')
  
  console.log('\n💡 布局优势:')
  console.log('- 信息密度更高，节省垂直空间')
  console.log('- 申请时间和使用目的逻辑关联性强')
  console.log('- 申请理由占整行，保证内容可读性')
  console.log('- 整体布局更加均衡美观')
}

// 测试不同状态的详情显示
function testDifferentStatusDisplay() {
  console.log('🔍 测试不同状态的详情显示...')
  
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  
  if (authRequests.length === 0) {
    console.log('❌ 没有授权请求数据，请先创建测试数据')
    return false
  }
  
  console.log('📋 不同状态详情显示测试:')
  authRequests.slice(-3).forEach((req, index) => {
    console.log(`${index + 1}. ${req.dataName} (状态: ${req.status})`)
    console.log(`   申请时间: ${req.requestedAt} → 格式化显示`)
    console.log(`   使用目的: 从理由中提取并转为中文`)
    console.log(`   处理时间: ${req.processedAt ? '有' : '无'}`)
    
    if (req.status === 'rejected' && req.rejectReason) {
      console.log(`   拒绝理由: ${req.rejectReason}`)
    }
    console.log('')
  })
  
  return true
}

// 模拟详情对话框操作
function simulateDetailDialog(requestIndex = 0) {
  console.log('🔧 模拟详情对话框操作...')
  
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  
  if (authRequests.length <= requestIndex) {
    console.log('❌ 没有足够的授权请求数据')
    return false
  }
  
  const selectedRequest = authRequests[requestIndex]
  
  console.log('📋 模拟详情对话框内容:')
  console.log(`请求数据: ${selectedRequest.dataName}`)
  console.log(`数据类型: ${selectedRequest.dataType}`)
  console.log(`申请时间: ${selectedRequest.requestedAt} (同行左侧)`)
  console.log(`使用目的: 从理由中提取 (同行右侧)`)
  console.log(`申请理由: ${selectedRequest.reason.split('\n')[0]} (占整行)`)
  console.log(`请求状态: ${selectedRequest.status}`)
  
  if (selectedRequest.processedAt) {
    console.log(`处理时间: ${selectedRequest.processedAt}`)
  }
  
  console.log('\n💡 这个请求适合在详情对话框中测试布局效果')
  
  return selectedRequest
}

// 完整测试流程
function fullDetailLayoutTest() {
  console.log('🚀 开始完整的详情对话框布局测试...\n')
  
  // 1. 清除旧数据并创建测试数据
  console.log('📋 第1步: 准备测试数据')
  clearTestData()
  const testRequests = createDetailDialogTestData()
  
  // 2. 验证布局结构
  console.log('\n📋 第2步: 验证布局结构')
  verifyDetailDialogLayout()
  
  // 3. 测试不同状态显示
  console.log('\n📋 第3步: 测试不同状态显示')
  testDifferentStatusDisplay()
  
  // 4. 模拟详情对话框
  console.log('\n📋 第4步: 模拟详情对话框')
  const sampleRequest = simulateDetailDialog(0)
  
  // 5. 给出测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 访问患者端"授权管理"页面')
  console.log('2. 点击任意授权请求的"详情"按钮')
  console.log('3. 在弹出的详情对话框中检查布局:')
  console.log('   - 申请时间和使用目的是否在同一行显示')
  console.log('   - 申请理由是否占据整行')
  console.log('   - 整体布局是否更加紧凑')
  console.log('4. 测试不同状态的请求详情显示')
  
  console.log('\n✅ 期望结果:')
  console.log('- 申请时间在左侧，使用目的在右侧，同一行显示')
  console.log('- 申请理由占据整行，保持内容完整性')
  console.log('- 时间格式正确: 年-月-日 时:分:秒')
  console.log('- 使用目的显示为中文')
  console.log('- 整体布局美观、信息清晰')
  
  return {
    testRequests: testRequests.length,
    testCompleted: new Date().toISOString(),
    sampleRequestId: sampleRequest?.id
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

function clearTestData() {
  console.log('🧹 清除测试数据...')
  localStorage.removeItem('medical_files')
  localStorage.removeItem('authorization_requests')
  localStorage.removeItem('access_records')
  console.log('✅ 测试数据已清除')
}

console.log('🔧 详情对话框布局调整测试工具已加载')
console.log('使用 fullDetailLayoutTest() 运行完整测试')
console.log('使用 createDetailDialogTestData() 创建测试数据')
console.log('使用 simulateDetailDialog(index) 模拟特定详情对话框')
console.log('使用 verifyDetailDialogLayout() 查看布局说明')
console.log('使用 clearTestData() 清除测试数据')
