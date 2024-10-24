// 引入第三方插件
import { createI18n } from 'vue-i18n'
import VueAxios from 'vue-axios'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createPinia } from 'pinia'

// 引入自定義指令
import permission from '@/directives/permission'
import loading from '@/directives/loading'

// 引入自定義元件
import BaseComponents from '@/components/common'

// 配置 dayjs
dayjs.locale('zh-tw')
dayjs.extend(relativeTime)

// 配置 axios
axios.defaults.baseURL = process.env.VUE_APP_API_URL
axios.defaults.timeout = 15000
axios.defaults.headers.common['Accept'] = 'application/json'

// 創建 i18n 實例
const i18n = createI18n({
    locale: 'zh-TW',
    fallbackLocale: 'en',
    messages: {
        'zh-TW': require('@/locales/zh-TW.json'),
        'en': require('@/locales/en.json')
    }
})

// 創建 Pinia 實例
const pinia = createPinia()

// 插件安裝函數
export default {
    install: (app) => {
        // 安裝 Vue I18n
        app.use(i18n)

        // 安裝 Vue Axios
        app.use(VueAxios, axios)
        app.provide('axios', app.config.globalProperties.axios)

        // 安裝 Pinia
        app.use(pinia)

        // 註冊全局指令
        app.use(permission)
        app.use(loading)

        // 註冊基礎元件
        app.use(BaseComponents)

        // 註冊全局屬性
        app.config.globalProperties.$dayjs = dayjs

        // 註冊全局方法
        app.config.globalProperties.$formatDate = (date) => {
            if (!date) return ''
            return dayjs(date).format('YYYY-MM-DD')
        }

        app.config.globalProperties.$formatDateTime = (date) => {
            if (!date) return ''
            return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
        }

        app.config.globalProperties.$formatRelativeTime = (date) => {
            if (!date) return ''
            return dayjs(date).fromNow()
        }

        // 全局錯誤處理
        app.config.errorHandler = (err, vm, info) => {
            console.error('全局錯誤:', err)
            console.error('錯誤組件:', vm)
            console.error('錯誤信息:', info)
        }

        // 全局警告處理
        app.config.warnHandler = (msg, vm, trace) => {
            console.warn('全局警告:', msg)
            console.warn('警告組件:', vm)
            console.warn('警告追蹤:', trace)
        }

        // 註冊全局 mixin
        app.mixin({
            methods: {
                // 通用確認對話框
                async $confirm(message, title = '確認') {
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
                $toast(message, type = 'success') {
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
    }
}