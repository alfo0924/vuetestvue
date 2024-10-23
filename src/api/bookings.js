import request from '@/utils/request'

const bookingAPI = {
    // 取得訂位列表
    getBookings(params) {
        return request({
            url: '/bookings',
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                memberId: params?.memberId,
                movieId: params?.movieId,
                status: params?.status,
                startDate: params?.startDate,
                endDate: params?.endDate
            }
        })
    },

    // 取得單一訂位詳情
    getBookingById(id) {
        return request({
            url: `/bookings/${id}`,
            method: 'get'
        })
    },

    // 創建新訂位
    createBooking(data) {
        return request({
            url: '/bookings',
            method: 'post',
            data: {
                memberId: data.memberId,
                movieId: data.movieId,
                showingId: data.showingId,
                seatNumber: data.seatNumber,
                bookingTime: new Date().toISOString()
            }
        })
    },

    // 更新訂位資訊
    updateBooking(id, data) {
        return request({
            url: `/bookings/${id}`,
            method: 'put',
            data: {
                seatNumber: data.seatNumber,
                status: data.status
            }
        })
    },

    // 取消訂位
    cancelBooking(id) {
        return request({
            url: `/bookings/${id}/cancel`,
            method: 'put',
            data: {
                status: '已取消'
            }
        })
    },

    // 刪除訂位（管理員）
    deleteBooking(id) {
        return request({
            url: `/bookings/${id}`,
            method: 'delete'
        })
    },

    // 取得會員的訂位歷史
    getMemberBookings(memberId, params) {
        return request({
            url: `/members/${memberId}/bookings`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                status: params?.status
            }
        })
    },

    // 檢查座位可用性
    checkSeatAvailability(showingId, seatNumber) {
        return request({
            url: `/bookings/check-seat`,
            method: 'get',
            params: {
                showingId,
                seatNumber
            }
        })
    },

    // 批量檢查座位可用性
    checkSeatsAvailability(showingId, seatNumbers) {
        return request({
            url: `/bookings/check-seats`,
            method: 'post',
            data: {
                showingId,
                seatNumbers
            }
        })
    },

    // 取得場次的已訂位座位
    getBookedSeats(showingId) {
        return request({
            url: `/bookings/booked-seats/${showingId}`,
            method: 'get'
        })
    },

    // 確認訂位並支付
    confirmAndPay(bookingId, paymentData) {
        return request({
            url: `/bookings/${bookingId}/confirm-pay`,
            method: 'post',
            data: {
                walletId: paymentData.walletId,
                amount: paymentData.amount,
                discountId: paymentData.discountId
            }
        })
    },

    // 取得訂位統計（管理員）
    getBookingStats(params) {
        return request({
            url: '/bookings/stats',
            method: 'get',
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate,
                movieId: params?.movieId,
                venueId: params?.venueId
            }
        })
    },

    // 取得訂位收據
    getBookingReceipt(bookingId) {
        return request({
            url: `/bookings/${bookingId}/receipt`,
            method: 'get'
        })
    },

    // 發送訂位確認通知
    sendBookingConfirmation(bookingId) {
        return request({
            url: `/bookings/${bookingId}/send-confirmation`,
            method: 'post'
        })
    },

    // 取得訂位退款資訊
    getRefundInfo(bookingId) {
        return request({
            url: `/bookings/${bookingId}/refund-info`,
            method: 'get'
        })
    },

    // 申請退款
    requestRefund(bookingId, data) {
        return request({
            url: `/bookings/${bookingId}/refund`,
            method: 'post',
            data: {
                reason: data.reason,
                refundType: data.refundType
            }
        })
    }
}

export default bookingAPI