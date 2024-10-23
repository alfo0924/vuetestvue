import benefitAPI from '@/api/benefits'

export default {
    namespaced: true,

    state: {
        // 優惠列表
        benefits: [],
        // 總筆數
        total: 0,
        // 載入狀態
        loading: false,
        // 當前優惠詳情
        currentBenefit: null,
        // 使用記錄
        usageHistory: [],
        // 使用記錄總筆數
        usageTotal: 0,
        // 使用統計
        usageStats: {
            totalUsage: 0,
            monthlyUsage: 0,
            usageRate: 0
        },
        // 錯誤訊息
        error: null
    },

    mutations: {
        // 設置優惠列表
        SET_BENEFITS(state, { benefits, total }) {
            state.benefits = benefits
            state.total = total
        },

        // 設置載入狀態
        SET_LOADING(state, status) {
            state.loading = status
        },

        // 設置當前優惠
        SET_CURRENT_BENEFIT(state, benefit) {
            state.currentBenefit = benefit
        },

        // 設置使用記錄
        SET_USAGE_HISTORY(state, { usageHistory, total }) {
            state.usageHistory = usageHistory
            state.usageTotal = total
        },

        // 設置使用統計
        SET_USAGE_STATS(state, stats) {
            state.usageStats = stats
        },

        // 設置錯誤訊息
        SET_ERROR(state, error) {
            state.error = error
        },

        // 清除錯誤訊息
        CLEAR_ERROR(state) {
            state.error = null
        }
    },

    actions: {
        // 取得優惠列表
        async getBenefits({ commit }, params = {}) {
            try {
                commit('SET_LOADING', true)
                const response = await benefitAPI.getBenefits(params)
                commit('SET_BENEFITS', {
                    benefits: response.data,
                    total: response.total
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得優惠詳情
        async getBenefitById({ commit }, benefitId) {
            try {
                commit('SET_LOADING', true)
                const response = await benefitAPI.getBenefitById(benefitId)
                commit('SET_CURRENT_BENEFIT', response)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 新增優惠
        async createBenefit({ commit }, data) {
            try {
                commit('SET_LOADING', true)
                const response = await benefitAPI.createBenefit(data)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新優惠
        async updateBenefit({ commit }, { benefitId, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await benefitAPI.updateBenefit(benefitId, data)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 刪除優惠
        async deleteBenefit({ commit }, benefitId) {
            try {
                commit('SET_LOADING', true)
                await benefitAPI.deleteBenefit(benefitId)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得使用記錄
        async getBenefitUsageHistory({ commit }, { benefitId, params = {} }) {
            try {
                commit('SET_LOADING', true)
                const response = await benefitAPI.getBenefitUsageHistory(benefitId, params)
                commit('SET_USAGE_HISTORY', {
                    usageHistory: response.data,
                    total: response.total
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得使用統計
        async getBenefitStats({ commit }, benefitId) {
            try {
                const response = await benefitAPI.getBenefitStats(benefitId)
                commit('SET_USAGE_STATS', response)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            }
        },

        // 使用優惠
        async useBenefit({ commit }, { benefitId, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await benefitAPI.useBenefit(benefitId, data)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 批量更新優惠狀態
        async batchUpdateBenefitsStatus({ commit }, data) {
            try {
                commit('SET_LOADING', true)
                await benefitAPI.batchUpdateBenefitsStatus(data)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 清除錯誤訊息
        clearError({ commit }) {
            commit('CLEAR_ERROR')
        }
    },

    getters: {
        // 取得載入狀態
        isLoading: state => state.loading,

        // 取得錯誤訊息
        error: state => state.error,

        // 取得優惠列表
        benefits: state => state.benefits,

        // 取得總筆數
        total: state => state.total,

        // 取得當前優惠
        currentBenefit: state => state.currentBenefit,

        // 取得使用記錄
        usageHistory: state => state.usageHistory,

        // 取得使用記錄總筆數
        usageTotal: state => state.usageTotal,

        // 取得使用統計
        usageStats: state => state.usageStats,

        // 檢查優惠是否可用
        isBenefitAvailable: state => benefit => {
            if (!benefit) return false
            const now = new Date()
            return (
                benefit.status === '使用中' &&
                (!benefit.validUntil || new Date(benefit.validUntil) > now) &&
                (!benefit.usageLimit || benefit.usageCount < benefit.usageLimit)
            )
        }
    }
}