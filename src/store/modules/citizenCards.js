import citizenCardAPI from '@/api/citizenCards'

export default {
    namespaced: true,

    state: {
        // 市民卡列表
        cards: [],
        // 總數
        total: 0,
        // 當前市民卡詳情
        currentCard: null,
        // 載入狀態
        loading: false,
        // 錯誤訊息
        error: null,
        // 卡片類型列表
        cardTypes: [
            { value: '一般卡', label: '一般卡' },
            { value: '敬老卡', label: '敬老卡' },
            { value: '愛心卡', label: '愛心卡' },
            { value: '學生卡', label: '學生卡' }
        ]
    },

    mutations: {
        // 設置市民卡列表
        SET_CARDS(state, { cards, total }) {
            state.cards = cards
            state.total = total
        },

        // 設置當前市民卡
        SET_CURRENT_CARD(state, card) {
            state.currentCard = card
        },

        // 新增市民卡
        ADD_CARD(state, card) {
            state.cards.unshift(card)
            state.total++
        },

        // 更新市民卡
        UPDATE_CARD(state, updatedCard) {
            const index = state.cards.findIndex(card => card.cardNumber === updatedCard.cardNumber)
            if (index !== -1) {
                state.cards.splice(index, 1, updatedCard)
            }
            if (state.currentCard?.cardNumber === updatedCard.cardNumber) {
                state.currentCard = updatedCard
            }
        },

        // 刪除市民卡
        DELETE_CARD(state, cardNumber) {
            state.cards = state.cards.filter(card => card.cardNumber !== cardNumber)
            state.total--
            if (state.currentCard?.cardNumber === cardNumber) {
                state.currentCard = null
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
        // 取得市民卡列表
        async getCards({ commit }, params = {}) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.getCitizenCards(params)
                commit('SET_CARDS', {
                    cards: response.data,
                    total: response.total
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得單一市民卡詳情
        async getCardByNumber({ commit }, cardNumber) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.getCitizenCardByNumber(cardNumber)
                commit('SET_CURRENT_CARD', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 新增市民卡
        async createCard({ commit }, cardData) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.createCard(cardData)
                commit('ADD_CARD', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新市民卡
        async updateCard({ commit }, { cardNumber, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.updateCard(cardNumber, data)
                commit('UPDATE_CARD', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 刪除市民卡
        async deleteCard({ commit }, cardNumber) {
            try {
                commit('SET_LOADING', true)
                await citizenCardAPI.deleteCard(cardNumber)
                commit('DELETE_CARD', cardNumber)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 綁定會員
        async bindCard({ commit }, { cardNumber, memberId }) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.bindCard({
                    cardNumber,
                    memberId
                })
                commit('UPDATE_CARD', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 解除綁定
        async unbindCard({ commit }, cardNumber) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.unbindCard(cardNumber)
                commit('UPDATE_CARD', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 掛失市民卡
        async reportLoss({ commit }, { cardNumber, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.reportLoss(cardNumber, data)
                commit('UPDATE_CARD', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 補發市民卡
        async replaceCard({ commit }, { oldCardNumber, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await citizenCardAPI.replaceCard(oldCardNumber, data)
                commit('DELETE_CARD', oldCardNumber)
                commit('ADD_CARD', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
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

        // 取得市民卡列表
        cards: state => state.cards,

        // 取得總數
        total: state => state.total,

        // 取得當前市民卡
        currentCard: state => state.currentCard,

        // 取得卡片類型列表
        cardTypes: state => state.cardTypes,

        // 取得已綁定的卡片
        boundCards: state => state.cards.filter(card => card.memberId),

        // 取得未綁定的卡片
        unboundCards: state => state.cards.filter(card => !card.memberId)
    }
}