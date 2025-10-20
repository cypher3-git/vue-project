/**
 * 测试患者端授权请求详情对话框格式修复
 */

// 测试授权详情对话框格式修复
function testAuthDetailFormat() {
  console.log('🔧 测试患者端授权请求详情对话框格式修复...')
  
  // 切换到患者账户
  switchToPatient()
  
  console.log('📋 测试项目:')
  console.log('1. 申请时间和处理时间格式为：年-月-日 时:分:秒')
  console.log('2. 数据类型显示为中文而非英文')
  console.log('3. 使用目的从申请理由中提取并显示为中文')
  console.log('4. 申请理由只显示理由内容，不包含使用目的行')
  
  return true
}

// 创建包含完整信息的授权请求测试数据
function createDetailTestData() {
  console.log('📊 创建授权请求详情测试数据...')
  
  // 确保有医疗文件
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  if (medicalFiles.length === 0) {
    const testFile = {
      id: `file_${Date.now()}`,
      patientId: "patient_001",
      title: "心电图检查",
      description: "心电图检查报告",
      category: "medical-image",
      fileName: "ecg_test.pdf",
      filePath: "/uploads/ecg_test.pdf",
      fileSize: 1024000,
      uploadTime: new Date().toISOString(),
      authStatus: "pending",
      authorizationCount: 1,
      accessCount: 0,
      isShared: false,
      tags: ["心电图"]
    }
    medicalFiles.push(testFile)
    localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  }
  
  // 创建包含不同状态和格式的授权请求
  const testRequests = [
    {
      id: `auth_req_${Date.now()}_1`,
      dataId: medicalFiles[0].id,
      dataName: medicalFiles[0].title,
      dataType: "other", // 英文类型，应该转换为中文
      doctorId: "doctor_001",
      doctorName: "演示医生",
      doctorDepartment: "心内科",
      doctorHospital: "演示医院",
      doctorIdCard: "110***********5678",
      reason: `患者心律不齐症状需要查看心电图数据进行诊断分析\n使用目的：diagnosis`, // 包含英文目的
      status: "pending",
      requestedAt: "2025-10-14T02:55:30.123Z", // ISO格式时间
      processedAt: null,
      isIdentityRevealed: false
    },
    {
      id: `auth_req_${Date.now()}_2`,
      dataId: medicalFiles[0].id,
      dataName: "血常规检查报告", 
      dataType: "lab-report", // 标准类型
      doctorId: "doctor_002",
      doctorName: "张医生",
      doctorDepartment: "内科",
      doctorHospital: "演示医院",
      doctorIdCard: "120***********9012",
      reason: `评估患者整体健康状况需要参考血液检查指标\n使用目的：evaluation`, // 包含英文目的
      status: "approved",
      requestedAt: "2025-10-13T14:30:45.678Z", // ISO格式时间
      processedAt: "2025-10-14T09:15:20.456Z", // ISO格式处理时间
      isIdentityRevealed: true
    },
    {
      id: `auth_req_${Date.now()}_3`,
      dataId: medicalFiles[0].id,
      dataName: "X光检查片",
      dataType: "medical-image",
      doctorId: "doctor_003", 
      doctorName: "李医生",
      doctorDepartment: "骨科",
      doctorHospital: "演示医院",
      doctorIdCard: "130***********3456",
      reason: `科研项目需要收集X光影像数据进行医学研究\n使用目的：research`, // 包含英文目的
      status: "rejected",
      requestedAt: "2025-10-12T20:45:15.890Z", // ISO格式时间
      processedAt: "2025-10-13T10:30:25.234Z", // ISO格式处理时间
      rejectReason: "当前数据不适合用于医学研究项目",
      isIdentityRevealed: false
    }
  ]
  
  // 保存授权请求
  const existingRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  const updatedRequests = [...existingRequests, ...testRequests]
  localStorage.setItem('authorization_requests', JSON.stringify(updatedRequests))
  
  console.log(`✅ 已创建 ${testRequests.length} 个授权请求测试数据`)
  console.log('📝 测试数据特点:')
  console.log('- 包含不同状态: pending、approved、rejected')
  console.log('- 包含英文数据类型: other、lab-report、medical-image')
  console.log('- 包含英文使用目的: diagnosis、evaluation、research')
  console.log('- 包含ISO格式时间: 需要转换为年月日时分秒')
  console.log('- 包含处理时间: approved和rejected状态有处理时间')
  
  return testRequests
}

