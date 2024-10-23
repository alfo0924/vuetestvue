import request from '@/utils/request'

const walletAPI = {
    // 取得錢包資訊
    getWallet(memberId) {
        return request({
            url: `/wallets/${memberId}`,
            method: 'get'
        })
    },

    // 取得錢包餘額
    getBalance(memberId) {
        return request({
            url: `/wallets/${memberId}/balance`,
            method: 'get'
        })
    },

    // 建立錢包（新會員註冊時）
    createWallet(memberId) {
        return request({
            url: '/wallets',
            method: 'post',
            data: {
                memberId
            }
        })
    },

    // 儲值
    deposit(memberId, data) {
        return request({
            url: `/wallets/${memberId}/deposit`,
            method: 'post',
            data: {
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                transactionTime: new Date().toISOString()
            }
        })
    },

    // 支付
    pay(memberId, data) {
        return request({
            url: `/wallets/${memberId}/pay`,
            method: 'post',
            data: {
                amount: data.amount,
                description: data.description,
                transactionTime: new Date().toISOString()
            }
        })
    },

    // 退款
    refund(memberId, data) {
        return request({
            url: `/wallets/${memberId}/refund`,
            method: 'post',
            data: {
                amount: data.amount,
                originalTransactionId: data.originalTransactionId,
                reason: data.reason,
                transactionTime: new Date().toISOString()
            }
        })
    },

    // 取得交易紀錄
    getTransactions(memberId, params) {
        return request({
            url: `/wallets/${memberId}/transactions`,
            method: 'get',
            params: {
                page: params?.page || 1,
                pageSize: params?.pageSize || 10,
                startDate: params?.startDate,
                endDate: params?.endDate,
                transactionType: params?.transactionType
            }
        })
    },

    // 取得特定交易詳情
    getTransactionDetail(memberId, transactionId) {
        return request({
            url: `/wallets/${memberId}/transactions/${transactionId}`,
            method: 'get'
        })
    },

    // 凍結錢包（管理員）
    freezeWallet(memberId, data) {
        return request({
            url: `/wallets/${memberId}/freeze`,
            method: 'put',
            data: {
                reason: data.reason,
                freezeDuration: data.freezeDuration
            }
        })
    },

    // 解凍錢包（管理員）
    unfreezeWallet(memberId) {
        return request({
            url: `/wallets/${memberId}/unfreeze`,
            method: 'put'
        })
    },

    // 設定交易限額
    setTransactionLimit(memberId, data) {
        return request({
            url: `/wallets/${memberId}/limit`,
            method: 'put',
            data: {
                dailyLimit: data.dailyLimit,
                singleTransactionLimit: data.singleTransactionLimit
            }
        })
    },

    // 檢查交易限額
    checkTransactionLimit(memberId, amount) {
        return request({
            url: `/wallets/${memberId}/check-limit`,
            method: 'get',
            params: { amount }
        })
    },

    // 取得錢包統計資訊
    getWalletStats(memberId, params) {
        return request({
            url: `/wallets/${memberId}/stats`,
            method: 'get',
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate
            }
        })
    },

    // 產生交易報表
    generateTransactionReport(memberId, params) {
        return request({
            url: `/wallets/${memberId}/transaction-report`,
            method: 'get',
            params: {
                startDate: params?.startDate,
                endDate: params?.endDate,
                format: params?.format || 'pdf'
            },
            responseType: 'blob' // 用於下載檔案
        })
    }
}

export default walletAPI