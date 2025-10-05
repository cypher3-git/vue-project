import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { MedicalFile, UploadData, FileCategory } from '@/types/medicalData'
import { medicalDataApi } from '@/api'

export const useMedicalDataStore = defineStore('medicalData', () => {
  // 状态
  const files = ref<MedicalFile[]>([])
  const loading = ref<boolean>(false)
  const uploadProgress = ref<number>(0)
  const currentFile = ref<MedicalFile | null>(null)

  // 计算属性
  const totalFiles = computed(() => files.value.length)
  
  const filesByCategory = computed(() => {
    const categorized: Record<FileCategory, MedicalFile[]> = {
      report: [],
      image: [], 
      prescription: [],
      other: []
    }
    
    files.value.forEach(file => {
      categorized[file.category].push(file)
    })
    
    return categorized
  })

  const sharedFiles = computed(() => 
    files.value.filter(file => file.isShared)
  )

  const recentFiles = computed(() => 
    files.value
      .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
      .slice(0, 10)
  )

  // 获取文件列表
  const getFiles = async (params?: {
    category?: FileCategory
    keyword?: string
    page?: number
    pageSize?: number
  }): Promise<void> => {
    loading.value = true
    try {
      const response = await medicalDataApi.getMedicalFiles(params)
      
      if (response.success && response.data) {
        files.value = response.data.files || []
      } else {
        throw new Error(response.message || '获取文件列表失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '获取文件列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 上传文件
  const uploadFile = async (data: UploadData): Promise<MedicalFile> => {
    loading.value = true
    uploadProgress.value = 0
    
    try {
      const response = await medicalDataApi.uploadMedicalFile(data, (progress) => {
        uploadProgress.value = progress
      })

      if (response.success && response.data) {
        const newFile = response.data
        files.value.unshift(newFile)
        ElMessage.success('文件上传成功！')
        return newFile
      } else {
        throw new Error(response.message || '文件上传失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '文件上传失败')
      throw error
    } finally {
      loading.value = false
      uploadProgress.value = 0
    }
  }

  // 删除文件
  const deleteFile = async (fileId: string): Promise<void> => {
    loading.value = true
    try {
      const response = await medicalDataApi.deleteMedicalFile(fileId)
      
      if (response.success) {
        files.value = files.value.filter(file => file.id !== fileId)
        ElMessage.success('文件删除成功')
      } else {
        throw new Error(response.message || '文件删除失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '文件删除失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新文件信息
  const updateFile = async (fileId: string, updateData: {
    title?: string
    description?: string
    category?: FileCategory
  }): Promise<void> => {
    loading.value = true
    try {
      const response = await medicalDataApi.updateMedicalFile(fileId, updateData)
      
      if (response.success && response.data) {
        const index = files.value.findIndex(file => file.id === fileId)
        if (index !== -1) {
          files.value[index] = { ...files.value[index], ...response.data }
        }
        ElMessage.success('文件信息更新成功')
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '文件信息更新失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 分享文件
  const shareFile = async (fileId: string, shareData: {
    doctorId: string
    expiresAt?: string
    permissions?: string[]
  }): Promise<void> => {
    loading.value = true
    try {
      const response = await medicalDataApi.getFileShareStatus(fileId)
      
      if (response.success) {
        const index = files.value.findIndex(file => file.id === fileId)
        if (index !== -1) {
          files.value[index] = { ...files.value[index], isShared: true }
        }
        ElMessage.success('文件分享成功')
      } else {
        throw new Error(response.message || '文件分享失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '文件分享失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 取消分享
  const unshareFile = async (fileId: string, shareId: string): Promise<void> => {
    loading.value = true
    try {
      const response = await medicalDataApi.getFileShareStatus(fileId)
      
      if (response.success) {
        const index = files.value.findIndex(file => file.id === fileId)
        if (index !== -1) {
          files.value[index] = { ...files.value[index], isShared: false }
        }
        ElMessage.success('已取消文件分享')
      } else {
        throw new Error(response.message || '取消分享失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '取消分享失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取文件详情
  const getFileDetail = async (fileId: string): Promise<MedicalFile> => {
    loading.value = true
    try {
      const response = await medicalDataApi.getMedicalFileById(fileId)
      
      if (response.success && response.data) {
        currentFile.value = response.data
        return response.data
      } else {
        throw new Error(response.message || '获取文件详情失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '获取文件详情失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 下载文件
  const downloadFile = async (fileId: string, fileName: string): Promise<void> => {
    loading.value = true
    try {
      await medicalDataApi.downloadMedicalFile(fileId, fileName)
      ElMessage.success('文件下载成功')
    } catch (error: any) {
      ElMessage.error(error.message || '文件下载失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取文件预览URL
  const getPreviewUrl = (fileId: string): string => {
    return `/api/medical-data/files/${fileId}/preview`
  }

  // 清理状态
  const clearFiles = (): void => {
    files.value = []
    currentFile.value = null
  }

  return {
    // 状态
    files,
    loading,
    uploadProgress,
    currentFile,
    
    // 计算属性
    totalFiles,
    filesByCategory,
    sharedFiles,
    recentFiles,
    
    // 方法
    getFiles,
    uploadFile,
    deleteFile,
    updateFile,
    shareFile,
    unshareFile,
    getFileDetail,
    downloadFile,
    getPreviewUrl,
    clearFiles
  }
})