// 测试时间格式转换
function testTimeFormat() {
  console.log('🕐 测试时间格式转换...')
  
  const testTimes = [
    "2025-10-14T02:55:30.123Z",
    "2025-10-13T14:30:45.678Z", 
    "2025-10-12T20:45:15.890Z"
  ]
  
  console.log('📋 时间格式转换示例:')
  testTimes.forEach((timeStr, index) => {
    console.log(`${index + 1}. 原始: ${timeStr}`)
    
    try {
      const date = new Date(timeStr)
      const dateStr = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-')
      
      const timeOnly = date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      
      const formatted = `${dateStr} ${timeOnly}`
      console.log(`   转换: ${formatted}`)
    } catch (error) {
      console.log(`   ❌ 转换失败: ${error.message}`)
    }
  })
}

// 测试数据类型转换
function testDataTypeTranslation() {
  console.log('🔄 测试数据类型英文转中文...')
  
  const typeMap = {
    'lab-report': '检验报告',
    'medical-image': '影像资料',
    'medication': '用药记录',
    'physical-exam': '体检报告',
    'other': '其他类型'
  }
  
  console.log('📋 数据类型转换映射:')
  Object.entries(typeMap).forEach(([english, chinese]) => {
    console.log(`- ${english} → ${chinese}`)
  })
}

// 测试使用目的提取和转换
function testPurposeExtraction() {
  console.log('🎯 测试使用目的提取和转换...')
  
  const testReasons = [
    "患者心律不齐症状需要查看心电图数据进行诊断分析\n使用目的：diagnosis",
    "评估患者整体健康状况需要参考血液检查指标\n使用目的：evaluation", 
    "科研项目需要收集X光影像数据进行医学研究\n使用目的：research"
  ]
  
  const purposeMap = {
    'diagnosis': '诊断治疗',
    'evaluation': '病情评估',
    'research': '医学研究',
    'consultation': '会诊咨询',
    'other': '其他'
  }
  
  console.log('📋 使用目的提取和转换:')
  testReasons.forEach((reason, index) => {
    console.log(`${index + 1}. 原文: ${reason}`)
    
    // 提取使用目的
    const purposeMatch = reason.match(/使用目的[：:]\s*(\w+)/)
    const purpose = purposeMatch ? purposeMap[purposeMatch[1]] || purposeMatch[1] : '-'
    
    // 提取纯理由
    const reasonOnly = reason.replace(/\n?使用目的[：:]\s*\w+\n?/g, '').trim()
    
    console.log(`   使用目的: ${purpose}`)
    console.log(`   申请理由: ${reasonOnly}`)
    console.log('')
  })
}

// 完整测试流程
function fullDetailFormatTest() {
  console.log('🚀 开始完整的授权详情格式测试...\n')
  
  // 1. 清除旧数据并创建测试数据
  console.log('📋 第1步: 准备测试数据')
  clearTestData()
  const testRequests = createDetailTestData()
  
  // 2. 测试时间格式转换
  console.log('\n📋 第2步: 测试时间格式转换')
  testTimeFormat()
  
  // 3. 测试数据类型转换
  console.log('\n📋 第3步: 测试数据类型转换')
  testDataTypeTranslation()
  
  // 4. 测试使用目的提取
  console.log('\n📋 第4步: 测试使用目的提取和转换')
  testPurposeExtraction()
  
  // 5. 给出测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 访问患者端"授权管理"页面')
  console.log('2. 点击任意授权请求的"详情"按钮')
  console.log('3. 在授权请求详情对话框中检查以下内容:')
  console.log('   - 数据类型显示为中文（如：其他类型、检验报告等）')
  console.log('   - 申请时间格式：年-月-日 时:分:秒（如：2025-10-14 02:55:30）')
  console.log('   - 使用目的显示为中文（如：诊断治疗、病情评估等）')
  console.log('   - 申请理由不包含"使用目的：xxx"行')
  console.log('   - 处理时间（如果有）也是年月日时分秒格式')
  
  console.log('\n✅ 期望结果:')
  console.log('- 时间格式: 2025-10-14 02:55:30（无T、Z等字符）')
  console.log('- 数据类型: 其他类型、检验报告、影像资料等中文')
  console.log('- 使用目的: 诊断治疗、病情评估、医学研究等中文')
  console.log('- 申请理由: 只包含理由内容，使用目的单独一行显示')
  
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

console.log('🔧 授权请求详情格式修复测试工具已加载')
console.log('使用 fullDetailFormatTest() 运行完整测试')
console.log('使用 createDetailTestData() 创建测试数据')
console.log('使用 testTimeFormat() 测试时间格式转换')
console.log('使用 testDataTypeTranslation() 测试数据类型转换')
console.log('使用 testPurposeExtraction() 测试使用目的提取')
console.log('使用 clearTestData() 清除测试数据')
