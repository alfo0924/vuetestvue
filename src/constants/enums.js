// 用戶角色
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user'
}

// 會員狀態
export const MEMBER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
}

// 卡片類型
export const CARD_TYPES = {
    NORMAL: '一般卡',
    SENIOR: '敬老卡',
    CHARITY: '愛心卡',
    STUDENT: '學生卡'
}

// 身份驗證類型
export const VERIFICATION_TYPES = {
    DIGITAL_ID: '數位身份證明',
    LIBRARY_CARD: '圖書館借書',
    STUDENT_ID: '學生身份驗證',
    EMPLOYEE_ID: '員工身份驗證'
}

// 交易類型
export const TRANSACTION_TYPES = {
    DEPOSIT: '充值',
    PAYMENT: '支付',
    REFUND: '退款'
}

// 優惠類型
export const BENEFIT_TYPES = {
    BUS_DISCOUNT: '公車優惠',
    STORE_DISCOUNT: '特約商店折扣',
    POINTS_EVENT: '政府活動積點',
    LOTTERY: '抽獎參與'
}

// 訂位狀態
export const BOOKING_STATUS = {
    BOOKED: '已預訂',
    CANCELLED: '已取消',
    COMPLETED: '已完成'
}

// 支付狀態
export const PAYMENT_STATUS = {
    UNPAID: '未付款',
    PAID: '已付款',
    REFUNDED: '已退款'
}

// 場地狀態
export const VENUE_STATUS = {
    AVAILABLE: '可用',
    MAINTENANCE: '維護中',
    CLOSED: '已關閉'
}

// 通知類型
export const NOTIFICATION_TYPES = {
    SYSTEM: '系統通知',
    BENEFIT: '優惠通知',
    BOOKING: '訂單通知'
}

// 日誌類型
export const LOG_TYPES = {
    OPERATION: '系統操作',
    ERROR: '錯誤',
    SECURITY: '安全事件'
}

// HTTP 狀態碼
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
}

// 錯誤代碼
export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    SYSTEM_ERROR: 'SYSTEM_ERROR'
}

// 驗證規則
export const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    PHONE_PATTERN: /^09\d{8}$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    CARD_NUMBER_PATTERN: /^[A-Z]\d{9}$/
}

// 分頁設定
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
}

// 日期格式
export const DATE_FORMATS = {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss'
}

// 檔案相關
export const FILE = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    UPLOAD_PATH: '/uploads'
}

// 快取設定
export const CACHE = {
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    EXPIRE_TIME: 24 * 60 * 60 * 1000 // 24小時
}

// API 路徑
export const API_PATHS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout'
    },
    MEMBERS: {
        BASE: '/members',
        PROFILE: '/members/profile',
        VERIFY: '/members/verify'
    },
    CARDS: {
        BASE: '/cards',
        BIND: '/cards/bind',
        UNBIND: '/cards/unbind'
    },
    WALLET: {
        BASE: '/wallet',
        DEPOSIT: '/wallet/deposit',
        WITHDRAW: '/wallet/withdraw'
    },
    BENEFITS: {
        BASE: '/benefits',
        USE: '/benefits/use'
    },
    BOOKINGS: {
        BASE: '/bookings',
        CANCEL: '/bookings/cancel'
    }
}

export default {
    USER_ROLES,
    MEMBER_STATUS,
    CARD_TYPES,
    VERIFICATION_TYPES,
    TRANSACTION_TYPES,
    BENEFIT_TYPES,
    BOOKING_STATUS,
    PAYMENT_STATUS,
    VENUE_STATUS,
    NOTIFICATION_TYPES,
    LOG_TYPES,
    HTTP_STATUS,
    ERROR_CODES,
    VALIDATION_RULES,
    PAGINATION,
    DATE_FORMATS,
    FILE,
    CACHE,
    API_PATHS
}