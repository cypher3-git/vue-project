/**
 * 测试医生提交申请后授权状态变化
 */

// 测试完整的授权状态变化流程
function fullAuthStatusTest() {
  console.log('🚀 开始测试授权状态变化流程...')
  
  // 第一步：切换到患者账户并上传数据
  console.log('\n📋 第1步：患者上传数据')
  switchToPatient()
  console.log('👤 当前用户:', JSON.parse(localStorage.getItem('user') || '{}').name)
  
  const patientData = uploadTestData()
  console.log('📄 上传的数据ID:', patientData.id)
  console.log('📊 初始授权状态:', patientData.authStatus) // 应该是 'not-requested'
  
  // 第二步：切换到医生账户
  console.log('\n📋 第2步：切换到医生账户')
  switchToDoctor()
  console.log('👨‍⚕️ 当前用户:', JSON.parse(localStorage.getItem('user') || '{}').name)
  
  // 第三步：医生查看数据状态
  console.log('\n📋 第3步：医生查看数据状态')
  const doctorViewBefore = checkDataFromDoctorView(patientData.id)
  console.log('🔍 医生端看到的数据状态:', doctorViewBefore?.authStatus) // 应该是 'not-requested'
  
  // 第四步：医生提交授权申请
  console.log('\n📋 第4步：医生提交授权申请')
  const authRequest = submitAuthorizationRequest(patientData.id, '用于诊断治疗需要')
  console.log('📨 授权请求结果:', authRequest)
  
  // 第五步：检查数据状态是否已更新
  console.log('\n📋 第5步：检查状态更新')
  const doctorViewAfter = checkDataFromDoctorView(patientData.id)
  console.log('🔄 提交申请后医生端数据状态:', doctorViewAfter?.authStatus) // 应该是 'pending'
  
  // 第六步：切换回患者查看状态
  console.log('\n📋 第6步：患者端查看状态')
  switchToPatient()
  const patientView = checkDataFromPatientView(patientData.id)
  console.log('🔄 患者端数据状态:', patientView?.authStatus) // 应该是 'pending'
  
  // 第七步：检查授权请求列表
  console.log('\n📋 第7步：检查授权请求')
  const authRequests = getAuthorizationRequests()
  console.log('📋 授权请求列表:', authRequests)
  const relatedRequest = authRequests.find(req => req.dataId === patientData.id)
  console.log('🎯 相关授权请求:', relatedRequest)
  
  // 验证结果
  console.log('\n✅ 测试结果验证:')
  console.log('- 初始状态 not-requested:', patientData.authStatus === 'not-requested')
  console.log('- 申请后状态 pending (医生端):', doctorViewAfter?.authStatus === 'pending')
  console.log('- 申请后状态 pending (患者端):', patientView?.authStatus === 'pending')
  console.log('- 生成了授权请求:', relatedRequest?.status === 'pending')
  
  const allPassed = patientData.authStatus === 'not-requested' &&
                   doctorViewAfter?.authStatus === 'pending' &&
                   patientView?.authStatus === 'pending' &&
                   relatedRequest?.status === 'pending'
  
  console.log(allPassed ? '🎉 所有测试通过！' : '❌ 部分测试失败！')
  
  return {
    initialStatus: patientData.authStatus,
    doctorViewAfter: doctorViewAfter?.authStatus,
    patientView: patientView?.authStatus,
    authRequest: relatedRequest,
    allPassed
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

function uploadTestData() {
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  const newFile = {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    patientId: "patient_001",
    title: "测试心电图报告",
    description: "用于测试授权状态变化的心电图数据",
    category: "medical-image",
    fileName: "test_ecg.pdf",
    filePath: "/uploads/test_ecg.pdf", 
    fileSize: 1024000,
    uploadTime: new Date().toISOString(),
    authStatus: "not-requested",
    authorizationCount: 0,
    accessCount: 0,
    isShared: false,
    tags: ["心电图", "测试"]
  }
  
  medicalFiles.push(newFile)
  localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
  return newFile
}

function checkDataFromDoctorView(fileId) {
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  return medicalFiles.find(file => file.id === fileId)
}

function checkDataFromPatientView(fileId) {
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  return medicalFiles.find(file => file.id === fileId)
}

function submitAuthorizationRequest(dataId, reason) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (currentUser.role !== 'doctor') {
      return { success: false, message: '只有医生可以发起授权请求' }
    }

    const files = JSON.parse(localStorage.getItem('medical_files') || '[]')
    const file = files.find(f => f.id === dataId)

    if (!file) {
      return { success: false, message: '医疗数据不存在' }
    }

    const requests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')

    // 检查是否已经存在待审批的授权请求
    const existingRequest = requests.find(
      req => req.dataId === dataId && 
             req.doctorId === currentUser.id && 
             req.status === 'pending'
    )

    if (existingRequest) {
      return { success: false, message: '已存在待审批的授权请求，请等待患者处理' }
    }

    // 创建新的授权请求
    const newRequest = {
      id: `auth_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataId: dataId,
      dataName: file.title,
      dataType: file.category,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorDepartment: currentUser.department || '未知科室',
      doctorHospital: currentUser.hospital || '未知医院',
      doctorIdCard: currentUser.idCard || '',
      reason: reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      isIdentityRevealed: false
    }

    requests.push(newRequest)
    localStorage.setItem('authorization_requests', JSON.stringify(requests))

    // 更新文件的授权状态
    const fileIndex = files.findIndex(f => f.id === dataId)
    if (fileIndex !== -1) {
      files[fileIndex].authStatus = 'pending'
      files[fileIndex].authorizationCount = (files[fileIndex].authorizationCount || 0) + 1
      localStorage.setItem('medical_files', JSON.stringify(files))
    }

    console.log('✅ 授权请求发起成功:', newRequest)

    return {
      success: true,
      message: '授权请求已发送，等待患者审批'
    }
  } catch (error) {
    console.error('❌ 发起授权请求失败:', error)
    return {
      success: false,
      message: error.message || '发起授权请求失败'
    }
  }
}

function getAuthorizationRequests() {
  return JSON.parse(localStorage.getItem('authorization_requests') || '[]')
}

// 清除测试数据
function clearTestData() {
  console.log('🧹 清除测试数据...')
  localStorage.removeItem('medical_files')
  localStorage.removeItem('authorization_requests') 
  localStorage.removeItem('access_records')
  console.log('✅ 测试数据已清除')
}

// 快速测试
function quickTest() {
  clearTestData()
  return fullAuthStatusTest()
}

console.log('🔧 授权状态变化测试工具已加载')
console.log('使用 fullAuthStatusTest() 运行完整测试')
console.log('使用 quickTest() 运行快速测试（先清除数据）')
console.log('使用 clearTestData() 清除测试数据')
