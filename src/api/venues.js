import request from '@/utils/request'

const venueAPI = {
    // 取得場地列表
    getVenues(params) {
        return request({
            url: '/venues',
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                venueName: params?.venueName
            }
        })
    },

    // 取得單一場地詳情
    getVenueById(id) {
        return request({
            url: `/venues/${id}`,
            method: 'get'
        })
    },

    // 新增場地（管理員）
    createVenue(data) {
        return request({
            url: '/venues',
            method: 'post',
            data: {
                venueName: data.venueName,
                seatCount: data.seatCount,
                address: data.address,
                capacity: data.capacity
            }
        })
    },

    // 更新場地資訊（管理員）
    updateVenue(id, data) {
        return request({
            url: `/venues/${id}`,
            method: 'put',
            data: {
                venueName: data.venueName,
                seatCount: data.seatCount,
                address: data.address,
                capacity: data.capacity
            }
        })
    },

    // 刪除場地（管理員）
    deleteVenue(id) {
        return request({
            url: `/venues/${id}`,
            method: 'delete'
        })
    },

    // 取得場地座位配置
    getVenueSeats(id) {
        return request({
            url: `/venues/${id}/seats`,
            method: 'get'
        })
    },

    // 更新場地座位配置（管理員）
    updateVenueSeats(id, data) {
        return request({
            url: `/venues/${id}/seats`,
            method: 'put',
            data: {
                seatConfiguration: data.seatConfiguration
            }
        })
    },

    // 檢查場地可用性
    checkVenueAvailability(id, params) {
        return request({
            url: `/venues/${id}/availability`,
            method: 'get',
            params: {
                date: params.date,
                startTime: params.startTime,
                endTime: params.endTime
            }
        })
    },

    // 取得場地排程
    getVenueSchedule(id, params) {
        return request({
            url: `/venues/${id}/schedule`,
            method: 'get',
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate
            }
        })
    },

    // 新增場地排程（管理員）
    createVenueSchedule(id, data) {
        return request({
            url: `/venues/${id}/schedule`,
            method: 'post',
            data: {
                movieId: data.movieId,
                showTime: data.showTime,
                duration: data.duration
            }
        })
    },

    // 取得場地使用統計
    getVenueStats(id, params) {
        return request({
            url: `/venues/${id}/stats`,
            method: 'get',
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate
            }
        })
    },

    // 取得場地維護記錄
    getVenueMaintenance(id, params) {
        return request({
            url: `/venues/${id}/maintenance`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10
            }
        })
    },

    // 新增維護記錄（管理員）
    createMaintenance(id, data) {
        return request({
            url: `/venues/${id}/maintenance`,
            method: 'post',
            data: {
                maintenanceType: data.maintenanceType,
                description: data.description,
                maintenanceDate: data.maintenanceDate
            }
        })
    },

    // 更新場地狀態（管理員）
    updateVenueStatus(id, data) {
        return request({
            url: `/venues/${id}/status`,
            method: 'put',
            data: {
                status: data.status,
                reason: data.reason
            }
        })
    },

    // 取得場地評價
    getVenueReviews(id, params) {
        return request({
            url: `/venues/${id}/reviews`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10
            }
        })
    },

    // 新增場地評價
    createVenueReview(id, data) {
        return request({
            url: `/venues/${id}/reviews`,
            method: 'post',
            data: {
                rating: data.rating,
                comment: data.comment
            }
        })
    }
}

export default venueAPI