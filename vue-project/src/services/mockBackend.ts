/**
 * 模拟后端服务 - 使用 LocalStorage 存储数据
 * 用于演示医疗数据管理系统的核心功能
 */

import type {
  MedicalFile,
  FileCategory,
  FileStatus,
  AuthorizationStatus,
  AuthorizationRequest,
  AccessRecord,
  ApproveAuthorizationData,
  RejectAuthorizationData,
  UploadData
} from '@/types/medicalData'
import type { ApiResponse, PaginatedData, PatientUser, DoctorUser, Department } from '@/types/auth'

// ==================== 多用户数据模型扩展 ====================

// 扩展医疗文件，添加科室信息
interface MedicalFileWithDepartment extends MedicalFile {
  departmentId: string      // 文件所属科室ID
  departmentName: string    // 科室名称
  patientDepartment: string // 患者上传时的科室（冗余字段，便于查询）
  // 兼容旧数据的额外字段
  isUploaded?: boolean      // 是否已上传
  filePath?: string         // 文件路径
  filePreviewUrl?: string   // 文件预览URL
}

// 多用户数据库结构
interface UserDatabase {
  patients: PatientUser[]           // 所有患者用户
  doctors: DoctorUser[]            // 所有医生用户
  departments: Department[]        // 科室列表
  currentUserId: string           // 当前登录用户ID
  currentUserRole: 'patient' | 'doctor'  // 当前用户角色
}

// 预设用户数据
interface PresetUser {
  id: string
  name: string
  phone: string
  idCard: string
  department?: string  // 医生的固定科室，或患者的当前科室
  hospital?: string    // 医生的医院
  registeredDepartments?: string[]  // 患者注册的科室列表
}

// ==================== LocalStorage 键名常量 ====================
const STORAGE_KEYS = {
  USER_DATABASE: 'mock_user_database',        // 新增：多用户数据库
  MEDICAL_FILES: 'mock_medical_files',
  AUTHORIZATION_REQUESTS: 'mock_authorization_requests',
  ACCESS_RECORDS: 'mock_access_records',
  DEPARTMENTS: 'mock_departments',            // 新增：科室列表
  CURRENT_USER: 'mock_current_user'          // 保留：当前用户（兼容）
} as const

// ==================== 数据存储工具函数 ====================

/**
 * 从 LocalStorage 获取数据
 */
function getStorageData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error(`读取 ${key} 数据失败:`, error)
    return defaultValue
  }
}

/**
 * 保存数据到 LocalStorage
 */
function setStorageData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`保存 ${key} 数据失败:`, error)
  }
}

/**
 * 生成唯一ID
 */
function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ==================== 多用户数据库管理 ====================

/**
 * 获取用户数据库
 */
function getUserDatabase(): UserDatabase {
  try {
    console.log('🔍 检查localStorage中的用户数据库...')
    const stored = localStorage.getItem(STORAGE_KEYS.USER_DATABASE)
    
    if (stored) {
      console.log('📖 发现已存储的数据，解析中...')
      const db = JSON.parse(stored) as UserDatabase
      
      console.log('🧐 验证数据完整性:')
      console.log(`- 患者数量: ${db.patients?.length || 0}`)
      console.log(`- 医生数量: ${db.doctors?.length || 0}`)
      
      if (db.patients && db.doctors && db.patients.length >= 4 && db.doctors.length >= 4) {
        console.log('✅ 数据库完整，使用现有数据')
        console.log('患者ID列表:', db.patients.map(p => p.id))
        console.log('医生ID列表:', db.doctors.map(d => d.id))
        return db
      } else {
        console.log('⚠️ 数据库不完整，需要重新初始化')
      }
    } else {
      console.log('📭 localStorage中没有找到用户数据库')
    }
  } catch (error) {
    console.error('❌ 解析用户数据库失败:', error)
  }
  
  // 数据库不存在或不完整，重新初始化
  console.log('🚀 开始重新初始化用户数据库...')
  return initializeUserDatabase()
}

/**
 * 保存用户数据库
 */
function saveUserDatabase(db: UserDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATABASE, JSON.stringify(db))
    console.log(`💾 数据库已保存: 患者${db.patients.length}个, 医生${db.doctors.length}个`)
  } catch (error) {
    console.error('❌ 保存用户数据库失败:', error)
  }
}

/**
 * 获取当前登录用户信息（兼容原有逻辑）
 */
function getCurrentUser() {
  // 先尝试从localStorage获取传统用户信息（兼容性）
  const userStr = localStorage.getItem('user')
  if (userStr) {
    return JSON.parse(userStr)
  }
  
  // 从多用户数据库获取当前用户
  const db = getUserDatabase()
  if (!db.currentUserId) {
    throw new Error('用户未登录')
  }
  
  if (db.currentUserRole === 'patient') {
    const patient = db.patients.find(p => p.id === db.currentUserId)
    if (!patient) {
      throw new Error('当前患者用户不存在')
    }
    return patient
  } else {
    const doctor = db.doctors.find(d => d.id === db.currentUserId)
    if (!doctor) {
      throw new Error('当前医生用户不存在')
    }
    return doctor
  }
}

/**
 * 切换当前用户（自动初始化数据库）
 */
