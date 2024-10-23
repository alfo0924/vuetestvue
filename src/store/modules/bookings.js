import bookingAPI from '@/api/bookings'

export default {
    namespaced: true,

    state: {
        bookings: [],
        currentBooking: null,
        total: 0,
        loading: false,
        error: null,
        filters: {
            page: 1,
            pageSize: 10,
            status: '',
            startDate: '',
            endDate: ''
        }
    },

    mutations: {
        SET_BOOKINGS(state, { bookings, total }) {
            state.bookings = bookings
            state.total = total
        },

        SET_CURRENT_BOOKING(state, booking) {
            state.currentBooking = booking
        },

        SET_LOADING(state, status) {
            state.loading = status
        },

        SET_ERROR(state, error) {
            state.error = error
        },

        SET_FILTERS(state, filters) {
            state.filters = { ...state.filters, ...filters }
        },

        UPDATE_BOOKING_STATUS(state, { bookingId, status }) {
            const booking = state.bookings.find(b => b.bookingId === bookingId)
            if (booking) {
                booking.status = status
            }
        },

        REMOVE_BOOKING(state, bookingId) {
            state.bookings = state.bookings.filter(b => b.bookingId !== bookingId)
            state.total--
        }
    },

    actions: {
        // 獲取訂位列表
        async fetchBookings({ commit, state }, params = {}) {
            try {
                commit('SET_LOADING', true)
                const response = await bookingAPI.getBookings({
                    ...state.filters,
                    ...params
                })
                commit('SET_BOOKINGS', {
                    bookings: response.data,
                    total: response.total
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 獲取單一訂位詳情
        async fetchBookingById({ commit }, bookingId) {
            try {
                commit('SET_LOADING', true)
                const response = await bookingAPI.getBookingById(bookingId)
                commit('SET_CURRENT_BOOKING', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 創建新訂位
        async createBooking({ commit, dispatch }, bookingData) {
            try {
                commit('SET_LOADING', true)
                const response = await bookingAPI.createBooking(bookingData)
                // 重新獲取訂位列表
                await dispatch('fetchBookings')
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新訂位
        async updateBooking({ commit, dispatch }, { bookingId, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await bookingAPI.updateBooking(bookingId, data)
                // 更新本地狀態
                commit('UPDATE_BOOKING_STATUS', {
                    bookingId,
                    status: data.status
                })
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取消訂位
        async cancelBooking({ commit }, { bookingId, reason }) {
            try {
                commit('SET_LOADING', true)
                await bookingAPI.cancelBooking(bookingId, { reason })
                commit('UPDATE_BOOKING_STATUS', {
                    bookingId,
                    status: '已取消'
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 刪除訂位
        async deleteBooking({ commit }, bookingId) {
            try {
                commit('SET_LOADING', true)
                await bookingAPI.deleteBooking(bookingId)
                commit('REMOVE_BOOKING', bookingId)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 檢查座位可用性
        async checkSeatAvailability({ commit }, { showingId, seatNumber }) {
            try {
                const response = await bookingAPI.checkSeatAvailability(showingId, seatNumber)
                return response.available
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            }
        },

        // 批量檢查座位可用性
        async checkSeatsAvailability({ commit }, { showingId, seatNumbers }) {
            try {
                const response = await bookingAPI.checkSeatsAvailability(showingId, seatNumbers)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            }
        },

        // 確認訂位並支付
        async confirmAndPay({ commit }, { bookingId, paymentData }) {
            try {
                commit('SET_LOADING', true)
                const response = await bookingAPI.confirmAndPay(bookingId, paymentData)
                commit('UPDATE_BOOKING_STATUS', {
                    bookingId,
                    status: '已完成'
                })
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 獲取訂位收據
        async getBookingReceipt({ commit }, bookingId) {
            try {
                const response = await bookingAPI.getBookingReceipt(bookingId)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            }
        },

        // 更新過濾條件
        updateFilters({ commit, dispatch }, filters) {
            commit('SET_FILTERS', filters)
            return dispatch('fetchBookings')
        },

        // 清除錯誤
        clearError({ commit }) {
            commit('SET_ERROR', null)
        }
    },

    getters: {
        // 獲取載入狀態
        isLoading: state => state.loading,

        // 獲取錯誤信息
        error: state => state.error,

        // 獲取訂位總數
        totalBookings: state => state.total,

        // 獲取當前頁面訂位
        currentPageBookings: state => state.bookings,

        // 獲取當前訂位詳情
        currentBooking: state => state.currentBooking,

        // 獲取過濾條件
        filters: state => state.filters,

        // 檢查是否可以取消訂位
        canCancel: (state) => (booking) => {
            return booking.status === '已預訂' &&
                new Date(booking.showTime) > new Date()
        }
    }
}