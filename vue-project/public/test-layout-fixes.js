/**
 * 测试表格布局和申请目的中文显示修复
 */

// 测试申请目的中文显示
function testAuthorizationPurpose() {
  console.log('🧪 测试申请目的中文显示...')
  
  // 切换到医生账户
  switchToDoctor()
  
  // 创建测试数据
  const testFile = createTestMedicalFile()
  
  console.log('📋 测试数据已创建:', testFile.id)
  console.log('💡 请在医生端数据管理页面点击"发起授权"按钮')
  console.log('✅ 检查项目:')
  console.log('1. 使用目的下拉选项应该显示中文')
  console.log('2. 选项包括：诊断治疗、病情评估、医学研究、会诊咨询、其他')
  console.log('3. 表格中的数据应该居中显示')
  
  return testFile
}

// 测试表格布局
function testTableLayout() {
  console.log('🎨 测试表格布局居中显示...')
  
  // 测试患者端
  console.log('\n👤 测试患者端表格布局:')
  switchToPatient()
  createTestMedicalFiles(3)
  createTestAuthRequests(2)
  
  console.log('✅ 患者端检查项目:')
  console.log('1. "我的数据"页面 - 所有列数据居中显示')
  console.log('2. "授权管理"页面 - 所有列数据居中显示')
  
  // 测试医生端
  console.log('\n👨‍⚕️ 测试医生端表格布局:')
  switchToDoctor()
  
  console.log('✅ 医生端检查项目:')
  console.log('1. "数据管理"页面 - 所有列数据居中显示')
  console.log('2. 数据信息（图标+标题）应该垂直居中')
  
  console.log('\n🎯 布局检查要点:')
  console.log('- 表头文字居中')
  console.log('- 表格内容垂直和水平居中')
  console.log('- 图标与文字对齐良好')
  console.log('- 标签（Tag）居中显示')
}

// 完整测试流程
function fullLayoutTest() {
  console.log('🚀 开始完整的布局和中文化测试...\n')
  
  // 清除旧数据
  clearTestData()
  
  // 测试申请目的中文化
  const testFile = testAuthorizationPurpose()
  
  // 测试表格布局
  testTableLayout()
  
  console.log('\n📝 测试步骤总结:')
  console.log('1. 访问患者端"我的数据"页面，检查表格居中对齐')
  console.log('2. 访问患者端"授权管理"页面，检查表格居中对齐')
  console.log('3. 访问医生端"数据管理"页面，检查表格居中对齐')
  console.log('4. 在医生端点击"发起授权"，检查使用目的选项为中文')
  console.log('5. 提交授权申请，检查申请理由包含中文目的')
  
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

function createTestMedicalFile() {
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  const newFile = {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    patientId: "patient_001",
    title: "布局测试心电图",
    description: "用于测试表格布局居中显示的测试数据",
    category: "medical-image",
    fileName: "layout_test_ecg.pdf",
    filePath: "/uploads/layout_test_ecg.pdf",
    fileSize: 2048000,
    uploadTime: new Date().toISOString(),
    authStatus: "not-requested",
    authorizationCount: 0,
    accessCount: 0,
    isShared: false,
    tags: ["心电图", "布局测试"]
  }
  
  medicalFiles.push(newFile)
  localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  return newFile
}

function createTestMedicalFiles(count = 3) {
  const categories = ["lab-report", "medical-image", "medication", "physical-exam"]
  const titles = ["血常规检查", "CT扫描报告", "处方药记录", "体检报告"]
  
  for (let i = 0; i < count; i++) {
    const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
    const newFile = {
      id: `file_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: "patient_001",
      title: `${titles[i % titles.length]} ${i + 1}`,
      description: `测试数据${i + 1} - 用于验证表格布局居中显示`,
      category: categories[i % categories.length],
      fileName: `test_file_${i + 1}.pdf`,
      filePath: `/uploads/test_file_${i + 1}.pdf`,
      fileSize: (i + 1) * 512000,
      uploadTime: new Date(Date.now() - i * 3600000).toISOString(),
      authStatus: ["not-requested", "pending", "approved"][i % 3],
      authorizationCount: i % 2,
      accessCount: i % 3,
      isShared: i % 2 === 0,
      tags: [`标签${i + 1}`, "布局测试"]
    }
    
    medicalFiles.push(newFile)
    localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  }
  
  console.log(`✅ 已创建 ${count} 个测试医疗文件`)
}

function createTestAuthRequests(count = 2) {
  const requests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  
  for (let i = 0; i < count; i++) {
    const newRequest = {
      id: `auth_req_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      dataId: `file_test_${i}`,
      dataName: `测试授权数据 ${i + 1}`,
      dataType: "medical-image",
      doctorId: "doctor_001",
      doctorName: "演示医生",
      doctorDepartment: "心内科",
      doctorHospital: "演示医院",
      doctorIdCard: "110***********5678",
      reason: `布局测试申请理由 ${i + 1}\n使用目的：诊断治疗`,
      status: ["pending", "approved"][i % 2],
      requestedAt: new Date(Date.now() - i * 7200000).toISOString(),
      isIdentityRevealed: i % 2 === 0
    }
    
    requests.push(newRequest)
  }
  
  localStorage.setItem('authorization_requests', JSON.stringify(requests))
  console.log(`✅ 已创建 ${count} 个测试授权请求`)
}

function clearTestData() {
  console.log('🧹 清除测试数据...')
  localStorage.removeItem('medical_files')
  localStorage.removeItem('authorization_requests')
  localStorage.removeItem('access_records')
  console.log('✅ 测试数据已清除')
}

// 检查当前页面表格样式
function checkTableStyles() {
  console.log('🔍 检查当前页面表格样式...')
  
  const tables = document.querySelectorAll('.el-table')
  if (tables.length === 0) {
    console.log('❌ 未找到表格元素')
    return
  }
  
  tables.forEach((table, index) => {
    console.log(`📊 表格 ${index + 1}:`)
    
    const cells = table.querySelectorAll('.el-table__cell')
    const centerAligned = Array.from(cells).filter(cell => {
      const style = window.getComputedStyle(cell)
      return style.textAlign === 'center'
    })
    
    console.log(`  - 总单元格数: ${cells.length}`)
    console.log(`  - 居中对齐单元格数: ${centerAligned.length}`)
    console.log(`  - 居中对齐比例: ${(centerAligned.length / cells.length * 100).toFixed(1)}%`)
  })
}

console.log('🎨 表格布局测试工具已加载')
console.log('使用 fullLayoutTest() 运行完整测试')
console.log('使用 testAuthorizationPurpose() 测试申请目的中文化')
console.log('使用 testTableLayout() 测试表格布局')
console.log('使用 checkTableStyles() 检查当前页面表格样式')
console.log('使用 clearTestData() 清除测试数据')