export function switchUser(userId: string, role: 'patient' | 'doctor'): ApiResponse {
  try {
    console.log(`🔄 switchUser called: ${userId} (${role})`)
    
    // 确保数据库已初始化
    let db = getUserDatabase()
    console.log(`📊 当前数据库状态: 患者${db.patients.length}个, 医生${db.doctors.length}个`)
    
    // 如果数据库为空或数据不完整，强制初始化
    if (db.patients.length < 4 || db.doctors.length < 4) {
      console.log('⚠️ 数据库不完整，强制重新初始化...')
      console.log('原有数据:')
      console.log('- 患者:', db.patients.map(p => `${p.id}: ${p.name}`))
      console.log('- 医生:', db.doctors.map(d => `${d.id}: ${d.name}`))
      
      // 清除旧数据并重新初始化
      localStorage.removeItem(STORAGE_KEYS.USER_DATABASE)
      db = initializeUserDatabase()
      
      console.log('✅ 重新初始化完成:')
      console.log('- 患者:', db.patients.map(p => `${p.id}: ${p.name}`))
      console.log('- 医生:', db.doctors.map(d => `${d.id}: ${d.name}`))
    }
    
    // 详细查找过程
    let targetUser: any = null
    if (role === 'patient') {
      console.log(`🔍 在${db.patients.length}个患者中查找: ${userId}`)
      console.log('所有患者ID:', db.patients.map(p => p.id))
      
      targetUser = db.patients.find(p => p.id === userId)
      if (!targetUser) {
        console.error(`❌ 患者不存在: ${userId}`)
        console.log('完整患者列表:', db.patients.map(p => `${p.id}: ${p.name} (${p.currentDepartment})`))
        return { success: false, message: `患者用户不存在: ${userId}` }
      }
    } else {
      console.log(`🔍 在${db.doctors.length}个医生中查找: ${userId}`)
      console.log('所有医生ID:', db.doctors.map(d => d.id))
      
      targetUser = db.doctors.find(d => d.id === userId)
      if (!targetUser) {
        console.error(`❌ 医生不存在: ${userId}`)
        console.log('完整医生列表:', db.doctors.map(d => `${d.id}: ${d.name} (${d.department})`))
        return { success: false, message: `医生用户不存在: ${userId}` }
      }
    }
    
    console.log(`🎯 找到目标用户: ${targetUser.name} (${targetUser.role})`)
    
    // 更新当前用户
    db.currentUserId = userId
    db.currentUserRole = role
    saveUserDatabase(db)
    
    // 更新localStorage
    localStorage.setItem('user', JSON.stringify(targetUser))
    
    console.log(`✅ 用户切换成功: ${targetUser.name}`)
    
    return {
      success: true,
      message: `已切换到${targetUser.name}`,
      data: targetUser
    }
  } catch (error: any) {
    console.error('❌ 用户切换失败:', error)
    return {
      success: false,
      message: error.message || '用户切换失败'
    }
  }
}

/**
 * 初始化用户数据库（预设多用户测试数据）
 */
