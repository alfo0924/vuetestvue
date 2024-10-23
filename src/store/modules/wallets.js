import walletAPI from '@/api/wallets'

export default {
    namespaced: true,

    state: {
        // 錢包餘額
        balance: 0,
        // 交易記錄
        transactions: [],
        // 交易記錄總數
        totalTransactions: 0,
        // 每日交易限額
        dailyLimit: 10000,
        // 單筆交易限額
        singleTransactionLimit: 5000,
        // 載入狀態
        loading: false,
        // 錯誤訊息
        error: null,
        // 過濾條件
        filters: {
            page: 1,
            pageSize: 10,
            startDate: '',
            endDate: '',
            transactionType: ''
        }
    },

    mutations: {
        // 設置餘額
        SET_BALANCE(state, balance) {
            state.balance = balance
        },

        // 設置交易記錄
        SET_TRANSACTIONS(state, { transactions, total }) {
            state.transactions = transactions
            state.totalTransactions = total
        },

        // 設置每日限額
        SET_DAILY_LIMIT(state, limit) {
            state.dailyLimit = limit
        },

        // 設置單筆限額
        SET_SINGLE_TRANSACTION_LIMIT(state, limit) {
            state.singleTransactionLimit = limit
        },

        // 新增交易記錄
        ADD_TRANSACTION(state, transaction) {
            state.transactions.unshift(transaction)
            state.totalTransactions++
        },

        // 設置載入狀態
        SET_LOADING(state, status) {
            state.loading = status
        },

        // 設置錯誤訊息
        SET_ERROR(state, error) {
            state.error = error
        },

        // 設置過濾條件
        SET_FILTERS(state, filters) {
            state.filters = { ...state.filters, ...filters }
        }
    },

    actions: {
        // 取得錢包餘額
        async getBalance({ commit }) {
            try {
                commit('SET_LOADING', true)
                const response = await walletAPI.getBalance()
                commit('SET_BALANCE', response.balance)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得交易記錄
        async getTransactions({ commit, state }, params = {}) {
            try {
                commit('SET_LOADING', true)
                const response = await walletAPI.getTransactions({
                    ...state.filters,
                    ...params
                })
                commit('SET_TRANSACTIONS', {
                    transactions: response.data,
                    total: response.total
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 儲值
        async deposit({ commit }, { amount, paymentMethod }) {
            try {
                commit('SET_LOADING', true)
                const response = await walletAPI.deposit({
                    amount,
                    paymentMethod
                })
                commit('ADD_TRANSACTION', response)
                commit('SET_BALANCE', response.balanceAfter)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 支付
        async pay({ commit, state }, { amount, description }) {
            try {
                // 檢查限額
                if (amount > state.singleTransactionLimit) {
                    throw new Error('超過單筆交易限額')
                }

                commit('SET_LOADING', true)
                const response = await walletAPI.pay({
                    amount,
                    description
                })
                commit('ADD_TRANSACTION', response)
                commit('SET_BALANCE', response.balanceAfter)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 退款
        async refund({ commit }, { transactionId, reason }) {
            try {
                commit('SET_LOADING', true)
                const response = await walletAPI.refund(transactionId, {
                    reason
                })
                commit('ADD_TRANSACTION', response)
                commit('SET_BALANCE', response.balanceAfter)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新交易限額
        async updateTransactionLimits({ commit }, { dailyLimit, singleTransactionLimit }) {
            try {
                commit('SET_LOADING', true)
                const response = await walletAPI.updateTransactionLimits({
                    dailyLimit,
                    singleTransactionLimit
                })
                commit('SET_DAILY_LIMIT', response.dailyLimit)
                commit('SET_SINGLE_TRANSACTION_LIMIT', response.singleTransactionLimit)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新過濾條件
        updateFilters({ commit, dispatch }, filters) {
            commit('SET_FILTERS', filters)
            return dispatch('getTransactions')
        },

        // 清除錯誤訊息
        clearError({ commit }) {
            commit('SET_ERROR', null)
        }
    },

    getters: {
        // 取得載入狀態
        isLoading: state => state.loading,

        // 取得錯誤訊息
        error: state => state.error,

        // 取得餘額
        balance: state => state.balance,

        // 取得交易記錄
        transactions: state => state.transactions,

        // 取得交易記錄總數
        totalTransactions: state => state.totalTransactions,

        // 取得每日限額
        dailyLimit: state => state.dailyLimit,

        // 取得單筆限額
        singleTransactionLimit: state => state.singleTransactionLimit,

        // 取得過濾條件
        filters: state => state.filters,

        // 計算今日交易總額
        todayTransactionTotal: state => {
            const today = new Date().toISOString().split('T')[0]
            return state.transactions
                .filter(t => t.transactionTime.startsWith(today))
                .reduce((sum, t) => sum + (t.amount || 0), 0)
        },

        // 檢查是否超過每日限額
        isOverDailyLimit: (state, getters) => amount => {
            return (getters.todayTransactionTotal + amount) > state.dailyLimit
        }
    }
}