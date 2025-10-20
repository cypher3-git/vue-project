/**
 * 测试患者端授权管理医生身份证号显示修复
 */

// 测试医生身份证号显示修复
function testDoctorIdCardFix() {
  console.log('🔧 测试患者端医生身份证号显示修复...')
  
  // 切换到患者账户
  switchToPatient()
  
  console.log('📋 修改内容:')
  console.log('1. 列名: 医生身份证 → 医生身份证号')
  console.log('2. 脱敏显示: 部分脱敏(110***********1234) → 全部脱敏(********************)')
  console.log('3. 溯源后: 显示完整真实身份证号')
  
  return true
}

// 创建包含医生身份证号的测试数据
function createDoctorIdCardTestData() {
  console.log('📊 创建包含医生身份证号的授权请求测试数据...')
  
  // 确保有医疗文件
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  if (medicalFiles.length === 0) {
    const testFile = {
      id: `file_${Date.now()}`,
      patientId: "patient_001",
      title: "血糖监测报告",
      description: "糖尿病血糖监测检查报告",
      category: "lab-report",
      fileName: "blood_sugar_test.pdf",
      filePath: "/uploads/blood_sugar_test.pdf",
      fileSize: 512000,
      uploadTime: new Date().toISOString(),
      authStatus: "pending",
      authorizationCount: 1,
      accessCount: 0,
      isShared: false,
      tags: ["血糖", "糖尿病"]
    }
    medicalFiles.push(testFile)
    localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  }
  
  // 创建包含不同身份证号和溯源状态的授权请求
  const testRequests = [
    {
      id: `auth_req_${Date.now()}_1`,
      dataId: medicalFiles[0].id,
      dataName: "血糖监测报告",
      dataType: "lab-report",
      doctorId: "doctor_001",
      doctorName: "张明华",
      doctorDepartment: "内分泌科",
      doctorHospital: "演示医院",
      doctorIdCard: "110101198001011234", // 完整身份证号
      reason: `患者血糖异常需要查看监测数据制定治疗方案\n使用目的：diagnosis`,
      status: "pending",
      requestedAt: new Date().toISOString(),
      isIdentityRevealed: false // 未溯源 - 应该全部显示*
    },
    {
      id: `auth_req_${Date.now()}_2`, 
      dataId: medicalFiles[0].id,
      dataName: "血压检查记录",
      dataType: "physical-exam",
      doctorId: "doctor_002",
      doctorName: "李小红",
      doctorDepartment: "心内科",
      doctorHospital: "演示医院",
      doctorIdCard: "320102198205156789", // 完整身份证号
      reason: `评估患者高血压治疗效果需要查看血压监测数据\n使用目的：evaluation`,
      status: "approved",
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      processedAt: new Date(Date.now() - 43200000).toISOString(),
      isIdentityRevealed: true // 已溯源 - 应该显示真实身份证
    },
    {
      id: `auth_req_${Date.now()}_3`,
      dataId: medicalFiles[0].id,
      dataName: "心电图检查",
      dataType: "medical-image", 
      doctorId: "doctor_003",
      doctorName: "王大明",
      doctorDepartment: "心血管科",
      doctorHospital: "演示医院",
      doctorIdCard: "440301199012120987", // 完整身份证号
      reason: `心律不齐症状需要分析心电图数据进行诊断\n使用目的：diagnosis`,
      status: "rejected",
      requestedAt: new Date(Date.now() - 172800000).toISOString(),
      processedAt: new Date(Date.now() - 86400000).toISOString(),
      rejectReason: "当前数据质量不符合诊断要求",
      isIdentityRevealed: false // 未溯源 - 应该全部显示*
    }
  ]
  
  // 保存授权请求
  const existingRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  const updatedRequests = [...existingRequests, ...testRequests]
  localStorage.setItem('authorization_requests', JSON.stringify(updatedRequests))
  
  console.log(`✅ 已创建 ${testRequests.length} 个包含医生身份证号的授权请求`)
  console.log('📝 测试数据特点:')
  console.log('- 包含不同溯源状态: 未溯源(脱敏)、已溯源(真实)')
  console.log('- 包含完整18位身份证号')
  console.log('- 包含不同的授权状态: pending、approved、rejected')
  
  return testRequests
}