function initializeUserDatabase(): UserDatabase {
  console.log('🚀 初始化多用户测试数据...')
  
  // 预设科室列表（与DEPARTMENTS保持一致）
  const departments = [
    '心血管科', '内科', '骨科', '神经科', '外科', 
    '呼吸内科', '消化内科', '泌尿科', '妇产科', '儿科'
  ]
  
  // 预设患者（4个用户：2个心血管科+2个呼吸内科）
  const patients: PatientUser[] = [
    // 心血管科患者
    {
      id: 'patient_cardio_001',
      name: '张三',
      phone: '13800138001',
      role: 'patient',
      idCard: '330101199001011234',
      currentDepartment: '心血管科',
      departments: [{ id: 'dept_cardio_001', department: '心血管科' }],
      createdAt: formatDateTime(new Date('2024-01-01'))
    },
    {
      id: 'patient_cardio_002', 
      name: '李四',
      phone: '13800138002',
      role: 'patient',
      idCard: '330101199202021234',
      currentDepartment: '心血管科',
      departments: [{ id: 'dept_cardio_002', department: '心血管科' }],
      createdAt: formatDateTime(new Date('2024-01-02'))
    },
    
    // 呼吸内科患者
    {
      id: 'patient_respiratory_001',
      name: '王五',
      phone: '13800138003',
      role: 'patient', 
      idCard: '330101199303031234',
      currentDepartment: '呼吸内科',
      departments: [{ id: 'dept_respiratory_001', department: '呼吸内科' }],
      createdAt: formatDateTime(new Date('2024-01-03'))
    },
    {
      id: 'patient_respiratory_002',
      name: '赵六',
      phone: '13800138004',
      role: 'patient',
      idCard: '330101199404041234', 
      currentDepartment: '呼吸内科',
      departments: [{ id: 'dept_respiratory_002', department: '呼吸内科' }],
      createdAt: formatDateTime(new Date('2024-01-04'))
    }
  ]
  
  // 预设医生（4个用户：2个心血管科+2个呼吸内科）
  const doctors: DoctorUser[] = [
    // 心血管科医生
    {
      id: 'doctor_cardio_001',
      name: '刘医生',
      phone: '13900139001', 
      role: 'doctor',
      idCard: '330101197001011234',
      department: '心血管科',
      hospital: '浙江大学医学院附属第一医院',
      createdAt: formatDateTime(new Date('2023-06-01'))
    },
    {
      id: 'doctor_cardio_002',
      name: '陈医生',
      phone: '13900139002',
      role: 'doctor', 
      idCard: '330101197502021234',
      department: '心血管科',
      hospital: '浙江大学医学院附属第二医院',
      createdAt: formatDateTime(new Date('2023-06-02'))
    },
    
    // 呼吸内科医生
    {
      id: 'doctor_respiratory_001',
      name: '吴医生', 
      phone: '13900139003',
      role: 'doctor',
      idCard: '330101197603031234',
      department: '呼吸内科',
      hospital: '浙江大学医学院附属第一医院',
      createdAt: formatDateTime(new Date('2023-06-03'))
    },
    {
      id: 'doctor_respiratory_002',
      name: '周医生',
      phone: '13900139004',
      role: 'doctor',
      idCard: '330101197704041234', 
      department: '呼吸内科',
      hospital: '浙江大学医学院附属第二医院',
      createdAt: formatDateTime(new Date('2023-06-04'))
    }
  ]
  
  // 验证用户数据完整性
  console.log('🔍 验证创建的用户数据:')
  console.log('患者列表:')
  patients.forEach(p => console.log(`  - ${p.id}: ${p.name} (${p.currentDepartment})`))
  console.log('医生列表:')
  doctors.forEach(d => console.log(`  - ${d.id}: ${d.name} (${d.department})`))
  
  if (patients.length !== 4) {
    console.error(`❌ 患者数量错误: 期望4个，实际${patients.length}个`)
  }
  if (doctors.length !== 4) {
    console.error(`❌ 医生数量错误: 期望4个，实际${doctors.length}个`)
  }
  
  // 创建用户数据库
  const db: UserDatabase = {
    patients: [...patients], // 使用扩展运算符确保数据独立性
    doctors: [...doctors],   // 使用扩展运算符确保数据独立性
    departments: departments as any,
    currentUserId: patients[0].id,
    currentUserRole: 'patient'
  }
  
  console.log('💾 保存用户数据库到localStorage...')
  
  // 保存到localStorage
  try {
    saveUserDatabase(db)
    
    // 立即验证保存结果
    const savedData = localStorage.getItem(STORAGE_KEYS.USER_DATABASE)
    if (savedData) {
      const parsedData = JSON.parse(savedData) as UserDatabase
      console.log('✅ 验证保存结果:')
      console.log(`- 患者数量: ${parsedData.patients.length}`)
      console.log(`- 医生数量: ${parsedData.doctors.length}`)
      console.log('- 患者ID:', parsedData.patients.map(p => p.id))
      console.log('- 医生ID:', parsedData.doctors.map(d => d.id))
      
      if (parsedData.patients.length === 4 && parsedData.doctors.length === 4) {
        console.log('🎉 数据保存验证成功！')
      } else {
        console.error('❌ 数据保存验证失败！')
      }
    } else {
      console.error('❌ 保存后无法读取数据')
    }
  } catch (error) {
    console.error('❌ 保存用户数据库时出错:', error)
  }
  
  // 设置默认用户到localStorage
  const defaultUser = patients[0]
  localStorage.setItem('user', JSON.stringify(defaultUser))
  
  console.log(`✅ 多用户数据初始化完成: ${patients.length}个患者, ${doctors.length}个医生`)
  console.log(`🎯 默认用户: ${defaultUser.name} (${defaultUser.role})`)
  
  return db
}

/**
 * 获取所有用户列表（用于用户切换界面）
 */
export function getAllUsers(): ApiResponse<{patients: PatientUser[], doctors: DoctorUser[]}> {
  try {
    const db = getUserDatabase()
    return {
      success: true,
      message: '获取用户列表成功',
      data: {
        patients: db.patients,
        doctors: db.doctors
      }
    }
  } catch (error: any) {
    console.error('❌ 获取用户列表失败:', error)
    return {
      success: false,
      message: error.message || '获取用户列表失败'
    }
  }
}

/**
 * 格式化日期时间
 */
function formatDateTime(date: Date = new Date()): string {
  return date.toISOString()
}

// ==================== 医疗文件管理 ====================

/**
 * 获取所有医疗文件
 */
export function getAllMedicalFiles(): MedicalFile[] {
  return getStorageData<MedicalFile[]>(STORAGE_KEYS.MEDICAL_FILES, [])
}

/**
 * 保存医疗文件列表
 */
export function saveMedicalFiles(files: MedicalFile[]): void {
  setStorageData(STORAGE_KEYS.MEDICAL_FILES, files)
}

/**
 * 患者上传医疗数据（支持科室标识）
 */
