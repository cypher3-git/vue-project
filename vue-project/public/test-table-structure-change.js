/**
 * 测试患者端授权管理表格结构调整
 */

// 测试表格结构调整
function testTableStructureChange() {
  console.log('🔧 测试患者端授权管理表格结构调整...')
  
  // 切换到患者账户
  switchToPatient()
  
  console.log('📋 表格结构变化:')
  console.log('❌ 原来: 申请理由 | 申请时间 | 状态')
  console.log('✅ 现在: 申请理由 | 使用目的 | 状态')
  
  console.log('\n📋 测试项目:')
  console.log('1. 申请时间列已被使用目的列替换')
  console.log('2. 申请理由列不再显示使用目的内容')
  console.log('3. 使用目的列显示中文目的，带蓝色样式')
  console.log('4. 表格数据居中对齐')
  
  return true
}

// 创建包含使用目的的测试数据
function createPurposeTestData() {
  console.log('📊 创建包含使用目的的授权请求测试数据...')
  
  // 确保有医疗文件
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  if (medicalFiles.length === 0) {
    const testFile = {
      id: `file_${Date.now()}`,
      patientId: "patient_001",
      title: "心脏彩超检查",
      description: "心脏彩超影像检查报告",
      category: "medical-image",
      fileName: "heart_ultrasound.pdf",
      filePath: "/uploads/heart_ultrasound.pdf", 
      fileSize: 1536000,
      uploadTime: new Date().toISOString(),
      authStatus: "pending",
      authorizationCount: 1,
      accessCount: 0,
      isShared: false,
      tags: ["心脏", "彩超"]
    }
    medicalFiles.push(testFile)
    localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  }
  
  // 创建包含不同使用目的的授权请求
  const testRequests = [
    {
      id: `auth_req_${Date.now()}_1`,
      dataId: medicalFiles[0].id,
      dataName: "心脏彩超检查",
      dataType: "medical-image",
      doctorId: "doctor_001", 
      doctorName: "演示医生",
      doctorDepartment: "心内科",
      doctorHospital: "演示医院",
      doctorIdCard: "110***********5678",
      reason: `患者出现胸闷气短症状，需要通过心脏彩超检查评估心脏功能状态\n使用目的：diagnosis`, // 诊断治疗
      status: "pending",
      requestedAt: new Date().toISOString(),
      isIdentityRevealed: false
    },
    {
      id: `auth_req_${Date.now()}_2`, 
      dataId: medicalFiles[0].id,
      dataName: "血压监测记录",
      dataType: "physical-exam",
      doctorId: "doctor_002",
      doctorName: "张医生",
      doctorDepartment: "内科",
      doctorHospital: "演示医院",
      doctorIdCard: "120***********9012",
      reason: `评估患者高血压病情进展情况，调整治疗方案\n使用目的：evaluation`, // 病情评估
      status: "approved",
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      processedAt: new Date(Date.now() - 43200000).toISOString(),
      isIdentityRevealed: true
    },
    {
      id: `auth_req_${Date.now()}_3`,
      dataId: medicalFiles[0].id,
      dataName: "糖尿病检查报告", 
      dataType: "lab-report",
      doctorId: "doctor_003",
      doctorName: "李医生",
      doctorDepartment: "内分泌科",
      doctorHospital: "演示医院",
      doctorIdCard: "130***********3456",
      reason: `参与糖尿病流行病学调查研究项目，需要分析患者检查数据\n使用目的：research`, // 医学研究
      status: "rejected",
      requestedAt: new Date(Date.now() - 172800000).toISOString(),
      processedAt: new Date(Date.now() - 86400000).toISOString(),
      rejectReason: "数据不符合研究项目的纳入标准",
      isIdentityRevealed: false
    },
    {
      id: `auth_req_${Date.now()}_4`,
      dataId: medicalFiles[0].id,
      dataName: "康复治疗记录",
      dataType: "other",
      doctorId: "doctor_004",
      doctorName: "王医生", 
      doctorDepartment: "康复科",
      doctorHospital: "演示医院",
      doctorIdCard: "140***********7890",
      reason: `多学科会诊需要了解患者康复治疗进展\n使用目的：consultation`, // 会诊咨询
      status: "pending",
      requestedAt: new Date(Date.now() - 43200000).toISOString(),
      isIdentityRevealed: false
    }
  ]
  
  // 保存授权请求
  const existingRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  const updatedRequests = [...existingRequests, ...testRequests]
  localStorage.setItem('authorization_requests', JSON.stringify(updatedRequests))
  
  console.log(`✅ 已创建 ${testRequests.length} 个包含不同使用目的的授权请求`)
  console.log('📝 使用目的类型:')
  console.log('- diagnosis → 诊断治疗（蓝色标签样式）')
  console.log('- evaluation → 病情评估（蓝色标签样式）')
  console.log('- research → 医学研究（蓝色标签样式）')
  console.log('- consultation → 会诊咨询（蓝色标签样式）')
  
  return testRequests
}

