/**
 * 测试患者端授权管理页面使用目的中文化和时间格式修复
 */

// 测试使用目的中文化和时间格式
function testAuthorizationFormatFix() {
  console.log('🔧 测试患者端授权管理格式修复...')
  
  // 切换到患者账户
  switchToPatient()
  
  console.log('📋 测试项目:')
  console.log('1. 申请理由中的使用目的应显示为中文')
  console.log('2. 申请时间应分两行显示：年-月-日 和 时:分:秒')
  console.log('3. 时间格式不应包含字母T、Z等')
  
  return true
}

// 创建包含英文使用目的的测试数据
function createTestAuthRequestsWithEnglish() {
  console.log('📊 创建包含英文使用目的的测试数据...')
  
  // 确保有医疗文件
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  if (medicalFiles.length === 0) {
    const testFile = {
      id: `file_${Date.now()}`,
      patientId: "patient_001",
      title: "胸部X光片",
      description: "胸部X光检查报告",
      category: "medical-image",
      fileName: "chest_xray.pdf",
      filePath: "/uploads/chest_xray.pdf",
      fileSize: 1024000,
      uploadTime: new Date().toISOString(),
      authStatus: "not-requested",
      authorizationCount: 0,
      accessCount: 0,
      isShared: false,
      tags: ["X光", "胸部"]
    }
    medicalFiles.push(testFile)
    localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  }
  
  // 创建包含不同英文使用目的的授权请求
  const testRequests = [
    {
      id: `auth_req_${Date.now()}_1`,
      dataId: medicalFiles[0].id,
      dataName: medicalFiles[0].title,
      dataType: medicalFiles[0].category,
      doctorId: "doctor_001",
      doctorName: "演示医生",
      doctorDepartment: "心内科",
      doctorHospital: "演示医院",
      doctorIdCard: "110***********5678",
      reason: `患者胸部不适需要查看X光片进行诊断\n使用目的：diagnosis`, // 英文目的
      status: "pending",
      requestedAt: new Date().toISOString(),
      isIdentityRevealed: false
    },
    {
      id: `auth_req_${Date.now()}_2`,
      dataId: medicalFiles[0].id,
      dataName: "心电图检查",
      dataType: "medical-image",
      doctorId: "doctor_002",
      doctorName: "张医生",
      doctorDepartment: "内科",
      doctorHospital: "演示医院",
      doctorIdCard: "120***********9012",
      reason: `评估患者心脏功能状况\n使用目的：evaluation`, // 英文目的
      status: "approved",
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      isIdentityRevealed: true
    },
    {
      id: `auth_req_${Date.now()}_3`,
      dataId: medicalFiles[0].id,
      dataName: "血常规检查",
      dataType: "lab-report", 
      doctorId: "doctor_003",
      doctorName: "李医生",
      doctorDepartment: "外科",
      doctorHospital: "演示医院", 
      doctorIdCard: "130***********3456",
      reason: `科研项目需要参考患者血液指标数据\n使用目的：research`, // 英文目的
      status: "rejected",
      requestedAt: new Date(Date.now() - 172800000).toISOString(),
      isIdentityRevealed: false
    }
  ]
  
  // 保存授权请求
  const existingRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  const updatedRequests = [...existingRequests, ...testRequests]
  localStorage.setItem('authorization_requests', JSON.stringify(updatedRequests))
  
  console.log(`✅ 已创建 ${testRequests.length} 个包含英文使用目的的授权请求`)
  console.log('📝 包含的英文使用目的:')
  console.log('  - diagnosis (应显示为: 诊断治疗)')
  console.log('  - evaluation (应显示为: 病情评估)')
  console.log('  - research (应显示为: 医学研究)')
  
  return testRequests
}

// 检查时间格式
function checkTimeFormat() {
  console.log('🕐 检查申请时间格式...')
  
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  
  if (authRequests.length === 0) {
    console.log('❌ 没有授权请求数据')
    return
  }
  
  console.log('📋 原始时间格式示例:')
  authRequests.slice(0, 3).forEach((req, index) => {
    console.log(`${index + 1}. ${req.requestedAt}`)
    
    // 模拟格式化处理
    try {
      const date = new Date(req.requestedAt)
      const dateStr = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
      }).replace(/\//g, '-')
      
      const timeStr = date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      
      console.log(`   格式化后: ${dateStr}`)
      console.log(`            ${timeStr}`)
    } catch (error) {
      console.log(`   ❌ 格式化失败: ${error.message}`)
    }
  })
}

// 检查使用目的转换
function checkPurposeTranslation() {
  console.log('🔄 检查使用目的英文转中文...')
  
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  
  const purposeMap = {
    'diagnosis': '诊断治疗',
    'evaluation': '病情评估',
    'research': '医学研究', 
    'consultation': '会诊咨询',
    'other': '其他'
  }
  
  console.log('📋 申请理由中的使用目的转换:')
  authRequests.forEach((req, index) => {
    if (req.reason && req.reason.includes('使用目的')) {
      console.log(`${index + 1}. 原文: ${req.reason}`)
      
      // 模拟转换处理
      const converted = req.reason.replace(/使用目的[：:]\s*(\w+)/g, (match, purpose) => {
        const chinesePurpose = purposeMap[purpose] || purpose
        return `使用目的：${chinesePurpose}`
      })
      
      console.log(`   转换后: ${converted}`)
      console.log('')
    }
  })
}

// 完整测试流程
function fullFormatTest() {
  console.log('🚀 开始完整的格式修复测试...\n')
  
  // 1. 清除旧数据并创建测试数据
  console.log('📋 第1步: 准备测试数据')
  clearTestData()
  const testRequests = createTestAuthRequestsWithEnglish()
  
  // 2. 检查时间格式处理
  console.log('\n📋 第2步: 检查时间格式')
  checkTimeFormat()
  
  // 3. 检查使用目的转换
  console.log('\n📋 第3步: 检查使用目的转换')
  checkPurposeTranslation()
  
  // 4. 给出测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 访问患者端"授权管理"页面')
  console.log('2. 检查申请时间是否分两行显示（日期 + 时间）')
  console.log('3. 检查申请理由中的使用目的是否为中文')
  console.log('4. 确认时间格式没有T、Z等字母')
  
  console.log('\n✅ 期望结果:')
  console.log('- 申请时间: 第一行显示年-月-日，第二行显示时:分:秒')
  console.log('- 使用目的: diagnosis→诊断治疗, evaluation→病情评估, research→医学研究')
  console.log('- 无多余字符: 不显示ISO格式的T、Z等字符')
  
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

console.log('🔧 授权管理格式修复测试工具已加载')
console.log('使用 fullFormatTest() 运行完整测试')
console.log('使用 createTestAuthRequestsWithEnglish() 创建测试数据')
console.log('使用 checkTimeFormat() 检查时间格式')
console.log('使用 checkPurposeTranslation() 检查使用目的转换')
console.log('使用 clearTestData() 清除测试数据')
