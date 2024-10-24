// 基本驗證規則
const rules = {
    // 必填驗證
    required: {
        validate: value => value !== undefined && value !== null && value !== '',
        message: '此欄位為必填'
    },

    // 電子郵件驗證
    email: {
        validate: value => {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return !value || pattern.test(value)
        },
        message: '請輸入有效的電子郵件地址'
    },

    // 手機號碼驗證（台灣格式）
    phone: {
        validate: value => {
            const pattern = /^09\d{8}$/
            return !value || pattern.test(value)
        },
        message: '請輸入有效的手機號碼'
    },

    // 密碼驗證
    password: {
        validate: value => {
            const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
            return !value || pattern.test(value)
        },
        message: '密碼必須包含至少8個字符，包括字母和數字'
    },

    // 市民卡號驗證
    cardNumber: {
        validate: value => {
            const pattern = /^[A-Z]\d{9}$/
            return !value || pattern.test(value)
        },
        message: '請輸入有效的市民卡號（1個大寫字母加9位數字）'
    },

    // 最小值驗證
    min: (min) => ({
        validate: value => !value || Number(value) >= min,
        message: `不能小於 ${min}`
    }),

    // 最大值驗證
    max: (max) => ({
        validate: value => !value || Number(value) <= max,
        message: `不能大於 ${max}`
    }),

    // 最小長度驗證
    minLength: (min) => ({
        validate: value => !value || String(value).length >= min,
        message: `長度不能少於 ${min} 個字符`
    }),

    // 最大長度驗證
    maxLength: (max) => ({
        validate: value => !value || String(value).length <= max,
        message: `長度不能超過 ${max} 個字符`
    }),

    // 日期驗證
    date: {
        validate: value => {
            if (!value) return true
            const date = new Date(value)
            return !isNaN(date.getTime())
        },
        message: '請輸入有效的日期'
    },

    // 未來日期驗證
    futureDate: {
        validate: value => {
            if (!value) return true
            const date = new Date(value)
            return date > new Date()
        },
        message: '日期必須是未來時間'
    },

    // 數字驗證
    numeric: {
        validate: value => {
            const pattern = /^\d+$/
            return !value || pattern.test(value)
        },
        message: '請輸入數字'
    },

    // 金額驗證
    amount: {
        validate: value => {
            const pattern = /^\d+(\.\d{1,2})?$/
            return !value || pattern.test(value)
        },
        message: '請輸入有效的金額'
    }
}

// 驗證函數
export const validate = (value, validations = {}) => {
    const errors = []

    // 遍歷所有驗證規則
    Object.entries(validations).forEach(([ruleName, ruleValue]) => {
        // 獲取驗證規則
        let rule = rules[ruleName]

        // 如果規則是函數（例如 min, max），則執行函數獲取實際規則
        if (typeof rule === 'function') {
            rule = rule(ruleValue)
        }

        // 如果規則存在且驗證失敗
        if (rule && !rule.validate(value)) {
            errors.push(rule.message)
        }
    })

    return errors
}

// 表單驗證函數
export const validateForm = (formData, validationRules) => {
    const errors = {}
    let isValid = true

    // 遍歷所有表單欄位
    Object.entries(validationRules).forEach(([field, rules]) => {
        const fieldErrors = validate(formData[field], rules)
        if (fieldErrors.length > 0) {
            errors[field] = fieldErrors[0] // 只返回第一個錯誤訊息
            isValid = false
        }
    })

    return { isValid, errors }
}

// 自定義驗證規則
export const addRule = (name, rule) => {
    rules[name] = rule
}

// 預設導出
export default {
    validate,
    validateForm,
    addRule,
    rules
}

// 使用範例：
/*
import { validateForm } from '@/utils/validation'

const formData = {
  email: 'test@example.com',
  phone: '0912345678',
  password: 'password123'
}

const validationRules = {
  email: {
    required: true,
    email: true
  },
  phone: {
    required: true,
    phone: true
  },
  password: {
    required: true,
    password: true,
    minLength: 8
  }
}

const { isValid, errors } = validateForm(formData, validationRules)

if (!isValid) {
  console.log('表單驗證失敗:', errors)
} else {
  console.log('表單驗證成功')
}
*/

// 在組件中使用：
/*
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <input
        v-model="form.email"
        :class="{ 'is-invalid': errors.email }"
      >
      <div class="invalid-feedback">{{ errors.email }}</div>
    </div>
  </form>
</template>

<script>
import { validateForm } from '@/utils/validation'

export default {
  data() {
    return {
      form: {
        email: ''
      },
      errors: {}
    }
  },
  methods: {
    handleSubmit() {
      const validationRules = {
        email: {
          required: true,
          email: true
        }
      }

      const { isValid, errors } = validateForm(this.form, validationRules)

      if (!isValid) {
        this.errors = errors
        return
      }

      // 提交表單...
    }
  }
}
</script>
*/