/**
 * 隐私数据脱敏工具函数
 */

/**
 * 脱敏显示姓名
 * @param name 完整姓名
 * @param simple 是否使用简化模式（显示单个"-"字符）
 * @returns 脱敏后的姓名 (如: 张三 -> *** 或 -)
 */
export const maskName = (name: string, simple: boolean = false): string => {
  if (!name || name.length === 0) return simple ? '-' : '***'
  
  // 简化脱敏模式：显示单个"-"
  if (simple) return '-'
  
  // 完全脱敏，不显示任何真实字符
  return '*'.repeat(Math.max(name.length, 3))
}

/**
 * 脱敏显示身份证号
 * @param idCard 完整身份证号
 * @param simple 是否使用简化模式（显示单个"-"字符）
 * @returns 脱敏后的身份证号 (如: 320106198503156789 -> 320***********6789 或 -)
 */
export const maskIdCard = (idCard: string, simple: boolean = false): string => {
  if (!idCard || idCard.length < 8) return simple ? '-' : '***************'
  
  // 简化脱敏模式：显示单个"-"
  if (simple) return '-'
  
  const start = idCard.substring(0, 3)
  const end = idCard.substring(idCard.length - 4)
  const middle = '*'.repeat(idCard.length - 7)
  
  return start + middle + end
}

/**
 * 脱敏显示手机号
 * @param phone 完整手机号
 * @param simple 是否使用简化模式（显示单个"-"字符）
 * @returns 脱敏后的手机号 (如: 13800138000 -> 138****8000 或 -)
 */
export const maskPhone = (phone: string, simple: boolean = false): string => {
  if (!phone || phone.length < 7) return simple ? '-' : '***********'
  
  // 简化脱敏模式：显示单个"-"
  if (simple) return '-'
  
  const start = phone.substring(0, 3)
  const end = phone.substring(phone.length - 4)
  const middle = '*'.repeat(4)
  
  return start + middle + end
}

/**
 * 脱敏显示邮箱
 * @param email 完整邮箱
 * @returns 脱敏后的邮箱 (如: test@example.com -> t***@example.com)
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***@***.***'
  
  const [localPart, domain] = email.split('@')
  if (localPart.length <= 1) {
    return '*' + '@' + domain
  }
  
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 1)
  return maskedLocal + '@' + domain
}

/**
 * 通用脱敏工具 - 保留首尾，中间用*替换
 * @param text 原始文本
 * @param startLen 保留开头字符数
 * @param endLen 保留结尾字符数
 * @param simple 是否使用简化模式（显示单个"-"字符）
 * @returns 脱敏后的文本
 */
export const maskText = (text: string, startLen: number = 1, endLen: number = 1, simple: boolean = false): string => {
  if (!text || text.length <= startLen + endLen) {
    return simple ? '-' : '*'.repeat(text?.length || 3)
  }
  
  // 简化脱敏模式：显示单个"-"
  if (simple) return '-'
  
  const start = text.substring(0, startLen)
  const end = text.substring(text.length - endLen)
  const middle = '*'.repeat(text.length - startLen - endLen)
  
  return start + middle + end
}

/**
 * 根据解锁状态显示内容
 * @param content 原始内容
 * @param isUnlocked 是否已解锁
 * @param fallback 未解锁时的默认值
 * @returns 解锁后显示原始内容，未解锁显示"-"
 */
export const displayByUnlockStatus = (content: string | undefined | null, isUnlocked: boolean | undefined, fallback: string = '-'): string => {
  if (isUnlocked === true) {
    return content || '暂无信息'
  }
  return fallback
}
