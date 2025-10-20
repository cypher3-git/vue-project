/**
 * 修复LocalStorage中的英文数据类型显示
 */

// 数据类型映射表
const DATA_TYPE_MAP = {
  'lab-report': '检验报告',
  'medical-image': '影像资料', 
  'medication': '用药记录',
  'physical-exam': '体检报告',
  'other': '其他类型',
  // 旧的英文值映射
  'diagnosis': '检验报告', // diagnosis -> lab-report
  'evaluation': '影像资料', // evaluation -> medical-image  
  'research': '用药记录', // research -> medication
  'consultation': '体检报告' // consultation -> physical-exam
}

// 检查LocalStorage中的英文数据
function checkEnglishData() {
  console.log('🔍 检查LocalStorage中的英文数据类型...')
  
  // 检查医疗文件
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  console.log(`📄 医疗文件总数: ${medicalFiles.length}`)
  
  const englishFiles = medicalFiles.filter(file => 
    file.category && (
      file.category === 'other' || 
      file.category === 'diagnosis' ||
      !['lab-report', 'medical-image', 'medication', 'physical-exam'].includes(file.category)
    )
  )
  
  if (englishFiles.length > 0) {
    console.log(`❌ 发现 ${englishFiles.length} 个文件包含英文或无效的数据类型:`)
    englishFiles.forEach(file => {
      console.log(`  - ${file.title}: ${file.category}`)
    })
  } else {
    console.log('✅ 所有医疗文件数据类型正常')
  }
  
  // 检查授权请求
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  console.log(`📋 授权请求总数: ${authRequests.length}`)
  
  const englishRequests = authRequests.filter(req => 
    req.dataType && (
      req.dataType === 'other' || 
      req.dataType === 'diagnosis' ||
      !['lab-report', 'medical-image', 'medication', 'physical-exam'].includes(req.dataType)
    )
  )
  
  if (englishRequests.length > 0) {
    console.log(`❌ 发现 ${englishRequests.length} 个授权请求包含英文或无效的数据类型:`)
    englishRequests.forEach(req => {
      console.log(`  - ${req.dataName}: ${req.dataType}`)
    })
  } else {
    console.log('✅ 所有授权请求数据类型正常')
  }
  
  return {
    medicalFiles: {
      total: medicalFiles.length,
      english: englishFiles.length,
      files: englishFiles
    },
    authRequests: {
      total: authRequests.length,
      english: englishRequests.length,
      requests: englishRequests
    }
  }
}

// 修复LocalStorage中的英文数据类型
function fixEnglishData() {
  console.log('🔧 修复LocalStorage中的英文数据类型...')
  
  // 修复医疗文件
  const medicalFiles = JSON.parse(localStorage.getItem('medical_files') || '[]')
  let fixedFilesCount = 0
  
  medicalFiles.forEach(file => {
    if (file.category && !['lab-report', 'medical-image', 'medication', 'physical-exam'].includes(file.category)) {
      const oldCategory = file.category
      
      // 根据内容推测类型
      if (oldCategory === 'other' || oldCategory === 'diagnosis') {
        if (file.title.includes('检验') || file.title.includes('化验') || file.title.includes('血常规')) {
          file.category = 'lab-report'
        } else if (file.title.includes('CT') || file.title.includes('X光') || file.title.includes('影像') || file.title.includes('心电图')) {
          file.category = 'medical-image'
        } else if (file.title.includes('处方') || file.title.includes('用药') || file.title.includes('药物')) {
          file.category = 'medication'
        } else if (file.title.includes('体检') || file.title.includes('健康')) {
          file.category = 'physical-exam'
        } else {
          // 默认设为检验报告
          file.category = 'lab-report'
        }
      } else {
        // 其他英文类型直接映射
        file.category = 'lab-report'
      }
      
      console.log(`  📄 ${file.title}: ${oldCategory} → ${file.category}`)
      fixedFilesCount++
    }
  })
  
  if (fixedFilesCount > 0) {
    localStorage.setItem('medical_files', JSON.stringify(medicalFiles))
    console.log(`✅ 已修复 ${fixedFilesCount} 个医疗文件`)
  } else {
    console.log('✅ 医疗文件无需修复')
  }
  
  // 修复授权请求
  const authRequests = JSON.parse(localStorage.getItem('authorization_requests') || '[]')
  let fixedRequestsCount = 0
  
  authRequests.forEach(req => {
    if (req.dataType && !['lab-report', 'medical-image', 'medication', 'physical-exam'].includes(req.dataType)) {
      const oldType = req.dataType
      
      // 根据数据名称推测类型
      if (oldType === 'other' || oldType === 'diagnosis') {
        if (req.dataName.includes('检验') || req.dataName.includes('化验') || req.dataName.includes('血常规')) {
          req.dataType = 'lab-report'
        } else if (req.dataName.includes('CT') || req.dataName.includes('X光') || req.dataName.includes('影像') || req.dataName.includes('心电图')) {
          req.dataType = 'medical-image'
        } else if (req.dataName.includes('处方') || req.dataName.includes('用药') || req.dataName.includes('药物')) {
          req.dataType = 'medication'
        } else if (req.dataName.includes('体检') || req.dataName.includes('健康')) {
          req.dataType = 'physical-exam'
        } else {
          req.dataType = 'lab-report'
        }
      } else {
        req.dataType = 'lab-report'
      }
      
      console.log(`  📋 ${req.dataName}: ${oldType} → ${req.dataType}`)
      fixedRequestsCount++
    }
  })
  
  if (fixedRequestsCount > 0) {
    localStorage.setItem('authorization_requests', JSON.stringify(authRequests))
    console.log(`✅ 已修复 ${fixedRequestsCount} 个授权请求`)
  } else {
    console.log('✅ 授权请求无需修复')
  }
  
  return {
    fixedFiles: fixedFilesCount,
    fixedRequests: fixedRequestsCount
  }
}

