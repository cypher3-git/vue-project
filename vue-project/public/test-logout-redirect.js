/**
 * 测试退出登录跳转修复
 */

// 测试退出登录跳转
function testLogoutRedirect() {
  console.log('🔐 测试退出登录跳转逻辑...')
  
  // 确保当前已登录
  const currentUser = localStorage.getItem('user')
  if (!currentUser) {
    console.log('❌ 当前未登录，请先登录一个演示账户')
    return false
  }
  
  const user = JSON.parse(currentUser)
  console.log('👤 当前用户:', user.name, `(${user.role})`)
  
  console.log('\n📋 测试步骤:')
  console.log('1. 点击右上角用户头像下拉菜单')
  console.log('2. 点击"退出登录"选项')
  console.log('3. 观察页面跳转是否到 http://localhost:5173/ (根路径)')
  console.log('4. 确认没有跳转到 http://localhost:5173/auth/login')
  
  console.log('\n✅ 期望结果:')
  console.log('- 退出登录后跳转到根路径 (/)')
  console.log('- 清除了本地存储的用户信息和token')
  console.log('- 显示登录页面供用户重新选择')
  
  return true
}

// 模拟退出登录操作（仅清除本地数据）
function simulateLogout() {
  console.log('🚪 模拟退出登录...')
  
  const beforeUser = localStorage.getItem('user')
  const beforeToken = localStorage.getItem('token')
  
  console.log('📊 退出前状态:')
  console.log('- 用户信息:', beforeUser ? JSON.parse(beforeUser).name : '无')
  console.log('- Token:', beforeToken ? '已设置' : '无')
  
  // 清除本地存储（模拟logout函数的行为）
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  
  console.log('\n📊 退出后状态:')
  console.log('- 用户信息:', localStorage.getItem('user') || '已清除')
  console.log('- Token:', localStorage.getItem('token') || '已清除')
  
  console.log('\n💡 注意: 这只是模拟清除数据，真正的跳转需要点击退出登录按钮测试')
  
  return {
    beforeUser: beforeUser ? JSON.parse(beforeUser) : null,
    beforeToken: !!beforeToken,
    afterUser: localStorage.getItem('user'),
    afterToken: localStorage.getItem('token'),
    cleared: !localStorage.getItem('user') && !localStorage.getItem('token')
  }
}

// 恢复登录状态（用于测试后恢复）
function restoreLogin(userType = 'patient') {
  console.log(`🔄 恢复${userType === 'patient' ? '患者' : '医生'}登录状态...`)
  
  if (userType === 'patient') {
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
  } else {
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
  
  console.log('✅ 登录状态已恢复，请刷新页面')
}

// 检查当前页面URL
function checkCurrentUrl() {
  const url = window.location.href
  console.log('🌐 当前页面URL:', url)
  
  const expectedRoot = 'http://localhost:5173/'
  const expectedLogin = 'http://localhost:5173/auth/login'
  
  if (url === expectedRoot) {
    console.log('✅ 正确: 当前在根路径')
  } else if (url === expectedLogin) {
    console.log('❌ 错误: 当前在登录页（应该在根路径）')
  } else {
    console.log('ℹ️  当前在其他页面:', url)
  }
  
  return {
    current: url,
    isRoot: url === expectedRoot,
    isLogin: url === expectedLogin
  }
}

// 完整的退出登录测试流程
function fullLogoutTest() {
  console.log('🚀 开始完整的退出登录测试...\n')
  
  // 1. 检查当前状态
  const hasUser = testLogoutRedirect()
  if (!hasUser) {
    console.log('\n🔧 恢复登录状态进行测试...')
    restoreLogin('patient')
    console.log('请刷新页面后再次运行测试')
    return
  }
  
  // 2. 检查当前URL
  const urlStatus = checkCurrentUrl()
  
  // 3. 给出测试指导
  console.log('\n📝 测试指导:')
  console.log('1. 确保当前已登录（已检查 ✅）')
  console.log('2. 点击右上角用户头像')
  console.log('3. 选择"退出登录"')
  console.log('4. 观察是否跳转到根路径而非登录页')
  console.log('5. 使用 checkCurrentUrl() 验证跳转结果')
  
  return {
    userLoggedIn: hasUser,
    currentUrl: urlStatus
  }
}

console.log('🔐 退出登录跳转测试工具已加载')
console.log('使用 fullLogoutTest() 运行完整测试')
console.log('使用 testLogoutRedirect() 查看测试指导')
console.log('使用 simulateLogout() 模拟退出登录')
console.log('使用 restoreLogin("patient") 或 restoreLogin("doctor") 恢复登录')
console.log('使用 checkCurrentUrl() 检查当前页面URL')
