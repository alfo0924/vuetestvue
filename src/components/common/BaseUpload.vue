<template>
  <div class="base-upload">
    <!-- 上傳區域 -->
    <div
        class="upload-area"
        :class="{
        'is-dragover': isDragover,
        'is-disabled': disabled
      }"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragover = true"
        @dragleave.prevent="isDragover = false"
        @click="triggerFileInput"
    >
      <!-- 隱藏的文件輸入框 -->
      <input
          ref="fileInput"
          type="file"
          class="file-input"
          :accept="accept"
          :multiple="multiple"
          :disabled="disabled"
          @change="handleFileChange"
      >

      <!-- 上傳區域內容 -->
      <div class="upload-content">
        <template v-if="!fileList.length">
          <i class="bi bi-cloud-upload display-4"></i>
          <p class="upload-text mt-2">
            {{ dragText }}
            <span class="text-primary">選擇文件</span>
            或拖拽文件到此處
          </p>
          <p class="upload-hint">
            {{ hint }}
          </p>
        </template>

        <!-- 文件列表 -->
        <div v-else class="file-list">
          <div
              v-for="(file, index) in fileList"
              :key="index"
              class="file-item"
          >
            <!-- 文件圖標 -->
            <i
                class="bi"
                :class="getFileIcon(file.name)"
            ></i>

            <!-- 文件信息 -->
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>

            <!-- 上傳進度 -->
            <div v-if="file.status === 'uploading'" class="progress">
              <div
                  class="progress-bar"
                  :style="{ width: file.percentage + '%' }"
              >
                {{ file.percentage }}%
              </div>
            </div>

            <!-- 文件狀態 -->
            <div class="file-status">
              <i
                  v-if="file.status === 'success'"
                  class="bi bi-check-circle-fill text-success"
              ></i>
              <i
                  v-else-if="file.status === 'error'"
                  class="bi bi-x-circle-fill text-danger"
                  :title="file.error"
              ></i>
              <button
                  v-if="file.status !== 'uploading'"
                  type="button"
                  class="btn btn-link btn-sm p-0 ms-2"
                  @click="removeFile(index)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按鈕 -->
    <div v-if="fileList.length" class="upload-actions mt-3">
      <button
          type="button"
          class="btn btn-primary me-2"
          :disabled="!hasNewFiles || uploading || disabled"
          @click="uploadFiles"
      >
        <span v-if="!uploading">
          <i class="bi bi-cloud-upload"></i>
          開始上傳
        </span>
        <span v-else>
          <span class="spinner-border spinner-border-sm"></span>
          上傳中...
        </span>
      </button>
      <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="uploading || disabled"
          @click="clearFiles"
      >
        <i class="bi bi-x-lg"></i>
        清空
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BaseUpload',
  props: {
    // 接受的文件類型
    accept: {
      type: String,
      default: '*'
    },
    // 是否支持多文件
    multiple: {
      type: Boolean,
      default: true
    },
    // 文件大小限制（bytes）
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    // 最大文件數量
    maxCount: {
      type: Number,
      default: 5
    },
    // 拖拽提示文字
    dragText: {
      type: String,
      default: '點擊'
    },
    // 提示文字
    hint: {
      type: String,
      default: '支持的文件格式：JPG、PNG、PDF，單個文件不超過10MB'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 自動上傳
    autoUpload: {
      type: Boolean,
      default: false
    }
  },

  emits: ['upload', 'remove', 'success', 'error'],

  setup(props, { emit }) {
    const fileInput = ref(null)
    const isDragover = ref(false)
    const fileList = ref([])
    const uploading = ref(false)

    // 是否有新文件需要上傳
    const hasNewFiles = computed(() =>
        fileList.value.some(file => !file.status || file.status === 'error')
    )

    // 觸發文件選擇
    const triggerFileInput = () => {
      if (!props.disabled) {
        fileInput.value.click()
      }
    }

    // 處理文件選擇
    const handleFileChange = (event) => {
      const files = Array.from(event.target.files)
      addFiles(files)
      event.target.value = '' // 重置input
    }

    // 處理拖拽
    const handleDrop = (event) => {
      isDragover.value = false
      const files = Array.from(event.dataTransfer.files)
      addFiles(files)
    }

    // 添加文件
    const addFiles = (files) => {
      // 檢查文件數量限制
      if (fileList.value.length + files.length > props.maxCount) {
        alert(`最多只能上傳 ${props.maxCount} 個文件`)
        return
      }

      // 處理每個文件
      files.forEach(file => {
        // 檢查文件大小
        if (file.size > props.maxSize) {
          alert(`文件 ${file.name} 超過大小限制`)
          return
        }

        // 添加到文件列表
        fileList.value.push({
          file,
          name: file.name,
          size: file.size,
          status: null,
          percentage: 0
        })
      })

      // 如果設置了自動上傳
      if (props.autoUpload && hasNewFiles.value) {
        uploadFiles()
      }
    }

    // 移除文件
    const removeFile = (index) => {
      const file = fileList.value[index]
      fileList.value.splice(index, 1)
      emit('remove', file)
    }

    // 清空文件列表
    const clearFiles = () => {
      fileList.value = []
    }

    // 上傳文件
    const uploadFiles = async () => {
      if (uploading.value) return
      uploading.value = true

      try {
        // 過濾出需要上傳的文件
        const filesToUpload = fileList.value.filter(
            file => !file.status || file.status === 'error'
        )

        // 創建上傳任務
        const uploadTasks = filesToUpload.map(async (file, index) => {
          try {
            file.status = 'uploading'
            file.percentage = 0

            // 模擬上傳進度
            const updateProgress = (progress) => {
              file.percentage = Math.round(progress)
            }

            // 發出上傳事件
            const result = await emit('upload', file.file, updateProgress)

            file.status = 'success'
            file.percentage = 100
            emit('success', file, result)
          } catch (error) {
            file.status = 'error'
            file.error = error.message
            emit('error', file, error)
          }
        })

        await Promise.all(uploadTasks)
      } finally {
        uploading.value = false
      }
    }

    // 獲取文件圖標
    const getFileIcon = (fileName) => {
      const extension = fileName.split('.').pop().toLowerCase()
      const iconMap = {
        pdf: 'bi-file-pdf',
        doc: 'bi-file-word',
        docx: 'bi-file-word',
        xls: 'bi-file-excel',
        xlsx: 'bi-file-excel',
        jpg: 'bi-file-image',
        jpeg: 'bi-file-image',
        png: 'bi-file-image',
        gif: 'bi-file-image'
      }
      return iconMap[extension] || 'bi-file-earmark'
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return {
      fileInput,
      isDragover,
      fileList,
      uploading,
      hasNewFiles,
      triggerFileInput,
      handleFileChange,
      handleDrop,
      removeFile,
      clearFiles,
      uploadFiles,
      getFileIcon,
      formatFileSize
    }
  }
}
</script>

<style scoped>
.base-upload {
  width: 100%;
}

.upload-area {
  position: relative;
  padding: 2rem;
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  background-color: #fff;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #0d6efd;
}

.upload-area.is-dragover {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.upload-area.is-disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

.upload-text {
  margin: 1rem 0;
  color: #6c757d;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6c757d;
}

.file-list {
  text-align: left;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.file-info {
  flex: 1;
  margin: 0 1rem;
}

.file-name {
  font-weight: 500;
}

.file-size {
  font-size: 0.875rem;
  color: #6c757d;
}

.progress {
  width: 100px;
  height: 0.5rem;
  margin: 0 1rem;
}

.file-status {
  display: flex;
  align-items: center;
}

/* 動畫效果 */
.file-item {
  transition: all 0.3s ease;
}

.file-item:hover {
  background-color: #e9ecef;
}

@keyframes progress {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.progress-bar {
  animation: progress 1s linear infinite;
  background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
  );
  background-size: 1rem 1rem;
}
</style>