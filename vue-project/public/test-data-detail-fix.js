/**
 * 测试患者端数据详情功能修复
 */

// 测试数据详情功能修复
function testDataDetailFix() {
  console.log('🔧 测试患者端数据详情功能修复...')
  
  // 切换到患者账户
  switchToPatient()
  
  console.log('📋 修复内容:')
  console.log('1. 修复数据字段映射问题')
  console.log('2. 完善文件预览功能')
  console.log('3. 添加文件类型检测')
  console.log('4. 实现模拟预览URL生成')
  
  return true
}

// 创建包含完整数据的医疗文件
function createCompleteTestData() {
  console.log('📊 创建包含完整数据的医疗文件测试数据...')
  
  const testFiles = [
    {
      id: `file_${Date.now()}_1`,
      patientId: "patient_001",
      title: "血常规检查报告",
      description: "包含白细胞、红细胞、血小板等各项指标的详细检查报告",
      category: "lab-report",
      fileName: "blood_test_report.pdf",
      filePath: "/uploads/blood_test_report.pdf",
      fileSize: 1024000,
      uploadTime: new Date().toISOString(),
      authStatus: "not-requested",
      authorizationCount: 0,
      accessCount: 0,
      isShared: false,
      tags: ["血常规", "体检", "健康检查"]
    },
    {
      id: `file_${Date.now()}_2`,
      patientId: "patient_001", 
      title: "胸部CT影像",
      description: "胸部计算机断层扫描影像，用于检查肺部和心脏状况",
      category: "medical-image",
      fileName: "chest_ct_scan.jpg",
      filePath: "/uploads/chest_ct_scan.jpg",
      fileSize: 2048000,
      uploadTime: new Date(Date.now() - 86400000).toISOString(),
      authStatus: "pending",
      authorizationCount: 1,
      accessCount: 0,
      isShared: true,
      tags: ["CT", "胸部", "影像"]
    },
    {
      id: `file_${Date.now()}_3`,
      patientId: "patient_001",
      title: "药物治疗记录", 
      description: "患者服用的所有药物信息，包括剂量、频次和治疗效果",
      category: "medication",
      fileName: "medication_record.txt",
      filePath: "/uploads/medication_record.txt",
      fileSize: 50000,
      uploadTime: new Date(Date.now() - 172800000).toISOString(),
      authStatus: "approved",
      authorizationCount: 2,
      accessCount: 3,
      isShared: true,
      tags: ["用药", "治疗", "记录"]
    },
    {
      id: `file_${Date.now()}_4`,
      patientId: "patient_001",
      title: "年度体检报告",
      description: "包含身体各项指标的全面健康体检报告",
      category: "physical-exam", 
      fileName: "annual_checkup.pdf",
      filePath: "/uploads/annual_checkup.pdf",
      fileSize: 3072000,
      uploadTime: new Date(Date.now() - 2592000000).toISOString(),
      authStatus: "rejected",
      authorizationCount: 1,
      accessCount: 0,
      isShared: false,
      tags: ["体检", "年度", "健康"]
    },
    // 添加额外的测试文件
    {
      id: `file_${Date.now()}_5`,
      patientId: "patient_001",
      title: "心电图检查",
      description: "心电图检查结果，用于评估心脏功能",
      category: "medical-image",
      fileName: "ecg_result.png",
      filePath: "/uploads/ecg_result.png",
      fileSize: 512000,
      uploadTime: new Date(Date.now() - 432000000).toISOString(),
      authStatus: "not-requested",
      authorizationCount: 0,
      accessCount: 0,
      isShared: false,
      tags: ["心电图", "心脏", "检查"]
    },
    {
      id: `file_${Date.now()}_6`,
      patientId: "patient_001",
      title: "治疗方案记录",
      description: "详细的治疗方案和医嘱信息",
      category: "medication",
      fileName: "treatment_plan.docx",
      filePath: "/uploads/treatment_plan.docx",
      fileSize: 256000,
      uploadTime: new Date(Date.now() - 604800000).toISOString(),
      authStatus: "approved",
      authorizationCount: 1,
      accessCount: 2,
      isShared: true,
      tags: ["治疗", "方案", "医嘱"]
    }
  ]
  
  // 清除现有数据并保存新数据
  localStorage.setItem('medical_files', JSON.stringify(testFiles))
  
  console.log(`✅ 已创建 ${testFiles.length} 个包含完整数据的医疗文件`)
  console.log('📝 测试数据特点:')
  console.log('- 包含所有数据字段：title, description, category, fileName, fileSize 等')
  console.log('- 包含不同文件类型：PDF, JPG, PNG, TXT, DOCX')
  console.log('- 包含不同类别：检验报告, 影像资料, 用药记录, 体检报告')
  console.log('- 包含不同授权状态：未申请, 待审批, 已授权, 已拒绝')
  console.log('- 测试数据类型映射修复')
  console.log('- 测试文件预览功能')
  
  return testFiles
}

