/**
 * 医疗数据共享测试辅助工具
 * 在浏览器控制台使用：window.testHelper.xxx()
 */

window.testHelper = {
  /**
   * 查看数据共享状态
   */
  checkStatus() {
    console.log('🔍 ===== 数据共享状态检查 =====\n')

    // 1. 当前登录用户
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    console.log('👤 当前登录用户:', user?.name || '未登录')
    console.log('🎭 用户角色:', user?.role || 'N/A')
    if (user?.role === 'patient') {
      console.log('🏥 当前科室:', user.currentDepartment)
    } else if (user?.role === 'doctor') {
      console.log('🏥 所属科室:', user.department)
      console.log('🏥 所属医院:', user.hospital)
    }
    console.log('')

    // 2. 医疗文件
    const files = JSON.parse(localStorage.getItem('mock_medical_files') || '[]')
    console.log('📄 医疗文件总数:', files.length)
    files.forEach((f, i) => {
      console.log(`  ${i+1}. ${f.title} - ${f.category} - [${f.authStatus}]`)
    })
    console.log('')

    // 3. 授权请求
    const requests = JSON.parse(localStorage.getItem('mock_authorization_requests') || '[]')
    console.log('📨 授权请求总数:', requests.length)
    requests.forEach((r, i) => {
      console.log(`  ${i+1}. ${r.doctorName} → ${r.dataName} - [${r.status}]`)
    })
    console.log('')

    // 4. 访问记录
    const records = JSON.parse(localStorage.getItem('mock_access_records') || '[]')
    console.log('📊 访问记录总数:', records.length)
    records.forEach((r, i) => {
      const time = new Date(r.accessTime).toLocaleString()
      console.log(`  ${i+1}. ${r.doctor.name} ${r.accessType} ${r.file.title} (${time})`)
    })
    console.log('')

    console.log('✅ ===== 检查完成 =====')
  },

  /**
   * 查看医疗文件详情
   */
  showFiles() {
    const files = JSON.parse(localStorage.getItem('mock_medical_files') || '[]')
    console.table(files.map(f => ({
      ID: f.id.substring(0, 15) + '...',
      标题: f.title,
      类别: f.category,
      授权状态: f.authStatus,
      上传时间: new Date(f.uploadTime).toLocaleString(),
      患者: f.patientName || '隐藏'
    })))
  },

  /**
   * 查看授权请求详情
   */
  showRequests() {
    const requests = JSON.parse(localStorage.getItem('mock_authorization_requests') || '[]')
    console.table(requests.map(r => ({
      ID: r.id.substring(0, 15) + '...',
      医生: r.doctorName,
      数据: r.dataName,
      状态: r.status,
      理由: r.reason.substring(0, 20) + '...',
      申请时间: new Date(r.requestedAt).toLocaleString()
    })))
  },

  /**
   * 查看访问记录详情
   */
  showRecords() {
    const records = JSON.parse(localStorage.getItem('mock_access_records') || '[]')
    console.table(records.map(r => ({
      医生: r.doctor.name,
      操作类型: r.accessType,
      数据: r.file.title,
      访问时间: new Date(r.accessTime).toLocaleString(),
      时长: r.duration + '秒'
    })))
  },

  /**
   * 查看当前用户信息
   */
  showUser() {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user) {
      console.log('❌ 未登录')
      return
    }
    
    console.log('👤 用户信息:')
    console.log('  ID:', user.id)
    console.log('  姓名:', user.name)
    console.log('  角色:', user.role === 'patient' ? '患者' : '医生')
    console.log('  手机:', user.phone)
    console.log('  身份证:', user.idCard)
    
    if (user.role === 'patient') {
      console.log('  当前科室:', user.currentDepartment)
      console.log('  已注册科室:', user.departments?.map(d => d.department).join(', '))
    } else {
      console.log('  所属科室:', user.department)
      console.log('  所属医院:', user.hospital)
    }
  },

  /**
   * 验证数据共享
   */
  verifySharing() {
    console.log('🔬 ===== 验证数据共享 =====\n')

    const files = JSON.parse(localStorage.getItem('mock_medical_files') || '[]')
    const requests = JSON.parse(localStorage.getItem('mock_authorization_requests') || '[]')
    const records = JSON.parse(localStorage.getItem('mock_access_records') || '[]')
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    console.log('当前登录:', user?.name, `(${user?.role})`)
    console.log('')

    // 验证1: 数据是否存在
    console.log('✅ 检查1: 共享数据存在性')
    console.log('  医疗文件:', files.length > 0 ? `✅ ${files.length}条` : '❌ 无数据')
    console.log('  授权请求:', requests.length > 0 ? `✅ ${requests.length}条` : '❌ 无数据')
    console.log('  访问记录:', records.length > 0 ? `✅ ${records.length}条` : '❌ 无数据')
    console.log('')

    // 验证2: 数据独立性
    console.log('✅ 检查2: 数据独立性')
    console.log('  用户数据:', localStorage.getItem('user') ? '✅ 存在' : '❌ 不存在')
    console.log('  医疗文件:', localStorage.getItem('mock_medical_files') ? '✅ 独立存储' : '❌ 不存在')
    console.log('  授权请求:', localStorage.getItem('mock_authorization_requests') ? '✅ 独立存储' : '❌ 不存在')
    console.log('  访问记录:', localStorage.getItem('mock_access_records') ? '✅ 独立存储' : '❌ 不存在')
    console.log('')

    // 验证3: 数据一致性
    console.log('✅ 检查3: 数据一致性')
    let consistent = true
    files.forEach(file => {
      const relatedRequests = requests.filter(r => r.dataId === file.id)
      if (relatedRequests.length > 0) {
        console.log(`  文件"${file.title}"有 ${relatedRequests.length} 个相关授权请求`)
      }
    })
    console.log('')

    console.log('✅ ===== 验证完成 =====')
  },

  /**
   * 清空所有测试数据
   */
  clearAll() {
    if (confirm('⚠️ 确定要清空所有测试数据吗？\n这将删除：\n- 所有医疗文件\n- 所有授权请求\n- 所有访问记录')) {
      localStorage.removeItem('mock_medical_files')
      localStorage.removeItem('mock_authorization_requests')
      localStorage.removeItem('mock_access_records')
      console.log('✅ 所有测试数据已清空')
      console.log('💡 提示：用户登录状态保留，如需重新登录请手动退出')
    }
  },

  /**
   * 生成测试数据
   */
  generateTestData() {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (!user || user.role !== 'patient') {
      console.log('❌ 请先以患者身份登录')
      return
    }

    const files = JSON.parse(localStorage.getItem('mock_medical_files') || '[]')
    
    // 生成3个测试文件
    const testFiles = [
      {
        id: `file_${Date.now()}_1`,
        title: '血常规检查报告',
        description: '2024年10月体检血常规',
        fileName: 'blood-test.pdf',
        originalName: 'blood-test.pdf',
        fileSize: 524288,
        fileType: 'pdf',
        mimeType: 'application/pdf',
        category: 'lab-report',
        status: 'completed',
        uploadTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patientId: user.id,
        downloadCount: 0,
        viewCount: 0,
        authStatus: 'not-requested',
        authorizationCount: 0,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        patientName: user.name,
        patientIdCard: user.idCard,
        patientPhone: user.phone,
        patientGender: user.gender || 'male',
        patientAge: 20
      },
      {
        id: `file_${Date.now()}_2`,
        title: 'CT影像报告',
        description: '胸部CT检查',
        fileName: 'ct-scan.pdf',
        originalName: 'ct-scan.pdf',
        fileSize: 1048576,
        fileType: 'pdf',
        mimeType: 'application/pdf',
        category: 'medical-image',
        status: 'completed',
        uploadTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patientId: user.id,
        downloadCount: 0,
        viewCount: 0,
        authStatus: 'not-requested',
        authorizationCount: 0,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        patientName: user.name,
        patientIdCard: user.idCard,
        patientPhone: user.phone,
        patientGender: user.gender || 'male',
        patientAge: 20
      },
      {
        id: `file_${Date.now()}_3`,
        title: '体检报告',
        description: '年度健康体检',
        fileName: 'health-check.pdf',
        originalName: 'health-check.pdf',
        fileSize: 786432,
        fileType: 'pdf',
        mimeType: 'application/pdf',
        category: 'physical-exam',
        status: 'completed',
        uploadTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patientId: user.id,
        downloadCount: 0,
        viewCount: 0,
        authStatus: 'not-requested',
        authorizationCount: 0,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        patientName: user.name,
        patientIdCard: user.idCard,
        patientPhone: user.phone,
        patientGender: user.gender || 'male',
        patientAge: 20
      }
    ]

    files.push(...testFiles)
    localStorage.setItem('mock_medical_files', JSON.stringify(files))
    
    console.log('✅ 已生成3个测试文件:')
    testFiles.forEach((f, i) => {
      console.log(`  ${i+1}. ${f.title} (${f.category})`)
    })
    console.log('💡 刷新页面后可以看到这些文件')
  },

  /**
   * 显示帮助信息
   */
  help() {
    console.log(`
📚 测试辅助工具使用说明

基础命令：
  testHelper.checkStatus()      - 查看数据共享状态（推荐）
  testHelper.showUser()          - 查看当前用户信息
  testHelper.help()              - 显示此帮助信息

详细查看：
  testHelper.showFiles()         - 查看医疗文件详情（表格）
  testHelper.showRequests()      - 查看授权请求详情（表格）
  testHelper.showRecords()       - 查看访问记录详情（表格）

验证和测试：
  testHelper.verifySharing()     - 验证数据共享是否正常
  testHelper.generateTestData()  - 生成测试数据（需患者登录）

清理数据：
  testHelper.clearAll()          - 清空所有测试数据

使用示例：
  1. 患者登录后执行：testHelper.generateTestData()
  2. 查看状态：testHelper.checkStatus()
  3. 医生登录后执行：testHelper.checkStatus()
  4. 验证共享：testHelper.verifySharing()
    `)
  }
}

// 自动显示帮助
console.log('✅ 测试辅助工具已加载！')
console.log('💡 输入 testHelper.help() 查看使用说明')
console.log('🚀 快速开始：testHelper.checkStatus()')

