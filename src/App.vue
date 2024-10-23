<template>
  <div id="app">
    <!-- 側邊欄 -->
    <Sidebar v-if="isLoggedIn" />

    <!-- 主要內容區域 -->
    <div class="main-content" :class="{ 'with-sidebar': isLoggedIn }">
      <!-- 頂部導航欄 -->
      <Header v-if="isLoggedIn" />

      <!-- 路由視圖 -->
      <div class="page-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

      <!-- 底部版權資訊 -->
      <Footer v-if="isLoggedIn" />
    </div>

    <!-- 全局載入指示器 -->
    <div v-if="loading" class="global-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
    </div>

    <!-- 全局通知提示 -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast show"
          :class="getToastClass(toast.type)"
          role="alert"
      >
        <div class="toast-header">
          <i
              class="bi me-2"
              :class="getToastIcon(toast.type)"
          ></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <small>{{ toast.time }}</small>
          <button
              type="button"
              class="btn-close"
              @click="removeToast(toast.id)"
          ></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'

export default {
  name: 'App',
  components: {
    Header,
    Sidebar,
    Footer
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    // 全局載入狀態
    const loading = ref(false)

    // 通知提示列表
    const toasts = ref([])
    let toastId = 0

    // 判斷是否已登入
    const isLoggedIn = computed(() => store.state.auth.isLoggedIn)

    // 提供全局通知方法
    const showToast = ({ type = 'info', title = '提示', message, duration = 3000 }) => {
      const id = ++toastId
      const toast = {
        id,
        type,
        title,
        message,
        time: new Date().toLocaleTimeString()
      }
      toasts.value.push(toast)

      // 自動關閉
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    // 移除通知
    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index !== -1) {
        toasts.value.splice(index, 1)
      }
    }

    // 獲取通知樣式
    const getToastClass = (type) => {
      const classMap = {
        success: 'bg-success text-white',
        error: 'bg-danger text-white',
        warning: 'bg-warning',
        info: 'bg-info text-white'
      }
      return classMap[type] || classMap.info
    }

    // 獲取通知圖標
    const getToastIcon = (type) => {
      const iconMap = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
      }
      return iconMap[type] || iconMap.info
    }

    // 提供全局載入方法
    const showLoading = () => {
      loading.value = true
    }

    const hideLoading = () => {
      loading.value = false
    }

    // 提供全局方法
    provide('toast', showToast)
    provide('loading', {
      show: showLoading,
      hide: hideLoading
    })

    // 檢查登入狀態
    onMounted(async () => {
      try {
        showLoading()
        await store.dispatch('auth/checkAuth')

        // 如果未登入且訪問需要驗證的頁面，則重定向到登入頁
        const requiresAuth = router.currentRoute.value.meta.requiresAuth
        if (!isLoggedIn.value && requiresAuth) {
          router.push('/login')
        }
      } catch (error) {
        console.error('檢查登入狀態失敗:', error)
      } finally {
        hideLoading()
      }
    })

    return {
      loading,
      isLoggedIn,
      toasts,
      removeToast,
      getToastClass,
      getToastIcon
    }
  }
}
</script>

<style>
/* 全局樣式 */
:root {
  --sidebar-width: 250px;
  --header-height: 60px;
  --footer-height: 60px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #212529;
  background-color: #f8f9fa;
}

/* 主要內容區域 */
.main-content {
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.with-sidebar {
  margin-left: var(--sidebar-width);
}

/* 頁面容器 */
.page-container {
  padding: var(--header-height) 0 var(--footer-height);
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
}

/* 全局載入指示器 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 路由轉場動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 通知提示樣式 */
.toast-container {
  z-index: 1050;
}

.toast {
  min-width: 300px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  :root {
    --sidebar-width: 0;
  }

  .main-content.with-sidebar {
    margin-left: 0;
  }
}
</style>