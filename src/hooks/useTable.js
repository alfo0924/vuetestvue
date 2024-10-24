import { ref, reactive, computed } from 'vue'

export default function useTable(options = {}) {
    // 預設配置
    const defaultOptions = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        loading: false,
        selectable: false,
        showActions: true,
        fetchData: null,
        onSelectionChange: null,
        onSort: null
    }

    // 合併配置
    const config = { ...defaultOptions, ...options }

    // 表格狀態
    const tableData = ref(config.data)
    const totalCount = ref(config.total)
    const currentPage = ref(config.page)
    const pageSize = ref(config.pageSize)
    const loading = ref(config.loading)
    const selectedRows = ref([])
    const sortInfo = reactive({
        field: '',
        order: ''
    })

    // 分頁設定
    const pageSizeOptions = [10, 20, 50, 100]

    // 計算屬性：當前頁數據
    const currentPageData = computed(() => {
        if (config.fetchData) {
            return tableData.value
        }
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        return tableData.value.slice(start, end)
    })

    // 計算屬性：總頁數
    const totalPages = computed(() => {
        return Math.ceil(totalCount.value / pageSize.value)
    })

    // 處理分頁變更
    const handlePageChange = async (page) => {
        currentPage.value = page
        if (config.fetchData) {
            await fetchTableData()
        }
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = async (size) => {
        pageSize.value = size
        currentPage.value = 1
        if (config.fetchData) {
            await fetchTableData()
        }
    }

    // 處理排序變更
    const handleSortChange = async ({ field, order }) => {
        sortInfo.field = field
        sortInfo.order = order
        if (config.onSort) {
            config.onSort({ field, order })
        }
        if (config.fetchData) {
            await fetchTableData()
        }
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
        selectedRows.value = rows
        if (config.onSelectionChange) {
            config.onSelectionChange(rows)
        }
    }

    // 取得表格資料
    const fetchTableData = async () => {
        if (!config.fetchData) return

        try {
            loading.value = true
            const response = await config.fetchData({
                page: currentPage.value,
                pageSize: pageSize.value,
                sortField: sortInfo.field,
                sortOrder: sortInfo.order
            })
            tableData.value = response.data
            totalCount.value = response.total
        } catch (error) {
            console.error('獲取表格數據失敗:', error)
        } finally {
            loading.value = false
        }
    }

    // 刷新表格
    const refreshTable = () => {
        if (config.fetchData) {
            fetchTableData()
        }
    }

    // 重置表格
    const resetTable = () => {
        currentPage.value = 1
        selectedRows.value = []
        sortInfo.field = ''
        sortInfo.order = ''
        refreshTable()
    }

    // 選擇所有行
    const selectAllRows = () => {
        selectedRows.value = [...tableData.value]
        handleSelectionChange(selectedRows.value)
    }

    // 取消選擇所有行
    const deselectAllRows = () => {
        selectedRows.value = []
        handleSelectionChange(selectedRows.value)
    }

    // 檢查行是否被選中
    const isRowSelected = (row) => {
        return selectedRows.value.includes(row)
    }

    // 切換行選擇狀態
    const toggleRowSelection = (row) => {
        const index = selectedRows.value.indexOf(row)
        if (index === -1) {
            selectedRows.value.push(row)
        } else {
            selectedRows.value.splice(index, 1)
        }
        handleSelectionChange(selectedRows.value)
    }

    return {
        // 狀態
        tableData,
        totalCount,
        currentPage,
        pageSize,
        loading,
        selectedRows,
        sortInfo,
        pageSizeOptions,

        // 計算屬性
        currentPageData,
        totalPages,

        // 方法
        handlePageChange,
        handlePageSizeChange,
        handleSortChange,
        handleSelectionChange,
        refreshTable,
        resetTable,
        selectAllRows,
        deselectAllRows,
        isRowSelected,
        toggleRowSelection,

        // 輔助方法
        getTableProps: () => ({
            data: currentPageData.value,
            loading: loading.value,
            selectable: config.selectable,
            showActions: config.showActions,
            'onUpdate:page': handlePageChange,
            'onUpdate:pageSize': handlePageSizeChange,
            'onSort': handleSortChange,
            'onSelectionChange': handleSelectionChange
        })
    }
}

// 使用範例：
/*
import { useTable } from '@/hooks/useTable'

export default {
  setup() {
    const {
      tableData,
      loading,
      currentPage,
      pageSize,
      selectedRows,
      handlePageChange,
      handlePageSizeChange,
      getTableProps
    } = useTable({
      fetchData: async (params) => {
        // 從 API 獲取數據
        const response = await api.getData(params)
        return response
      },
      onSelectionChange: (rows) => {
        console.log('選中的行:', rows)
      }
    })

    return {
      tableData,
      loading,
      currentPage,
      pageSize,
      selectedRows,
      handlePageChange,
      handlePageSizeChange,
      getTableProps
    }
  }
}
*/