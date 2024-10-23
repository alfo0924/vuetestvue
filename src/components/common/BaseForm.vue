<template>
  <form class="base-form" @submit.prevent="handleSubmit">
    <!-- 表單標題 -->
    <div v-if="title" class="form-header mb-4">
      <h4>{{ title }}</h4>
    </div>

    <!-- 表單欄位 -->
    <div class="form-body">
      <div v-for="(field, index) in formFields" :key="index" class="mb-3">
        <!-- 一般輸入框 -->
        <template v-if="field.type === 'text' || field.type === 'password' || field.type === 'email' || field.type === 'number'">
          <label :for="field.name" class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
          </label>
          <input
              :type="field.type"
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              class="form-control"
              :class="{ 'is-invalid': errors[field.name] }"
              :placeholder="field.placeholder"
              :required="field.required"
              :disabled="field.disabled"
              :min="field.min"
              :max="field.max"
          >
          <div v-if="errors[field.name]" class="invalid-feedback">
            {{ errors[field.name] }}
          </div>
        </template>

        <!-- 下拉選單 -->
        <template v-else-if="field.type === 'select'">
          <label :for="field.name" class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
          </label>
          <select
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              class="form-select"
              :class="{ 'is-invalid': errors[field.name] }"
              :required="field.required"
              :disabled="field.disabled"
          >
            <option value="">請選擇</option>
            <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <div v-if="errors[field.name]" class="invalid-feedback">
            {{ errors[field.name] }}
          </div>
        </template>

        <!-- 多行文字框 -->
        <template v-else-if="field.type === 'textarea'">
          <label :for="field.name" class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
          </label>
          <textarea
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              class="form-control"
              :class="{ 'is-invalid': errors[field.name] }"
              :placeholder="field.placeholder"
              :required="field.required"
              :disabled="field.disabled"
              :rows="field.rows || 3"
          ></textarea>
          <div v-if="errors[field.name]" class="invalid-feedback">
            {{ errors[field.name] }}
          </div>
        </template>

        <!-- 單選框組 -->
        <template v-else-if="field.type === 'radio'">
          <label class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
          </label>
          <div class="form-check" v-for="option in field.options" :key="option.value">
            <input
                type="radio"
                :id="`${field.name}_${option.value}`"
                :name="field.name"
                v-model="formData[field.name]"
                :value="option.value"
                class="form-check-input"
                :required="field.required"
                :disabled="field.disabled"
            >
            <label class="form-check-label" :for="`${field.name}_${option.value}`">
              {{ option.label }}
            </label>
          </div>
          <div v-if="errors[field.name]" class="text-danger small">
            {{ errors[field.name] }}
          </div>
        </template>

        <!-- 複選框組 -->
        <template v-else-if="field.type === 'checkbox'">
          <label class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
          </label>
          <div class="form-check" v-for="option in field.options" :key="option.value">
            <input
                type="checkbox"
                :id="`${field.name}_${option.value}`"
                :name="field.name"
                v-model="formData[field.name]"
                :value="option.value"
                class="form-check-input"
                :disabled="field.disabled"
            >
            <label class="form-check-label" :for="`${field.name}_${option.value}`">
              {{ option.label }}
            </label>
          </div>
          <div v-if="errors[field.name]" class="text-danger small">
            {{ errors[field.name] }}
          </div>
        </template>

        <!-- 日期選擇器 -->
        <template v-else-if="field.type === 'date'">
          <label :for="field.name" class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
          </label>
          <input
              type="date"
              :id="field.name"
              :name="field.name"
              v-model="formData[field.name]"
              class="form-control"
              :class="{ 'is-invalid': errors[field.name] }"
              :required="field.required"
              :disabled="field.disabled"
              :min="field.min"
              :max="field.max"
          >
          <div v-if="errors[field.name]" class="invalid-feedback">
            {{ errors[field.name] }}
          </div>
        </template>
      </div>
    </div>

    <!-- 表單按鈕 -->
    <div class="form-footer mt-4">
      <slot name="buttons">
        <button
            type="submit"
            class="btn btn-primary me-2"
            :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          {{ submitText }}
        </button>
        <button
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="loading"
        >
          {{ cancelText }}
        </button>
      </slot>
    </div>
  </form>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'BaseForm',
  props: {
    // 表單標題
    title: {
      type: String,
      default: ''
    },
    // 表單欄位定義
    formFields: {
      type: Array,
      required: true
    },
    // 初始數據
    initialData: {
      type: Object,
      default: () => ({})
    },
    // 提交按鈕文字
    submitText: {
      type: String,
      default: '確認'
    },
    // 取消按鈕文字
    cancelText: {
      type: String,
      default: '取消'
    },
    // 驗證規則
    validationRules: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['submit', 'cancel'],

  setup(props, { emit }) {
    // 表單數據
    const formData = reactive({ ...props.initialData })

    // 錯誤訊息
    const errors = ref({})

    // 載入狀態
    const loading = ref(false)

    // 驗證表單
    const validateForm = () => {
      errors.value = {}
      let isValid = true

      props.formFields.forEach(field => {
        const value = formData[field.name]
        const rules = props.validationRules[field.name]

        if (rules) {
          // 必填驗證
          if (rules.required && !value) {
            errors.value[field.name] = `${field.label}為必填項`
            isValid = false
          }

          // 電子郵件驗證
          if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.value[field.name] = '請輸入有效的電子郵件地址'
            isValid = false
          }

          // 最小長度驗證
          if (rules.minLength && value && value.length < rules.minLength) {
            errors.value[field.name] = `${field.label}最少需要${rules.minLength}個字符`
            isValid = false
          }

          // 最大長度驗證
          if (rules.maxLength && value && value.length > rules.maxLength) {
            errors.value[field.name] = `${field.label}最多只能有${rules.maxLength}個字符`
            isValid = false
          }

          // 自定義驗證
          if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(value)
            if (customError) {
              errors.value[field.name] = customError
              isValid = false
            }
          }
        }
      })

      return isValid
    }

    // 提交表單
    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }

      loading.value = true
      try {
        emit('submit', { ...formData })
      } catch (error) {
        console.error('表單提交錯誤:', error)
      } finally {
        loading.value = false
      }
    }

    // 取消
    const handleCancel = () => {
      emit('cancel')
    }

    return {
      formData,
      errors,
      loading,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.base-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.form-footer {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.form-check {
  margin-bottom: 0.5rem;
}

/* 動畫效果 */
.form-control, .form-select {
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .base-form {
    padding: 15px;
  }
}
</style>