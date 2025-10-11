/**
 * 医生端模拟数据
 */

export const mockDoctorData = {
  // 授权患者列表
  authorizedPatients: [
    {
      id: 'patient-1',
      name: '李阿姨',
      age: 65,
      gender: '女',
      phone: '138****1234',
      authorizationDate: '2024-01-10',
      expiryDate: '2024-07-10',
      status: 'active',
      dataCount: 8,
      lastAccess: '2024-01-20 14:20:00',
      diagnosis: '高血压、糖尿病'
    },
    {
      id: 'patient-2',
      name: '王大爷',
      age: 72,
      gender: '男',
      phone: '139****5678',
      authorizationDate: '2024-01-05',
      expiryDate: '2024-04-05',
      status: 'active',
      dataCount: 12,
      lastAccess: '2024-01-19 09:15:00',
      diagnosis: '冠心病'
    },
    {
      id: 'patient-3',
      name: '张女士',
      age: 45,
      gender: '女',
      phone: '137****9012',
      authorizationDate: '2023-12-20',
      expiryDate: '2024-06-20',
      status: 'active',
      dataCount: 5,
      lastAccess: '2024-01-18 16:30:00',
      diagnosis: '肺炎'
    },
    {
      id: 'patient-4',
      name: '刘先生',
      age: 58,
      gender: '男',
      phone: '136****3456',
      authorizationDate: '2024-01-15',
      expiryDate: '2024-02-15',
      status: 'expiring',
      dataCount: 6,
      lastAccess: '2024-01-17 10:45:00',
      diagnosis: '心律不齐'
    },
    {
      id: 'patient-5',
      name: '陈阿姨',
      age: 68,
      gender: '女',
      phone: '135****7890',
      authorizationDate: '2023-12-01',
      expiryDate: '2024-01-01',
      status: 'expired',
      dataCount: 10,
      lastAccess: '2023-12-28 15:20:00',
      diagnosis: '糖尿病并发症'
    }
  ],

  // 可访问的患者数据
  patientData: [
    {
      id: 'file-1',
      patientId: 'patient-1',
      patientName: '李阿姨',
      fileName: '血常规检查报告',
      fileType: '检验报告',
      category: 'lab-report',
      uploadDate: '2024-01-15',
      size: '2.5 MB',
      canView: true,
      canDownload: true,
      lastViewed: '2024-01-20 14:20:00'
    },
    {
      id: 'file-2',
      patientId: 'patient-1',
      patientName: '李阿姨',
      fileName: '心电图检查',
      fileType: '检验报告',
      category: 'lab-report',
      uploadDate: '2024-01-12',
      size: '1.8 MB',
      canView: true,
      canDownload: false,
      lastViewed: '2024-01-18 09:15:00'
    },
    {
      id: 'file-3',
      patientId: 'patient-2',
      patientName: '王大爷',
      fileName: '冠脉造影',
      fileType: '影像资料',
      category: 'imaging',
      uploadDate: '2024-01-10',
      size: '12.5 MB',
      canView: true,
      canDownload: true,
      lastViewed: '2024-01-19 09:15:00'
    },
    {
      id: 'file-4',
      patientId: 'patient-3',
      patientName: '张女士',
      fileName: '胸部X光片',
      fileType: '影像资料',
      category: 'imaging',
      uploadDate: '2024-01-10',
      size: '5.2 MB',
      canView: true,
      canDownload: true,
      lastViewed: '2024-01-18 16:30:00'
    }
  ],

  // 访问历史记录
  accessHistory: [
    {
      id: 'history-1',
      patientId: 'patient-1',
      patientName: '李阿姨',
      fileId: 'file-1',
      fileName: '血常规检查报告',
      fileCategory: '检验报告',
      accessedAt: '2024-01-20 14:20:00',
      action: '查看',
      duration: '5分钟'
    },
    {
      id: 'history-2',
      patientId: 'patient-2',
      patientName: '王大爷',
      fileId: 'file-3',
      fileName: '冠脉造影',
      fileCategory: '影像资料',
      accessedAt: '2024-01-19 09:15:00',
      action: '查看并下载',
      duration: '15分钟'
    },
    {
      id: 'history-3',
      patientId: 'patient-3',
      patientName: '张女士',
      fileId: 'file-4',
      fileName: '胸部X光片',
      fileCategory: '影像资料',
      accessedAt: '2024-01-18 16:30:00',
      action: '查看',
      duration: '8分钟'
    },
    {
      id: 'history-4',
      patientId: 'patient-1',
      patientName: '李阿姨',
      fileId: 'file-2',
      fileName: '心电图检查',
      fileCategory: '检验报告',
      accessedAt: '2024-01-18 09:15:00',
      action: '查看',
      duration: '3分钟'
    },
    {
      id: 'history-5',
      patientId: 'patient-4',
      patientName: '刘先生',
      fileId: 'file-5',
      fileName: '心电图检查',
      fileCategory: '检验报告',
      accessedAt: '2024-01-17 10:45:00',
      action: '查看',
      duration: '6分钟'
    }
  ],

  // 统计数据
  statistics: {
    totalPatients: 5,
    activeAuthorizations: 3,
    expiringAuthorizations: 1,
    todayAccess: 8,
    activeShares: 15,
    monthlyAccess: 45
  },

  // 可访问的医疗数据列表（新的数据管理模块）
  accessibleMedicalData: [
    {
      id: 'data-1',
      dataName: '血常规检查报告',
      dataType: '检验报告',
      patientId: 'P001',
      patientName: '李阿姨',
      uploadDate: '2024-01-15',
      fileSize: '2.5 MB',
      authStatus: 'authorized',
      description: '血常规检查结果：白细胞计数正常，红细胞计数正常，血小板计数正常'
    },
    {
      id: 'data-2',
      dataName: '胸部X光片',
      dataType: '影像资料',
      patientId: 'P001',
      patientName: '李阿姨',
      uploadDate: '2024-01-14',
      fileSize: '5.8 MB',
      authStatus: 'pending',
      description: '胸部X光检查：肺部纹理清晰，未见明显异常'
    },
    {
      id: 'data-3',
      dataName: '心电图检查',
      dataType: '检验报告',
      patientId: 'P002',
      patientName: '王大爷',
      uploadDate: '2024-01-13',
      fileSize: '1.2 MB',
      authStatus: 'authorized',
      description: '心电图检查：窦性心律，心率75次/分，ST段正常'
    },
    {
      id: 'data-4',
      dataName: '门诊病历',
      dataType: '病历记录',
      patientId: 'P002',
      patientName: '王大爷',
      uploadDate: '2024-01-12',
      fileSize: '0.8 MB',
      authStatus: 'not-requested',
      description: '主诉：胸闷气短1周，伴有心悸'
    },
    {
      id: 'data-5',
      dataName: '年度体检报告',
      dataType: '体检报告',
      patientId: 'P003',
      patientName: '张女士',
      uploadDate: '2024-01-10',
      fileSize: '3.5 MB',
      authStatus: 'authorized',
      description: '体检结果：身高165cm，体重60kg，BMI正常，血压120/80mmHg'
    },
    {
      id: 'data-6',
      dataName: '肝功能检查',
      dataType: '检验报告',
      patientId: 'P003',
      patientName: '张女士',
      uploadDate: '2024-01-09',
      fileSize: '2.1 MB',
      authStatus: 'rejected',
      description: '肝功能指标均在正常范围内'
    },
    {
      id: 'data-7',
      dataName: '用药记录',
      dataType: '用药记录',
      patientId: 'P001',
      patientName: '李阿姨',
      uploadDate: '2024-01-08',
      fileSize: '1.5 MB',
      authStatus: 'not-requested',
      description: '降压药：硝苯地平缓释片 30mg qd，氢氯噻嗪 12.5mg qd'
    },
    {
      id: 'data-8',
      dataName: 'CT影像报告',
      dataType: '影像资料',
      patientId: 'P004',
      patientName: '刘先生',
      uploadDate: '2024-01-07',
      fileSize: '15.2 MB',
      authStatus: 'pending',
      description: 'CT扫描显示：未见明显占位性病变'
    }
  ]
}

