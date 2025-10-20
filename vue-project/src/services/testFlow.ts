/**
 * 医疗数据管理系统 - 完整流程测试脚本
 * 
 * 使用方法：
 * 1. 在浏览器控制台导入此文件
 * 2. 分别以患者和医生身份登录
 * 3. 调用相应的测试函数
 */

import { uploadMedicalFile, getMedicalFiles } from '@/api/medicalData'
import { 
  getMedicalDataList, 
  requestAuthorization, 
  viewMedicalData,
  revealPatientIdentity 
} from '@/api/doctor'
import { 
  getAuthorizationRequests, 
  approveAuthorization, 
  rejectAuthorization,
  revealDoctorIdentity 
} from '@/api/patient'
import { getAccessRecordsList } from '@/services/mockBackend'

/**
 * 测试1：患者上传医疗数据
 */
export async function testPatientUpload() {
  console.log('📤 测试：患者上传医疗数据...')
  
  // 创建一个模拟文件
  const mockFile = new File(
    ['模拟文件内容'], 
    'test-report.pdf', 
    { type: 'application/pdf' }
  )

  const uploadData = {
    file: mockFile,
    title: '血常规检查报告',
    description: '2024年10月体检血常规检查结果',
    category: 'lab-report' as const
  }

  try {
    const response = await uploadMedicalFile(uploadData)
    console.log('✅ 上传成功:', response)
    return response.data
  } catch (error) {
    console.error('❌ 上传失败:', error)
    throw error
  }
}

/**
 * 测试2：患者查看自己的医疗数据
 */
export async function testPatientViewFiles() {
  console.log('👀 测试：患者查看医疗数据列表...')
  
  try {
    const response = await getMedicalFiles({
      page: 1,
      pageSize: 20
    })
    console.log('✅ 查询成功:', response)
    console.log(`📊 共有 ${response.data?.total || 0} 条数据`)
    return response.data
  } catch (error) {
    console.error('❌ 查询失败:', error)
    throw error
  }
}

/**
 * 测试3：医生查看医疗数据列表
 */
export async function testDoctorViewDataList() {
  console.log('👨‍⚕️ 测试：医生查看医疗数据列表...')
  
  try {
    const response = await getMedicalDataList({
      page: 1,
      pageSize: 20
    })
    console.log('✅ 查询成功:', response)
    console.log(`📊 共有 ${response.data?.total || 0} 条数据`)
    
    // 检查患者信息是否被隐藏
    const firstFile = response.data?.items[0]
    if (firstFile) {
      console.log('🔒 授权状态:', firstFile.authStatus)
      console.log('👤 患者姓名:', firstFile.patientName || '【需授权后可见】')
    }
    
    return response.data
  } catch (error) {
    console.error('❌ 查询失败:', error)
    throw error
  }
}

/**
 * 测试4：医生发起授权请求
 */
export async function testDoctorRequestAuth(dataId: string) {
  console.log('🔐 测试：医生发起授权请求...')
  console.log('数据ID:', dataId)
  
  try {
    const response = await requestAuthorization(
      dataId,
      '需要查看患者的检查报告以便进行准确诊断和制定治疗方案'
    )
    console.log('✅ 授权请求发送成功:', response)
    return response
  } catch (error) {
    console.error('❌ 授权请求失败:', error)
    throw error
  }
}

/**
 * 测试5：患者查看授权请求
 */
export async function testPatientViewAuthRequests() {
  console.log('📋 测试：患者查看授权请求...')
  
  try {
    const response = await getAuthorizationRequests({
      status: 'pending',
      page: 1,
      pageSize: 20
    })
    console.log('✅ 查询成功:', response)
    console.log(`📊 待审批的请求数: ${response.data?.total || 0}`)
    
    if (response.data?.items.length > 0) {
      const firstRequest = response.data.items[0]
      console.log('👨‍⚕️ 申请医生:', firstRequest.doctorName)
      console.log('📄 申请数据:', firstRequest.dataName)
      console.log('💬 申请理由:', firstRequest.reason)
    }
    
    return response.data
  } catch (error) {
    console.error('❌ 查询失败:', error)
    throw error
  }
}

/**
 * 测试6：患者同意授权
 */
