import memberAPI from '@/api/members'

export default {
    namespaced: true,

    state: {
        // 會員列表
        members: [],
        // 總數
        total: 0,
        // 當前會員
        currentMember: null,
        // 載入狀態
        loading: false,
        // 錯誤訊息
        error: null,
        // 過濾條件
        filters: {
            page: 1,
            pageSize: 10,
            keyword: '',
            memberType: '',
            status: ''
        }
    },

    mutations: {
        // 設置會員列表
        SET_MEMBERS(state, { members, total }) {
            state.members = members
            state.total = total
        },

        // 設置當前會員
        SET_CURRENT_MEMBER(state, member) {
            state.currentMember = member
        },

        // 新增會員
        ADD_MEMBER(state, member) {
            state.members.unshift(member)
            state.total++
        },

        // 更新會員
        UPDATE_MEMBER(state, updatedMember) {
            const index = state.members.findIndex(member => member.memberId === updatedMember.memberId)
            if (index !== -1) {
                state.members.splice(index, 1, updatedMember)
            }
            if (state.currentMember?.memberId === updatedMember.memberId) {
                state.currentMember = updatedMember
            }
        },

        // 刪除會員
        DELETE_MEMBER(state, memberId) {
            state.members = state.members.filter(member => member.memberId !== memberId)
            state.total--
            if (state.currentMember?.memberId === memberId) {
                state.currentMember = null
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
    },

    actions: {
        // 取得會員列表
        async getMembers({ commit, state }, params = {}) {
            try {
                commit('SET_LOADING', true)
                const response = await memberAPI.getMembers({
                    ...state.filters,
                    ...params
                })
                commit('SET_MEMBERS', {
                    members: response.data,
                    total: response.total
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得單一會員
        async getMemberById({ commit }, memberId) {
            try {
                commit('SET_LOADING', true)
                const response = await memberAPI.getMemberById(memberId)
                commit('SET_CURRENT_MEMBER', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 新增會員
        async createMember({ commit }, memberData) {
            try {
                commit('SET_LOADING', true)
                const response = await memberAPI.createMember(memberData)
                commit('ADD_MEMBER', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新會員
        async updateMember({ commit }, { memberId, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await memberAPI.updateMember(memberId, data)
                commit('UPDATE_MEMBER', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 刪除會員
        async deleteMember({ commit }, memberId) {
            try {
                commit('SET_LOADING', true)
                await memberAPI.deleteMember(memberId)
                commit('DELETE_MEMBER', memberId)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 驗證會員
        async verifyMember({ commit }, { memberId, verificationData }) {
            try {
                commit('SET_LOADING', true)
                const response = await memberAPI.verifyMember(memberId, verificationData)
                commit('UPDATE_MEMBER', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新會員狀態
        async updateMemberStatus({ commit }, { memberId, status }) {
            try {
                commit('SET_LOADING', true)
                const response = await memberAPI.updateMemberStatus(memberId, { status })
                commit('UPDATE_MEMBER', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 批量更新會員狀態
        async batchUpdateMemberStatus({ commit, dispatch }, { memberIds, status }) {
            try {
                commit('SET_LOADING', true)
                await memberAPI.batchUpdateMemberStatus({ memberIds, status })
                await dispatch('getMembers')
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
            return dispatch('getMembers')
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

        // 取得會員列表
        members: state => state.members,

        // 取得總數
        total: state => state.total,

        // 取得當前會員
        currentMember: state => state.currentMember,

        // 取得過濾條件
        filters: state => state.filters,

        // 取得已驗證的會員
        verifiedMembers: state => state.members.filter(member => member.isVerified),

        // 取得活躍會員
        activeMembers: state => state.members.filter(member => member.isActive),

        // 根據角色過濾會員
        membersByRole: (state) => (role) => {
            return state.members.filter(member => member.role === role)
        }
    }
}