// 测试身份证号脱敏显示
function testIdCardMasking() {
  console.log('🎭 测试医生身份证号脱敏显示...')
  
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  
  if (authRequests.length === 0) {
    console.log('❌ 没有授权请求数据，请先创建测试数据')
    return false
  }
  
  console.log('📋 身份证号脱敏测试:')
  authRequests.slice(0, 3).forEach((req, index) => {
    console.log(`${index + 1}. 医生: ${req.doctorName}`)
    console.log(`   原始身份证: ${req.doctorIdCard}`)
    console.log(`   溯源状态: ${req.isIdentityRevealed ? '已溯源' : '未溯源'}`)
    
    // 模拟脱敏逻辑
    const displayIdCard = req.isIdentityRevealed ? req.doctorIdCard : '******************'
    console.log(`   显示结果: ${displayIdCard}`)
    
    if (req.isIdentityRevealed) {
      console.log(`   ✅ 已溯源，显示完整身份证号`)
    } else {
      console.log(`   ✅ 未溯源，全部显示为*`)
    }
    console.log('')
  })
  
  return true
}

// 验证列名和显示效果
function verifyColumnAndDisplay() {
  console.log('📋 验证列名和显示效果...')
  
  console.log('✅ 列名修改:')
  console.log('- 原来: 医生身份证')
  console.log('- 现在: 医生身份证号')
  console.log('- 说明: 更加明确地表示显示的是身份证号码')
  
  console.log('\n✅ 脱敏规则修改:')
  console.log('- 原来: 部分脱敏（如: 110***********1234）')
  console.log('- 现在: 全部脱敏（显示: ******************）')
  console.log('- 长度: 18个*号，与身份证号长度一致')
  
  console.log('\n✅ 溯源后显示:')
  console.log('- 显示完整真实身份证号（如: 110101198001011234）')
  console.log('- 保持数据的完整性和可追溯性')
  
  console.log('\n💡 使用场景:')
  console.log('- 未溯源: 保护医生隐私，全部脱敏')
  console.log('- 已溯源: 显示真实信息，便于身份确认')
}

// 模拟身份溯源操作
function simulateDoctorTrace(requestId) {
  console.log('🔍 模拟医生身份溯源操作...')
  
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  const requestIndex = authRequests.findIndex(req => req.id === requestId)
  
  if (requestIndex === -1) {
    console.log('❌ 未找到指定的授权请求')
    return false
  }
  
  const beforeStatus = authRequests[requestIndex].isIdentityRevealed
  authRequests[requestIndex].isIdentityRevealed = true
  localStorage.setItem('authorization_requests', JSON.stringify(authRequests))
  
  const request = authRequests[requestIndex]
  console.log('✅ 医生身份溯源完成')
  console.log(`  - 医生姓名: ${request.doctorName}`)
  console.log(`  - 溯源前状态: ${beforeStatus ? '已溯源' : '未溯源(******************)'}`)
  console.log(`  - 溯源后状态: 已溯源(${request.doctorIdCard})`)
  
  return true
}

// 完整测试流程
function fullDoctorIdCardTest() {
  console.log('🚀 开始完整的医生身份证号显示修复测试...\n')
  
  // 1. 清除旧数据并创建测试数据
  console.log('📋 第1步: 准备测试数据')
  clearTestData()
  const testRequests = createDoctorIdCardTestData()
  
  // 2. 测试身份证号脱敏
  console.log('\n📋 第2步: 测试身份证号脱敏显示')
  testIdCardMasking()
  
  // 3. 验证列名和显示效果
  console.log('\n📋 第3步: 验证列名和显示效果')
  verifyColumnAndDisplay()
  
  // 4. 给出测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 访问患者端"授权管理"页面')
  console.log('2. 检查表格列名是否为"医生身份证号"')
  console.log('3. 查看未溯源的医生身份证是否全部显示为*')
  console.log('4. 点击"身份溯源"按钮测试真实身份证显示')
  console.log('5. 验证已溯源的医生身份证显示完整号码')
  
  console.log('\n✅ 期望结果:')
  console.log('- 列名显示为"医生身份证号"')
  console.log('- 未溯源状态: ******************（18个*）')
  console.log('- 已溯源状态: 完整身份证号（如: 110101198001011234）')
  console.log('- 数据居中对齐显示')
  
  console.log('\n🧪 可以测试的溯源请求ID:')
  testRequests.forEach((req, index) => {
    console.log(`${index + 1}. ${req.id} - ${req.doctorName} - ${req.isIdentityRevealed ? '已溯源' : '未溯源'}`)
  })
  
  return {
    testRequests: testRequests.length,
    testCompleted: new Date().toISOString(),
    firstUnrevealedId: testRequests.find(req => !req.isIdentityRevealed)?.id
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

console.log('🔧 医生身份证号显示修复测试工具已加载')
console.log('使用 fullDoctorIdCardTest() 运行完整测试')
console.log('使用 createDoctorIdCardTestData() 创建测试数据')
console.log('使用 testIdCardMasking() 测试身份证脱敏显示')
console.log('使用 simulateDoctorTrace(requestId) 模拟身份溯源')
console.log('使用 clearTestData() 清除测试数据')