export async function testPatientApproveAuth(requestId: string) {
  console.log('✅ 测试：患者同意授权...')
  console.log('请求ID:', requestId)
  
  try {
    const response = await approveAuthorization({
      requestId,
      expiresIn: 30,  // 30天有效期
      notes: '请妥善保管我的医疗数据，仅用于诊疗目的'
    })
    console.log('✅ 授权成功:', response)
    return response
  } catch (error) {
    console.error('❌ 授权失败:', error)
    throw error
  }
}

/**
 * 测试7：患者拒绝授权
 */
export async function testPatientRejectAuth(requestId: string) {
  console.log('❌ 测试：患者拒绝授权...')
  console.log('请求ID:', requestId)
  
  try {
    const response = await rejectAuthorization({
      requestId,
      reason: '暂时不需要就诊，谢谢医生的关心'
    })
    console.log('✅ 拒绝成功:', response)
    return response
  } catch (error) {
    console.error('❌ 拒绝失败:', error)
    throw error
  }
}

/**
 * 测试8：医生查看已授权的数据
 */
export async function testDoctorViewData(dataId: string) {
  console.log('👁️ 测试：医生查看已授权的数据...')
  console.log('数据ID:', dataId)
  
  try {
    const response = await viewMedicalData(dataId)
    console.log('✅ 查看成功:', response)
    console.log('📄 数据标题:', response.data?.title)
    console.log('📝 数据描述:', response.data?.description)
    console.log('🔒 访问已记录')
    return response.data
  } catch (error) {
    console.error('❌ 查看失败:', error)
    throw error
  }
}

/**
 * 测试9：医生溯源患者身份
 */
export async function testDoctorTracePatient(dataId: string) {
  console.log('🔍 测试：医生溯源患者身份...')
  console.log('数据ID:', dataId)
  
  try {
    const response = await revealPatientIdentity(dataId)
    console.log('✅ 溯源成功:', response)
    if (response.data) {
      console.log('👤 患者姓名:', response.data.patient.name)
      console.log('🏥 患者年龄:', response.data.patient.age)
      console.log('📞 患者电话:', response.data.patient.phone)
    }
    return response.data
  } catch (error) {
    console.error('❌ 溯源失败:', error)
    throw error
  }
}

/**
 * 测试10：患者溯源医生身份
 */
export async function testPatientTraceDoctor(requestId: string) {
  console.log('🔍 测试：患者溯源医生身份...')
  console.log('请求ID:', requestId)
  
  try {
    const response = await revealDoctorIdentity(requestId)
    console.log('✅ 溯源成功:', response)
    if (response.data) {
      console.log('👨‍⚕️ 医生姓名:', response.data.doctor.name)
      console.log('🏥 所属医院:', response.data.doctor.hospital)
      console.log('🔬 所属科室:', response.data.doctor.department)
      console.log('📊 总访问次数:', response.data.totalAccess)
      console.log('🕐 最后访问时间:', response.data.lastAccessTime)
    }
    return response.data
  } catch (error) {
    console.error('❌ 溯源失败:', error)
    throw error
  }
}

/**
 * 测试11：查看访问记录
 */
export async function testViewAccessRecords(fileId?: string) {
  console.log('📊 测试：查看访问记录...')
  
  try {
    const response = getAccessRecordsList({
      fileId,
      page: 1,
      pageSize: 20
    })
    console.log('✅ 查询成功:', response)
    console.log(`📊 共有 ${response.data?.total || 0} 条访问记录`)
    
    if (response.data?.items.length > 0) {
      console.log('最近的访问记录:')
      response.data.items.slice(0, 5).forEach((record, index) => {
        console.log(`${index + 1}. ${record.doctor.name} 于 ${record.accessTime} ${record.accessType}了数据`)
      })
    }
    
    return response.data
  } catch (error) {
    console.error('❌ 查询失败:', error)
    throw error
  }
}

/**
 * 完整流程测试
 * 
 * 注意：需要分别以患者和医生身份登录来执行不同步骤
 */