export function uploadMedicalFile(uploadData: UploadData): ApiResponse<MedicalFileWithDepartment> {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'patient') {
      return {
        success: false,
        message: '只有患者可以上传医疗数据'
      }
    }

    // 获取患者当前科室信息
    const currentDepartment = currentUser.currentDepartment || '未知科室'

    const files = getAllMedicalFiles()
    
    // 检查是否存在重复文件（基于文件名和大小）
    const existingFile = files.find(file => 
      file.patientId === currentUser.id &&
      file.fileName === uploadData.file.name && 
      file.fileSize === uploadData.file.size
    )
    
    console.log('🔍 重复文件检查:', {
      uploadFileName: uploadData.file.name,
      uploadFileSize: uploadData.file.size,
      patientId: currentUser.id,
      existingFiles: files.filter(f => f.patientId === currentUser.id).map(f => ({
        id: f.id,
        fileName: f.fileName,
        fileSize: f.fileSize
      })),
      isDuplicate: !!existingFile
    })
    
    if (existingFile) {
      return {
        success: false,
        message: `文件 "${uploadData.file.name}" 已存在，不能重复上传同一个文件`
      }
    }
    
    // 创建新的医疗文件记录（带科室信息）
    const newFile: MedicalFileWithDepartment = {
      id: generateId('file'),
      title: uploadData.title,
      description: uploadData.description,
      fileName: uploadData.file.name,
      originalName: uploadData.file.name,
      fileSize: uploadData.file.size,
      fileType: uploadData.file.name.split('.').pop() || '',
      mimeType: uploadData.file.type,
      category: uploadData.category,
      status: 'completed' as FileStatus,
      uploadTime: formatDateTime(),
      updatedAt: formatDateTime(),
      patientId: currentUser.id,
      downloadCount: 0,
      viewCount: 0,
      authStatus: 'not-requested' as AuthorizationStatus,
      authorizationCount: 0,
      isVerified: true,
      verifiedAt: formatDateTime(),
      // 患者信息（患者端上传时保存完整信息）
      patientName: currentUser.name,
      patientIdCard: currentUser.idCard,
      patientPhone: currentUser.phone,
      patientGender: currentUser.gender || '未知',
      patientAge: calculateAge(currentUser.idCard) || 0,
      // 新增：科室信息
      departmentId: generateId('dept'),
      departmentName: currentDepartment,
      patientDepartment: currentDepartment,
      // 添加文件预览相关字段
      isUploaded: true,
      filePath: uploadData.fileData || '', // 文件的base64数据或blob URL
      filePreviewUrl: uploadData.fileData || '' // 用于预览的URL
    }

    files.push(newFile)
    saveMedicalFiles(files)

    console.log('✅ 医疗数据上传成功:', newFile)

    return {
      success: true,
      message: '上传成功',
      data: newFile
    }
  } catch (error: any) {
    console.error('❌ 上传失败:', error)
    return {
      success: false,
      message: error.message || '上传失败'
    }
  }
}

/**
 * 患者删除医疗数据
 */
export function deleteMedicalFile(fileId: string): ApiResponse<void> {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'patient') {
      return {
        success: false,
        message: '只有患者可以删除医疗数据'
      }
    }

    const files = getAllMedicalFiles() as MedicalFileWithDepartment[]
    const fileIndex = files.findIndex(file => file.id === fileId)
    
    if (fileIndex === -1) {
      return {
        success: false,
        message: '文件不存在'
      }
    }
    
    const fileToDelete = files[fileIndex]
    
    // 检查是否为当前用户的文件
    if (fileToDelete.patientId !== currentUser.id) {
      return {
        success: false,
        message: '无权限删除此文件'
      }
    }
    
    // 删除文件记录
    files.splice(fileIndex, 1)
    saveMedicalFiles(files)
    
    console.log('🗑️ 文件删除成功:', {
      deletedFileId: fileId,
      deletedFileName: fileToDelete.fileName,
      deletedFileSize: fileToDelete.fileSize,
      remainingFiles: files.filter(f => f.patientId === currentUser.id).length
    })
    
    // 清理相关的授权请求
    const authRequests = getAllAuthorizationRequests()
    const updatedAuthRequests = authRequests.filter(request => request.dataId !== fileId)
    if (updatedAuthRequests.length !== authRequests.length) {
      saveAuthorizationRequests(updatedAuthRequests)
    }
    
    // 清理相关的访问记录
    const accessRecords = getAllAccessRecords()
    const updatedAccessRecords = accessRecords.filter(record => record.fileId !== fileId)
    if (updatedAccessRecords.length !== accessRecords.length) {
      saveAccessRecords(updatedAccessRecords)
    }
    
    // 如果是blob URL，释放内存
    if (fileToDelete.filePath && fileToDelete.filePath.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(fileToDelete.filePath)
      } catch (error) {
        console.warn('释放blob URL失败:', error)
      }
    }

    console.log('✅ 医疗数据删除成功:', fileToDelete.title)

    return {
      success: true,
      message: '删除成功'
    }
  } catch (error: any) {
    console.error('❌ 医疗数据删除失败:', error)
    return {
      success: false,
      message: error.message || '删除失败'
    }
  }
}

/**
 * 患者获取自己的医疗文件列表（数据隔离保证）
 */
export function getPatientMedicalFiles(params?: {
  category?: FileCategory
  keyword?: string
  authStatus?: AuthorizationStatus
  page?: number
  pageSize?: number
}): ApiResponse<PaginatedData<MedicalFileWithDepartment>> {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'patient') {
      return {
        success: false,
        message: '只有患者可以查看自己的医疗数据'
      }
    }

    let files = getAllMedicalFiles() as MedicalFileWithDepartment[]
    
    // 核心保证：患者只能看到自己的数据
    files = files.filter(file => file.patientId === currentUser.id)
    
    console.log(`👤 患者 ${currentUser.name} 查看自己的数据，共 ${files.length} 条`)

    // 应用筛选条件
    if (params?.category) {
      files = files.filter(file => file.category === params.category)
    }

    if (params?.authStatus) {
      files = files.filter(file => file.authStatus === params.authStatus)
    }

    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      files = files.filter(file => 
        file.title.toLowerCase().includes(keyword) ||
        file.description.toLowerCase().includes(keyword)
      )
    }

    // 排序：按上传时间倒序
    files.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())

    // 分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const total = files.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedFiles = files.slice(start, end)

    return {
      success: true,
      message: '查询成功',
      data: {
        files: paginatedFiles,  // ✅ 修复：改为 files 以匹配前端期望
        items: paginatedFiles,  // 保留 items 以兼容
        total,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '查询失败'
    }
  }
}

