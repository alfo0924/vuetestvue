// 日期時間格式化工具

// 格式化日期
export const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return d.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

// 格式化日期時間
export const formatDateTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return d.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// 格式化時間
export const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return d.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 格式化金額
export const formatMoney = (amount) => {
    if (typeof amount !== 'number') return '$ 0'
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount)
}

// 格式化電話號碼
export const formatPhone = (phone) => {
    if (!phone) return ''
    // 移除所有非數字字符
    const cleaned = phone.replace(/\D/g, '')
    // 格式化為 09xx-xxx-xxx
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/)
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`
    }
    return phone
}

// 格式化身分證字號
export const formatID = (id) => {
    if (!id) return ''
    // 格式化為 A123456789
    const match = id.match(/^([A-Z])(\d{9})$/)
    if (match) {
        return `${match[1]}${match[2]}`
    }
    return id
}

// 格式化市民卡號
export const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return ''
    // 格式化為 A-123456789
    const match = cardNumber.match(/^([A-Z])(\d{9})$/)
    if (match) {
        return `${match[1]}-${match[2]}`
    }
    return cardNumber
}

// 格式化檔案大小
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 格式化持續時間（分鐘轉為小時和分鐘）
export const formatDuration = (minutes) => {
    if (!minutes) return '0分鐘'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
        return `${hours}小時${mins > 0 ? ` ${mins}分鐘` : ''}`
    }
    return `${mins}分鐘`
}

// 格式化相對時間
export const formatRelativeTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const now = new Date()
    const diff = now - d
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
        return formatDate(date)
    } else if (days > 0) {
        return `${days}天前`
    } else if (hours > 0) {
        return `${hours}小時前`
    } else if (minutes > 0) {
        return `${minutes}分鐘前`
    } else {
        return '剛剛'
    }
}

// 格式化百分比
export const formatPercent = (value, decimals = 0) => {
    if (typeof value !== 'number') return '0%'
    return `${value.toFixed(decimals)}%`
}

// 格式化列表
export const formatList = (list, separator = '、') => {
    if (!Array.isArray(list)) return ''
    return list.join(separator)
}

// 格式化狀態
export const formatStatus = (status) => {
    const statusMap = {
        active: '啟用',
        inactive: '停用',
        pending: '待處理',
        processing: '處理中',
        completed: '已完成',
        cancelled: '已取消',
        failed: '失敗'
    }
    return statusMap[status] || status
}

// 格式化性別
export const formatGender = (gender) => {
    const genderMap = {
        male: '男',
        female: '女',
        other: '其他'
    }
    return genderMap[gender] || gender
}

// 預設導出
export default {
    formatDate,
    formatDateTime,
    formatTime,
    formatMoney,
    formatPhone,
    formatID,
    formatCardNumber,
    formatFileSize,
    formatDuration,
    formatRelativeTime,
    formatPercent,
    formatList,
    formatStatus,
    formatGender
}

// 使用範例：
/*
import { formatDateTime, formatMoney } from '@/utils/format'

// 格式化日期時間
console.log(formatDateTime(new Date())) // 2024/10/24 14:30:00

// 格式化金額
console.log(formatMoney(1234567)) // $ 1,234,567

// 在組件中使用
export default {
  setup() {
    const date = ref(new Date())
    const amount = ref(1000)

    return {
      formattedDate: computed(() => formatDateTime(date.value)),
      formattedAmount: computed(() => formatMoney(amount.value))
    }
  }
}
*/