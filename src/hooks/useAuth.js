import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { validate } from '@/utils/validation'

export default function useAuth() {
    const store = useStore()
    const router = useRouter()

    // 載入狀態
    const loading = ref(false)
    const error = ref(null)

    // 表單資料
    const loginForm = ref({
        email: '',
        password: ''
    })

    const registerForm = ref({
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    })

    // 表單驗證規則
    const loginRules = {
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            minLength: 6
        }
    }

    const registerRules = {
        email: {
            required: true,
            email: true
        },
        password: {
            required: true,
            minLength: 6
        },
        confirmPassword: {
            required: true,
            custom: (value) => {
                if (value !== registerForm.value.password) {
                    return '密碼不一致'
                }
            }
        },
        phone: {
            required: true,
            phone: true
        }
    }

    // 計算屬性
    const isLoggedIn = computed(() => store.state.auth.isLoggedIn)
    const user = computed(() => store.state.auth.user)
    const userRole = computed(() => store.state.auth.userRole)

    // 登入方法
    const login = async () => {
        try {
            // 驗證表單
            const errors = validate(loginForm.value, loginRules)
            if (Object.keys(errors).length > 0) {
                error.value = '請檢查輸入資料'
                return
            }

            loading.value = true
            await store.dispatch('auth/login', loginForm.value)

            // 登入成功後導向首頁或指定頁面
            const redirect = router.currentRoute.value.query.redirect || '/'
            router.push(redirect)
        } catch (err) {
            error.value = err.message || '登入失敗'
        } finally {
            loading.value = false
        }
    }

    // 註冊方法
    const register = async () => {
        try {
            // 驗證表單
            const errors = validate(registerForm.value, registerRules)
            if (Object.keys(errors).length > 0) {
                error.value = '請檢查輸入資料'
                return
            }

            loading.value = true
            await store.dispatch('auth/register', registerForm.value)

            // 註冊成功後自動登入
            await store.dispatch('auth/login', {
                email: registerForm.value.email,
                password: registerForm.value.password
            })

            router.push('/')
        } catch (err) {
            error.value = err.message || '註冊失敗'
        } finally {
            loading.value = false
        }
    }

    // 登出方法
    const logout = async () => {
        try {
            loading.value = true
            await store.dispatch('auth/logout')
            router.push('/login')
        } catch (err) {
            error.value = err.message || '登出失敗'
        } finally {
            loading.value = false
        }
    }

    // 更新個人資料
    const updateProfile = async (data) => {
        try {
            loading.value = true
            await store.dispatch('auth/updateUserInfo', data)
        } catch (err) {
            error.value = err.message || '更新失敗'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 更改密碼
    const changePassword = async (data) => {
        try {
            loading.value = true
            await store.dispatch('auth/changePassword', data)
        } catch (err) {
            error.value = err.message || '密碼更改失敗'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 重設密碼
    const resetPassword = async (email) => {
        try {
            loading.value = true
            await store.dispatch('auth/resetPassword', email)
        } catch (err) {
            error.value = err.message || '重設密碼失敗'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 驗證信箱
    const verifyEmail = async (token) => {
        try {
            loading.value = true
            await store.dispatch('auth/verifyEmail', token)
        } catch (err) {
            error.value = err.message || '信箱驗證失敗'
            throw err
        } finally {
            loading.value = false
        }
    }

    // 檢查權限
    const hasPermission = (permission) => {
        return store.getters['auth/hasPermission'](permission)
    }

    // 清除錯誤
    const clearError = () => {
        error.value = null
    }

    return {
        // 狀態
        loading,
        error,
        isLoggedIn,
        user,
        userRole,

        // 表單
        loginForm,
        registerForm,

        // 方法
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        resetPassword,
        verifyEmail,
        hasPermission,
        clearError
    }
}