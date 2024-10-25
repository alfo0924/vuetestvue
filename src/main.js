import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'

// 引入 Bootstrap 和 Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// 引入全局樣式
import '@/assets/styles/global.scss'

// 引入工具函數
import { formatDate, formatDateTime, formatMoney, formatCardNumber } from '@/utils/format'
import { hasPermission } from '@/utils/permission'
import { validateForm } from '@/utils/validation'
import { useStorage } from '@/utils/storage'

// 引入全局組件
import BaseComponents from '@/components/common'

// 設定 dayjs
dayjs.locale('zh-tw')

// 創建 Vue 應用實例
const app = createApp(App)
const pinia = createPinia()

// 註冊全局屬性
app.config.globalProperties.$format = {
    date: formatDate,
    dateTime: formatDateTime,
    money: formatMoney,
    cardNumber: formatCardNumber
}

app.config.globalProperties.$validate = validateForm
app.config.globalProperties.$storage = useStorage

// 註冊全局指令
app.directive('permission', {
    mounted(el, binding) {
        if (!hasPermission(binding.value)) {
            el.parentNode?.removeChild(el)
        }
    }
})

// 註冊全局組件
app.use(BaseComponents)

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
    console.error('全局錯誤:', err)
    store.dispatch('setError', {
        message: err.message,
        type: 'error',
        stack: err.stack
    })
}

// 註冊全局 mixin
app.mixin({
    methods: {
        async $confirm(message, title = '確認', options = {}) {
            const {
                confirmText = '確認',
                cancelText = '取消',
                type = 'primary'
            } = options

            return new Promise(resolve => {
                const modal = new bootstrap.Modal(document.createElement('div'))
                modal._element.innerHTML = `
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${title}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <p>${message}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    ${cancelText}
                                </button>
                                <button type="button" class="btn btn-${type} confirm-btn">
                                    ${confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                `
                modal._element.querySelector('.confirm-btn').onclick = () => {
                    modal.hide()
                    resolve(true)
                }
                modal._element.querySelector('.btn-close').onclick = () => {
                    modal.hide()
                    resolve(false)
                }
                modal.show()
            })
        },

        $toast(message, type = 'success', duration = 3000) {
            const toast = document.createElement('div')
            toast.className = `toast align-items-center text-white bg-${type}`
            toast.setAttribute('role', 'alert')
            toast.setAttribute('aria-live', 'assertive')
            toast.setAttribute('aria-atomic', 'true')
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `
            document.body.appendChild(toast)
            const bsToast = new bootstrap.Toast(toast, {
                delay: duration
            })
            bsToast.show()
            toast.addEventListener('hidden.bs.toast', () => {
                document.body.removeChild(toast)
            })
        }
    }
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
    // 顯示載入進度條
    NProgress.start()

    // 設置頁面標題
    document.title = to.meta.title
      ? `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE}`
      : import.meta.env.VITE_APP_TITLE

    // 檢查認證狀態
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const isAuthenticated = await store.dispatch('auth/checkAuth')
        if (!isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }
    }

    // 檢查權限
    if (to.meta.permission && !hasPermission(to.meta.permission)) {
        next('/403')
        return
    }

    next()
})

router.afterEach(() => {
    // 隱藏載入進度條
    NProgress.done()
})

// 掛載 Vue 實例
app.use(pinia)
app.use(router)
app.use(store)
app.use(i18n)
app.mount('#app')

// 開發環境配置
if (import.meta.env.DEV) {
    // 啟用 Vue Devtools
    app.config.devtools = true

    // 啟用 Mock Service Worker
    if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
        const { worker } = await import('./mocks/browser')
        worker.start()
    }
}

// 全局錯誤處理
window.addEventListener('unhandledrejection', event => {
    console.error('未處理的 Promise 錯誤:', event.reason)
    store.dispatch('setError', {
        message: event.reason.message,
        type: 'error',
        stack: event.reason.stack
    })
})

window.onerror = (message, source, lineno, colno, error) => {
    console.error('全局 JavaScript 錯誤:', { message, source, lineno, colno, error })
    store.dispatch('setError', {
        message,
        type: 'error',
        stack: error?.stack
    })
    return false
}

// PWA 配置
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            })
            console.log('SW registered:', registration)
        } catch (error) {
            console.error('SW registration failed:', error)
        }
    })
}