import { ref, reactive, computed } from 'vue'
import { validate } from '@/utils/validation'

export default function useForm(initialValues = {}, validationRules = {}, onSubmit = null) {
    // 表單數據
    const formData = reactive({ ...initialValues })

    // 表單狀態
    const state = reactive({
        // 載入狀態
        loading: false,
        // 提交狀態
        submitted: false,
        // 錯誤訊息
        errors: {},
        // 是否已修改
        dirty: false,
        // 已觸碰的欄位
        touched: {},
        // 已驗證的欄位
        validated: {}
    })

    // 重置表單
    const resetForm = () => {
        // 重置表單數據
        Object.keys(formData).forEach(key => {
            formData[key] = initialValues[key]
        })

        // 重置表單狀態
        state.loading = false
        state.submitted = false
        state.errors = {}
        state.dirty = false
        state.touched = {}
        state.validated = {}
    }

    // 設置欄位值
    const setFieldValue = (field, value) => {
        formData[field] = value
        state.dirty = true
        validateField(field)
    }

    // 設置多個欄位值
    const setFieldValues = (values) => {
        Object.entries(values).forEach(([field, value]) => {
            formData[field] = value
        })
        state.dirty = true
        validateForm()
    }

    // 處理欄位變更
    const handleFieldChange = (field) => (event) => {
        const value = event.target?.type === 'checkbox'
            ? event.target.checked
            : event.target.value
        setFieldValue(field, value)
    }

    // 處理欄位失焦
    const handleFieldBlur = (field) => () => {
        state.touched[field] = true
        validateField(field)
    }

    // 驗證單一欄位
    const validateField = (field) => {
        if (!validationRules[field]) return true

        const errors = validate(formData[field], validationRules[field])
        state.errors[field] = errors[0] || ''
        state.validated[field] = !errors.length

        return !errors.length
    }

    // 驗證整個表單
    const validateForm = () => {
        let isValid = true
        const errors = {}

        Object.keys(validationRules).forEach(field => {
            const fieldErrors = validate(formData[field], validationRules[field])
            if (fieldErrors.length) {
                errors[field] = fieldErrors[0]
                isValid = false
            }
        })

        state.errors = errors
        return isValid
    }

    // 處理表單提交
    const handleSubmit = async (event) => {
        if (event) {
            event.preventDefault()
        }

        state.submitted = true

        // 驗證表單
        if (!validateForm()) {
            return false
        }

        try {
            state.loading = true

            // 如果有提供 onSubmit 函數，則執行
            if (onSubmit) {
                await onSubmit(formData)
            }

            return true
        } catch (error) {
            // 處理 API 錯誤
            if (error.response?.data?.errors) {
                state.errors = error.response.data.errors
            } else {
                state.errors = { general: error.message || '提交失敗，請稍後再試' }
            }
            return false
        } finally {
            state.loading = false
        }
    }

    // 計算屬性
    const isValid = computed(() => Object.keys(state.errors).length === 0)
    const isDirty = computed(() => state.dirty)
    const isSubmitting = computed(() => state.loading)
    const hasErrors = computed(() => Object.keys(state.errors).length > 0)

    // 取得欄位屬性
    const getFieldProps = (field) => ({
        value: formData[field],
        onChange: handleFieldChange(field),
        onBlur: handleFieldBlur(field),
        error: state.errors[field],
        touched: state.touched[field],
        validated: state.validated[field]
    })

    return {
        // 表單數據
        formData,
        // 表單狀態
        errors: state.errors,
        loading: state.loading,
        submitted: state.submitted,
        touched: state.touched,
        validated: state.validated,

        // 計算屬性
        isValid,
        isDirty,
        isSubmitting,
        hasErrors,

        // 方法
        setFieldValue,
        setFieldValues,
        validateField,
        validateForm,
        handleSubmit,
        resetForm,
        getFieldProps
    }
}

// 使用範例：
/*
import { useForm } from '@/hooks/useForm'

export default {
  setup() {
    // 初始值
    const initialValues = {
      email: '',
      password: ''
    }

    // 驗證規則
    const validationRules = {
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minLength: 8
      }
    }

    // 提交處理
    const onSubmit = async (data) => {
      await api.login(data)
    }

    // 使用表單 Hook
    const {
      formData,
      errors,
      loading,
      isValid,
      handleSubmit,
      getFieldProps
    } = useForm(initialValues, validationRules, onSubmit)

    return {
      formData,
      errors,
      loading,
      isValid,
      handleSubmit,
      getFieldProps
    }
  }
}

// 在模板中使用
<template>
  <form @submit="handleSubmit">
    <input
      v-bind="getFieldProps('email')"
      :class="{ 'is-invalid': errors.email }"
    >
    <div class="invalid-feedback">{{ errors.email }}</div>

    <input
      type="password"
      v-bind="getFieldProps('password')"
      :class="{ 'is-invalid': errors.password }"
    >
    <div class="invalid-feedback">{{ errors.password }}</div>

    <button type="submit" :disabled="!isValid || loading">
      {{ loading ? '提交中...' : '提交' }}
    </button>
  </form>
</template>
*/