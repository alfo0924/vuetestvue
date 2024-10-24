// 載入指令
export default {
    // 指令名稱: v-loading
    name: 'loading',

    // 創建時
    created(el, binding) {
        // 創建載入遮罩元素
        const loadingEl = document.createElement('div')
        loadingEl.className = 'v-loading'

        // 創建載入動畫元素
        const spinnerEl = document.createElement('div')
        spinnerEl.className = 'v-loading__spinner'

        // 添加載入文字
        const textEl = document.createElement('div')
        textEl.className = 'v-loading__text'
        textEl.textContent = binding.value?.text || '載入中...'

        // 組合元素
        loadingEl.appendChild(spinnerEl)
        loadingEl.appendChild(textEl)

        // 保存到元素上
        el.loadingEl = loadingEl

        // 設置元素樣式
        el.style.position = 'relative'
    },

    // 更新時
    updated(el, binding) {
        if (binding.value?.text) {
            el.loadingEl.querySelector('.v-loading__text').textContent = binding.value.text
        }
    },

    // 掛載時
    mounted(el, binding) {
        if (binding.value) {
            el.appendChild(el.loadingEl)
        }
    },

    // 更新前
    beforeUpdate(el, binding) {
        if (binding.value !== binding.oldValue) {
            if (binding.value) {
                el.appendChild(el.loadingEl)
            } else {
                el.removeChild(el.loadingEl)
            }
        }
    },

    // 卸載時
    unmounted(el) {
        if (el.loadingEl && el.loadingEl.parentNode === el) {
            el.removeChild(el.loadingEl)
        }
    }
}

// 添加相關樣式
const style = document.createElement('style')
style.textContent = `
  .v-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .v-loading__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .v-loading__text {
    margin-top: 10px;
    color: #666;
    font-size: 14px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* 黑暗模式 */
  @media (prefers-color-scheme: dark) {
    .v-loading {
      background-color: rgba(0, 0, 0, 0.9);
    }
    
    .v-loading__spinner {
      border-color: #333;
      border-top-color: #3498db;
    }
    
    .v-loading__text {
      color: #fff;
    }
  }
`
document.head.appendChild(style)

// 使用範例：
/*
// 在 main.js 中註冊
import loading from '@/directives/loading'
app.directive('loading', loading)

// 在組件中使用
<template>
  <div v-loading="isLoading">
    內容
  </div>

  <!-- 自定義文字 -->
  <div v-loading="{ text: '處理中...' }">
    內容
  </div>
</template>

<script>
export default {
  setup() {
    const isLoading = ref(false)

    const fetchData = async () => {
      isLoading.value = true
      try {
        await api.getData()
      } finally {
        isLoading.value = false
      }
    }

    return {
      isLoading
    }
  }
}
</script>
*/