/**
 * 医生获取医疗数据列表（支持科室权限控制）
 */
export function getDoctorMedicalDataList(params?: {
  dataType?: string
  authStatus?: string
  keyword?: string
  page?: number
  pageSize?: number
}): ApiResponse<PaginatedData<MedicalFileWithDepartment>> {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'doctor') {
      return {
        success: false,
        message: '只有医生可以查看医疗数据'
      }
    }

    // 获取医生所属科室
    const doctorDepartment = currentUser.department || '未知科室'

    let files = getAllMedicalFiles() as MedicalFileWithDepartment[]
    const authRequests = getAllAuthorizationRequests()

    // 核心改进：科室级权限控制 - 医生只能看到本科室的数据
    files = files.filter(file => {
      // 如果文件有科室信息，检查是否匹配医生科室
      if (file.departmentName || file.patientDepartment) {
        const fileDepartment = file.departmentName || file.patientDepartment
        return fileDepartment === doctorDepartment
      }
      // 兼容旧数据：没有科室信息的文件对所有医生可见
      return true
    })

    console.log(`🏥 医生 ${currentUser.name}(${doctorDepartment}) 查看科室数据，共 ${files.length} 条`)

    // 为每个文件添加授权状态信息
    files = files.map(file => {
      // 查找当前医生对该文件的授权请求
      const request = authRequests.find(
        req => req.dataId === file.id && req.doctorId === currentUser.id
      )

      if (!request) {
        // 未发起授权请求
        return {
          ...file,
          authStatus: 'not-requested' as AuthorizationStatus,
          // 隐藏患者信息
          patientName: undefined,
          patientIdCard: undefined,
          patientPhone: undefined,
          patientGender: undefined,
          patientAge: undefined,
          isPatientIdentityRevealed: false
        }
      } else if (request.status === 'pending') {
        // 待审批
        return {
          ...file,
          authStatus: 'pending' as AuthorizationStatus,
          // 隐藏患者信息
          patientName: undefined,
          patientIdCard: undefined,
          patientPhone: undefined,
          patientGender: undefined,
          patientAge: undefined,
          isPatientIdentityRevealed: false
        }
      } else if (request.status === 'approved') {
        // 已批准 - 显示患者信息
        return {
          ...file,
          authStatus: 'approved' as AuthorizationStatus,
          // 默认不显示患者信息，需要溯源才显示
          isPatientIdentityRevealed: false
        }
      } else if (request.status === 'rejected') {
        // 已拒绝
        return {
          ...file,
          authStatus: 'rejected' as AuthorizationStatus,
          // 隐藏患者信息
          patientName: undefined,
          patientIdCard: undefined,
          patientPhone: undefined,
          patientGender: undefined,
          patientAge: undefined,
          isPatientIdentityRevealed: false
        }
      }

      return file
    })

    // 应用筛选条件
    if (params?.dataType) {
      files = files.filter(file => file.category === params.dataType)
    }

    if (params?.authStatus) {
      files = files.filter(file => file.authStatus === params.authStatus)
    }

    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      files = files.filter(file => 
        file.title.toLowerCase().includes(keyword) ||
        file.description.toLowerCase().includes(keyword)
      )
    }

    // 排序：按上传时间倒序
    files.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())

    // 分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const total = files.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedFiles = files.slice(start, end)

    return {
      success: true,
      message: '查询成功',
      data: {
        files: paginatedFiles,  // ✅ 修复：改为 files 以匹配前端期望
        items: paginatedFiles,  // 保留 items 以兼容
        total,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '查询失败'
    }
  }
}

// ==================== 授权请求管理 ====================

/**
 * 获取所有授权请求
 */
export function getAllAuthorizationRequests(): AuthorizationRequest[] {
  return getStorageData<AuthorizationRequest[]>(STORAGE_KEYS.AUTHORIZATION_REQUESTS, [])
}

/**
 * 保存授权请求列表
 */
export function saveAuthorizationRequests(requests: AuthorizationRequest[]): void {
  setStorageData(STORAGE_KEYS.AUTHORIZATION_REQUESTS, requests)
}

/**
 * 医生发起授权请求
 */
