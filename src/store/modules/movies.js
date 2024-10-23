import movieAPI from '@/api/movies'

export default {
    namespaced: true,

    state: {
        // 電影列表
        movies: [],
        // 總數
        total: 0,
        // 當前電影詳情
        currentMovie: null,
        // 場次列表
        showings: [],
        // 場次總數
        totalShowings: 0,
        // 載入狀態
        loading: false,
        // 錯誤訊息
        error: null,
        // 電影類別列表
        categories: [],
        // 篩選條件
        filters: {
            categoryId: '',
            status: '',
            keyword: ''
        }
    },

    mutations: {
        // 設置電影列表
        SET_MOVIES(state, { movies, total }) {
            state.movies = movies
            state.total = total
        },

        // 設置當前電影
        SET_CURRENT_MOVIE(state, movie) {
            state.currentMovie = movie
        },

        // 設置場次列表
        SET_SHOWINGS(state, { showings, total }) {
            state.showings = showings
            state.totalShowings = total
        },

        // 新增場次
        ADD_SHOWING(state, showing) {
            state.showings.unshift(showing)
            state.totalShowings++
        },

        // 更新場次
        UPDATE_SHOWING(state, updatedShowing) {
            const index = state.showings.findIndex(showing => showing.id === updatedShowing.id)
            if (index !== -1) {
                state.showings.splice(index, 1, updatedShowing)
            }
        },

        // 刪除場次
        DELETE_SHOWING(state, showingId) {
            state.showings = state.showings.filter(showing => showing.id !== showingId)
            state.totalShowings--
        },

        // 設置電影類別
        SET_CATEGORIES(state, categories) {
            state.categories = categories
        },

        // 設置篩選條件
        SET_FILTERS(state, filters) {
            state.filters = { ...state.filters, ...filters }
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
        // 取得電影列表
        async getMovies({ commit, state }, params = {}) {
            try {
                commit('SET_LOADING', true)
                const response = await movieAPI.getMovies({
                    ...state.filters,
                    ...params
                })
                commit('SET_MOVIES', {
                    movies: response.data,
                    total: response.total
                })
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得電影詳情
        async getMovieById({ commit }, movieId) {
            try {
                commit('SET_LOADING', true)
                const response = await movieAPI.getMovieById(movieId)
                commit('SET_CURRENT_MOVIE', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 新增電影
        async createMovie({ commit }, movieData) {
            try {
                commit('SET_LOADING', true)
                const response = await movieAPI.createMovie(movieData)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新電影
        async updateMovie({ commit }, { movieId, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await movieAPI.updateMovie(movieId, data)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 刪除電影
        async deleteMovie({ commit }, movieId) {
            try {
                commit('SET_LOADING', true)
                await movieAPI.deleteMovie(movieId)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得場次列表
        async getShowings({ commit }, { movieId, params = {} }) {
            try {
                commit('SET_LOADING', true)
                const response = await movieAPI.getShowings(movieId, params)
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

        // 新增場次
        async createShowing({ commit }, { movieId, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await movieAPI.createShowing(movieId, data)
                commit('ADD_SHOWING', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 更新場次
        async updateShowing({ commit }, { movieId, showingId, data }) {
            try {
                commit('SET_LOADING', true)
                const response = await movieAPI.updateShowing(movieId, showingId, data)
                commit('UPDATE_SHOWING', response)
                return response
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 刪除場次
        async deleteShowing({ commit }, { movieId, showingId }) {
            try {
                commit('SET_LOADING', true)
                await movieAPI.deleteShowing(movieId, showingId)
                commit('DELETE_SHOWING', showingId)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            } finally {
                commit('SET_LOADING', false)
            }
        },

        // 取得電影類別
        async getCategories({ commit }) {
            try {
                const response = await movieAPI.getCategories()
                commit('SET_CATEGORIES', response)
            } catch (error) {
                commit('SET_ERROR', error.message)
                throw error
            }
        },

        // 更新篩選條件
        updateFilters({ commit }, filters) {
            commit('SET_FILTERS', filters)
        }
    },

    getters: {
        // 取得載入狀態
        isLoading: state => state.loading,

        // 取得錯誤訊息
        error: state => state.error,

        // 取得電影列表
        movies: state => state.movies,

        // 取得總數
        total: state => state.total,

        // 取得當前電影
        currentMovie: state => state.currentMovie,

        // 取得場次列表
        showings: state => state.showings,

        // 取得場次總數
        totalShowings: state => state.totalShowings,

        // 取得電影類別
        categories: state => state.categories,

        // 取得篩選條件
        filters: state => state.filters,

        // 依類別分組的電影
        moviesByCategory: state => {
            const grouped = {}
            state.movies.forEach(movie => {
                const category = movie.categoryName || '未分類'
                if (!grouped[category]) {
                    grouped[category] = []
                }
                grouped[category].push(movie)
            })
            return grouped
        },

        // 檢查場次是否可訂位
        canBook: state => showing => {
            return showing.availableSeats > 0 && new Date(showing.showTime) > new Date()
        }
    }
}