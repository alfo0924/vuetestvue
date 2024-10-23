<template>
  <div class="base-table-wrapper">
    <!-- 表格標題和工具列 -->
    <div class="table-header d-flex justify-content-between align-items-center mb-3">
      <h4 v-if="title" class="mb-0">{{ title }}</h4>
      <div class="table-tools">
        <slot name="tools">
          <!-- 預設工具按鈕 -->
          <button v-if="showRefresh"
                  class="btn btn-outline-secondary btn-sm me-2"
                  @click="handleRefresh">
            <i class="bi bi-arrow-clockwise"></i> 重新整理
          </button>
          <button v-if="showAdd"
                  class="btn btn-primary btn-sm"
                  @click="$emit('add')">
            <i class="bi bi-plus-lg"></i> 新增
          </button>
        </slot>
      </div>
    </div>

    <!-- 表格本體 -->
    <div class="table-responsive">
      <table class="table" :class="tableClass">
        <!-- 表頭 -->
        <thead>
        <tr>
          <!-- 選擇框 -->
          <th v-if="selectable" style="width: 50px;">
            <input type="checkbox"
                   class="form-check-input"
                   :checked="isAllSelected"
                   @change="handleSelectAll">
          </th>
          <!-- 動態表頭 -->
          <th v-for="column in columns"
              :key="column.prop"
              :style="{ width: column.width || 'auto' }"
              :class="{ 'sortable': column.sortable }"
              @click="column.sortable && handleSort(column.prop)">
            {{ column.label }}
            <i v-if="column.sortable"
               class="bi"
               :class="getSortIconClass(column.prop)"></i>
          </th>
          <!-- 操作列 -->
          <th v-if="showActions" :style="{ width: actionsWidth }">操作</th>
        </tr>
        </thead>

        <!-- 表格內容 -->
        <tbody>
        <template v-if="data && data.length">
          <tr v-for="(row, index) in data" :key="row.id || index">
            <!-- 選擇框 -->
            <td v-if="selectable">
              <input type="checkbox"
                     class="form-check-input"
                     :checked="selectedRows.includes(row)"
                     @change="handleSelect(row)">
            </td>
            <!-- 動態單元格 -->
            <td v-for="column in columns" :key="column.prop">
              <slot :name="column.prop" :row="row">
                {{ formatCellValue(row[column.prop], column) }}
              </slot>
            </td>
            <!-- 操作按鈕 -->
            <td v-if="showActions">
              <slot name="actions" :row="row">
                <button v-if="showEdit"
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="$emit('edit', row)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button v-if="showDelete"
                        class="btn btn-sm btn-outline-danger"
                        @click="handleDelete(row)">
                  <i class="bi bi-trash"></i>
                </button>
              </slot>
            </td>
          </tr>
        </template>
        <!-- 無數據顯示 -->
        <tr v-else>
          <td :colspan="getTotalColumns" class="text-center py-4">
            <slot name="empty">
              <div class="text-muted">
                <i class="bi bi-inbox-fill fs-2"></i>
                <p class="mt-2">暫無數據</p>
              </div>
            </slot>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁器 -->
    <div v-if="showPagination" class="d-flex justify-content-between align-items-center mt-3">
      <!-- 每頁筆數選擇器 -->
      <div class="page-size-selector">
        <select class="form-select form-select-sm"
                v-model="currentPageSize"
                @change="handlePageSizeChange">
          <option v-for="size in pageSizes"
                  :key="size"
                  :value="size">
            {{ size }} 筆/頁
          </option>
        </select>
      </div>
      <!-- 分頁按鈕 -->
      <nav aria-label="Page navigation">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="handlePageChange(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          <li v-for="page in displayPages"
              :key="page"
              class="page-item"
              :class="{ active: currentPage === page }">
            <a class="page-link"
               href="#"
               @click.prevent="handlePageChange(page)">
              {{ page }}
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="handlePageChange(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BaseTable',
  props: {
    // 表格標題
    title: {
      type: String,
      default: ''
    },
    // 表格數據
    data: {
      type: Array,
      required: true
    },
    // 表格列定義
    columns: {
      type: Array,
      required: true
    },
    // 表格樣式類
    tableClass: {
      type: [String, Array, Object],
      default: ''
    },
    // 是否可選擇
    selectable: {
      type: Boolean,
      default: false
    },
    // 是否顯示操作列
    showActions: {
      type: Boolean,
      default: true
    },
    // 操作列寬度
    actionsWidth: {
      type: String,
      default: '150px'
    },
    // 是否顯示新增按鈕
    showAdd: {
      type: Boolean,
      default: true
    },
    // 是否顯示編輯按鈕
    showEdit: {
      type: Boolean,
      default: true
    },
    // 是否顯示刪除按鈕
    showDelete: {
      type: Boolean,
      default: true
    },
    // 是否顯示重新整理按鈕
    showRefresh: {
      type: Boolean,
      default: true
    },
    // 是否顯示分頁
    showPagination: {
      type: Boolean,
      default: true
    },
    // 總數據量
    total: {
      type: Number,
      default: 0
    },
    // 當前頁碼
    page: {
      type: Number,
      default: 1
    },
    // 每頁筆數
    pageSize: {
      type: Number,
      default: 10
    },
    // 可選擇的每頁筆數
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    }
  },

  emits: ['update:page', 'update:pageSize', 'refresh', 'add', 'edit', 'delete', 'sort', 'selection-change'],

  setup(props, { emit }) {
    // 選中的行
    const selectedRows = ref([])
    // 當前排序字段
    const sortField = ref('')
    // 排序方向
    const sortOrder = ref('asc')
    // 當前頁碼
    const currentPage = computed({
      get: () => props.page,
      set: (val) => emit('update:page', val)
    })
    // 當前每頁筆數
    const currentPageSize = computed({
      get: () => props.pageSize,
      set: (val) => emit('update:pageSize', val)
    })

    // 計算總頁數
    const totalPages = computed(() =>
        Math.ceil(props.total / currentPageSize.value)
    )

    // 計算顯示的頁碼
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

    // 計算是否全選
    const isAllSelected = computed(() =>
        props.data.length > 0 && selectedRows.value.length === props.data.length
    )

    // 計算總列數
    const getTotalColumns = computed(() => {
      let count = props.columns.length
      if (props.selectable) count++
      if (props.showActions) count++
      return count
    })

    // 處理全選
    const handleSelectAll = (e) => {
      selectedRows.value = e.target.checked ? [...props.data] : []
      emit('selection-change', selectedRows.value)
    }

    // 處理單行選擇
    const handleSelect = (row) => {
      const index = selectedRows.value.indexOf(row)
      if (index === -1) {
        selectedRows.value.push(row)
      } else {
        selectedRows.value.splice(index, 1)
      }
      emit('selection-change', selectedRows.value)
    }

    // 處理排序
    const handleSort = (field) => {
      if (sortField.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortOrder.value = 'asc'
      }
      emit('sort', { field, order: sortOrder.value })
    }

    // 獲取排序圖標類
    const getSortIconClass = (field) => {
      if (field !== sortField.value) return 'bi-arrow-down-up'
      return sortOrder.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
    }

    // 處理分頁變更
    const handlePageChange = (page) => {
      if (page < 1 || page > totalPages.value) return
      currentPage.value = page
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = () => {
      currentPage.value = 1
    }

    // 處理刪除
    const handleDelete = (row) => {
      if (confirm('確定要刪除嗎？')) {
        emit('delete', row)
      }
    }

    // 處理重新整理
    const handleRefresh = () => {
      emit('refresh')
    }

    // 格式化單元格值
    const formatCellValue = (value, column) => {
      if (column.formatter) {
        return column.formatter(value)
      }
      return value
    }

    return {
      selectedRows,
      currentPage,
      currentPageSize,
      totalPages,
      displayPages,
      isAllSelected,
      getTotalColumns,
      handleSelectAll,
      handleSelect,
      handleSort,
      getSortIconClass,
      handlePageChange,
      handlePageSizeChange,
      handleDelete,
      handleRefresh,
      formatCellValue
    }
  }
}
</script>

<style scoped>
.base-table-wrapper {
  background-color: #fff;
  border-radius: 0.375rem;
  padding: 1rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #e9ecef;
}

.table td {
  vertical-align: middle;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.25rem 0.5rem;
}

.form-check-input {
  cursor: pointer;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}

.table-responsive {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .table-tools {
    margin-top: 0.5rem;
  }
}
</style>