export async function testCompleteFlow() {
  console.log('🚀 开始完整流程测试...')
  console.log('=' .repeat(50))
  
  try {
    // 步骤1：患者上传数据
    console.log('\n📤 步骤1：患者上传医疗数据')
    console.log('请确保当前登录的是【患者】账号')
    console.log('执行命令: testPatientUpload()')
    
    // 步骤2：患者查看数据
    console.log('\n📋 步骤2：患者查看自己的数据')
    console.log('执行命令: testPatientViewFiles()')
    
    // 步骤3：切换到医生账号
    console.log('\n🔄 步骤3：切换到医生账号')
    console.log('请退出患者账号，以【医生】身份重新登录')
    
    // 步骤4：医生查看数据列表
    console.log('\n👀 步骤4：医生查看数据列表')
    console.log('执行命令: testDoctorViewDataList()')
    
    // 步骤5：医生发起授权
    console.log('\n🔐 步骤5：医生发起授权请求')
    console.log('执行命令: testDoctorRequestAuth("数据ID")')
    
    // 步骤6：切换回患者账号
    console.log('\n🔄 步骤6：切换回患者账号')
    console.log('请退出医生账号，以【患者】身份重新登录')
    
    // 步骤7：患者查看授权请求
    console.log('\n📋 步骤7：患者查看授权请求')
    console.log('执行命令: testPatientViewAuthRequests()')
    
    // 步骤8：患者同意授权
    console.log('\n✅ 步骤8：患者同意授权')
    console.log('执行命令: testPatientApproveAuth("请求ID")')
    
    // 步骤9：切换到医生账号
    console.log('\n🔄 步骤9：切换到医生账号')
    console.log('请退出患者账号，以【医生】身份重新登录')
    
    // 步骤10：医生查看数据
    console.log('\n👁️ 步骤10：医生查看已授权的数据')
    console.log('执行命令: testDoctorViewData("数据ID")')
    
    // 步骤11：医生溯源患者
    console.log('\n🔍 步骤11：医生溯源患者身份')
    console.log('执行命令: testDoctorTracePatient("数据ID")')
    
    // 步骤12：切换回患者账号
    console.log('\n🔄 步骤12：切换回患者账号')
    console.log('请退出医生账号，以【患者】身份重新登录')
    
    // 步骤13：患者溯源医生
    console.log('\n🔍 步骤13：患者溯源医生身份')
    console.log('执行命令: testPatientTraceDoctor("请求ID")')
    
    // 步骤14：查看访问记录
    console.log('\n📊 步骤14：查看访问记录')
    console.log('执行命令: testViewAccessRecords("数据ID")')
    
    console.log('\n' + '='.repeat(50))
    console.log('✅ 测试流程说明完成！')
    console.log('💡 提示：请按照上述步骤，在不同账号之间切换并执行相应命令')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

/**
 * 快速演示（需要手动切换账号）
 */
export async function quickDemo() {
  console.log('🎬 快速演示模式')
  console.log('=' .repeat(50))
  
  // 获取当前用户
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    console.error('❌ 请先登录！')
    return
  }
  
  const user = JSON.parse(userStr)
  console.log(`👤 当前用户: ${user.name} (${user.role === 'patient' ? '患者' : '医生'})`)
  
  if (user.role === 'patient') {
    console.log('\n📤 患者操作演示:')
    console.log('1. 上传数据: await testPatientUpload()')
    console.log('2. 查看数据: await testPatientViewFiles()')
    console.log('3. 查看授权请求: await testPatientViewAuthRequests()')
    console.log('4. 同意授权: await testPatientApproveAuth("请求ID")')
    console.log('5. 溯源医生: await testPatientTraceDoctor("请求ID")')
  } else {
    console.log('\n👨‍⚕️ 医生操作演示:')
    console.log('1. 查看数据列表: await testDoctorViewDataList()')
    console.log('2. 发起授权: await testDoctorRequestAuth("数据ID")')
    console.log('3. 查看数据: await testDoctorViewData("数据ID")')
    console.log('4. 溯源患者: await testDoctorTracePatient("数据ID")')
  }
  
  console.log('\n📊 通用操作:')
  console.log('- 查看访问记录: await testViewAccessRecords()')
  console.log('=' .repeat(50))
}

// 导出所有测试函数
export default {
  testPatientUpload,
  testPatientViewFiles,
  testDoctorViewDataList,
  testDoctorRequestAuth,
  testPatientViewAuthRequests,
  testPatientApproveAuth,
  testPatientRejectAuth,
  testDoctorViewData,
  testDoctorTracePatient,
  testPatientTraceDoctor,
  testViewAccessRecords,
  testCompleteFlow,
  quickDemo
}