// 测试数据字段映射
function testFieldMapping() {
  console.log('🔄 测试数据字段映射...')
  
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  
  if (medicalFiles.length === 0) {
    console.log('❌ 没有医疗文件数据，请先创建测试数据')
    return false
  }
  
  console.log('📋 字段映射测试:')
  medicalFiles.slice(0, 2).forEach((file, index) => {
    console.log(`${index + 1}. ${file.title}`)
    console.log(`   原始数据结构:`)
    console.log(`   - title: ${file.title}`)
    console.log(`   - category: ${file.category}`)
    console.log(`   - fileSize: ${file.fileSize}`)
    console.log(`   - uploadTime: ${file.uploadTime}`)
    console.log(`   - fileName: ${file.fileName}`)
    
    // 模拟字段映射处理
    console.log(`   映射后显示:`)
    console.log(`   - 名称: ${file.title}`)
    console.log(`   - 类型: ${getCategoryMapping(file.category)}`)
    console.log(`   - 大小: ${formatFileSize(file.fileSize)}`)
    console.log(`   - 日期: ${formatDate(file.uploadTime)}`)
    console.log(`   - 文件类型: ${detectFileType(file.fileName)}`)
    console.log('')
  })
  
  return true
}

// 测试文件预览功能
function testFilePreview() {
  console.log('👁️ 测试文件预览功能...')
  
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  
  if (medicalFiles.length === 0) {
    console.log('❌ 没有医疗文件数据，请先创建测试数据')
    return false
  }
  
  console.log('📋 文件预览测试:')
  medicalFiles.forEach((file, index) => {
    const fileType = detectFileType(file.fileName)
    const previewUrl = generatePreviewUrl(file)
    
    console.log(`${index + 1}. ${file.title}`)
    console.log(`   文件名: ${file.fileName}`)
    console.log(`   检测类型: ${fileType}`)
    console.log(`   预览URL: ${previewUrl}`)
    console.log(`   预览支持: ${fileType === 'pdf' || fileType === 'image' ? '✅ 支持' : '❌ 不支持'}`)
    console.log('')
  })
  
  return true
}

// 验证数据详情对话框字段
function verifyDetailDialogFields() {
  console.log('📋 验证数据详情对话框字段...')
  
  console.log('✅ 应该正确显示的字段:')
  console.log('1. 数据类型 - 显示中文类别名称')
  console.log('2. 文件大小 - 格式化显示（如：1.0 MB）')
  console.log('3. 创建日期 - 格式化显示（如：2025-10-14）')
  console.log('4. 授权状态 - 显示中文状态和对应颜色')
  console.log('5. 文件名称 - 显示完整文件名')
  console.log('6. 文件路径 - 显示文件存储路径')
  console.log('7. 描述信息 - 显示文件详细描述')
  
  console.log('\n✅ 文件预览功能:')
  console.log('1. PDF文件 - 在线预览，支持翻页')
  console.log('2. 图片文件 - 在线预览，支持缩放旋转')
  console.log('3. 文本文件 - 显示文本内容')
  console.log('4. 其他文件 - 显示不支持预览提示')
  
  console.log('\n💡 预览控制功能:')
  console.log('- 图片：缩放、旋转、重置、全屏')
  console.log('- PDF：翻页、全屏')
  console.log('- 下载：支持所有文件类型下载')
}