// 验证表格列显示
function verifyTableColumns() {
  console.log('📋 验证表格列结构...')
  
  console.log('✅ 应该显示的列:')
  console.log('1. 请求数据 - 显示数据名称和类型标签')
  console.log('2. 医生姓名 - 显示医生姓名（脱敏/真实）')
  console.log('3. 医生身份证 - 显示身份证（脱敏/真实）')
  console.log('4. 申请理由 - 只显示理由内容，不包含使用目的')
  console.log('5. 使用目的 - 显示中文使用目的，蓝色标签样式')
  console.log('6. 状态 - 显示请求状态标签')
  console.log('7. 操作 - 显示操作按钮')
  
  console.log('\n❌ 已移除的列:')
  console.log('1. 申请时间 - 不再在表格中显示')
  
  console.log('\n💡 使用目的列特点:')
  console.log('- 宽度: 120px，适合显示中文目的')
  console.log('- 样式: 蓝色背景，圆角边框')
  console.log('- 内容: 从申请理由中提取并转换为中文')
  console.log('- 对齐: 居中显示')
}

// 测试使用目的提取和显示
function testPurposeDisplay() {
  console.log('🎯 测试使用目的提取和显示...')
  
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  
  if (authRequests.length === 0) {
    console.log('❌ 没有授权请求数据，请先创建测试数据')
    return false
  }
  
  console.log('📋 使用目的提取测试:')
  authRequests.slice(0, 4).forEach((req, index) => {
    console.log(`${index + 1}. 数据: ${req.dataName}`)
    console.log(`   原始理由: ${req.reason}`)
    
    // 模拟提取使用目的
    const purposeMatch = req.reason.match(/使用目的[：:]\s*(\w+)/)
    const purposeMap = {
      'diagnosis': '诊断治疗',
      'evaluation': '病情评估', 
      'research': '医学研究',
      'consultation': '会诊咨询',
      'other': '其他'
    }
    const purpose = purposeMatch ? purposeMap[purposeMatch[1]] || purposeMatch[1] : '-'
    
    // 模拟提取纯理由
    const reasonOnly = req.reason.replace(/\n?使用目的[：:]\s*\w+\n?/g, '').trim()
    
    console.log(`   使用目的: ${purpose}`)
    console.log(`   纯理由: ${reasonOnly}`)
    console.log('')
  })
  
  return true
}

// 完整测试流程
function fullTableStructureTest() {
  console.log('🚀 开始完整的表格结构调整测试...\n')
  
  // 1. 清除旧数据并创建测试数据
  console.log('📋 第1步: 准备测试数据')
  clearTestData()
  const testRequests = createPurposeTestData()
  
  // 2. 验证表格列结构
  console.log('\n📋 第2步: 验证表格列结构')
  verifyTableColumns()
  
  // 3. 测试使用目的提取
  console.log('\n📋 第3步: 测试使用目的提取和显示')
  testPurposeDisplay()
  
  // 4. 给出测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 访问患者端"授权管理"页面')
  console.log('2. 检查表格列结构是否正确')
  console.log('3. 确认申请时间列已被使用目的列替换')
  console.log('4. 确认申请理由列不再包含使用目的内容')
  console.log('5. 确认使用目的列显示中文且有蓝色样式')
  console.log('6. 测试不同状态的授权请求显示')
  
  console.log('\n✅ 期望结果:')
  console.log('- 表格有使用目的列，无申请时间列')
  console.log('- 使用目的显示为中文（诊断治疗、病情评估等）')
  console.log('- 使用目的有蓝色标签样式')
  console.log('- 申请理由干净，不包含使用目的行')
  console.log('- 所有数据居中对齐')
  
  return {
    testRequests: testRequests.length,
    testCompleted: new Date().toISOString()
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

console.log('🔧 表格结构调整测试工具已加载')
console.log('使用 fullTableStructureTest() 运行完整测试')
console.log('使用 createPurposeTestData() 创建测试数据')
console.log('使用 testPurposeDisplay() 测试使用目的显示')
console.log('使用 verifyTableColumns() 验证表格列结构')
console.log('使用 clearTestData() 清除测试数据')