export function requestAuthorization(dataId: string, reason: string): ApiResponse {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'doctor') {
      return {
        success: false,
        message: '只有医生可以发起授权请求'
      }
    }

    const files = getAllMedicalFiles()
    const file = files.find(f => f.id === dataId)

    if (!file) {
      return {
        success: false,
        message: '医疗数据不存在'
      }
    }

    const requests = getAllAuthorizationRequests()

    // 检查是否已经存在待审批的授权请求
    const existingRequest = requests.find(
      req => req.dataId === dataId && 
             req.doctorId === currentUser.id && 
             req.status === 'pending'
    )

    if (existingRequest) {
      return {
        success: false,
        message: '已存在待审批的授权请求，请等待患者处理'
      }
    }

    // 创建新的授权请求
    const newRequest: AuthorizationRequest = {
      id: generateId('auth_req'),
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
      requestedAt: formatDateTime(),
      isIdentityRevealed: false
    }

    requests.push(newRequest)
    saveAuthorizationRequests(requests)

    // 更新文件的授权状态
    const fileIndex = files.findIndex(f => f.id === dataId)
    if (fileIndex !== -1) {
      files[fileIndex].authStatus = 'pending'
      files[fileIndex].authorizationCount = (files[fileIndex].authorizationCount || 0) + 1
      saveMedicalFiles(files)
    }

    console.log('✅ 授权请求发起成功:', newRequest)

    return {
      success: true,
      message: '授权请求已发送，等待患者审批'
    }
  } catch (error: any) {
    console.error('❌ 发起授权请求失败:', error)
    return {
      success: false,
      message: error.message || '发起授权请求失败'
    }
  }
}

/**
 * 患者获取授权请求列表
 */
export function getPatientAuthorizationRequests(params?: {
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  pageSize?: number
}): ApiResponse<PaginatedData<AuthorizationRequest>> {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'patient') {
      return {
        success: false,
        message: '只有患者可以查看授权请求'
      }
    }

    const files = getAllMedicalFiles()
    let requests = getAllAuthorizationRequests()

    // 筛选当前患者的授权请求
    const patientFileIds = files
      .filter(f => f.patientId === currentUser.id)
      .map(f => f.id)
    
    requests = requests.filter(req => patientFileIds.includes(req.dataId))

    // 按状态筛选
    if (params?.status) {
      requests = requests.filter(req => req.status === params.status)
    }

    // 排序：待审批的优先，然后按请求时间倒序
    requests.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    })

    // 分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const total = requests.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRequests = requests.slice(start, end)

    return {
      success: true,
      message: '查询成功',
      data: {
        items: paginatedRequests,
        total,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '查询失败'
    }
  }
}

/**
 * 患者同意授权请求
 */
export function approveAuthorizationRequest(approveData: ApproveAuthorizationData): ApiResponse {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'patient') {
      return {
        success: false,
        message: '只有患者可以审批授权请求'
      }
    }

    const requests = getAllAuthorizationRequests()
    const requestIndex = requests.findIndex(req => req.id === approveData.requestId)

    if (requestIndex === -1) {
      return {
        success: false,
        message: '授权请求不存在'
      }
    }

    const request = requests[requestIndex]

    if (request.status !== 'pending') {
      return {
        success: false,
        message: '该授权请求已被处理'
      }
    }

    // 更新授权请求状态
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + approveData.expiresIn)

    requests[requestIndex] = {
      ...request,
      status: 'approved',
      processedAt: formatDateTime(),
      expiresAt: expiresAt.toISOString(),
      notes: approveData.notes
    }

    saveAuthorizationRequests(requests)

    // 更新文件的授权状态
    const files = getAllMedicalFiles()
    const fileIndex = files.findIndex(f => f.id === request.dataId)
    
    if (fileIndex !== -1) {
      files[fileIndex].authStatus = 'approved'
      saveMedicalFiles(files)
    }

    console.log('✅ 授权请求已同意:', requests[requestIndex])

    return {
      success: true,
      message: '授权成功'
    }
  } catch (error: any) {
    console.error('❌ 同意授权失败:', error)
    return {
      success: false,
      message: error.message || '同意授权失败'
    }
  }
}

/**
 * 患者拒绝授权请求
 */
export function rejectAuthorizationRequest(rejectData: RejectAuthorizationData): ApiResponse {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'patient') {
      return {
        success: false,
        message: '只有患者可以审批授权请求'
      }
    }

    const requests = getAllAuthorizationRequests()
    const requestIndex = requests.findIndex(req => req.id === rejectData.requestId)

    if (requestIndex === -1) {
      return {
        success: false,
        message: '授权请求不存在'
      }
    }

    const request = requests[requestIndex]

    if (request.status !== 'pending') {
      return {
        success: false,
        message: '该授权请求已被处理'
      }
    }

    // 更新授权请求状态
    requests[requestIndex] = {
      ...request,
      status: 'rejected',
      processedAt: formatDateTime(),
      rejectReason: rejectData.reason
    }

    saveAuthorizationRequests(requests)

    // 更新文件的授权状态
    const files = getAllMedicalFiles()
    const fileIndex = files.findIndex(f => f.id === request.dataId)
    
    if (fileIndex !== -1) {
      files[fileIndex].authStatus = 'rejected'
      saveMedicalFiles(files)
    }

    console.log('✅ 授权请求已拒绝:', requests[requestIndex])

    return {
      success: true,
      message: '已拒绝授权申请'
    }
  } catch (error: any) {
    console.error('❌ 拒绝授权失败:', error)
    return {
      success: false,
      message: error.message || '拒绝授权失败'
    }
  }
}

// ==================== 访问记录管理 ====================

/**
 * 获取所有访问记录
 */
export function getAllAccessRecords(): AccessRecord[] {
  return getStorageData<AccessRecord[]>(STORAGE_KEYS.ACCESS_RECORDS, [])
}

/**
 * 保存访问记录列表
 */
