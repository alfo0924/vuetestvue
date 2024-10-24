import store from '@/store'
import router from '@/router'
import { useStorage } from '@/utils/storage'

// 認證中間件
export default {
    // 路由守衛
    async routeGuard(to, from, next) {
        try {
            // 檢查是否需要認證
            if (to.matched.some(record => record.meta.requiresAuth)) {
                // 檢查登入狀態
                const isLoggedIn = store.state.auth.isLoggedIn
                const token = useStorage.get('token')

                if (!isLoggedIn || !token) {
                    // 未登入，導向登入頁面
                    next({
                        path: '/login',
                        query: { redirect: to.fullPath }
                    })
                    return
                }

                // 檢查 token 有效性
                try {
                    await store.dispatch('auth/checkAuth')
                } catch (error) {
                    // token 無效，清除登入狀態並重新登入
                    await store.dispatch('auth/logout')
                    next({
                        path: '/login',
                        query: { redirect: to.fullPath }
                    })
                    return
                }

                // 檢查角色權限
                if (to.meta.role) {
                    const userRole = store.state.auth.userRole
                    if (userRole !== to.meta.role) {
                        next('/403')
                        return
                    }
                }

                // 檢查特定權限
                if (to.meta.permission) {
                    const hasPermission = store.getters['auth/hasPermission'](to.meta.permission)
                    if (!hasPermission) {
                        next('/403')
                        return
                    }
                }
            }

            // 允許訪問
            next()
        } catch (error) {
            console.error('Route guard error:', error)
            next('/error')
        }
    },

    // HTTP 請求攔截器
    requestInterceptor(config) {
        // 從 localStorage 獲取 token
        const token = useStorage.get('token')

        // 如果有 token 則加入到請求頭
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        return config
    },

    // HTTP 響應攔截器
    responseInterceptor: {
        // 成功處理
        success(response) {
            // 如果響應中包含新的 token，更新 localStorage
            const newToken = response.headers['new-token']
            if (newToken) {
                useStorage.set('token', newToken)
            }

            return response
        },

        // 錯誤處理
        async error(error) {
            if (!error.response) {
                // 網路錯誤
                store.dispatch('setError', '網路連接失敗，請檢查網路設置')
                return Promise.reject(error)
            }

            const { status } = error.response

            switch (status) {
                case 401: {
                    // token 過期或無效
                    const refreshToken = useStorage.get('refreshToken')
                    if (refreshToken) {
                        try {
                            // 嘗試使用 refresh token 更新 token
                            await store.dispatch('auth/refreshToken')
                            // 重新發送原始請求
                            return axios(error.config)
                        } catch (refreshError) {
                            // refresh token 也失效，需要重新登入
                            await store.dispatch('auth/logout')
                            router.push({
                                path: '/login',
                                query: { redirect: router.currentRoute.value.fullPath }
                            })
                        }
                    } else {
                        // 沒有 refresh token，直接登出
                        await store.dispatch('auth/logout')
                        router.push({
                            path: '/login',
                            query: { redirect: router.currentRoute.value.fullPath }
                        })
                    }
                    break
                }

                case 403:
                    // 權限不足
                    router.push('/403')
                    break

                case 404:
                    // 資源不存在
                    router.push('/404')
                    break

                case 500:
                    // 伺服器錯誤
                    store.dispatch('setError', '伺服器錯誤，請稍後再試')
                    break

                default:
                    // 其他錯誤
                    store.dispatch('setError', error.response.data.message || '發生錯誤，請稍後再試')
                    break
            }

            return Promise.reject(error)
        }
    },

    // 權限檢查
    checkPermission(permission) {
        return store.getters['auth/hasPermission'](permission)
    },

    // 角色檢查
    checkRole(role) {
        return store.state.auth.userRole === role
    },

    // 登入狀態檢查
    isAuthenticated() {
        return store.state.auth.isLoggedIn && useStorage.get('token')
    }
}

// 使用範例：
/*
// 在 router/index.js 中使用路由守衛
import auth from '@/middleware/auth'
router.beforeEach(auth.routeGuard)

// 在 axios 實例中使用請求/響應攔截器
import auth from '@/middleware/auth'
axios.interceptors.request.use(
  auth.requestInterceptor,
  error => Promise.reject(error)
)
axios.interceptors.response.use(
  auth.responseInterceptor.success,
  auth.responseInterceptor.error
)

// 在組件中使用權限檢查
import auth from '@/middleware/auth'

export default {
  setup() {
    // 檢查特定權限
    const canEdit = computed(() => auth.checkPermission('user:edit'))

    // 檢查角色
    const isAdmin = computed(() => auth.checkRole('admin'))

    // 檢查登入狀態
    const isLoggedIn = computed(() => auth.isAuthenticated())

    return {
      canEdit,
      isAdmin,
      isLoggedIn
    }
  }
}
*/