<template>
  <div>
    <!-- 遮罩層 -->
    <div
        v-if="modelValue"
        class="modal-backdrop"
        @click="handleBackdropClick"
    ></div>

    <!-- 對話框 -->
    <div
        class="modal"
        :class="{ 'show': modelValue }"
        tabindex="-1"
        role="dialog"
        :aria-labelledby="id + '-title'"
    >
      <div
          class="modal-dialog"
          :class="[
          size ? `modal-${size}` : '',
          centered ? 'modal-dialog-centered' : ''
        ]"
          role="document"
      >
        <div class="modal-content">
          <!-- 標題區 -->
          <div class="modal-header" v-if="!hideHeader">
            <h5 class="modal-title" :id="id + '-title'">
              <slot name="title">{{ title }}</slot>
            </h5>
            <button
                v-if="!hideClose"
                type="button"
                class="btn-close"
                aria-label="Close"
                @click="handleClose"
            ></button>
          </div>

          <!-- 內容區 -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- 按鈕區 -->
          <div class="modal-footer" v-if="!hideFooter">
            <slot name="footer">
              <button
                  v-if="!hideCancel"
                  type="button"
                  class="btn btn-secondary"
                  @click="handleCancel"
                  :disabled="loading"
              >
                {{ cancelText }}
              </button>
              <button
                  v-if="!hideConfirm"
                  type="button"
                  class="btn btn-primary"
                  @click="handleConfirm"
                  :disabled="loading"
              >
                <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-1"
                ></span>
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'BaseModal',
  props: {
    // 控制顯示隱藏
    modelValue: {
      type: Boolean,
      required: true
    },
    // 模態框標題
    title: {
      type: String,
      default: ''
    },
    // 唯一標識
    id: {
      type: String,
      default: () => `modal-${Date.now()}`
    },
    // 尺寸：sm, lg, xl
    size: {
      type: String,
      validator: value => ['sm', 'lg', 'xl'].includes(value)
    },
    // 是否垂直居中
    centered: {
      type: Boolean,
      default: true
    },
    // 確認按鈕文字
    confirmText: {
      type: String,
      default: '確認'
    },
    // 取消按鈕文字
    cancelText: {
      type: String,
      default: '取消'
    },
    // 是否隱藏頭部
    hideHeader: {
      type: Boolean,
      default: false
    },
    // 是否隱藏底部
    hideFooter: {
      type: Boolean,
      default: false
    },
    // 是否隱藏關閉按鈕
    hideClose: {
      type: Boolean,
      default: false
    },
    // 是否隱藏確認按鈕
    hideConfirm: {
      type: Boolean,
      default: false
    },
    // 是否隱藏取消按鈕
    hideCancel: {
      type: Boolean,
      default: false
    },
    // 點擊背景是否關閉
    closeOnClickBackdrop: {
      type: Boolean,
      default: true
    },
    // 按ESC是否關閉
    closeOnPressEscape: {
      type: Boolean,
      default: true
    }
  },

  emits: ['update:modelValue', 'confirm', 'cancel', 'close'],

  setup(props, { emit }) {
    const loading = ref(false)

    // 監聽ESC按鍵
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && props.closeOnPressEscape) {
        handleClose()
      }
    }

    // 監聽模態框顯示狀態
    watch(() => props.modelValue, (val) => {
      if (val) {
        document.body.classList.add('modal-open')
        document.addEventListener('keydown', handleKeydown)
      } else {
        document.body.classList.remove('modal-open')
        document.removeEventListener('keydown', handleKeydown)
      }
    })

    // 點擊背景
    const handleBackdropClick = () => {
      if (props.closeOnClickBackdrop) {
        handleClose()
      }
    }

    // 關閉模態框
    const handleClose = () => {
      if (loading.value) return
      emit('update:modelValue', false)
      emit('close')
    }

    // 取消
    const handleCancel = () => {
      if (loading.value) return
      emit('update:modelValue', false)
      emit('cancel')
    }

    // 確認
    const handleConfirm = async () => {
      if (loading.value) return
      loading.value = true
      try {
        await emit('confirm')
        emit('update:modelValue', false)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      handleBackdropClick,
      handleClose,
      handleCancel,
      handleConfirm
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  display: none;
}

.modal.show {
  display: block;
}

.modal-dialog {
  margin: 1.75rem auto;
  max-width: 500px;
}

.modal-content {
  position: relative;
  background-color: #fff;
  border-radius: 0.3rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* 尺寸變體 */
.modal-sm { max-width: 300px; }
.modal-lg { max-width: 800px; }
.modal-xl { max-width: 1140px; }

/* 垂直居中 */
.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: calc(100% - 3.5rem);
}
</style>