export function saveAccessRecords(records: AccessRecord[]): void {
  setStorageData(STORAGE_KEYS.ACCESS_RECORDS, records)
}

/**
 * 医生查看医疗数据（记录访问）
 */
export function viewMedicalData(dataId: string): ApiResponse<MedicalFile> {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'doctor') {
      return {
        success: false,
        message: '只有医生可以查看医疗数据'
      }
    }

    const files = getAllMedicalFiles()
    const fileIndex = files.findIndex(f => f.id === dataId)

    if (fileIndex === -1) {
      return {
        success: false,
        message: '医疗数据不存在'
      }
    }

    const file = files[fileIndex]

    // 检查授权状态
    const requests = getAllAuthorizationRequests()
    const authRequest = requests.find(
      req => req.dataId === dataId && 
             req.doctorId === currentUser.id && 
             req.status === 'approved'
    )

    if (!authRequest) {
      return {
        success: false,
        message: '您没有查看此数据的权限，请先申请授权'
      }
    }

    // 检查授权是否过期
    if (authRequest.expiresAt && new Date(authRequest.expiresAt) < new Date()) {
      return {
        success: false,
        message: '授权已过期，请重新申请'
      }
    }

    // 记录访问
    const accessRecords = getAllAccessRecords()
    const newRecord: AccessRecord = {
      id: generateId('access'),
      fileId: dataId,
      doctorId: currentUser.id,
      patientId: file.patientId,
      accessType: 'view',
      accessTime: formatDateTime(),
      ipAddress: '127.0.0.1', // 模拟IP
      userAgent: navigator.userAgent,
      duration: Math.floor(Math.random() * 300) + 30, // 模拟访问时长30-330秒
      doctor: {
        id: currentUser.id,
        name: currentUser.name,
        hospital: currentUser.hospital || '未知医院',
        department: currentUser.department || '未知科室'
      },
      file: {
        id: file.id,
        title: file.title,
        fileName: file.fileName,
        fileType: file.fileType,
        category: file.category
      }
    }

    accessRecords.push(newRecord)
    saveAccessRecords(accessRecords)

    // 更新文件查看次数
    files[fileIndex].viewCount = (files[fileIndex].viewCount || 0) + 1
    saveMedicalFiles(files)

    console.log('✅ 访问记录已保存:', newRecord)

    return {
      success: true,
      message: '查看成功',
      data: file
    }
  } catch (error: any) {
    console.error('❌ 查看数据失败:', error)
    return {
      success: false,
      message: error.message || '查看数据失败'
    }
  }
}

/**
 * 获取访问记录列表
 */
export function getAccessRecordsList(params?: {
  patientId?: string
  doctorId?: string
  fileId?: string
  page?: number
  pageSize?: number
}): ApiResponse<PaginatedData<AccessRecord>> {
  try {
    const currentUser = getCurrentUser()
    let records = getAllAccessRecords()

    // 根据用户角色筛选
    if (currentUser.role === 'patient') {
      // 患者只能看到自己数据的访问记录
      records = records.filter(record => record.patientId === currentUser.id)
    } else if (currentUser.role === 'doctor') {
      // 医生只能看到自己的访问记录
      records = records.filter(record => record.doctorId === currentUser.id)
    }

    // 应用其他筛选条件
    if (params?.fileId) {
      records = records.filter(record => record.fileId === params.fileId)
    }

    // 排序：按访问时间倒序
    records.sort((a, b) => new Date(b.accessTime).getTime() - new Date(a.accessTime).getTime())

    // 分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const total = records.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRecords = records.slice(start, end)

    return {
      success: true,
      message: '查询成功',
      data: {
        items: paginatedRecords,
        total,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '查询失败'
    }
  }
}

// ==================== 身份溯源 ====================

/**
 * 患者端医生身份溯源
 */
export function revealDoctorIdentity(requestId: string): ApiResponse {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'patient') {
      return {
        success: false,
        message: '只有患者可以进行医生身份溯源'
      }
    }

    const requests = getAllAuthorizationRequests()
    const requestIndex = requests.findIndex(req => req.id === requestId)

    if (requestIndex === -1) {
      return {
        success: false,
        message: '授权请求不存在'
      }
    }

    // 标记为已显示真实身份
    requests[requestIndex].isIdentityRevealed = true
    saveAuthorizationRequests(requests)

    // 获取该医生对此数据的访问记录
    const accessRecords = getAllAccessRecords()
    const doctorAccessRecords = accessRecords.filter(
      record => record.doctorId === requests[requestIndex].doctorId &&
                record.fileId === requests[requestIndex].dataId
    )

    console.log('✅ 医生身份溯源成功:', {
      requestId,
      doctorName: requests[requestIndex].doctorName,
      accessCount: doctorAccessRecords.length
    })

    return {
      success: true,
      message: '身份溯源成功',
      data: {
        doctor: {
          id: requests[requestIndex].doctorId,
          name: requests[requestIndex].doctorName,
          hospital: requests[requestIndex].doctorHospital,
          department: requests[requestIndex].doctorDepartment,
          idCard: requests[requestIndex].doctorIdCard
        },
        accessRecords: doctorAccessRecords,
        totalAccess: doctorAccessRecords.length,
        lastAccessTime: doctorAccessRecords[0]?.accessTime
      }
    }
  } catch (error: any) {
    console.error('❌ 医生身份溯源失败:', error)
    return {
      success: false,
      message: error.message || '身份溯源失败'
    }
  }
}

