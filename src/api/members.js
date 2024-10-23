import request from '@/utils/request'

// 會員相關 API
const memberAPI = {
    // 註冊新會員
    register(data) {
        return request({
            url: '/members/register',
            method: 'post',
            data: {
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: '普通用戶'
            }
        })
    },

    // 會員登入
    login(data) {
        return request({
            url: '/members/login',
            method: 'post',
            data: {
                email: data.email,
                password: data.password
            }
        })
    },

    // 取得會員列表 (管理員使用)
    getMembers(params) {
        return request({
            url: '/members',
            method: 'get',
            params: {
                page: params.page || 1,
                pageSize: params.pageSize || 10,
                email: params.email,
                phone: params.phone,
                role: params.role
            }
        })
    },

    // 取得單一會員資料
    getMemberById(id) {
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
            data: {
                email: data.email,
                phone: data.phone,
                password: data.password
            }
        })
    },

    // 刪除會員 (管理員使用)
    deleteMember(id) {
        return request({
            url: `/members/${id}`,
            method: 'delete'
        })
    },

    // 修改會員密碼
    changePassword(id, data) {
        return request({
            url: `/members/${id}/password`,
            method: 'put',
            data: {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            }
        })
    },

    // 重設密碼請求
    requestPasswordReset(email) {
        return request({
            url: '/members/password-reset-request',
            method: 'post',
            data: { email }
        })
    },

    // 執行密碼重設
    resetPassword(data) {
        return request({
            url: '/members/password-reset',
            method: 'post',
            data: {
                token: data.token,
                newPassword: data.newPassword
            }
        })
    },

    // 驗證會員信箱
    verifyEmail(token) {
        return request({
            url: '/members/verify-email',
            method: 'post',
            data: { token }
        })
    },

    // 取得會員優惠列表
    getMemberDiscounts(id) {
        return request({
            url: `/members/${id}/discounts`,
            method: 'get'
        })
    },

    // 取得會員訂位紀錄
    getMemberBookings(id, params) {
        return request({
            url: `/members/${id}/bookings`,
            method: 'get',
            params: {
                page: params.page || 1,
                pageSize: params.pageSize || 10,
                status: params.status
            }
        })
    },

    // 取得會員電子錢包資訊
    getMemberWallet(id) {
        return request({
            url: `/members/${id}/wallet`,
            method: 'get'
        })
    },

    // 取得會員通知
    getMemberNotifications(id, params) {
        return request({
            url: `/members/${id}/notifications`,
            method: 'get',
            params: {
                page: params.page || 1,
                pageSize: params.pageSize || 10,
                isRead: params.isRead
            }
        })
    },

    // 標記通知為已讀
    markNotificationAsRead(memberId, notificationId) {
        return request({
            url: `/members/${memberId}/notifications/${notificationId}`,
            method: 'put',
            data: { isRead: true }
        })
    },

    // 綁定市民卡
    bindCitizenCard(memberId, data) {
        return request({
            url: `/members/${memberId}/citizen-card`,
            method: 'post',
            data: {
                cardNumber: data.cardNumber,
                holderName: data.holderName,
                cardType: data.cardType
            }
        })
    },

    // 取得會員市民卡資訊
    getMemberCitizenCard(memberId) {
        return request({
            url: `/members/${memberId}/citizen-card`,
            method: 'get'
        })
    },

    // 更新會員狀態
    updateMemberStatus(id, data) {
        return request({
            url: `/members/${id}/status`,
            method: 'put',
            data: {
                isActive: data.isActive,
                isVerified: data.isVerified
            }
        })
    }
}

export default memberAPI