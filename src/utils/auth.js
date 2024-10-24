import authAPI from '@/api/auth'
import router from '@/router'

export default {
    namespaced: true,

    state: {
        // 登入狀態
        isLoggedIn: false,
        // 使用者資料
        user: null,
        // 使用者角色
        userRole: null,
        // 權限列表
        permissions: [],
        // 存取令牌
        token: localStorage.getItem('token') || null,
        // 重新整理令牌
        refreshToken: localStorage.getItem('refreshToken') || null,
        // 載入狀態
        loading: false,
        // 錯誤訊息
        error: null
    },

    mutations: {
        // 設置登入狀態
        SET_LOGIN_STATUS(state, status) {
            state.isLoggedIn = status
        },

        // 設置使用者資料
        SET_USER(state, user) {
            state.user = user
            state.userRole = user?.role || null
        },

        // 設置權限列表
        SET_PERMISSIONS(state, permissions) {
            state.permissions = permissions
        },

        // 設置存取令牌
        SET_TOKEN(state, token) {
            state.token = token
            if (token) {
                localStorage.setItem('token', token)
            } else {
                localStorage.removeItem('token')
            }
        },

        // 設置重新整理令牌
        SET_REFRESH_TOKEN(state, token) {
            state.refreshToken = token
            if (token) {
                localStorage.setItem('refreshToken', token)
            } else {
                localStorage.removeItem('refreshToken')
            }
        },

        // 設置載入狀態
        SET_LOADING(state, status) {
            state.loading = status
        },

        // 設置錯誤訊息
        SET_ERROR(state, error) {
            state.error = error
        }
    },

    actions: {
        // 登入
        async login({ commit, dispatch }, credentials) {
            try {
                commit('SET_LOADING', true)
                const response = await authAPI.login(credentials)

                commit('SET_TOKEN', response.token)
                commit('SET_REFRESH_TOKEN', response.refreshToken)
                commit('SET_LOGIN_STATUS', true)

                // 取得使用者資料
                await dispatch('getUserInfo')

                // 更新最後登入時間
                await authAPI.updateLastLoginTime()

                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 註冊
        async register({ commit }, userData) {
            try {
                commit('SET_LOADING', true)
                const response = await authAPI.register(userData)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 登出
        async logout({ commit }) {
            try {
                commit('SET_LOADING', true)
                await authAPI.logout()

                // 清除所有狀態
                commit('SET_TOKEN', null)
                commit('SET_REFRESH_TOKEN', null)
                commit('SET_USER', null)
                commit('SET_LOGIN_STATUS', false)
                commit('SET_PERMISSIONS', [])

                // 導向登入頁
                router.push('/login')
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得使用者資料
        async getUserInfo({ commit }) {
            try {
                const response = await authAPI.getUserInfo()
                commit('SET_USER', response)
                commit('SET_PERMISSIONS', response.permissions || [])
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            }
        },

        // 更新使用者資料
        async updateUserInfo({ commit }, userData) {
            try {
                commit('SET_LOADING', true)
                const response = await authAPI.updateUserInfo(userData)
                commit('SET_USER', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更改密碼
        async changePassword({ commit }, passwords) {
            try {
                commit('SET_LOADING', true)
                await authAPI.changePassword(passwords)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 重設密碼
        async resetPassword({ commit }, email) {
            try {
                commit('SET_LOADING', true)
                await authAPI.resetPassword(email)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 驗證信箱
        async verifyEmail({ commit }, token) {
            try {
                commit('SET_LOADING', true)
                await authAPI.verifyEmail(token)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 重新整理令牌
        async refreshToken({ commit, state }) {
            try {
                const response = await authAPI.refreshToken(state.refreshToken)
                commit('SET_TOKEN', response.token)
                return response.token
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            }
        },

        // 檢查登入狀態
        async checkAuth({ commit, dispatch, state }) {
            try {
                if (!state.token) {
                    return false
                }

                // 驗證令牌
                const response = await authAPI.validateToken()
                if (response.valid) {
                    commit('SET_LOGIN_STATUS', true)
                    await dispatch('getUserInfo')
                    return true
                } else {
                    // 令牌無效，嘗試重新整理
                    try {
                        await dispatch('refreshToken')
                        commit('SET_LOGIN_STATUS', true)
                        await dispatch('getUserInfo')
                        return true
                    } catch {
                        // 重新整理失敗，登出
                        await dispatch('logout')
                        return false
                    }
                }
            } catch (error) {
                commit('SET_ERROR', error.message)
                await dispatch('logout')
                return false
            }
        },

        // 清除錯誤訊息
        clearError({ commit }) {
            commit('SET_ERROR', null)
        }
    },

    getters: {
        // 取得登入狀態
        isLoggedIn: state => state.isLoggedIn,

        // 取得使用者資料
        user: state => state.user,

        // 取得使用者角色
        userRole: state => state.userRole,

        // 取得權限列表
        permissions: state => state.permissions,

        // 檢查是否有特定權限
        hasPermission: state => permission => {
            return state.permissions.includes(permission)
        },

        // 取得載入狀態
        isLoading: state => state.loading,

        // 取得錯誤訊息
        error: state => state.error,

        // 取得存取令牌
        token: state => state.token
    }
}