/**
 * 医生端患者身份溯源
 */
export function revealPatientIdentity(dataId: string): ApiResponse {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser.role !== 'doctor') {
      return {
        success: false,
        message: '只有医生可以进行患者身份溯源'
      }
    }

    const files = getAllMedicalFiles()
    const file = files.find(f => f.id === dataId)

    if (!file) {
      return {
        success: false,
        message: '医疗数据不存在'
      }
    }

    // 检查授权状态
    const requests = getAllAuthorizationRequests()
    const authRequest = requests.find(
      req => req.dataId === dataId && 
             req.doctorId === currentUser.id && 
             req.status === 'approved'
    )

    if (!authRequest) {
      return {
        success: false,
        message: '您没有查看此数据的权限，请先申请授权'
      }
    }

    // 检查授权是否过期
    if (authRequest.expiresAt && new Date(authRequest.expiresAt) < new Date()) {
      return {
        success: false,
        message: '授权已过期，请重新申请'
      }
    }

    // 记录溯源操作
    const accessRecords = getAllAccessRecords()
    const traceRecord: AccessRecord = {
      id: generateId('trace'),
      fileId: dataId,
      doctorId: currentUser.id,
      patientId: file.patientId,
      accessType: 'preview',
      accessTime: formatDateTime(),
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent,
      duration: 0,
      doctor: {
        id: currentUser.id,
        name: currentUser.name,
        hospital: currentUser.hospital || '未知医院',
        department: currentUser.department || '未知科室'
      },
      file: {
        id: file.id,
        title: file.title,
        fileName: file.fileName,
        fileType: file.fileType,
        category: file.category
      }
    }

    accessRecords.push(traceRecord)
    saveAccessRecords(accessRecords)

    console.log('✅ 患者身份溯源成功:', {
      dataId,
      patientName: file.patientName
    })

    return {
      success: true,
      message: '患者身份溯源成功',
      data: {
        patient: {
          id: file.patientId,
          name: file.patientName,
          gender: file.patientGender,
          age: file.patientAge,
          phone: file.patientPhone,
          idCard: file.patientIdCard
        },
        dataInfo: {
          id: file.id,
          name: file.title,
          type: file.category,
          uploadDate: file.uploadTime
        },
        traceTime: formatDateTime()
      }
    }
  } catch (error: any) {
    console.error('❌ 患者身份溯源失败:', error)
    return {
      success: false,
      message: error.message || '身份溯源失败'
    }
  }
}

// ==================== 辅助函数 ====================

/**
 * 从身份证号计算年龄
 */
function calculateAge(idCard: string): number | null {
  if (!idCard || idCard.length !== 18) return null
  
  const birthYear = parseInt(idCard.substring(6, 10))
  const birthMonth = parseInt(idCard.substring(10, 12))
  const birthDay = parseInt(idCard.substring(12, 14))
  
  const today = new Date()
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * 初始化模拟数据（可选）
 */
export function initMockData(): void {
  console.log('📦 初始化模拟数据...')
  
  // 检查是否已有数据
  const existingFiles = getAllMedicalFiles()
  if (existingFiles.length > 0) {
    console.log('✅ 已存在模拟数据，跳过初始化')
    return
  }

  console.log('✅ 模拟数据初始化完成')
}

// 导出所有功能
export const mockBackend = {
  // 医疗文件
  getAllMedicalFiles,
  saveMedicalFiles,
  uploadMedicalFile,
  deleteMedicalFile,
  getPatientMedicalFiles,
  getDoctorMedicalDataList,
  
  // 授权请求
  getAllAuthorizationRequests,
  saveAuthorizationRequests,
  requestAuthorization,
  getPatientAuthorizationRequests,
  approveAuthorizationRequest,
  rejectAuthorizationRequest,
  
  // 访问记录
  getAllAccessRecords,
  saveAccessRecords,
  viewMedicalData,
  getAccessRecordsList,
  
  // 身份溯源
  revealDoctorIdentity,
  revealPatientIdentity,
  
  // 多用户管理
  switchUser,
  getAllUsers,
  
  // 工具
  initMockData,
  resetAllData: () => {
    try {
      console.log('🔄 开始重置所有数据...')
      
      // 清除所有localStorage数据
      localStorage.clear()
      console.log('🗑️ localStorage已清除')
      
      // 强制重新初始化用户数据库
      const db = initializeUserDatabase()
      console.log('🚀 数据库重新初始化完成')
      
      // 验证初始化结果
      console.log('📋 验证用户数据:')
      console.log('患者用户:', db.patients.map(p => `${p.id}: ${p.name}`))
      console.log('医生用户:', db.doctors.map(d => `${d.id}: ${d.name}`))
      
      // 确保数据已正确保存
      const savedDb = getUserDatabase()
      if (savedDb.patients.length !== 4 || savedDb.doctors.length !== 4) {
        throw new Error(`数据保存异常: 患者${savedDb.patients.length}个, 医生${savedDb.doctors.length}个`)
      }
      
      console.log('✅ 所有数据重置并验证成功')
      return { success: true, message: '数据重置成功' }
      
    } catch (error: any) {
      console.error('❌ 数据重置失败:', error)
      return { success: false, message: error.message || '数据重置失败' }
    }
  }
}

export default mockBackend

