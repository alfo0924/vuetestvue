import request from '@/utils/request'

const citizenCardAPI = {
    // 取得市民卡列表（管理員）
    getCitizenCards(params) {
        return request({
            url: '/citizen-cards',
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                cardType: params?.cardType,
                holderName: params?.holderName
            }
        })
    },

    // 取得單一市民卡資訊
    getCitizenCardByNumber(cardNumber) {
        return request({
            url: `/citizen-cards/${cardNumber}`,
            method: 'get'
        })
    },

    // 綁定市民卡到會員帳號
    bindCard(data) {
        return request({
            url: '/citizen-cards/bind',
            method: 'post',
            data: {
                memberId: data.memberId,
                cardNumber: data.cardNumber,
                holderName: data.holderName,
                cardType: data.cardType
            }
        })
    },

    // 解除市民卡綁定
    unbindCard(cardNumber) {
        return request({
            url: `/citizen-cards/${cardNumber}/unbind`,
            method: 'put'
        })
    },

    // 更新市民卡資訊
    updateCard(cardNumber, data) {
        return request({
            url: `/citizen-cards/${cardNumber}`,
            method: 'put',
            data: {
                holderName: data.holderName,
                cardType: data.cardType
            }
        })
    },

    // 驗證市民卡身份
    verifyIdentity(cardNumber, data) {
        return request({
            url: `/citizen-cards/${cardNumber}/verify`,
            method: 'post',
            data: {
                verificationType: data.verificationType,
                verificationData: data.verificationData
            }
        })
    },

    // 取得市民卡交易紀錄
    getCardTransactions(cardNumber, params) {
        return request({
            url: `/citizen-cards/${cardNumber}/transactions`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                startDate: params?.startDate,
                endDate: params?.endDate
            }
        })
    },

    // 取得市民卡優惠使用紀錄
    getCardBenefitUsage(cardNumber, params) {
        return request({
            url: `/citizen-cards/${cardNumber}/benefits-usage`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                benefitType: params?.benefitType
            }
        })
    },

    // 市民卡掛失
    reportLoss(cardNumber, data) {
        return request({
            url: `/citizen-cards/${cardNumber}/report-loss`,
            method: 'put',
            data: {
                reason: data.reason,
                contactPhone: data.contactPhone
            }
        })
    },

    // 補發市民卡
    replaceCard(oldCardNumber, data) {
        return request({
            url: `/citizen-cards/${oldCardNumber}/replace`,
            method: 'post',
            data: {
                newCardNumber: data.newCardNumber,
                reason: data.reason
            }
        })
    },

    // 檢查市民卡狀態
    checkCardStatus(cardNumber) {
        return request({
            url: `/citizen-cards/${cardNumber}/status`,
            method: 'get'
        })
    },

    // 取得市民卡類型列表
    getCardTypes() {
        return request({
            url: '/citizen-cards/types',
            method: 'get'
        })
    },

    // 驗證市民卡資格（例如：敬老卡、學生卡）
    verifyCardEligibility(data) {
        return request({
            url: '/citizen-cards/verify-eligibility',
            method: 'post',
            data: {
                cardType: data.cardType,
                identityDocuments: data.identityDocuments
            }
        })
    }
}

export default citizenCardAPI