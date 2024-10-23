import request from '@/utils/request'

// 會員相關 API
export const memberAPI = {
    // 註冊
    register(data) {
        return request({
            url: '/members/register',
            method: 'post',
            data
        })
    },
    // 登入
    login(data) {
        return request({
            url: '/members/login',
            method: 'post',
            data
        })
    },
    // 取得會員資料
    getMemberInfo(id) {
        return request({
            url: `/members/${id}`,
            method: 'get'
        })
    },
    // 更新會員資料
    updateMember(id, data) {
        return request({
            url: `/members/${id}`,
            method: 'put',
            data
        })
    }
}

// 電影相關 API
export const movieAPI = {
    // 取得電影列表
    getMovieList(params) {
        return request({
            url: '/movies',
            method: 'get',
            params
        })
    },
    // 取得電影詳情
    getMovieDetail(id) {
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
            data
        })
    },
    // 更新電影（管理員）
    updateMovie(id, data) {
        return request({
            url: `/movies/${id}`,
            method: 'put',
            data
        })
    },
    // 刪除電影（管理員）
    deleteMovie(id) {
        return request({
            url: `/movies/${id}`,
            method: 'delete'
        })
    }
}

// 訂位相關 API
export const bookingAPI = {
    // 創建訂位
    createBooking(data) {
        return request({
            url: '/bookings',
            method: 'post',
            data
        })
    },
    // 取得訂位列表
    getBookingList(params) {
        return request({
            url: '/bookings',
            method: 'get',
            params
        })
    },
    // 取消訂位
    cancelBooking(id) {
        return request({
            url: `/bookings/${id}/cancel`,
            method: 'put'
        })
    }
}

// 電子錢包相關 API
export const walletAPI = {
    // 取得錢包餘額
    getBalance(memberId) {
        return request({
            url: `/wallets/${memberId}/balance`,
            method: 'get'
        })
    },
    // 儲值
    deposit(memberId, data) {
        return request({
            url: `/wallets/${memberId}/deposit`,
            method: 'post',
            data
        })
    },
    // 支付
    pay(memberId, data) {
        return request({
            url: `/wallets/${memberId}/pay`,
            method: 'post',
            data
        })
    }
}

// 優惠相關 API
export const benefitAPI = {
    // 取得優惠列表
    getBenefitList(params) {
        return request({
            url: '/benefits',
            method: 'get',
            params
        })
    },
    // 使用優惠
    useBenefit(id, data) {
        return request({
            url: `/benefits/${id}/use`,
            method: 'post',
            data
        })
    },
    // 新增優惠（管理員）
    createBenefit(data) {
        return request({
            url: '/benefits',
            method: 'post',
            data
        })
    },
    // 更新優惠（管理員）
    updateBenefit(id, data) {
        return request({
            url: `/benefits/${id}`,
            method: 'put',
            data
        })
    }
}

// 場地相關 API
export const venueAPI = {
    // 取得場地列表
    getVenueList() {
        return request({
            url: '/venues',
            method: 'get'
        })
    },
    // 取得場地詳情
    getVenueDetail(id) {
        return request({
            url: `/venues/${id}`,
            method: 'get'
        })
    },
    // 查詢場地可用座位
    getAvailableSeats(id, showTime) {
        return request({
            url: `/venues/${id}/seats`,
            method: 'get',
            params: { showTime }
        })
    }
}

// 市民卡相關 API
export const citizenCardAPI = {
    // 取得市民卡資訊
    getCardInfo(cardNumber) {
        return request({
            url: `/citizenCards/${cardNumber}`,
            method: 'get'
        })
    },
    // 綁定市民卡
    bindCard(memberId, data) {
        return request({
            url: `/citizenCards/bind/${memberId}`,
            method: 'post',
            data
        })
    }
}

// 系統通知相關 API
export const notificationAPI = {
    // 取得通知列表
    getNotifications(memberId) {
        return request({
            url: `/notifications/${memberId}`,
            method: 'get'
        })
    },
    // 標記通知為已讀
    markAsRead(notificationId) {
        return request({
            url: `/notifications/${notificationId}/read`,
            method: 'put'
        })
    }
}

export default {
    memberAPI,
    movieAPI,
    bookingAPI,
    walletAPI,
    benefitAPI,
    venueAPI,
    citizenCardAPI,
    notificationAPI
}