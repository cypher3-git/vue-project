/**
 * 上传数据调试工具
 */

window.debugUpload = {
  /**
   * 检查当前用户
   */
  checkUser() {
    const user = localStorage.getItem('user')
    console.log('=== 当前用户信息 ===')
    console.log('Raw:', user)
    if (user) {
      const parsed = JSON.parse(user)
      console.log('Parsed:', parsed)
      console.log('用户ID:', parsed.id)
      console.log('用户角色:', parsed.role)
      console.log('用户姓名:', parsed.name)
    } else {
      console.log('❌ 未登录')
    }
    console.log('')
  },

  /**
   * 检查医疗文件数据
   */
  checkFiles() {
    const files = localStorage.getItem('mock_medical_files')
    console.log('=== 医疗文件数据 ===')
    console.log('Raw:', files)
    if (files) {
      const parsed = JSON.parse(files)
      console.log('文件总数:', parsed.length)
      console.log('文件列表:')
      parsed.forEach((file, index) => {
        console.log(`  ${index + 1}. [${file.id}] ${file.title} (患者ID: ${file.patientId})`)
      })
    } else {
      console.log('❌ 无医疗文件数据')
    }
    console.log('')
  },

  /**
   * 检查数据匹配
   */
  checkMatch() {
    const user = localStorage.getItem('user')
    const files = localStorage.getItem('mock_medical_files')
    
    if (!user) {
      console.log('❌ 未登录，无法检查匹配')
      return
    }

    const userData = JSON.parse(user)
    const filesData = files ? JSON.parse(files) : []

    console.log('=== 数据匹配检查 ===')
    console.log('当前用户ID:', userData.id)
    console.log('用户角色:', userData.role)
    
    const userFiles = filesData.filter(f => f.patientId === userData.id)
    console.log('')
    console.log('属于当前用户的文件数:', userFiles.length)
    
    if (userFiles.length > 0) {
      console.log('✅ 找到匹配的文件:')
      userFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.title} (上传时间: ${file.uploadTime})`)
      })
    } else {
      console.log('⚠️ 未找到属于当前用户的文件')
      
      if (filesData.length > 0) {
        console.log('')
        console.log('📋 但LocalStorage中有其他文件:')
        filesData.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.title} (患者ID: ${file.patientId})`)
        })
      }
    }
    console.log('')
  },

  /**
   * 完整检查
   */
  fullCheck() {
    console.clear()
    console.log('🔍 ===== 上传数据调试 =====\n')
    this.checkUser()
    this.checkFiles()
    this.checkMatch()
    console.log('✅ ===== 检查完成 =====')
  },

  /**
   * 模拟上传
   */
  async simulateUpload() {
    const user = localStorage.getItem('user')
    if (!user) {
      console.error('❌ 请先登录')
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== 'patient') {
      console.error('❌ 只有患者可以上传数据')
      return
    }

    console.log('🚀 开始模拟上传...')
    
    // 创建模拟文件
    const mockFile = new File(['测试内容'], '测试文件.pdf', { type: 'application/pdf' })
    
    // 构造上传数据
    const uploadData = {
      file: mockFile,
      title: '测试上传 - ' + new Date().toLocaleTimeString(),
      description: '这是一个测试上传',
      category: 'report'
    }

    try {
      // 直接调用 mockBackend
      if (window.mockBackend) {
        const result = window.mockBackend.uploadMedicalFile(uploadData)
        console.log('上传结果:', result)
        
        if (result.success) {
          console.log('✅ 上传成功!')
          console.log('文件信息:', result.data)
          
          // 检查 LocalStorage
          setTimeout(() => {
            console.log('\n检查 LocalStorage 中的数据:')
            this.checkFiles()
          }, 100)
        } else {
          console.error('❌ 上传失败:', result.message)
        }
      } else {
        console.error('❌ mockBackend 未加载')
      }
    } catch (error) {
      console.error('❌ 上传出错:', error)
    }
  },

  /**
   * 清空所有数据
   */
  clearAll() {
    localStorage.removeItem('mock_medical_files')
    localStorage.removeItem('mock_authorization_requests')
    localStorage.removeItem('mock_access_records')
    console.log('✅ 已清空所有医疗数据')
  },

  /**
   * 帮助
   */
  help() {
    console.log(`
📖 上传数据调试工具使用说明:

基础检查:
  debugUpload.checkUser()        - 检查当前用户
  debugUpload.checkFiles()       - 检查医疗文件
  debugUpload.checkMatch()       - 检查数据匹配
  debugUpload.fullCheck()        - 完整检查

测试功能:
  debugUpload.simulateUpload()   - 模拟上传
  debugUpload.clearAll()         - 清空所有数据

快速诊断:
  debugUpload.fullCheck()        - 一键检查所有问题
    `)
  }
}

// 暴露 mockBackend
import('/src/services/mockBackend.ts').then(module => {
  window.mockBackend = module.default
  console.log('✅ 上传调试工具已加载！')
  console.log('💡 输入 debugUpload.help() 查看使用说明')
  console.log('🔍 快速诊断: debugUpload.fullCheck()')
}).catch(err => {
  console.error('❌ 加载 mockBackend 失败:', err)
})