// 完整测试流程
function fullDataDetailTest() {
  console.log('🚀 开始完整的数据详情功能测试...\n')
  
  // 1. 清除旧数据并创建测试数据
  console.log('📋 第1步: 准备测试数据')
  const testFiles = createCompleteTestData()
  
  // 2. 测试字段映射
  console.log('\n📋 第2步: 测试数据字段映射')
  testFieldMapping()
  
  // 3. 测试文件预览
  console.log('\n📋 第3步: 测试文件预览功能')
  testFilePreview()
  
  // 4. 验证对话框字段
  console.log('\n📋 第4步: 验证详情对话框字段')
  verifyDetailDialogFields()
  
  // 5. 给出测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 访问患者端"我的数据"页面')
  console.log('2. 点击任意医疗文件的"查看"按钮')
  console.log('3. 在数据详情对话框中检查：')
  console.log('   - 所有字段是否正确显示数据')
  console.log('   - 文件预览是否正常工作')
  console.log('   - 预览控制功能是否可用')
  console.log('4. 测试不同类型文件的预览效果')
  console.log('5. 测试下载功能是否正常')
  
  console.log('\n✅ 期望结果:')
  console.log('- 所有数据字段都有值显示，无空白内容')
  console.log('- PDF文件可以在线预览并翻页')
  console.log('- 图片文件可以预览并进行缩放旋转')
  console.log('- 文本文件显示内容摘要')
  console.log('- 不支持的文件显示合适的提示')
  
  return {
    testFiles: testFiles.length,
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

function getCategoryMapping(category) {
  const map = {
    'lab-report': '检验报告',
    'medical-image': '影像资料', 
    'medication': '用药记录',
    'physical-exam': '体检报告',
    'other': '其他类型'
  }
  return map[category] || '未知类型'
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

function detectFileType(fileName) {
  if (!fileName) return 'unknown'
  const ext = fileName.toLowerCase().split('.').pop()
  
  if (['pdf'].includes(ext)) return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
  if (['txt', 'doc', 'docx'].includes(ext)) return 'text'
  return 'unknown'
}

function generatePreviewUrl(file) {
  const fileType = detectFileType(file.fileName)
  const category = file.category
  
  if (fileType === 'image') {
    return `https://via.placeholder.com/600x400/4a90e2/ffffff?text=${encodeURIComponent(file.title)}`
  } else if (fileType === 'pdf') {
    return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
  
  return `https://via.placeholder.com/600x400/6c757d/ffffff?text=${encodeURIComponent('文件预览')}`
}

function clearTestData() {
  console.log('🧹 清除测试数据...')
  localStorage.removeItem('medical_files')
  localStorage.removeItem('authorization_requests')
  localStorage.removeItem('access_records')
  console.log('✅ 测试数据已清除')
}

// 测试上传数据类型映射
function testUploadTypeMapping() {
  console.log('🔄 测试上传数据类型映射...')
  
  console.log('📋 数据类型映射测试:')
  console.log('问题：患者上传时选择"影像资料"，但表单显示"其他类型"')
  console.log('原因：categoryMap映射错误，应该直接使用uploadForm.value.type')
  console.log('')
  
  console.log('✅ 修复说明:')
  console.log('- MEDICAL_DATA_TYPES 中 value 已经是正确的 FileCategory 值')
  console.log('- 例如：{ label: "影像资料", value: "medical-image" }')
  console.log('- uploadForm.value.type 存储的是 "medical-image"')
  console.log('- 应该直接使用作为 category，而不是通过中文标签映射')
  console.log('')
  
  console.log('🔧 修复前的错误映射:')
  console.log('categoryMap["影像资料"] = "medical-image"  // ❌ 错误')
  console.log('但实际 uploadForm.value.type = "medical-image"  // ✅ 正确')
  console.log('')
  
  console.log('🔧 修复后的正确做法:')
  console.log('直接使用: category: uploadForm.value.type as FileCategory')
  console.log('')
  
  return true
}

// 测试文件预览功能修复
function testPreviewFunctionFix() {
  console.log('👁️ 测试文件预览功能修复...')
  
  console.log('📋 文件预览问题:')
  console.log('1. 图片加载失败 - 使用不可靠的 placeholder 服务')
  console.log('2. PDF 预览失败 - URL 无效')
  console.log('3. 文本预览内容单一')
  console.log('')
  
  console.log('✅ 修复方案:')
  console.log('1. 图片预览:')
  console.log('   - 使用 picsum.photos 替代 via.placeholder.com')
  console.log('   - 根据文件ID生成固定的随机图片')
  console.log('   - 提供更好的错误处理和重试机制')
  console.log('')
  
  console.log('2. PDF预览:')
  console.log('   - 使用 Mozilla PDF.js 官方测试文件')
  console.log('   - URL: https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')
  console.log('')
  
  console.log('3. 文本预览:')
  console.log('   - 根据数据类型动态生成内容')
  console.log('   - 支持检验报告、用药记录、体检报告等不同格式')
  console.log('   - 包含实际的文件信息和时间')
  console.log('')
  
  console.log('4. 预览URL生成策略:')
  console.log('   - 优先使用处理后的 previewUrl')
  console.log('   - 用户上传文件优先使用 blob URL')
  console.log('   - 否则生成模拟预览内容')
  
  return true
}

// 测试真实文件上传和预览
function testRealFileUpload() {
  console.log('📁 测试真实文件上传和预览...')
  
  console.log('✅ 修复内容:')
  console.log('1. 文件上传时转换为base64保存（<5MB文件）')
  console.log('2. 大文件使用blob URL')
  console.log('3. 预览时优先使用真实文件数据')
  console.log('4. 支持图片、PDF、文本等文件的真实预览')
  console.log('')
  
  console.log('🔧 技术实现:')
  console.log('- UploadData 接口添加 fileData 字段')
  console.log('- mockBackend 保存 filePreviewUrl 和 isUploaded 标记')
  console.log('- handleUpload 函数使用 fileToBase64 转换文件')
  console.log('- getFilePreviewUrl 优先使用真实文件数据')
  console.log('')
  
  console.log('📋 测试步骤:')
  console.log('1. 选择一个真实的图片文件（JPG/PNG）')
  console.log('2. 在患者端上传该文件')
  console.log('3. 点击"查看"按钮打开数据详情')
  console.log('4. 检查预览区域是否显示你上传的真实图片')
  console.log('5. 测试缩放、旋转等功能')
  console.log('')
  
  console.log('💡 文件类型支持:')
  console.log('- 图片文件: JPG, PNG, GIF - 显示真实图片并支持操作')
  console.log('- PDF文件: PDF - 在线预览真实PDF内容')
  console.log('- 文本文件: TXT, DOC - 读取并显示真实文本内容')
  console.log('- 其他文件: 显示文件信息和下载选项')
  
  return true
}

// 创建文件上传测试指南
function createUploadTestGuide() {
  console.log('📖 创建文件上传测试指南...')
  
  console.log('🚀 完整测试流程:')
  console.log('')
  console.log('步骤1: 准备测试文件')
  console.log('- 选择一张图片（建议JPG格式，小于5MB）')
  console.log('- 准备一个PDF文件（如果有的话）')
  console.log('- 准备一个文本文件（如果有的话）')
  console.log('')
  
  console.log('步骤2: 上传文件')
  console.log('- 访问患者端"我的数据"页面')
  console.log('- 点击"上传数据"按钮')
  console.log('- 选择数据类型（如"影像资料"）')
  console.log('- 输入数据名称和描述')
  console.log('- 选择你的测试文件')
  console.log('- 点击"确定上传"')
  console.log('')
  
  console.log('步骤3: 验证上传结果')
  console.log('- 检查表格中是否出现新的数据记录')
  console.log('- 数据类型是否正确显示（如"影像资料"而不是"其他类型"）')
  console.log('- 文件大小、创建日期等信息是否正确')
  console.log('')
  
  console.log('步骤4: 测试文件预览')
  console.log('- 点击数据记录的"查看"按钮')
  console.log('- 打开数据详情对话框')
  console.log('- 检查"文件预览"区域')
  console.log('- 🎯 关键验证: 预览的内容应该是你上传的真实文件！')
  console.log('')
  
  console.log('步骤5: 测试预览功能')
  console.log('- 图片文件: 测试缩放、旋转、全屏功能')
  console.log('- PDF文件: 测试翻页功能')
  console.log('- 下载功能: 点击下载按钮')
  console.log('')
  
  console.log('✅ 期望结果:')
  console.log('- 上传的图片能在预览区域正确显示')
  console.log('- 数据类型映射正确（影像资料显示为"影像资料"）')
  console.log('- 所有数据字段都有内容显示')
  console.log('- 预览操作功能正常工作')
  
  return true
}

console.log('🔧 数据详情功能修复测试工具已加载')
console.log('使用 fullDataDetailTest() 运行完整测试')
console.log('使用 createCompleteTestData() 创建测试数据')
console.log('使用 testFieldMapping() 测试字段映射')
console.log('使用 testFilePreview() 测试文件预览')
console.log('使用 testUploadTypeMapping() 测试上传类型映射')
console.log('使用 testPreviewFunctionFix() 测试预览功能修复')
console.log('使用 testRealFileUpload() 了解真实文件上传修复')
console.log('使用 createUploadTestGuide() 查看完整测试指南')
console.log('使用 clearTestData() 清除测试数据')
