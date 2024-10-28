import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-tw'

// 引入 Bootstrap 和 Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// 引入全局樣式
import '@/assets/styles/main.scss'

// 引入工具函數
import { formatDate, formatDateTime, formatMoney, formatCardNumber } from '@/utils/format'
import { hasPermission } from '@/utils/permission'
import { validateForm } from '@/utils/validation'
import { useStorage } from '@/utils/storage'

// 引入全局組件
import BaseComponents from '@/components/common'

// 引入 SweetAlert2
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

// 引入進度條
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 設定 dayjs
dayjs.locale('zh-tw')
dayjs.extend(relativeTime)

// 設定 NProgress
NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 200
})

// 創建 Vue 應用實例
const app = createApp(App)
const pinia = createPinia()

// 註冊全局屬性
app.config.globalProperties.$format = {
    date: formatDate,
    dateTime: formatDateTime,
    money: formatMoney,
    cardNumber: formatCardNumber,
    relativeTime: (date) => dayjs(date).fromNow()
}

app.config.globalProperties.$validate = validateForm
app.config.globalProperties.$storage = useStorage
app.config.globalProperties.$dayjs = dayjs

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
    store.dispatch('app/setError', {
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

            return Swal.fire({
                title,
                text: message,
                icon: type === 'primary' ? 'question' : type,
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
                confirmButtonColor: type === 'primary' ? '#0d6efd' : `var(--bs-${type})`,
                reverseButtons: true
            }).then(result => result.isConfirmed)
        },

        $toast(message, type = 'success', duration = 3000) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: duration,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })

            Toast.fire({
                icon: type,
                title: message
            })
        }
    }
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
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

        // 檢查權限
        if (to.meta.permission && !hasPermission(to.meta.permission)) {
            next('/403')
            return
        }
    }

    next()
})

router.afterEach(() => {
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
    const setupDevTools = async () => {
        app.config.devtools = true

        if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
            const { worker } = await import('./mocks/browser')
            await worker.start({
                onUnhandledRequest: 'bypass'
            })
        }
    }

    setupDevTools()
}

// 全局錯誤處理
window.addEventListener('unhandledrejection', event => {
    console.error('未處理的 Promise 錯誤:', event.reason)
    store.dispatch('app/setError', {
        message: event.reason.message,
        type: 'error',
        stack: event.reason.stack
    })
})

// PWA 配置
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                })
                console.log('SW registered:', registration)
            } catch (error) {
                console.error('SW registration failed:', error)
            }
        }
        registerSW()
    })
}