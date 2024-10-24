/**
 * 本地存儲工具類
 */

// 預設過期時間（24小時）
const DEFAULT_EXPIRE = 24 * 60 * 60 * 1000

// 存儲前缀
const PREFIX = 'citizen_card_'

/**
 * 本地存儲類
 */
class Storage {
    /**
     * 設置存儲項目
     * @param {string} key 鍵名
     * @param {any} value 值
     * @param {number} expire 過期時間（毫秒）
     */
    set(key, value, expire = DEFAULT_EXPIRE) {
        const data = {
            value,
            expire: expire ? new Date().getTime() + expire : null
        }
        localStorage.setItem(PREFIX + key, JSON.stringify(data))
    }

    /**
     * 獲取存儲項目
     * @param {string} key 鍵名
     * @param {any} defaultValue 默認值
     * @returns {any} 存儲值
     */
    get(key, defaultValue = null) {
        const item = localStorage.getItem(PREFIX + key)
        if (!item) return defaultValue

        try {
            const data = JSON.parse(item)
            const { value, expire } = data

            // 檢查是否過期
            if (expire && expire < new Date().getTime()) {
                this.remove(key)
                return defaultValue
            }

            return value
        } catch (error) {
            console.error('Parse storage error:', error)
            return defaultValue
        }
    }

    /**
     * 移除存儲項目
     * @param {string} key 鍵名
     */
    remove(key) {
        localStorage.removeItem(PREFIX + key)
    }

    /**
     * 清空所有存儲
     */
    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(PREFIX)) {
                localStorage.removeItem(key)
            }
        })
    }

    /**
     * 獲取所有存儲項目
     * @returns {Object} 存儲項目對象
     */
    getAll() {
        const items = {}
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(PREFIX)) {
                const realKey = key.replace(PREFIX, '')
                items[realKey] = this.get(realKey)
            }
        })
        return items
    }

    /**
     * 設置會話存儲
     * @param {string} key 鍵名
     * @param {any} value 值
     */
    setSession(key, value) {
        sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
    }

    /**
     * 獲取會話存儲
     * @param {string} key 鍵名
     * @param {any} defaultValue 默認值
     * @returns {any} 存儲值
     */
    getSession(key, defaultValue = null) {
        const item = sessionStorage.getItem(PREFIX + key)
        if (!item) return defaultValue

        try {
            return JSON.parse(item)
        } catch (error) {
            console.error('Parse session storage error:', error)
            return defaultValue
        }
    }

    /**
     * 移除會話存儲
     * @param {string} key 鍵名
     */
    removeSession(key) {
        sessionStorage.removeItem(PREFIX + key)
    }

    /**
     * 清空所有會話存儲
     */
    clearSession() {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(PREFIX)) {
                sessionStorage.removeItem(key)
            }
        })
    }

    /**
     * 設置 Cookie
     * @param {string} key 鍵名
     * @param {string} value 值
     * @param {number} days Cookie 有效天數
     */
    setCookie(key, value, days = 7) {
        const date = new Date()
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
        document.cookie = `${PREFIX}${key}=${value};expires=${date.toUTCString()};path=/`
    }

    /**
     * 獲取 Cookie
     * @param {string} key 鍵名
     * @returns {string} Cookie 值
     */
    getCookie(key) {
        const name = PREFIX + key + '='
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
            cookie = cookie.trim()
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length)
            }
        }
        return ''
    }

    /**
     * 移除 Cookie
     * @param {string} key 鍵名
     */
    removeCookie(key) {
        this.setCookie(key, '', -1)
    }

    /**
     * 檢查存儲項目是否存在
     * @param {string} key 鍵名
     * @returns {boolean} 是否存在
     */
    has(key) {
        return !!localStorage.getItem(PREFIX + key)
    }

    /**
     * 檢查會話存儲項目是否存在
     * @param {string} key 鍵名
     * @returns {boolean} 是否存在
     */
    hasSession(key) {
        return !!sessionStorage.getItem(PREFIX + key)
    }

    /**
     * 獲取存儲大小
     * @returns {number} 存儲大小（字節）
     */
    size() {
        let size = 0
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(PREFIX)) {
                size += localStorage.getItem(key).length
            }
        })
        return size
    }

    /**
     * 訂閱存儲變化
     * @param {Function} callback 回調函數
     */
    subscribe(callback) {
        window.addEventListener('storage', event => {
            if (event.key && event.key.startsWith(PREFIX)) {
                const key = event.key.replace(PREFIX, '')
                callback(key, this.get(key))
            }
        })
    }
}

// 導出單例
export default new Storage()

/* 使用範例：

// 設置存儲
storage.set('token', 'xxx')
storage.set('userInfo', { name: 'John' }, 7 * 24 * 60 * 60 * 1000) // 7天過期

// 獲取存儲
const token = storage.get('token')
const userInfo = storage.get('userInfo', {}) // 設置默認值

// 移除存儲
storage.remove('token')

// 清空所有存儲
storage.clear()

// 會話存儲
storage.setSession('tempData', { id: 1 })
const tempData = storage.getSession('tempData')

// Cookie 操作
storage.setCookie('theme', 'dark')
const theme = storage.getCookie('theme')

// 訂閱存儲變化
storage.subscribe((key, value) => {
  console.log(`Storage changed: ${key} = ${value}`)
})
*/