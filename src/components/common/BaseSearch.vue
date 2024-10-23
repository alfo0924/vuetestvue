<template>
  <div class="base-search">
    <!-- 搜尋表單 -->
    <form @submit.prevent="handleSearch" class="search-form">
      <div class="row g-3">
        <!-- 關鍵字搜尋 -->
        <div :class="keywordColClass">
          <div class="input-group">
            <input
                type="text"
                class="form-control"
                v-model="searchForm.keyword"
                :placeholder="keywordPlaceholder"
            >
            <button
                class="btn btn-primary"
                type="submit"
                :disabled="loading"
            >
              <i class="bi bi-search"></i>
              <span v-if="!loading">搜尋</span>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
          </div>
        </div>

        <!-- 進階搜尋欄位 -->
        <template v-if="showAdvanced">
          <div
              v-for="field in advancedFields"
              :key="field.name"
              :class="field.colClass || 'col-md-3'"
          >
            <!-- 一般輸入框 -->
            <template v-if="field.type === 'text' || field.type === 'number'">
              <label :for="field.name" class="form-label">{{ field.label }}</label>
              <input
                  :type="field.type"
                  :id="field.name"
                  class="form-control"
                  v-model="searchForm[field.name]"
                  :placeholder="field.placeholder"
              >
            </template>

            <!-- 下拉選單 -->
            <template v-else-if="field.type === 'select'">
              <label :for="field.name" class="form-label">{{ field.label }}</label>
              <select
                  :id="field.name"
                  class="form-select"
                  v-model="searchForm[field.name]"
              >
                <option value="">全部</option>
                <option
                    v-for="option in field.options"
                    :key="option.value"
                    :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </template>

            <!-- 日期選擇器 -->
            <template v-else-if="field.type === 'date'">
              <label :for="field.name" class="form-label">{{ field.label }}</label>
              <input
                  type="date"
                  :id="field.name"
                  class="form-control"
                  v-model="searchForm[field.name]"
              >
            </template>

            <!-- 日期範圍選擇器 -->
            <template v-else-if="field.type === 'daterange'">
              <label class="form-label">{{ field.label }}</label>
              <div class="input-group">
                <input
                    type="date"
                    class="form-control"
                    v-model="searchForm[field.startName]"
                >
                <span class="input-group-text">至</span>
                <input
                    type="date"
                    class="form-control"
                    v-model="searchForm[field.endName]"
                >
              </div>
            </template>
          </div>
        </template>
      </div>

      <!-- 進階搜尋切換按鈕 -->
      <div v-if="hasAdvancedFields" class="mt-2">
        <button
            type="button"
            class="btn btn-link btn-sm p-0"
            @click="toggleAdvanced"
        >
          {{ showAdvanced ? '收起進階搜尋' : '展開進階搜尋' }}
          <i
              class="bi"
              :class="showAdvanced ? 'bi-chevron-up' : 'bi-chevron-down'"
          ></i>
        </button>
      </div>

      <!-- 搜尋標籤 -->
      <div v-if="showTags && hasActiveTags" class="search-tags mt-2">
        <span
            v-for="(value, key) in activeTags"
            :key="key"
            class="badge bg-light text-dark me-2"
        >
          {{ getTagLabel(key, value) }}
          <i
              class="bi bi-x-circle ms-1"
              role="button"
              @click="clearTag(key)"
          ></i>
        </span>
        <button
            type="button"
            class="btn btn-link btn-sm"
            @click="clearAll"
        >
          清除全部
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'BaseSearch',
  props: {
    // 關鍵字搜尋提示文字
    keywordPlaceholder: {
      type: String,
      default: '請輸入關鍵字'
    },
    // 關鍵字欄位寬度
    keywordColClass: {
      type: String,
      default: 'col-md-4'
    },
    // 進階搜尋欄位定義
    advancedFields: {
      type: Array,
      default: () => []
    },
    // 是否顯示搜尋標籤
    showTags: {
      type: Boolean,
      default: true
    },
    // 載入狀態
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['search', 'reset'],

  setup(props, { emit }) {
    // 搜尋表單數據
    const searchForm = reactive({
      keyword: ''
    })

    // 初始化進階搜尋欄位
    props.advancedFields.forEach(field => {
      if (field.type === 'daterange') {
        searchForm[field.startName] = ''
        searchForm[field.endName] = ''
      } else {
        searchForm[field.name] = ''
      }
    })

    // 是否顯示進階搜尋
    const showAdvanced = ref(false)

    // 是否有進階搜尋欄位
    const hasAdvancedFields = computed(() => props.advancedFields.length > 0)

    // 切換進階搜尋顯示狀態
    const toggleAdvanced = () => {
      showAdvanced.value = !showAdvanced.value
    }

    // 獲取活動的搜尋標籤
    const activeTags = computed(() => {
      const tags = {}
      if (searchForm.keyword) {
        tags.keyword = searchForm.keyword
      }
      props.advancedFields.forEach(field => {
        if (field.type === 'daterange') {
          if (searchForm[field.startName] || searchForm[field.endName]) {
            tags[field.name] = {
              start: searchForm[field.startName],
              end: searchForm[field.endName]
            }
          }
        } else if (searchForm[field.name]) {
          tags[field.name] = searchForm[field.name]
        }
      })
      return tags
    })

    // 是否有活動的搜尋標籤
    const hasActiveTags = computed(() => Object.keys(activeTags.value).length > 0)

    // 獲取標籤顯示文字
    const getTagLabel = (key, value) => {
      if (key === 'keyword') {
        return `關鍵字: ${value}`
      }
      const field = props.advancedFields.find(f =>
          f.name === key || (f.type === 'daterange' && (f.startName === key || f.endName === key))
      )
      if (!field) return ''

      if (field.type === 'daterange') {
        return `${field.label}: ${value.start} 至 ${value.end}`
      }
      if (field.type === 'select') {
        const option = field.options.find(opt => opt.value === value)
        return `${field.label}: ${option ? option.label : value}`
      }
      return `${field.label}: ${value}`
    }

    // 清除指定標籤
    const clearTag = (key) => {
      const field = props.advancedFields.find(f => f.name === key)
      if (key === 'keyword') {
        searchForm.keyword = ''
      } else if (field?.type === 'daterange') {
        searchForm[field.startName] = ''
        searchForm[field.endName] = ''
      } else {
        searchForm[key] = ''
      }
      handleSearch()
    }

    // 清除所有搜尋條件
    const clearAll = () => {
      searchForm.keyword = ''
      props.advancedFields.forEach(field => {
        if (field.type === 'daterange') {
          searchForm[field.startName] = ''
          searchForm[field.endName] = ''
        } else {
          searchForm[field.name] = ''
        }
      })
      emit('reset')
    }

    // 處理搜尋
    const handleSearch = () => {
      emit('search', { ...searchForm })
    }

    return {
      searchForm,
      showAdvanced,
      hasAdvancedFields,
      activeTags,
      hasActiveTags,
      toggleAdvanced,
      getTagLabel,
      clearTag,
      clearAll,
      handleSearch
    }
  }
}
</script>

<style scoped>
.base-search {
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-tags .badge {
  padding: 0.5rem;
  font-weight: normal;
}

.search-tags .badge i {
  cursor: pointer;
}

.search-tags .badge i:hover {
  color: #dc3545;
}

.btn-link {
  text-decoration: none;
}

.form-label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

/* 動畫效果 */
.base-search {
  transition: all 0.3s ease;
}

.base-search:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .base-search {
    padding: 0.75rem;
  }
}
</style>