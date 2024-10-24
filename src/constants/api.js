// API 基礎路徑
export const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

// API 版本
export const API_VERSION = 'v1'

// API 完整路徑
export const API_URL = `${API_BASE_URL}/${API_VERSION}`

// API 端點
export const API_ENDPOINTS = {
    // 認證相關
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
        VERIFY_EMAIL: '/auth/verify-email',
        RESET_PASSWORD: '/auth/reset-password',
        CHANGE_PASSWORD: '/auth/change-password',
        CHECK_EMAIL: '/auth/check-email',
        GET_PROFILE: '/auth/profile'
    },

    // 會員相關
    MEMBERS: {
        BASE: '/members',
        GET_ALL: '/members',
        GET_BY_ID: (id) => `/members/${id}`,
        CREATE: '/members',
        UPDATE: (id) => `/members/${id}`,
        DELETE: (id) => `/members/${id}`,
        UPDATE_STATUS: (id) => `/members/${id}/status`,
        VERIFY: (id) => `/members/${id}/verify`
    },

    // 市民卡相關
    CITIZEN_CARDS: {
        BASE: '/citizen-cards',
        GET_ALL: '/citizen-cards',
        GET_BY_NUMBER: (number) => `/citizen-cards/${number}`,
        CREATE: '/citizen-cards',
        UPDATE: (number) => `/citizen-cards/${number}`,
        DELETE: (number) => `/citizen-cards/${number}`,
        BIND_MEMBER: (number) => `/citizen-cards/${number}/bind`,
        UNBIND_MEMBER: (number) => `/citizen-cards/${number}/unbind`,
        REPORT_LOSS: (number) => `/citizen-cards/${number}/report-loss`,
        REPLACE: (number) => `/citizen-cards/${number}/replace`
    },

    // 電影相關
    MOVIES: {
        BASE: '/movies',
        GET_ALL: '/movies',
        GET_BY_ID: (id) => `/movies/${id}`,
        CREATE: '/movies',
        UPDATE: (id) => `/movies/${id}`,
        DELETE: (id) => `/movies/${id}`,
        GET_SHOWINGS: (id) => `/movies/${id}/showings`,
        CREATE_SHOWING: (id) => `/movies/${id}/showings`,
        UPDATE_SHOWING: (id, showingId) => `/movies/${id}/showings/${showingId}`,
        DELETE_SHOWING: (id, showingId) => `/movies/${id}/showings/${showingId}`
    },

    // 場地相關
    VENUES: {
        BASE: '/venues',
        GET_ALL: '/venues',
        GET_BY_ID: (id) => `/venues/${id}`,
        CREATE: '/venues',
        UPDATE: (id) => `/venues/${id}`,
        DELETE: (id) => `/venues/${id}`,
        GET_SCHEDULE: (id) => `/venues/${id}/schedule`,
        GET_MAINTENANCE: (id) => `/venues/${id}/maintenance`
    },

    // 訂位相關
    BOOKINGS: {
        BASE: '/bookings',
        GET_ALL: '/bookings',
        GET_BY_ID: (id) => `/bookings/${id}`,
        CREATE: '/bookings',
        UPDATE: (id) => `/bookings/${id}`,
        DELETE: (id) => `/bookings/${id}`,
        CANCEL: (id) => `/bookings/${id}/cancel`,
        CHECK_SEAT: '/bookings/check-seat',
        GET_RECEIPT: (id) => `/bookings/${id}/receipt`
    },

    // 優惠相關
    BENEFITS: {
        BASE: '/benefits',
        GET_ALL: '/benefits',
        GET_BY_ID: (id) => `/benefits/${id}`,
        CREATE: '/benefits',
        UPDATE: (id) => `/benefits/${id}`,
        DELETE: (id) => `/benefits/${id}`,
        USE: (id) => `/benefits/${id}/use`,
        GET_USAGE_HISTORY: (id) => `/benefits/${id}/usage-history`,
        GET_STATS: (id) => `/benefits/${id}/stats`
    },

    // 電子錢包相關
    WALLETS: {
        BASE: '/wallets',
        GET_BALANCE: '/wallets/balance',
        DEPOSIT: '/wallets/deposit',
        WITHDRAW: '/wallets/withdraw',
        TRANSFER: '/wallets/transfer',
        GET_TRANSACTIONS: '/wallets/transactions',
        GET_TRANSACTION: (id) => `/wallets/transactions/${id}`,
        UPDATE_LIMITS: '/wallets/limits'
    },

    // 通知相關
    NOTIFICATIONS: {
        BASE: '/notifications',
        GET_ALL: '/notifications',
        GET_BY_ID: (id) => `/notifications/${id}`,
        MARK_AS_READ: (id) => `/notifications/${id}/read`,
        MARK_ALL_AS_READ: '/notifications/read-all',
        GET_UNREAD_COUNT: '/notifications/unread-count'
    },

    // 系統相關
    SYSTEM: {
        GET_SETTINGS: '/system/settings',
        UPDATE_SETTINGS: '/system/settings',
        GET_LOGS: '/system/logs',
        GET_STATS: '/system/stats'
    },

    // 上傳相關
    UPLOAD: {
        IMAGE: '/upload/image',
        FILE: '/upload/file',
        VERIFICATION: '/upload/verification'
    }
}

// HTTP 方法
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
}

// API 錯誤碼
export const API_ERROR_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500
}

// API 請求超時時間 (毫秒)
export const API_TIMEOUT = 15000

// API 請求重試次數
export const API_RETRY_TIMES = 3

// API 請求重試延遲時間 (毫秒)
export const API_RETRY_DELAY = 1000

export default {
    API_BASE_URL,
    API_VERSION,
    API_URL,
    API_ENDPOINTS,
    HTTP_METHODS,
    API_ERROR_CODES,
    API_TIMEOUT,
    API_RETRY_TIMES,
    API_RETRY_DELAY
}