<template>
  <div class="base-pagination d-flex align-items-center justify-content-between">
    <!-- 每頁筆數選擇器 -->
    <div class="page-size-selector" v-if="showSizeChanger">
      <select
          class="form-select form-select-sm"
          v-model="currentPageSize"
          :disabled="disabled"
      >
        <option
            v-for="size in pageSizes"
            :key="size"
            :value="size"
        >
          {{ size }} 筆/頁
        </option>
      </select>
    </div>

    <!-- 分頁資訊 -->
    <div class="pagination-info" v-if="showTotal">
      共 {{ total }} 筆資料，
      顯示第 {{ startIndex }}-{{ endIndex }} 筆
    </div>

    <!-- 分頁按鈕 -->
    <nav aria-label="Page navigation">
      <ul class="pagination pagination-sm mb-0">
        <!-- 首頁 -->
        <li
            v-if="showFirstLast"
            class="page-item"
            :class="{ disabled: currentPage === 1 || disabled }"
        >
          <a
              class="page-link"
              href="#"
              @click.prevent="handlePageChange(1)"
              aria-label="First"
          >
            <i class="bi bi-chevron-double-left"></i>
          </a>
        </li>

        <!-- 上一頁 -->
        <li
            class="page-item"
            :class="{ disabled: currentPage === 1 || disabled }"
        >
          <a
              class="page-link"
              href="#"
              @click.prevent="handlePageChange(currentPage - 1)"
              aria-label="Previous"
          >
            <i class="bi bi-chevron-left"></i>
          </a>
        </li>

        <!-- 頁碼按鈕 -->
        <li
            v-for="page in displayPages"
            :key="page"
            class="page-item"
            :class="{
            active: currentPage === page,
            disabled: disabled
          }"
        >
          <a
              class="page-link"
              href="#"
              @click.prevent="handlePageChange(page)"
          >
            {{ page }}
          </a>
        </li>

        <!-- 下一頁 -->
        <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages || disabled }"
        >
          <a
              class="page-link"
              href="#"
              @click.prevent="handlePageChange(currentPage + 1)"
              aria-label="Next"
          >
            <i class="bi bi-chevron-right"></i>
          </a>
        </li>

        <!-- 末頁 -->
        <li
            v-if="showFirstLast"
            class="page-item"
            :class="{ disabled: currentPage === totalPages || disabled }"
        >
          <a
              class="page-link"
              href="#"
              @click.prevent="handlePageChange(totalPages)"
              aria-label="Last"
          >
            <i class="bi bi-chevron-double-right"></i>
          </a>
        </li>

        <!-- 跳頁輸入框 -->
        <li v-if="showQuickJumper" class="page-item ms-2">
          <div class="input-group input-group-sm">
            <input
                type="number"
                class="form-control"
                v-model.number="jumpPage"
                :min="1"
                :max="totalPages"
                :disabled="disabled"
                @keyup.enter="handleJumpPage"
            >
            <button
                class="btn btn-outline-secondary"
                type="button"
                @click="handleJumpPage"
                :disabled="disabled"
            >
              跳轉
            </button>
          </div>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'BasePagination',
  props: {
    // 當前頁碼
    page: {
      type: Number,
      required: true
    },
    // 每頁筆數
    pageSize: {
      type: Number,
      required: true
    },
    // 總筆數
    total: {
      type: Number,
      required: true
    },
    // 可選的每頁筆數
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    // 是否顯示每頁筆數選擇器
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    // 是否顯示總筆數
    showTotal: {
      type: Boolean,
      default: true
    },
    // 是否顯示首末頁
    showFirstLast: {
      type: Boolean,
      default: true
    },
    // 是否顯示跳頁
    showQuickJumper: {
      type: Boolean,
      default: true
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:page', 'update:pageSize', 'change'],

  setup(props, { emit }) {
    // 當前頁碼
    const currentPage = computed({
      get: () => props.page,
      set: (val) => emit('update:page', val)
    })

    // 當前每頁筆數
    const currentPageSize = computed({
      get: () => props.pageSize,
      set: (val) => {
        emit('update:pageSize', val)
        // 切換每頁筆數時重置為第一頁
        currentPage.value = 1
      }
    })

    // 跳頁輸入值
    const jumpPage = ref('')

    // 計算總頁數
    const totalPages = computed(() =>
        Math.ceil(props.total / currentPageSize.value)
    )

    // 計算顯示的頁碼範圍
    const displayPages = computed(() => {
      const pages = []
      let start = Math.max(1, currentPage.value - 2)
      let end = Math.min(totalPages.value, start + 4)

      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // 計算當前顯示的資料範圍
    const startIndex = computed(() =>
        (currentPage.value - 1) * currentPageSize.value + 1
    )

    const endIndex = computed(() =>
        Math.min(currentPage.value * currentPageSize.value, props.total)
    )

    // 處理頁碼變更
    const handlePageChange = (page) => {
      if (page < 1 || page > totalPages.value || props.disabled) return
      currentPage.value = page
      emit('change', { page, pageSize: currentPageSize.value })
    }

    // 處理跳頁
    const handleJumpPage = () => {
      if (!jumpPage.value) return
      const page = parseInt(jumpPage.value)
      if (page && page >= 1 && page <= totalPages.value) {
        handlePageChange(page)
      }
      jumpPage.value = ''
    }

    // 監聽總頁數變化，確保當前頁不超過總頁數
    watch(totalPages, (newVal) => {
      if (currentPage.value > newVal) {
        currentPage.value = newVal
      }
    })

    return {
      currentPage,
      currentPageSize,
      jumpPage,
      totalPages,
      displayPages,
      startIndex,
      endIndex,
      handlePageChange,
      handleJumpPage
    }
  }
}
</script>

<style scoped>
.base-pagination {
  background-color: #fff;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.page-size-selector {
  min-width: 100px;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.25rem 0.5rem;
  color: #0d6efd;
  background-color: #fff;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease-in-out;
}

.page-link:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #0a58ca;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.input-group {
  width: auto;
}

.input-group input {
  width: 60px;
  text-align: center;
}

/* 動畫效果 */
.page-link {
  position: relative;
  overflow: hidden;
}

.page-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(13, 110, 253, 0.1);
  transform: scale(0);
  transition: transform 0.3s ease;
  border-radius: 0.25rem;
}

.page-link:active::after {
  transform: scale(1);
}

@media (max-width: 768px) {
  .base-pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .pagination-info {
    text-align: center;
  }
}
</style>