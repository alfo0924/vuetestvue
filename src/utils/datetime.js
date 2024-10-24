import {
    format,
    formatDistance,
    formatRelative,
    addDays,
    subDays,
    addMonths,
    subMonths,
    addYears,
    subYears,
    isValid,
    isBefore,
    isAfter,
    isSameDay,
    parseISO,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    differenceInDays,
    differenceInMonths,
    differenceInYears
} from 'date-fns'
import { zhTW } from 'date-fns/locale'

// 基本格式化選項
const DEFAULT_FORMAT = 'yyyy-MM-dd'
const DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'
const DEFAULT_TIME_FORMAT = 'HH:mm:ss'
const DEFAULT_MONTH_FORMAT = 'yyyy-MM'
const DEFAULT_YEAR_FORMAT = 'yyyy'

/**
 * 日期時間工具類
 */
export default class DateTime {
    /**
     * 格式化日期
     * @param {Date|string|number} date 日期物件或可解析的日期字串
     * @param {string} formatStr 格式化字串
     * @returns {string} 格式化後的日期字串
     */
    static format(date, formatStr = DEFAULT_FORMAT) {
        if (!date) return ''
        try {
            const dateObj = typeof date === 'string' ? parseISO(date) : date
            if (!isValid(dateObj)) return ''
            return format(dateObj, formatStr, { locale: zhTW })
        } catch (error) {
            console.error('Date format error:', error)
            return ''
        }
    }

    /**
     * 格式化日期時間
     * @param {Date|string|number} date 日期物件
     * @returns {string} 格式化後的日期時間字串
     */
    static formatDateTime(date) {
        return this.format(date, DEFAULT_DATETIME_FORMAT)
    }

    /**
     * 格式化時間
     * @param {Date|string|number} date 日期物件
     * @returns {string} 格式化後的時間字串
     */
    static formatTime(date) {
        return this.format(date, DEFAULT_TIME_FORMAT)
    }

    /**
     * 格式化相對時間
     * @param {Date|string|number} date 日期物件
     * @param {Date} baseDate 基準日期
     * @returns {string} 相對時間字串
     */
    static formatRelative(date, baseDate = new Date()) {
        if (!date) return ''
        try {
            const dateObj = typeof date === 'string' ? parseISO(date) : date
            if (!isValid(dateObj)) return ''
            return formatRelative(dateObj, baseDate, { locale: zhTW })
        } catch (error) {
            console.error('Date relative format error:', error)
            return ''
        }
    }

    /**
     * 格式化時間距離
     * @param {Date|string|number} date 日期物件
     * @param {Date} baseDate 基準日期
     * @returns {string} 時間距離字串
     */
    static formatDistance(date, baseDate = new Date()) {
        if (!date) return ''
        try {
            const dateObj = typeof date === 'string' ? parseISO(date) : date
            if (!isValid(dateObj)) return ''
            return formatDistance(dateObj, baseDate, {
                addSuffix: true,
                locale: zhTW
            })
        } catch (error) {
            console.error('Date distance format error:', error)
            return ''
        }
    }

    /**
     * 解析日期字串
     * @param {string} dateStr 日期字串
     * @returns {Date} 日期物件
     */
    static parse(dateStr) {
        if (!dateStr) return null
        try {
            const date = parseISO(dateStr)
            return isValid(date) ? date : null
        } catch (error) {
            console.error('Date parse error:', error)
            return null
        }
    }

    /**
     * 增加天數
     * @param {Date} date 日期物件
     * @param {number} amount 天數
     * @returns {Date} 新的日期物件
     */
    static addDays(date, amount) {
        return addDays(date, amount)
    }

    /**
     * 減少天數
     * @param {Date} date 日期物件
     * @param {number} amount 天數
     * @returns {Date} 新的日期物件
     */
    static subDays(date, amount) {
        return subDays(date, amount)
    }

    /**
     * 增加月數
     * @param {Date} date 日期物件
     * @param {number} amount 月數
     * @returns {Date} 新的日期物件
     */
    static addMonths(date, amount) {
        return addMonths(date, amount)
    }

    /**
     * 減少月數
     * @param {Date} date 日期物件
     * @param {number} amount 月數
     * @returns {Date} 新的日期物件
     */
    static subMonths(date, amount) {
        return subMonths(date, amount)
    }

    /**
     * 增加年數
     * @param {Date} date 日期物件
     * @param {number} amount 年數
     * @returns {Date} 新的日期物件
     */
    static addYears(date, amount) {
        return addYears(date, amount)
    }

    /**
     * 減少年數
     * @param {Date} date 日期物件
     * @param {number} amount 年數
     * @returns {Date} 新的日期物件
     */
    static subYears(date, amount) {
        return subYears(date, amount)
    }

    /**
     * 檢查日期是否在之前
     * @param {Date} date 要檢查的日期
     * @param {Date} compareDate 比較的日期
     * @returns {boolean} 是否在之前
     */
    static isBefore(date, compareDate) {
        return isBefore(date, compareDate)
    }

    /**
     * 檢查日期是否在之後
     * @param {Date} date 要檢查的日期
     * @param {Date} compareDate 比較的日期
     * @returns {boolean} 是否在之後
     */
    static isAfter(date, compareDate) {
        return isAfter(date, compareDate)
    }

    /**
     * 檢查是否為同一天
     * @param {Date} dateLeft 第一個日期
     * @param {Date} dateRight 第二個日期
     * @returns {boolean} 是否為同一天
     */
    static isSameDay(dateLeft, dateRight) {
        return isSameDay(dateLeft, dateRight)
    }

    /**
     * 取得日期區間天數
     * @param {Date} startDate 開始日期
     * @param {Date} endDate 結束日期
     * @returns {number} 天數
     */
    static getDaysDiff(startDate, endDate) {
        return differenceInDays(endDate, startDate)
    }

    /**
     * 取得日期區間月數
     * @param {Date} startDate 開始日期
     * @param {Date} endDate 結束日期
     * @returns {number} 月數
     */
    static getMonthsDiff(startDate, endDate) {
        return differenceInMonths(endDate, startDate)
    }

    /**
     * 取得日期區間年數
     * @param {Date} startDate 開始日期
     * @param {Date} endDate 結束日期
     * @returns {number} 年數
     */
    static getYearsDiff(startDate, endDate) {
        return differenceInYears(endDate, startDate)
    }

    /**
     * 取得日期的開始時間
     * @param {Date} date 日期物件
     * @returns {Date} 該日開始時間
     */
    static startOfDay(date) {
        return startOfDay(date)
    }

    /**
     * 取得日期的結束時間
     * @param {Date} date 日期物件
     * @returns {Date} 該日結束時間
     */
    static endOfDay(date) {
        return endOfDay(date)
    }

    /**
     * 取得週的開始時間
     * @param {Date} date 日期物件
     * @returns {Date} 該週開始時間
     */
    static startOfWeek(date) {
        return startOfWeek(date, { locale: zhTW })
    }

    /**
     * 取得週的結束時間
     * @param {Date} date 日期物件
     * @returns {Date} 該週結束時間
     */
    static endOfWeek(date) {
        return endOfWeek(date, { locale: zhTW })
    }

    /**
     * 取得月的開始時間
     * @param {Date} date 日期物件
     * @returns {Date} 該月開始時間
     */
    static startOfMonth(date) {
        return startOfMonth(date)
    }

    /**
     * 取得月的結束時間
     * @param {Date} date 日期物件
     * @returns {Date} 該月結束時間
     */
    static endOfMonth(date) {
        return endOfMonth(date)
    }
}