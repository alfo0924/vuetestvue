import { createStore } from 'vuex'
import auth from './modules/auth'
import members from './modules/members'
import movies from './modules/movies'
import bookings from './modules/bookings'
import benefits from './modules/benefits'
import citizenCards from './modules/citizenCards'
import wallets from './modules/wallets'
import venues from './modules/venues'
import notifications from './modules/notifications'

export default createStore({
    state: {
        // 全域狀態
        loading: false,
        error: null,
        success: null
    },

    mutations: {
        // 設置載入狀態
        SET_LOADING(state, status) {
            state.loading = status
        },

        // 設置錯誤訊息
        SET_ERROR(state, error) {
            state.error = error
        },

        // 設置成功訊息
        SET_SUCCESS(state, message) {
            state.success = message
        },

        // 清除訊息
        CLEAR_MESSAGE(state) {
            state.error = null
            state.success = null
        }
    },

    actions: {
        // 設置載入狀態
        setLoading({ commit }, status) {
            commit('SET_LOADING', status)
        },

        // 設置錯誤訊息
        setError({ commit }, error) {
            commit('SET_ERROR', error)
            setTimeout(() => {
                commit('CLEAR_MESSAGE')
            }, 3000)
        },

        // 設置成功訊息
        setSuccess({ commit }, message) {
            commit('SET_SUCCESS', message)
            setTimeout(() => {
                commit('CLEAR_MESSAGE')
            }, 3000)
        },

        // 初始化應用程式
        async initializeApp({ dispatch }) {
            try {
                // 檢查登入狀態
                await dispatch('auth/checkAuth')

                // 載入必要的初始資料
                if (localStorage.getItem('token')) {
                    await Promise.all([
                        dispatch('notifications/fetchUnreadCount'),
                        dispatch('wallets/fetchBalance')
                    ])
                }
            } catch (error) {
                console.error('初始化應用程式失敗:', error)
            }
        }
    },

    getters: {
        // 取得載入狀態
        isLoading: state => state.loading,

        // 取得錯誤訊息
        error: state => state.error,

        // 取得成功訊息
        success: state => state.success,

        // 檢查是否有訊息
        hasMessage: state => state.error !== null || state.success !== null
    },

    modules: {
        auth,
        members,
        movies,
        bookings,
        benefits,
        citizenCards,
        wallets,
        venues,
        notifications
    },

    // 嚴格模式，在開發環境下啟用
    strict: process.env.NODE_ENV !== 'production'
})