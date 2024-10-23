import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 Bootstrap 和 Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// 引入全局樣式
import '@/assets/styles/global.scss'

// 創建 Vue 應用實例
const app = createApp(App)

// 註冊全局屬性
app.config.globalProperties.$formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('zh-TW')
}

app.config.globalProperties.$formatDateTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('zh-TW')
}

app.config.globalProperties.$formatMoney = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD'
    }).format(amount)
}

// 註冊全局指令
app.directive('permission', {
    mounted(el, binding) {
        const userRole = store.state.auth.userRole
        const requiredRole = binding.value
        if (requiredRole && userRole !== requiredRole) {
            el.style.display = 'none'
        }
    }
})

// 註冊全局組件
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseSearch from '@/components/common/BaseSearch.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseUpload from '@/components/common/BaseUpload.vue'

app.component('BaseButton', BaseButton)
app.component('BaseTable', BaseTable)
app.component('BaseForm', BaseForm)
app.component('BaseModal', BaseModal)
app.component('BaseSearch', BaseSearch)
app.component('BasePagination', BasePagination)
app.component('BaseUpload', BaseUpload)

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
    console.error('全局錯誤:', err)
    console.error('錯誤組件:', vm)
    console.error('錯誤信息:', info)
    // 可以在這裡添加錯誤上報邏輯
}

// 註冊全局 mixin
app.mixin({
    methods: {
        // 通用確認對話框
        async confirm(message, title = '確認') {
            return new Promise((resolve) => {
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
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                <button type="button" class="btn btn-primary confirm-btn">確認</button>
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

        // 通用提示訊息
        showMessage(message, type = 'success') {
            const toast = document.createElement('div')
            toast.className = `toast align-items-center text-white bg-${type}`
            toast.setAttribute('role', 'alert')
            toast.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      `
            document.body.appendChild(toast)
            new bootstrap.Toast(toast).show()
            setTimeout(() => {
                document.body.removeChild(toast)
            }, 3000)
        }
    }
})

// 路由守衛
router.beforeEach((to, from, next) => {
    // 檢查是否需要登入
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.state.auth.isLoggedIn) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }
    }

    // 檢查權限
    if (to.meta.role && store.state.auth.userRole !== to.meta.role) {
        next({ path: '/403' })
        return
    }

    next()
})

// 掛載 Vue 實例
app.use(router)
app.use(store)
app.mount('#app')

// 在開發環境下啟用 Vue Devtools
if (process.env.NODE_ENV === 'development') {
    const { worker } = require('./mocks/browser')
    worker.start()
}

// 處理未捕獲的 Promise 錯誤
window.addEventListener('unhandledrejection', event => {
    console.error('未處理的 Promise 錯誤:', event.reason)
    // 可以在這裡添加錯誤上報邏輯
})

// 處理全局錯誤
window.onerror = function(message, source, lineno, colno, error) {
    console.error('全局 JavaScript 錯誤:', {
        message,
        source,
        lineno,
        colno,
        error
    })
    // 可以在這裡添加錯誤上報邏輯
    return false
}

// 註冊 Service Worker（如果需要）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered:', registration)
        }).catch(error => {
            console.error('SW registration failed:', error)
        })
    })
}