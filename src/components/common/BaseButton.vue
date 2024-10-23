<template>
  <button
      :class="buttonClasses"
      :type="type"
      :disabled="disabled || loading"
      @click="handleClick"
  >
    <!-- 載入中狀態 -->
    <span v-if="loading" class="spinner-wrapper">
      <span class="spinner-border spinner-border-sm" role="status"></span>
    </span>

    <!-- 圖標 -->
    <i v-if="icon && !loading" :class="['bi', `bi-${icon}`, iconClass]"></i>

    <!-- 按鈕文字 -->
    <span :class="{ 'ms-2': icon && !loading }">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BaseButton',
  props: {
    // 按鈕類型
    type: {
      type: String,
      default: 'button',
      validator: value => ['button', 'submit', 'reset'].includes(value)
    },
    // 按鈕變體
    variant: {
      type: String,
      default: 'primary',
      validator: value => [
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'light',
        'dark',
        'link',
        'outline-primary',
        'outline-secondary',
        'outline-success',
        'outline-danger',
        'outline-warning',
        'outline-info',
        'outline-light',
        'outline-dark'
      ].includes(value)
    },
    // 按鈕大小
    size: {
      type: String,
      default: '',
      validator: value => ['', 'sm', 'lg'].includes(value)
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否顯示載入狀態
    loading: {
      type: Boolean,
      default: false
    },
    // 按鈕文字
    text: {
      type: String,
      default: ''
    },
    // 圖標名稱（Bootstrap Icons）
    icon: {
      type: String,
      default: ''
    },
    // 圖標類別
    iconClass: {
      type: String,
      default: ''
    },
    // 是否為塊級按鈕
    block: {
      type: Boolean,
      default: false
    },
    // 是否為圓角按鈕
    rounded: {
      type: Boolean,
      default: false
    },
    // 自定義類別
    customClass: {
      type: [String, Array, Object],
      default: ''
    }
  },

  emits: ['click'],

  setup(props, { emit }) {
    // 計算按鈕類別
    const buttonClasses = computed(() => {
      return [
        'btn',
        `btn-${props.variant}`,
        {
          [`btn-${props.size}`]: props.size,
          'w-100': props.block,
          'rounded-pill': props.rounded,
          'position-relative': props.loading
        },
        props.customClass
      ]
    })

    // 處理點擊事件
    const handleClick = (event) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    }

    return {
      buttonClasses,
      handleClick
    }
  }
}
</script>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(1px);
}

.spinner-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

/* 禁用狀態 */
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* 載入狀態 */
.btn.position-relative {
  pointer-events: none;
}

/* 塊級按鈕 */
.w-100 {
  width: 100%;
}

/* 圖標樣式 */
.bi {
  font-size: 1.1em;
  line-height: 0;
}

/* 按鈕大小變體 */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-lg {
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
}

/* 動畫效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.btn:not(:disabled):not(.disabled):active {
  animation: pulse 0.3s ease-in-out;
}
</style>