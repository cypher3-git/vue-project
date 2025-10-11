/**
 * 模拟数据配置
 * 用于控制是否使用模拟数据进行前端测试
 * 
 * 使用方法：
 * 1. 开发测试时：设置 USE_MOCK_DATA = true
 * 2. 连接后端时：设置 USE_MOCK_DATA = false
 * 
 * ⚠️ 重要说明：
 * - 模拟数据仅对演示账户生效（通过"患者演示"或"医生演示"登录）
 * - 真实账户登录时会自动调用真实后端 API，不会使用模拟数据
 * - 这样可以让演示账户看到完整的功能展示，同时不影响真实用户的数据
 */

export const MOCK_CONFIG = {
  // 是否启用模拟数据
  USE_MOCK_DATA: true,
  
  // 模拟 API 延迟时间（毫秒），模拟真实网络请求
  MOCK_DELAY: 300,
  
  // 是否在控制台打印模拟数据日志
  ENABLE_MOCK_LOG: true
}

/**
 * 模拟 API 延迟
 */
export const mockDelay = (ms: number = MOCK_CONFIG.MOCK_DELAY) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 打印模拟数据日志
 */
export const mockLog = (action: string, data?: any) => {
  if (MOCK_CONFIG.ENABLE_MOCK_LOG) {
    console.log(`[MOCK] ${action}`, data || '')
  }
}

