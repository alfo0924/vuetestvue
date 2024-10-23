import venueAPI from '@/api/venues'

const state = {
    // 場地列表
    venues: [],
    // 總數
    total: 0,
    // 當前場地詳情
    currentVenue: null,
    // 場次列表
    showings: [],
    // 場次總數
    totalShowings: 0,
    // 維護記錄
    maintenanceRecords: [],
    // 載入狀態
    loading: false,
    // 錯誤訊息
    error: null,
    // 過濾條件
    filters: {
        page: 1,
        pageSize: 10,
        status: '',
        startDate: '',
        endDate: ''
    }
}

const mutations = {
    // 設置場地列表
    SET_VENUES(state, { venues, total }) {
        state.venues = venues
        state.total = total
    },

    // 設置當前場地
    SET_CURRENT_VENUE(state, venue) {
        state.currentVenue = venue
    },

    // 設置場次列表
    SET_SHOWINGS(state, { showings, total }) {
        state.showings = showings
        state.totalShowings = total
    },

    // 設置維護記錄
    SET_MAINTENANCE_RECORDS(state, records) {
        state.maintenanceRecords = records
    },

    // 新增場地
    ADD_VENUE(state, venue) {
        state.venues.unshift(venue)
        state.total++
    },

    // 更新場地
    UPDATE_VENUE(state, updatedVenue) {
        const index = state.venues.findIndex(v => v.venueId === updatedVenue.venueId)
        if (index !== -1) {
            state.venues.splice(index, 1, updatedVenue)
        }
        if (state.currentVenue?.venueId === updatedVenue.venueId) {
            state.currentVenue = updatedVenue
        }
    },

    // 刪除場地
    DELETE_VENUE(state, venueId) {
        state.venues = state.venues.filter(v => v.venueId !== venueId)
        state.total--
        if (state.currentVenue?.venueId === venueId) {
            state.currentVenue = null
        }
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
}

const actions = {
    // 取得場地列表
    async getVenues({ commit, state }, params = {}) {
        try {
            commit('SET_LOADING', true)
            const response = await venueAPI.getVenues({
                ...state.filters,
                ...params
            })
            commit('SET_VENUES', {
                venues: response.data,
                total: response.total
            })
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 取得場地詳情
    async getVenueById({ commit }, venueId) {
        try {
            commit('SET_LOADING', true)
            const response = await venueAPI.getVenueById(venueId)
            commit('SET_CURRENT_VENUE', response)
            return response
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 新增場地
    async createVenue({ commit }, data) {
        try {
            commit('SET_LOADING', true)
            const response = await venueAPI.createVenue(data)
            commit('ADD_VENUE', response)
            return response
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 更新場地
    async updateVenue({ commit }, { venueId, data }) {
        try {
            commit('SET_LOADING', true)
            const response = await venueAPI.updateVenue(venueId, data)
            commit('UPDATE_VENUE', response)
            return response
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 刪除場地
    async deleteVenue({ commit }, venueId) {
        try {
            commit('SET_LOADING', true)
            await venueAPI.deleteVenue(venueId)
            commit('DELETE_VENUE', venueId)
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 取得場次列表
    async getVenueSchedule({ commit }, { venueId, params = {} }) {
        try {
            commit('SET_LOADING', true)
            const response = await venueAPI.getVenueSchedule(venueId, params)
            commit('SET_SHOWINGS', {
                showings: response.data,
                total: response.total
            })
        } catch (error) {
            commit('SET_ERROR', error.message)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 取得維護記錄
    async getVenueMaintenance({ commit }, venueId) {
        try {
            commit('SET_LOADING', true)
            const response = await venueAPI.getVenueMaintenance(venueId)
            commit('SET_MAINTENANCE_RECORDS', response)
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
        return dispatch('getVenues')
    },

    // 清除錯誤訊息
    clearError({ commit }) {
        commit('SET_ERROR', null)
    }
}

const getters = {
    // 取得載入狀態
    isLoading: state => state.loading,

    // 取得錯誤訊息
    error: state => state.error,

    // 取得場地列表
    venues: state => state.venues,

    // 取得總數
    total: state => state.total,

    // 取得當前場地
    currentVenue: state => state.currentVenue,

    // 取得場次列表
    showings: state => state.showings,

    // 取得場次總數
    totalShowings: state => state.totalShowings,

    // 取得維護記錄
    maintenanceRecords: state => state.maintenanceRecords,

    // 取得過濾條件
    filters: state => state.filters,

    // 取得可用場地
    availableVenues: state => state.venues.filter(v => v.status === '正常'),

    // 取得維護中場地
    maintenanceVenues: state => state.venues.filter(v => v.status === '維護中')
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}