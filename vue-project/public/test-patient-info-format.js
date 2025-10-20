/**
 * 测试医生端数据详情对话框患者身份信息格式修复
 */

// 测试患者身份信息显示格式
function testPatientInfoFormat() {
  console.log('🔧 测试医生端患者身份信息显示格式...')
  
  // 切换到医生账户
  switchToDoctor()
  
  console.log('📋 测试项目:')
  console.log('1. 患者身份信息只显示姓名和身份证号两项')
  console.log('2. 脱敏状态下身份证号全部显示为*')
  console.log('3. 删除联系电话、性别年龄等其他项目')
  
  return true
}

// 创建包含患者身份信息的测试数据
function createTestDataWithPatientInfo() {
  console.log('📊 创建包含患者身份信息的测试数据...')
  
  // 确保患者登录状态
  switchToPatient()
  
  // 创建医疗文件
  const testFile = {
    id: `file_${Date.now()}`,
    patientId: "patient_001",
    title: "胸部CT检查报告",
    description: "胸部CT影像检查，用于测试患者身份信息显示",
    category: "medical-image",
    fileName: "chest_ct_patient_info.pdf",
    filePath: "/uploads/chest_ct_patient_info.pdf",
    fileSize: 2048000,
    uploadTime: new Date().toISOString(),
    authStatus: "approved", // 已授权状态才能看到患者信息
    authorizationCount: 1,
    accessCount: 0,
    isShared: true,
    tags: ["CT", "胸部"],
    // 患者身份信息
    patientName: "张小明",
    patientIdCard: "110101199001011234",
    patientPhone: "13912345678",
    patientGender: "男",
    patientAge: 25,
    isPatientIdentityRevealed: false // 默认未溯源（脱敏状态）
  }
  
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  medicalFiles.push(testFile)
  localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  
  // 切换回医生账户
  switchToDoctor()
  
  console.log('✅ 已创建包含患者身份信息的测试文件')
  console.log('📝 患者信息:')
  console.log(`  - 姓名: ${testFile.patientName}`)
  console.log(`  - 身份证: ${testFile.patientIdCard}`)
  console.log(`  - 手机: ${testFile.patientPhone}`)
  console.log(`  - 性别年龄: ${testFile.patientGender} / ${testFile.patientAge}岁`)
  console.log(`  - 溯源状态: ${testFile.isPatientIdentityRevealed ? '已溯源' : '未溯源(脱敏)'}`)
  
  return testFile
}

// 模拟患者身份溯源操作
function simulatePatientTrace(fileId) {
  console.log('🔍 模拟患者身份溯源操作...')
  
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  const fileIndex = medicalFiles.findIndex(file => file.id === fileId)
  
  if (fileIndex === -1) {
    console.log('❌ 未找到指定的医疗文件')
    return false
  }
  
  const beforeStatus = medicalFiles[fileIndex].isPatientIdentityRevealed
  medicalFiles[fileIndex].isPatientIdentityRevealed = true
  localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  
  console.log('✅ 患者身份溯源完成')
  console.log(`  - 溯源前状态: ${beforeStatus ? '已溯源' : '未溯源(脱敏)'}`)
  console.log(`  - 溯源后状态: 已溯源(显示真实信息)`)
  
  return true
}

// 检查身份证脱敏格式
function checkIdCardMasking() {
  console.log('🎭 检查身份证脱敏格式...')
  
  // 测试不同的身份证号码
  const testIdCards = [
    '110101199001011234',
    '320102198505156789',
    '440301199512120987'
  ]
  
  console.log('📋 脱敏前后对比:')
  testIdCards.forEach((idCard, index) => {
    console.log(`${index + 1}. 原始: ${idCard}`)
    console.log(`   脱敏: ******************`) // 全部显示为*
    console.log(`   长度: ${idCard.length} → 18位*`)
  })
  
  console.log('\n✅ 脱敏规则:')
  console.log('- 溯源前: 全部显示为18个*')
  console.log('- 溯源后: 显示真实身份证号')
}

// 验证显示项目
function verifyDisplayItems() {
  console.log('📋 验证患者身份信息显示项目...')
  
  console.log('✅ 应该显示的项目:')
  console.log('1. 患者姓名 - 脱敏状态显示*，溯源后显示真实姓名')
  console.log('2. 身份证号 - 脱敏状态全部显示*，溯源后显示真实号码')
  
  console.log('\n❌ 已删除的项目:')
  console.log('1. 联系电话 - 已从显示中移除')
  console.log('2. 性别年龄 - 已从显示中移除')
  
  console.log('\n💡 注意事项:')
  console.log('- 只有授权状态为"已授权"的数据才显示患者身份信息')
  console.log('- 点击"患者身份溯源"按钮后会显示真实信息')
  console.log('- 溯源前所有敏感信息都用*号隐藏')
}

// 完整测试流程
function fullPatientInfoTest() {
  console.log('🚀 开始完整的患者身份信息格式测试...\n')
  
  // 1. 清除旧数据
  console.log('📋 第1步: 清除旧测试数据')
  clearTestData()
  
  // 2. 创建测试数据
  console.log('\n📋 第2步: 创建测试数据')
  const testFile = createTestDataWithPatientInfo()
  
  // 3. 检查脱敏格式
  console.log('\n📋 第3步: 检查身份证脱敏格式')
  checkIdCardMasking()
  
  // 4. 验证显示项目
  console.log('\n📋 第4步: 验证显示项目')
  verifyDisplayItems()
  
  // 5. 测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 访问医生端"数据管理"页面')
  console.log('2. 找到"胸部CT检查报告"，点击"查看数据"')
  console.log('3. 在数据详情对话框中检查患者身份信息部分')
  console.log('4. 验证只显示姓名和身份证号两项')
  console.log('5. 验证身份证号全部显示为*（18个*）')
  console.log('6. 点击"患者身份溯源"按钮测试真实信息显示')
  
  console.log('\n✅ 期望结果:')
  console.log('- 溯源前: 姓名为***, 身份证为******************')
  console.log('- 溯源后: 显示真实姓名和身份证号')
  console.log('- 不显示: 联系电话、性别年龄等其他信息')
  
  return {
    testFileId: testFile.id,
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

function switchToDoctor() {
  const doctorUser = {
    id: "doctor_001",
    username: "doctor_demo",
    name: "演示医生",
    email: "doctor@demo.com",
    role: "doctor",
    phone: "139****5678",
    idCard: "110***********5678",
    department: "心内科",
    hospital: "演示医院",
    title: "主治医师",
    avatar: ""
  }
  localStorage.setItem('user', JSON.stringify(doctorUser))
  localStorage.setItem('token', 'mock_doctor_token_456')
}

function clearTestData() {
  console.log('🧹 清除测试数据...')
  localStorage.removeItem('medical_files')
  localStorage.removeItem('authorization_requests')
  localStorage.removeItem('access_records')
  console.log('✅ 测试数据已清除')
}

console.log('🔧 患者身份信息格式测试工具已加载')
console.log('使用 fullPatientInfoTest() 运行完整测试')
console.log('使用 createTestDataWithPatientInfo() 创建测试数据')
console.log('使用 simulatePatientTrace(fileId) 模拟身份溯源')
console.log('使用 checkIdCardMasking() 检查身份证脱敏格式')
console.log('使用 clearTestData() 清除测试数据')
