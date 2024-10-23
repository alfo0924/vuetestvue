import request from '@/utils/request'

const benefitAPI = {
    // 取得優惠列表
    getBenefits(params) {
        return request({
            url: '/benefits',
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                benefitType: params?.benefitType,
                isActive: params?.isActive
            }
        })
    },

    // 取得單一優惠詳情
    getBenefitById(id) {
        return request({
            url: `/benefits/${id}`,
            method: 'get'
        })
    },

    // 新增優惠（管理員）
    createBenefit(data) {
        return request({
            url: '/benefits',
            method: 'post',
            data: {
                benefitName: data.benefitName,
                benefitType: data.benefitType,
                description: data.description,
                validUntil: data.validUntil,
                usageLimit: data.usageLimit
            }
        })
    },

    // 更新優惠資訊（管理員）
    updateBenefit(id, data) {
        return request({
            url: `/benefits/${id}`,
            method: 'put',
            data: {
                benefitName: data.benefitName,
                benefitType: data.benefitType,
                description: data.description,
                validUntil: data.validUntil,
                usageLimit: data.usageLimit
            }
        })
    },

    // 刪除優惠（管理員）
    deleteBenefit(id) {
        return request({
            url: `/benefits/${id}`,
            method: 'delete'
        })
    },

    // 取得會員的優惠列表
    getMemberBenefits(memberId, params) {
        return request({
            url: `/members/${memberId}/benefits`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                isUsed: params?.isUsed
            }
        })
    },

    // 使用優惠
    useBenefit(memberId, benefitId, data) {
        return request({
            url: `/benefits/${benefitId}/use`,
            method: 'post',
            data: {
                memberId,
                usageAmount: data.usageAmount,
                transactionId: data.transactionId
            }
        })
    },

    // 檢查優惠可用性
    checkBenefitAvailability(memberId, benefitId) {
        return request({
            url: `/benefits/${benefitId}/check-availability`,
            method: 'get',
            params: { memberId }
        })
    },

    // 取得優惠使用紀錄
    getBenefitUsageHistory(benefitId, params) {
        return request({
            url: `/benefits/${benefitId}/usage-history`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                startDate: params?.startDate,
                endDate: params?.endDate
            }
        })
    },

    // 取得優惠統計資料（管理員）
    getBenefitStats(params) {
        return request({
            url: '/benefits/stats',
            method: 'get',
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate,
                benefitType: params?.benefitType
            }
        })
    },

    // 批量新增優惠（管理員）
    batchCreateBenefits(benefitsData) {
        return request({
            url: '/benefits/batch',
            method: 'post',
            data: benefitsData
        })
    },

    // 批量更新優惠狀態（管理員）
    batchUpdateBenefitsStatus(data) {
        return request({
            url: '/benefits/batch-status',
            method: 'put',
            data: {
                benefitIds: data.benefitIds,
                isActive: data.isActive
            }
        })
    },

    // 複製優惠（管理員）
    cloneBenefit(benefitId, data) {
        return request({
            url: `/benefits/${benefitId}/clone`,
            method: 'post',
            data: {
                newBenefitName: data.newBenefitName,
                validUntil: data.validUntil
            }
        })
    },

    // 取得優惠類別列表
    getBenefitCategories() {
        return request({
            url: '/benefit-categories',
            method: 'get'
        })
    },

    // 驗證優惠碼
    validateBenefitCode(code) {
        return request({
            url: '/benefits/validate-code',
            method: 'post',
            data: { code }
        })
    }
}

export default benefitAPI