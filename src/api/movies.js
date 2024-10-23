import request from '@/utils/request'

const movieAPI = {
    // 取得電影列表
    getMovies(params) {
        return request({
            url: '/movies',
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                categoryId: params?.categoryId,
                movieName: params?.movieName
            }
        })
    },

    // 取得單一電影詳情
    getMovieById(id) {
        return request({
            url: `/movies/${id}`,
            method: 'get'
        })
    },

    // 新增電影（管理員）
    createMovie(data) {
        return request({
            url: '/movies',
            method: 'post',
            data: {
                movieName: data.movieName,
                description: data.description,
                duration: data.duration,
                categoryId: data.categoryId,
                showTime: data.showTime,
                venueId: data.venueId
            }
        })
    },

    // 更新電影資訊（管理員）
    updateMovie(id, data) {
        return request({
            url: `/movies/${id}`,
            method: 'put',
            data: {
                movieName: data.movieName,
                description: data.description,
                duration: data.duration,
                categoryId: data.categoryId,
                showTime: data.showTime,
                venueId: data.venueId
            }
        })
    },

    // 刪除電影（管理員）
    deleteMovie(id) {
        return request({
            url: `/movies/${id}`,
            method: 'delete'
        })
    },

    // 取得電影場次列表
    getShowings(movieId, params) {
        return request({
            url: `/movies/${movieId}/showings`,
            method: 'get',
            params: {
                date: params?.date,
                venueId: params?.venueId
            }
        })
    },

    // 新增電影場次（管理員）
    createShowing(movieId, data) {
        return request({
            url: `/movies/${movieId}/showings`,
            method: 'post',
            data: {
                showTime: data.showTime,
                venueId: data.venueId,
                availableSeats: data.availableSeats
            }
        })
    },

    // 更新場次資訊（管理員）
    updateShowing(movieId, showingId, data) {
        return request({
            url: `/movies/${movieId}/showings/${showingId}`,
            method: 'put',
            data: {
                showTime: data.showTime,
                venueId: data.venueId,
                availableSeats: data.availableSeats
            }
        })
    },

    // 刪除場次（管理員）
    deleteShowing(movieId, showingId) {
        return request({
            url: `/movies/${movieId}/showings/${showingId}`,
            method: 'delete'
        })
    },

    // 查詢場次可用座位
    getAvailableSeats(movieId, showingId) {
        return request({
            url: `/movies/${movieId}/showings/${showingId}/seats`,
            method: 'get'
        })
    },

    // 取得電影評價列表
    getReviews(movieId, params) {
        return request({
            url: `/movies/${movieId}/reviews`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10
            }
        })
    },

    // 新增電影評價
    createReview(movieId, data) {
        return request({
            url: `/movies/${movieId}/reviews`,
            method: 'post',
            data: {
                rating: data.rating,
                comment: data.comment
            }
        })
    },

    // 更新評價
    updateReview(movieId, reviewId, data) {
        return request({
            url: `/movies/${movieId}/reviews/${reviewId}`,
            method: 'put',
            data: {
                rating: data.rating,
                comment: data.comment
            }
        })
    },

    // 刪除評價
    deleteReview(movieId, reviewId) {
        return request({
            url: `/movies/${movieId}/reviews/${reviewId}`,
            method: 'delete'
        })
    },

    // 取得電影類別列表
    getCategories() {
        return request({
            url: '/movie-categories',
            method: 'get'
        })
    },

    // 新增電影類別（管理員）
    createCategory(data) {
        return request({
            url: '/movie-categories',
            method: 'post',
            data: {
                categoryName: data.categoryName
            }
        })
    },

    // 更新電影類別（管理員）
    updateCategory(categoryId, data) {
        return request({
            url: `/movie-categories/${categoryId}`,
            method: 'put',
            data: {
                categoryName: data.categoryName
            }
        })
    },

    // 刪除電影類別（管理員）
    deleteCategory(categoryId) {
        return request({
            url: `/movie-categories/${categoryId}`,
            method: 'delete'
        })
    }
}

export default movieAPI