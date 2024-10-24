import axios from 'axios'
import store from '@/store'
import router from '@/router'

// 創建 axios 實例
const service = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 請求攔截器
service.interceptors.request.use(
    config => {
        // 從 localStorage 獲取 token
        const token = localStorage.getItem('token')

        // 如果有 token 則加入到請求頭
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        // 如果是檔案上傳，修改 Content-Type
        if (config.isUpload) {
            config.headers['Content-Type'] = 'multipart/form-data'
        }

        return config
    },
    error => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// 響應攔截器
service.interceptors.response.use(
    response => {
        const res = response.data

        // 如果響應中包含新的 token，更新 localStorage
        const newToken = response.headers['new-token']
        if (newToken) {
            localStorage.setItem('token', newToken)
        }

        // 判斷響應狀態
        if (res.code && res.code !== 200) {
            // 顯示錯誤訊息
            store.dispatch('setError', res.message || '請求失敗')

            // 處理特定錯誤碼
            switch (res.code) {
                // token 過期
                case 401:
                    store.dispatch('auth/logout')
                    router.push({
                        path: '/login',
                        query: { redirect: router.currentRoute.value.fullPath }
                    })
                    break

                // 無權限訪問
                case 403:
                    router.push('/403')
                    break

                // 資源不存在
                case 404:
                    router.push('/404')
                    break

                // 其他錯誤
                default:
                    console.error('API error:', res)
                    break
            }

            return Promise.reject(new Error(res.message || '請求失敗'))
        }

        return res
    },
    error => {
        console.error('Response error:', error)

        // 處理網路錯誤
        if (!error.response) {
            store.dispatch('setError', '網路連接失敗，請檢查網路設置')
            return Promise.reject(error)
        }

        // 處理 HTTP 狀態碼錯誤
        const status = error.response.status
        let message = ''

        switch (status) {
            case 400:
                message = '請求錯誤'
                break
            case 401:
                message = '未授權，請重新登入'
                store.dispatch('auth/logout')
                router.push({
                    path: '/login',
                    query: { redirect: router.currentRoute.value.fullPath }
                })
                break
            case 403:
                message = '拒絕訪問'
                router.push('/403')
                break
            case 404:
                message = '請求地址出錯'
                router.push('/404')
                break
            case 408:
                message = '請求超時'
                break
            case 500:
                message = '伺服器內部錯誤'
                break
            case 501:
                message = '服務未實現'
                break
            case 502:
                message = '網關錯誤'
                break
            case 503:
                message = '服務不可用'
                break
            case 504:
                message = '網關超時'
                break
            case 505:
                message = 'HTTP版本不受支援'
                break
            default:
                message = `連接錯誤 ${status}`
        }

        store.dispatch('setError', message)
        return Promise.reject(error)
    }
)

// 封裝請求方法
export const request = {
    // GET 請求
    get(url, params) {
        return service({
            url,
            method: 'get',
            params
        })
    },

    // POST 請求
    post(url, data) {
        return service({
            url,
            method: 'post',
            data
        })
    },

    // PUT 請求
    put(url, data) {
        return service({
            url,
            method: 'put',
            data
        })
    },

    // DELETE 請求
    delete(url, params) {
        return service({
            url,
            method: 'delete',
            params
        })
    },

    // 檔案上傳
    upload(url, formData) {
        return service({
            url,
            method: 'post',
            data: formData,
            isUpload: true
        })
    },

    // 檔案下載
    download(url, params) {
        return service({
            url,
            method: 'get',
            params,
            responseType: 'blob'
        })
    }
}

// 導出實例
export default service