/**
 * 医生端表格显示测试工具
 */

window.testDoctorTable = {
  /**
   * 检查医生端数据
   */
  checkDoctorData() {
    const user = localStorage.getItem('user')
    console.log('=== 医生端数据检查 ===')
    
    if (!user) {
      console.log('❌ 未登录')
      return
    }

    const userData = JSON.parse(user)
    console.log('当前用户:', userData.name, '角色:', userData.role)

    if (userData.role !== 'doctor') {
      console.log('⚠️ 当前不是医生账户')
      return
    }

    // 检查医疗文件数据
    const files = localStorage.getItem('mock_medical_files')
    if (!files) {
      console.log('❌ 无医疗文件数据')
      return
    }

    const filesData = JSON.parse(files)
    console.log(`📄 医疗文件总数: ${filesData.length}`)

    // 检查授权请求数据
    const authRequests = localStorage.getItem('mock_authorization_requests')
    const requestsData = authRequests ? JSON.parse(authRequests) : []
    console.log(`📋 授权请求总数: ${requestsData.length}`)

    // 分析医生可见的数据
    const doctorRequests = requestsData.filter(req => req.doctorId === userData.id)
    console.log(`👨‍⚕️ 当前医生的授权请求: ${doctorRequests.length}`)

    if (doctorRequests.length > 0) {
      console.log('授权请求状态:')
      const statusCount = {}
      doctorRequests.forEach(req => {
        statusCount[req.status] = (statusCount[req.status] || 0) + 1
      })
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`)
      })
    }

    console.log('')
  },

  /**
   * 模拟医生端表格数据处理
   */
  simulateDoctorTable() {
    const user = localStorage.getItem('user')
    const files = localStorage.getItem('mock_medical_files')
    const authRequests = localStorage.getItem('mock_authorization_requests')

    if (!user || !files) {
      console.log('❌ 缺少必要数据')
      return
    }

    const userData = JSON.parse(user)
    const filesData = JSON.parse(files)
    const requestsData = authRequests ? JSON.parse(authRequests) : []

    console.log('=== 模拟医生端表格显示 ===')

    // 模拟 getDoctorMedicalDataList 的处理逻辑
    const processedFiles = filesData.map(file => {
      // 查找当前医生对该文件的授权请求
      const request = requestsData.find(
        req => req.dataId === file.id && req.doctorId === userData.id
      )

      let authStatus = 'not-requested'
      if (request) {
        authStatus = request.status === 'approved' ? 'approved' : 
                    request.status === 'pending' ? 'pending' : 
                    request.status === 'rejected' ? 'rejected' : 'not-requested'
      }

      return {
        ...file,
        authStatus,
        // 字段映射检查
        title: file.title,           // ✅ 数据名称
        category: file.category,     // ✅ 数据类型  
        uploadTime: file.uploadTime, // ✅ 上传时间
        fileSize: file.fileSize      // ✅ 文件大小
      }
    })

    console.log(`📊 处理后的数据数量: ${processedFiles.length}`)
    
    processedFiles.forEach((file, index) => {
      console.log(`\n📋 文件 ${index + 1}:`)
      console.log(`  ID: ${file.id}`)
      console.log(`  名称: ${file.title || '❌ 空'}`)
      console.log(`  类型: ${file.category || '❌ 空'}`)
      console.log(`  时间: ${file.uploadTime || '❌ 空'}`)
      console.log(`  大小: ${file.fileSize || '❌ 空'}`)
      console.log(`  授权状态: ${file.authStatus}`)
    })

    console.log('')
    return processedFiles
  },

  /**
   * 创建授权请求测试数据
   */
  createAuthRequest() {
    const user = localStorage.getItem('user')
    const files = localStorage.getItem('mock_medical_files')

    if (!user || !files) {
      console.log('❌ 缺少必要数据')
      return
    }

    const userData = JSON.parse(user)
    const filesData = JSON.parse(files)

    if (userData.role !== 'doctor') {
      console.log('❌ 只有医生可以创建授权请求')
      return
    }

    if (filesData.length === 0) {
      console.log('❌ 没有医疗文件可以申请授权')
      return
    }

    // 获取第一个文件
    const targetFile = filesData[0]
    
    // 创建授权请求
    const authRequest = {
      id: `auth_${Date.now()}`,
      doctorId: userData.id,
      doctorName: userData.name,
      patientId: targetFile.patientId,
      dataId: targetFile.id,
      reason: '诊断需要查看患者检查报告',
      purpose: 'diagnosis',
      status: 'pending',
      requestTime: new Date().toISOString(),
      processedTime: null,
      processedBy: null
    }

    // 获取现有授权请求
    const existingRequests = localStorage.getItem('mock_authorization_requests')
    const requests = existingRequests ? JSON.parse(existingRequests) : []
    
    // 检查是否已存在请求
    const existingRequest = requests.find(
      req => req.dataId === targetFile.id && req.doctorId === userData.id
    )

    if (existingRequest) {
      console.log('⚠️ 该文件已存在授权请求')
      console.log(`状态: ${existingRequest.status}`)
      return
    }

    // 添加新请求
    requests.push(authRequest)
    localStorage.setItem('mock_authorization_requests', JSON.stringify(requests))
    
    console.log('✅ 授权请求已创建')
    console.log(`📄 目标文件: ${targetFile.title}`)
    console.log(`👨‍⚕️ 申请医生: ${userData.name}`)
    console.log(`📋 请求状态: ${authRequest.status}`)
    console.log('💡 请刷新医生端页面查看效果')
    console.log('')
  },

  /**
   * 批准授权请求（模拟患者操作）
   */
  approveAuthRequest() {
    const requests = localStorage.getItem('mock_authorization_requests')
    if (!requests) {
      console.log('❌ 没有授权请求数据')
      return
    }

    const requestsData = JSON.parse(requests)
    const pendingRequests = requestsData.filter(req => req.status === 'pending')

    if (pendingRequests.length === 0) {
      console.log('❌ 没有待审批的授权请求')
      return
    }

    // 批准第一个待审批的请求
    const targetRequest = pendingRequests[0]
    targetRequest.status = 'approved'
    targetRequest.processedTime = new Date().toISOString()
    targetRequest.processedBy = 'demo_patient_001' // 模拟患者ID

    localStorage.setItem('mock_authorization_requests', JSON.stringify(requestsData))
    
    console.log('✅ 授权请求已批准')
    console.log(`📄 文件ID: ${targetRequest.dataId}`)
    console.log(`👨‍⚕️ 申请医生: ${targetRequest.doctorName}`)
    console.log('💡 请刷新医生端页面查看"已授权"状态')
    console.log('')
  },

  /**
   * 完整测试流程
   */
  fullTest() {
    console.clear()
    console.log('🔍 ===== 医生端表格测试 =====\n')
    
    this.checkDoctorData()
    this.simulateDoctorTable()
    
    console.log('✅ ===== 测试完成 =====')
    console.log('💡 如果数据显示正常，说明修复成功！')
    console.log('🔄 如果仍有问题，请刷新页面重试')
  },

  /**
   * 完整演示流程
   */
  demoFlow() {
    console.clear()
    console.log('🎯 ===== 医生端授权演示流程 =====\n')
    
    console.log('第1步：检查当前数据')
    this.checkDoctorData()
    
    console.log('第2步：创建授权请求')
    this.createAuthRequest()
    
    console.log('第3步：模拟患者批准')
    setTimeout(() => {
      this.approveAuthRequest()
      console.log('第4步：请刷新医生端页面查看效果')
      console.log('预期结果：')
      console.log('  - 表格显示完整数据（名称、类型、日期、大小）')
      console.log('  - 授权状态显示"已授权"')
      console.log('  - "查看数据"按钮可点击')
    }, 1000)
  },

  /**
   * 帮助
   */
  help() {
    console.log(`
📖 医生端表格测试工具使用说明:

基础检查:
  testDoctorTable.checkDoctorData()    - 检查医生端数据
  testDoctorTable.simulateDoctorTable() - 模拟表格显示
  testDoctorTable.fullTest()           - 完整测试

演示功能:
  testDoctorTable.createAuthRequest()  - 创建授权请求
  testDoctorTable.approveAuthRequest() - 批准授权请求
  testDoctorTable.demoFlow()          - 完整演示流程

快速诊断:
  testDoctorTable.fullTest()          - 一键测试所有功能

预期结果:
  - 数据名称列：显示文件标题
  - 数据类型列：显示中文标签
  - 上传日期列：显示格式化日期
  - 文件大小列：显示格式化大小
  - 授权状态列：显示对应状态标签
    `)
  }
}

console.log('✅ 医生端表格测试工具已加载！')
console.log('💡 输入 testDoctorTable.help() 查看使用说明')
console.log('🔍 快速测试: testDoctorTable.fullTest()')
console.log('🎯 完整演示: testDoctorTable.demoFlow()')
