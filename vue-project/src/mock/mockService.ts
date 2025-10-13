/**
 * 模拟数据服务
 * 根据配置决定是否使用模拟数据
 * 注意：模拟数据仅对演示账户生效
 */

import { MOCK_CONFIG, mockDelay, mockLog } from '@/config/mock.config'
import { mockPatientData } from './data/patients'
import { mockDoctorData } from './data/doctors'

/**
 * 通用的模拟 API 响应格式
 */
const createMockResponse = <T>(data: T, message = '操作成功') => {
  return {
    success: true,
    code: 200,
    data,
    message
  }
}

/**
 * 检查当前用户是否为演示账户
 * @returns 如果是演示账户返回 true，否则返回 false
 */
const isDemoAccount = (): boolean => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return false
    
    // 演示账户的 token 格式为 'demo_token_<role>_<timestamp>'
    return token.startsWith('demo_token_')
  } catch (error) {
    return false
  }
}

/**
 * 模拟数据服务类
 */
class MockService {
  /**
   * 患者端 - 获取医疗数据列表
   */
  async getPatientFiles(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取患者医疗数据列表', params)
    await mockDelay()
    
    return createMockResponse({
      files: mockPatientData.medicalFiles,
      total: mockPatientData.medicalFiles.length
    })
  }

  /**
   * 患者端 - 获取分享记录
   */
  async getPatientShareRecords(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取患者分享记录', params)
    await mockDelay()
    
    return createMockResponse({
      shares: mockPatientData.shareRecords,
      total: mockPatientData.shareRecords.length
    })
  }

  /**
   * 患者端 - 获取访问记录
   */
  async getPatientAccessRecords(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取患者访问记录', params)
    await mockDelay()
    
    return createMockResponse({
      records: mockPatientData.accessRecords,
      total: mockPatientData.accessRecords.length
    })
  }