// 创建标准测试数据
function createStandardTestData() {
  console.log('📊 创建标准测试数据...')
  
  // 清除现有数据
  localStorage.removeItem('medical_files')
  localStorage.removeItem('authorization_requests')
  localStorage.removeItem('access_records')
  
  // 创建标准医疗文件
  const standardFiles = [
    {
      id: `file_${Date.now()}_1`,
      patientId: "patient_001",
      title: "血常规检查报告",
      description: "定期健康检查血常规化验结果",
      category: "lab-report", // 标准类型
      fileName: "blood_test.pdf",
      filePath: "/uploads/blood_test.pdf",
      fileSize: 1024000,
      uploadTime: new Date().toISOString(),
      authStatus: "not-requested",
      authorizationCount: 0,
      accessCount: 0,
      isShared: false,
      tags: ["血常规", "健康检查"]
    },
    {
      id: `file_${Date.now()}_2`,
      patientId: "patient_001",
      title: "胸部CT扫描",
      description: "胸部CT影像检查报告",
      category: "medical-image", // 标准类型
      fileName: "chest_ct.pdf",
      filePath: "/uploads/chest_ct.pdf",
      fileSize: 2048000,
      uploadTime: new Date(Date.now() - 86400000).toISOString(),
      authStatus: "pending",
      authorizationCount: 1,
      accessCount: 0,
      isShared: true,
      tags: ["CT", "影像"]
    }
  ]
  
  localStorage.setItem('medical_files', JSON.stringify(standardFiles))
  
  // 创建标准授权请求
  const standardRequests = [
    {
      id: `auth_req_${Date.now()}_1`,
      dataId: standardFiles[1].id,
      dataName: standardFiles[1].title,
      dataType: standardFiles[1].category, // 使用标准类型
      doctorId: "doctor_001",
      doctorName: "演示医生",
      doctorDepartment: "心内科",
      doctorHospital: "演示医院",
      doctorIdCard: "110***********5678",
      reason: "患者胸闷症状需要查看CT影像进行诊断\n使用目的：诊断治疗",
      status: "pending",
      requestedAt: new Date().toISOString(),
      isIdentityRevealed: false
    }
  ]
  
  localStorage.setItem('authorization_requests', JSON.stringify(standardRequests))
  
  console.log(`✅ 已创建 ${standardFiles.length} 个标准医疗文件`)
  console.log(`✅ 已创建 ${standardRequests.length} 个标准授权请求`)
  console.log('📝 所有数据类型都使用标准的中文映射')
  
  return {
    files: standardFiles.length,
    requests: standardRequests.length
  }
}

// 完整修复流程
function fullEnglishFix() {
  console.log('🚀 开始完整的英文数据修复流程...\n')
  
  // 1. 检查问题
  console.log('📋 第1步: 检查现有数据')
  const checkResult = checkEnglishData()
  
  // 2. 修复数据
  console.log('\n📋 第2步: 修复英文数据')
  const fixResult = fixEnglishData()
  
  // 3. 验证修复
  console.log('\n📋 第3步: 验证修复结果')
  const verifyResult = checkEnglishData()
  
  console.log('\n✅ 修复完成!')
  console.log(`- 修复了 ${fixResult.fixedFiles} 个医疗文件`)
  console.log(`- 修复了 ${fixResult.fixedRequests} 个授权请求`)
  console.log('- 现在所有数据类型都会显示中文')
  
  console.log('\n💡 建议刷新页面查看修复效果')
  
  return {
    before: checkResult,
    fixed: fixResult,
    after: verifyResult
  }
}

console.log('🔧 英文数据修复工具已加载')
console.log('使用 fullEnglishFix() 运行完整修复')
console.log('使用 checkEnglishData() 检查数据状态')
console.log('使用 fixEnglishData() 修复英文数据')
console.log('使用 createStandardTestData() 创建标准测试数据')
