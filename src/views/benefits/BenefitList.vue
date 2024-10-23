<template>
  <div class="benefit-list">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          keywordPlaceholder="搜尋優惠名稱"
          :advanced-fields="searchFields"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 數據表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="優惠列表"
              :columns="columns"
              :data="benefits"
              :loading="loading"
              :total="total"
              :page="page"
              :pageSize="pageSize"
              selectable
              show-actions
              @selection-change="handleSelectionChange"
              @update:page="handlePageChange"
              @update:pageSize="handlePageSizeChange"
              @add="handleAdd"
              @edit="handleEdit"
              @delete="handleDelete"
              @sort="handleSort"
          >
            <!-- 自定義狀態列渲染 -->
            <template #status="{ row }">
              <span :class="getStatusClass(row.status)">
                {{ row.status }}
              </span>
            </template>

            <!-- 自定義有效期限列渲染 -->
            <template #validUntil="{ row }">
              <span :class="{ 'text-danger': isExpired(row.validUntil) }">
                {{ formatDate(row.validUntil) }}
              </span>
            </template>

            <!-- 自定義操作列 -->
            <template #actions="{ row }">
              <div class="btn-group">
                <BaseButton
                    icon="eye"
                    variant="outline-primary"
                    size="sm"
                    title="查看詳情"
                    @click="handleView(row)"
                />
                <BaseButton
                    v-if="isAdmin"
                    icon="pencil"
                    variant="outline-secondary"
                    size="sm"
                    title="編輯"
                    @click="handleEdit(row)"
                />
                <BaseButton
                    v-if="isAdmin"
                    icon="trash"
                    variant="outline-danger"
                    size="sm"
                    title="刪除"
                    @click="handleDelete(row)"
                />
              </div>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>

    <!-- 批量操作工具列 -->
    <div v-if="selectedRows.length && isAdmin" class="batch-actions">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between">
          <span>已選擇 {{ selectedRows.length }} 項</span>
          <div class="btn-group">
            <BaseButton
                variant="primary"
                icon="check-circle"
                @click="handleBatchEnable"
            >
              批量啟用
            </BaseButton>
            <BaseButton
                variant="warning"
                icon="dash-circle"
                @click="handleBatchDisable"
            >
              批量停用
            </BaseButton>
            <BaseButton
                variant="danger"
                icon="trash"
                @click="handleBatchDelete"
            >
              批量刪除
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認刪除對話框 -->
    <BaseModal
        v-model="showDeleteConfirm"
        title="確認刪除"
        @confirm="confirmDelete"
    >
      <p>確定要刪除選中的優惠嗎？此操作無法復原。</p>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseSearch from '@/components/common/BaseSearch.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import benefitAPI from '@/api/benefits'
import { formatDate } from '@/utils/format'

export default {
  name: 'BenefitList',
  components: {
    Breadcrumb,
    BaseSearch,
    BaseTable,
    BaseButton,
    BaseModal
  },
  setup() {
    const router = useRouter()
    const store = useStore()

    // 搜尋條件
    const searchFields = [
      {
        type: 'select',
        name: 'benefitType',
        label: '優惠類型',
        options: [
          { value: '公車優惠', label: '公車優惠' },
          { value: '特約商店折扣', label: '特約商店折扣' },
          { value: '政府活動積點', label: '政府活動積點' },
          { value: '抽獎參與', label: '抽獎參與' }
        ]
      },
      {
        type: 'select',
        name: 'status',
        label: '狀態',
        options: [
          { value: '使用中', label: '使用中' },
          { value: '已過期', label: '已過期' },
          { value: '已達使用上限', label: '已達使用上限' }
        ]
      },
      {
        type: 'daterange',
        name: 'validPeriod',
        label: '有效期限',
        startName: 'startDate',
        endName: 'endDate'
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'benefitName', label: '優惠名稱', sortable: true },
      { prop: 'benefitType', label: '優惠類型' },
      { prop: 'validUntil', label: '有效期限', sortable: true },
      { prop: 'usageLimit', label: '使用次數限制' },
      { prop: 'usageCount', label: '已使用次數' },
      { prop: 'status', label: '狀態' }
    ]

    // 數據狀態
    const loading = ref(false)
    const benefits = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const selectedRows = ref([])
    const showDeleteConfirm = ref(false)
    const pendingDelete = ref(null)

    // 判斷是否為管理員
    const isAdmin = computed(() => store.state.auth.userRole === 'admin')

    // 載入優惠列表
    const fetchBenefits = async (params = {}) => {
      try {
        loading.value = true
        const response = await benefitAPI.getBenefits({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        benefits.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入優惠列表失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchBenefits(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchBenefits()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchBenefits()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchBenefits()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchBenefits({ sortField: field, sortOrder: order })
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    // 查看詳情
    const handleView = (row) => {
      router.push(`/benefits/${row.benefitId}`)
    }

    // 新增優惠
    const handleAdd = () => {
      router.push('/benefits/new')
    }

    // 編輯優惠
    const handleEdit = (row) => {
      router.push(`/benefits/${row.benefitId}/edit`)
    }

    // 刪除優惠
    const handleDelete = (row) => {
      pendingDelete.value = [row]
      showDeleteConfirm.value = true
    }

    // 批量啟用
    const handleBatchEnable = async () => {
      try {
        const ids = selectedRows.value.map(row => row.benefitId)
        await benefitAPI.batchUpdateBenefitsStatus({ benefitIds: ids, isActive: true })
        fetchBenefits()
        selectedRows.value = []
      } catch (error) {
        console.error('批量啟用失敗:', error)
      }
    }

    // 批量停用
    const handleBatchDisable = async () => {
      try {
        const ids = selectedRows.value.map(row => row.benefitId)
        await benefitAPI.batchUpdateBenefitsStatus({ benefitIds: ids, isActive: false })
        fetchBenefits()
        selectedRows.value = []
      } catch (error) {
        console.error('批量停用失敗:', error)
      }
    }

    // 批量刪除
    const handleBatchDelete = () => {
      pendingDelete.value = selectedRows.value
      showDeleteConfirm.value = true
    }

    // 確認刪除
    const confirmDelete = async () => {
      if (!pendingDelete.value) return

      try {
        const ids = pendingDelete.value.map(row => row.benefitId)
        await benefitAPI.deleteBenefit(ids)
        fetchBenefits()
        selectedRows.value = []
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('刪除失敗:', error)
      } finally {
        pendingDelete.value = null
      }
    }

    // 判斷是否過期
    const isExpired = (date) => {
      return new Date(date) < new Date()
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '使用中': 'badge bg-success',
        '已過期': 'badge bg-danger',
        '已達使用上限': 'badge bg-warning'
      }
      return classMap[status] || 'badge bg-secondary'
    }

    onMounted(() => {
      fetchBenefits()
    })

    return {
      searchFields,
      columns,
      loading,
      benefits,
      total,
      page,
      pageSize,
      selectedRows,
      showDeleteConfirm,
      isAdmin,
      handleSearch,
      handleReset,
      handlePageChange,
      handlePageSizeChange,
      handleSort,
      handleSelectionChange,
      handleView,
      handleAdd,
      handleEdit,
      handleDelete,
      handleBatchEnable,
      handleBatchDisable,
      handleBatchDelete,
      confirmDelete,
      isExpired,
      getStatusClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.benefit-list {
  padding: 1.5rem;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.batch-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 1rem;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.badge {
  padding: 0.5em 0.75em;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .benefit-list {
    padding: 1rem;
  }

  .batch-actions {
    padding: 0.75rem;
  }
}
</style>