  /**
   * 医生端 - 获取授权患者列表
   */
  async getDoctorPatients(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取医生授权患者列表', params)
    await mockDelay()
    
    // 将模拟数据转换为 API 期望的格式
    const patients = mockDoctorData.authorizedPatients.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      idCard: `310101${1960 + p.age}01234567`, // 根据年龄生成假身份证
      authorizedDataTypes: ['检验报告', '影像资料', '病历记录', '体检报告', '用药记录'],
      authStatus: p.status,
      authExpireDate: p.expiryDate,
      lastAccessTime: p.lastAccess,
      dataCount: p.dataCount,
      recentAccess: [
        {
          dataType: '检验报告',
          accessTime: p.lastAccess,
          duration: '5分钟',
          operation: '查看'
        }
      ]
    }))
    
    // 应用分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return createMockResponse({
      items: patients.slice(start, end),
      total: patients.length,
      page,
      pageSize
    })
  }

  /**
   * 医生端 - 获取患者文件列表
   */
  async getDoctorPatientFiles(patientId: string, params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取患者文件列表', { patientId, params })
    await mockDelay()
    
    // 筛选该患者的数据
    const patientFiles = mockDoctorData.patientData.filter(
      file => file.patientId === patientId
    )
    
    return createMockResponse({
      items: patientFiles,
      total: patientFiles.length
    })
  }

  /**
   * 医生端 - 获取访问历史
   */
  async getDoctorAccessHistory(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取医生访问历史', params)
    await mockDelay()
    
    return createMockResponse({
      items: mockDoctorData.accessHistory,
      total: mockDoctorData.accessHistory.length
    })
  }

  /**
   * 分享管理 - 获取我的分享
   */
  async getMyShares(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取我的分享', params)
    await mockDelay()
    
    return createMockResponse({
      shares: mockPatientData.shareRecords,
      total: mockPatientData.shareRecords.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    })
  }

  /**
   * 创建分享
   */
  async createShare(data: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('创建分享', data)
    await mockDelay()
    
    const newShare = {
      id: `share-${Date.now()}`,
      ...data,
      shareTime: new Date().toISOString(),
      status: 'active',
      accessCount: 0
    }
    
    return createMockResponse(newShare, '分享创建成功')
  }

  /**
   * 撤销分享
   */
  async revokeShare(shareId: string) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('撤销分享', { shareId })
    await mockDelay()
    
    return createMockResponse(null, '分享已撤销')
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File, metadata: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('上传文件', { fileName: file.name, ...metadata })
    await mockDelay(1000) // 上传需要更长时间
    
    const newFile = {
      id: `file-${Date.now()}`,
      name: metadata.name || file.name,
      type: metadata.type,
      category: metadata.category,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      description: metadata.description || '',
      status: 'normal',
      sharedCount: 0
    }
    
    return createMockResponse(newFile, '文件上传成功')
  }

  /**
   * 医生端 - 获取可访问的医疗数据列表
   */
  async getDoctorAccessibleData(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取医生可访问的医疗数据列表', params)
    await mockDelay()
    
    let data = [...mockDoctorData.accessibleMedicalData]
    
    // 按数据类型筛选
    if (params?.dataType) {
      data = data.filter(item => item.dataType === params.dataType)
    }
    
    // 按授权状态筛选
    if (params?.authStatus) {
      data = data.filter(item => item.authStatus === params.authStatus)
    }
    
    // 按关键词搜索
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      data = data.filter(item => 
        item.dataName.toLowerCase().includes(keyword) ||
        item.patientName.toLowerCase().includes(keyword)
      )
    }
    
    return createMockResponse({
      data: data,
      total: data.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20
    })
  }

  /**
   * 患者端 - 获取授权请求列表
   */
  async getPatientAuthorizationRequests(params?: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('获取患者授权请求列表', params)
    await mockDelay()
    
    let requests = [...mockPatientData.authorizationRequests]
    
    // 按状态筛选
    if (params?.status) {
      requests = requests.filter(req => req.status === params.status)
    }
    
    return createMockResponse({
      requests: requests,
      total: requests.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20
    })
  }

  /**
   * 患者端 - 同意授权
   */
  async approveAuthorization(requestId: string, approveData: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('同意授权', { requestId, approveData })
    await mockDelay()
    
    return createMockResponse(null, '授权已同意')
  }

  /**
   * 患者端 - 拒绝授权
   */
  async rejectAuthorization(requestId: string, rejectData: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('拒绝授权', { requestId, rejectData })
    await mockDelay()
    
    return createMockResponse(null, '授权已拒绝')
  }

  /**
   * 医生端 - 发起授权申请
   */
  async requestDataAuthorization(requestData: any) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('发起授权申请', requestData)
    await mockDelay()
    
    const newRequest = {
      id: `auth-req-${Date.now()}`,
      ...requestData,
      status: 'pending',
      requestedAt: new Date().toLocaleString('zh-CN')
    }
    
    return createMockResponse(newRequest, '授权申请已提交')
  }

  /**
   * 患者端 - 身份溯源
   */
  async traceIdentity(requestId: string) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('身份溯源', { requestId })
    await mockDelay()
    
    // 查找对应的授权请求
    const request = mockPatientData.authorizationRequests.find(
      req => req.id === requestId
    )
    
    if (!request) {
      return {
        success: false,
        message: '授权请求不存在',
        code: 404
      }
    }
    
    // 模拟医生详细信息
    const doctorDetails: { [key: string]: any } = {
      'D001': {
        id: 'D001',
        name: '张医生',
        hospital: '北京协和医院',
        department: '心血管科',
        title: '主任医师',
        isVerified: true
      },
      'D002': {
        id: 'D002',
        name: '李医生',
        hospital: '北京协和医院',
        department: '呼吸内科',
        title: '副主任医师',
        isVerified: true
      },
      'D003': {
        id: 'D003',
        name: '王医生',
        hospital: '北京协和医院',
        department: '内分泌科',
        title: '主治医师',
        isVerified: true
      },
      'D004': {
        id: 'D004',
        name: '赵医生',
        hospital: '北京协和医院',
        department: '骨科',
        title: '主任医师',
        isVerified: true
      }
    }
    
    // 获取医生信息
    const doctor = doctorDetails[request.doctorId] || {
      id: request.doctorId,
      name: request.doctorName,
      hospital: '北京协和医院',
      department: request.doctorDepartment,
      title: '主治医师',
      isVerified: true
    }
    
    // 筛选该医生对该数据的访问记录
    const accessRecords = mockPatientData.accessRecords
      .filter(record => 
        record.doctorName === request.doctorName && 
        record.dataName === request.dataName
      )
      .map(record => ({
        id: record.id,
        fileId: record.fileId,
        doctorId: request.doctorId,
        patientId: 'P001',
        accessType: record.operations.includes('下载') ? 'download' : 
                    record.operations.includes('打印') ? 'preview' : 'view',
        accessTime: record.accessTime,
        ipAddress: record.ipAddress,
        duration: parseInt(record.duration) || 0,
        doctor: {
          id: request.doctorId,
          name: request.doctorName,
          hospital: doctor.hospital,
          department: request.doctorDepartment
        },
        file: {
          id: record.fileId,
          title: record.fileName,
          fileName: record.fileName,
          fileType: 'pdf',
          category: 'report'
        }
      }))
    
    // 如果没有访问记录，生成一些模拟记录
    if (accessRecords.length === 0 && request.status === 'approved') {
      accessRecords.push({
        id: `access-mock-${Date.now()}`,
        fileId: request.dataId,
        doctorId: request.doctorId,
        patientId: 'P001',
        accessType: 'view',
        accessTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN'),
        ipAddress: '192.168.1.100',
        duration: 120,
        doctor: {
          id: request.doctorId,
          name: request.doctorName,
          hospital: doctor.hospital,
          department: request.doctorDepartment
        },
        file: {
          id: request.dataId,
          title: request.dataName,
          fileName: request.dataName,
          fileType: 'pdf',
          category: 'report'
        }
      })
    }
    
    return createMockResponse(
      {
        doctor,
        accessRecords,
        totalAccess: accessRecords.length,
        lastAccessTime: accessRecords.length > 0 
          ? accessRecords[0].accessTime 
          : null
      },
      '身份溯源成功'
    )
  }

  /**
   * 医生端 - 患者身份溯源
   */
  async traceDoctorPatientIdentity(dataId: string) {
    // 只有演示账户才返回模拟数据
    if (!MOCK_CONFIG.USE_MOCK_DATA || !isDemoAccount()) return null
    
    mockLog('医生端患者身份溯源', { dataId })
    await mockDelay()
    
    // 查找对应的医疗数据
    const medicalData = mockDoctorData.accessibleMedicalData.find(
      data => data.id === dataId
    )
    
    if (!medicalData) {
      return {
        success: false,
        message: '数据不存在',
        code: 404
      }
    }
    
    // 检查授权状态
    if (medicalData.authStatus !== 'authorized') {
      return {
        success: false,
        message: '无权溯源，请先获得患者授权',
        code: 403
      }
    }
    
    // 患者信息映射（脱敏处理）
    const patientInfoMap: { [key: string]: any } = {
      'P001': {
        id: 'P001',
        name: '李阿姨',
        gender: '女',
        age: 65,
        phone: '138****1234',
        idCard: '320***********5678',
        registeredDepartment: '心血管科'
      },
      'P002': {
        id: 'P002',
        name: '王大爷',
        gender: '男',
        age: 72,
        phone: '139****5678',
        idCard: '320***********9012',
        registeredDepartment: '心血管科'
      },
      'P003': {
        id: 'P003',
        name: '张女士',
        gender: '女',
        age: 45,
        phone: '137****9012',
        idCard: '320***********3456',
        registeredDepartment: '呼吸内科'
      },
      'P004': {
        id: 'P004',
        name: '刘先生',
        gender: '男',
        age: 58,
        phone: '136****3456',
        idCard: '320***********7890',
        registeredDepartment: '心血管科'
      }
    }
    
    // 获取患者信息
    const patient = patientInfoMap[medicalData.patientId] || {
      id: medicalData.patientId,
      name: medicalData.patientName,
      gender: '未知',
      age: 0,
      phone: '***********',
      idCard: '***********',
      registeredDepartment: '未知'
    }
    
    return createMockResponse(
      {
        patient,
        dataInfo: {
          id: medicalData.id,
          name: medicalData.dataName,
          type: medicalData.dataType,
          uploadDate: medicalData.uploadDate
        },
        traceTime: new Date().toLocaleString('zh-CN')
      },
      '患者身份溯源成功'
    )
  }
}

// 导出单例
export const mockService = new MockService()

