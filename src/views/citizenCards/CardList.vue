<template>
  <div class="card-list">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          keywordPlaceholder="搜尋卡號或持卡人姓名"
          :advanced-fields="searchFields"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 數據表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="市民卡列表"
              :columns="columns"
              :data="cards"
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
                    v-if="!row.memberId"
                    icon="link"
                    variant="outline-success"
                    size="sm"
                    title="綁定會員"
                    @click="showBindModal(row)"
                />
                <BaseButton
                    v-if="row.status === '正常'"
                    icon="x-circle"
                    variant="outline-danger"
                    size="sm"
                    title="掛失"
                    @click="handleReportLoss(row)"
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
          </div>
        </div>
      </div>
    </div>

    <!-- 綁定會員對話框 -->
    <BaseModal
        v-model="showBindMemberModal"
        title="綁定會員"
        @confirm="confirmBind"
    >
      <form @submit.prevent>
        <div class="mb-3">
          <label class="form-label">會員搜尋</label>
          <div class="input-group">
            <input
                type="text"
                class="form-control"
                v-model="memberSearchKey"
                placeholder="輸入會員電子郵件或手機號碼"
            >
            <button
                class="btn btn-outline-secondary"
                type="button"
                @click="searchMember"
            >
              搜尋
            </button>
          </div>
        </div>
        <div v-if="searchedMember" class="member-info">
          <p><strong>會員姓名：</strong> {{ searchedMember.name }}</p>
          <p><strong>電子郵件：</strong> {{ searchedMember.email }}</p>
          <p><strong>手機號碼：</strong> {{ searchedMember.phone }}</p>
        </div>
      </form>
    </BaseModal>

    <!-- 掛失對話框 -->
    <BaseModal
        v-model="showLossModal"
        title="市民卡掛失"
        @confirm="confirmReportLoss"
    >
      <div class="mb-3">
        <label class="form-label">掛失原因</label>
        <textarea
            v-model="lossReason"
            class="form-control"
            rows="3"
            placeholder="請輸入掛失原因"
        ></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">聯絡電話</label>
        <input
            type="tel"
            class="form-control"
            v-model="contactPhone"
            placeholder="請輸入聯絡電話"
        >
      </div>
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
import citizenCardAPI from '@/api/citizenCards'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'CardList',
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
        name: 'cardType',
        label: '卡片類型',
        options: [
          { value: '一般卡', label: '一般卡' },
          { value: '敬老卡', label: '敬老卡' },
          { value: '愛心卡', label: '愛心卡' },
          { value: '學生卡', label: '學生卡' }
        ]
      },
      {
        type: 'select',
        name: 'status',
        label: '狀態',
        options: [
          { value: '正常', label: '正常' },
          { value: '已掛失', label: '已掛失' },
          { value: '已註銷', label: '已註銷' }
        ]
      },
      {
        type: 'select',
        name: 'bindStatus',
        label: '綁定狀態',
        options: [
          { value: 'bound', label: '已綁定' },
          { value: 'unbound', label: '未綁定' }
        ]
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'cardNumber', label: '卡號', sortable: true },
      { prop: 'holderName', label: '持卡人姓名', sortable: true },
      { prop: 'cardType', label: '卡片類型' },
      { prop: 'memberName', label: '綁定會員' },
      {
        prop: 'bindTime',
        label: '綁定時間',
        formatter: formatDateTime
      },
      { prop: 'status', label: '狀態' }
    ]

    // 數據狀態
    const loading = ref(false)
    const cards = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const selectedRows = ref([])

    // 綁定會員相關
    const showBindMemberModal = ref(false)
    const pendingBindCard = ref(null)
    const memberSearchKey = ref('')
    const searchedMember = ref(null)

    // 掛失相關
    const showLossModal = ref(false)
    const pendingLossCard = ref(null)
    const lossReason = ref('')
    const contactPhone = ref('')

    // 判斷是否為管理員
    const isAdmin = computed(() => store.state.auth.userRole === 'admin')

    // 載入市民卡列表
    const fetchCards = async (params = {}) => {
      try {
        loading.value = true
        const response = await citizenCardAPI.getCitizenCards({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        cards.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入市民卡列表失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchCards(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchCards()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchCards()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchCards()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchCards({ sortField: field, sortOrder: order })
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    // 查看詳情
    const handleView = (row) => {
      router.push(`/citizen-cards/${row.cardNumber}`)
    }

    // 新增市民卡
    const handleAdd = () => {
      router.push('/citizen-cards/new')
    }

    // 編輯市民卡
    const handleEdit = (row) => {
      router.push(`/citizen-cards/${row.cardNumber}/edit`)
    }

    // 顯示綁定會員對話框
    const showBindModal = (card) => {
      pendingBindCard.value = card
      memberSearchKey.value = ''
      searchedMember.value = null
      showBindMemberModal.value = true
    }

    // 搜尋會員
    const searchMember = async () => {
      try {
        const response = await citizenCardAPI.searchMember(memberSearchKey.value)
        searchedMember.value = response
      } catch (error) {
        console.error('搜尋會員失敗:', error)
        searchedMember.value = null
      }
    }

    // 確認綁定會員
    const confirmBind = async () => {
      if (!searchedMember.value) return

      try {
        await citizenCardAPI.bindCard({
          cardNumber: pendingBindCard.value.cardNumber,
          memberId: searchedMember.value.id
        })
        await fetchCards()
        showBindMemberModal.value = false
      } catch (error) {
        console.error('綁定會員失敗:', error)
      }
    }

    // 處理掛失
    const handleReportLoss = (card) => {
      pendingLossCard.value = card
      lossReason.value = ''
      contactPhone.value = ''
      showLossModal.value = true
    }

    // 確認掛失
    const confirmReportLoss = async () => {
      try {
        await citizenCardAPI.reportLoss(pendingLossCard.value.cardNumber, {
          reason: lossReason.value,
          contactPhone: contactPhone.value
        })
        await fetchCards()
        showLossModal.value = false
      } catch (error) {
        console.error('掛失失敗:', error)
      }
    }

    // 批量啟用
    const handleBatchEnable = async () => {
      try {
        const cardNumbers = selectedRows.value.map(row => row.cardNumber)
        await citizenCardAPI.batchUpdateCardStatus({
          cardNumbers,
          status: '正常'
        })
        fetchCards()
        selectedRows.value = []
      } catch (error) {
        console.error('批量啟用失敗:', error)
      }
    }

    // 批量停用
    const handleBatchDisable = async () => {
      try {
        const cardNumbers = selectedRows.value.map(row => row.cardNumber)
        await citizenCardAPI.batchUpdateCardStatus({
          cardNumbers,
          status: '已註銷'
        })
        fetchCards()
        selectedRows.value = []
      } catch (error) {
        console.error('批量停用失敗:', error)
      }
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '正常': 'badge bg-success',
        '已掛失': 'badge bg-danger',
        '已註銷': 'badge bg-secondary'
      }
      return classMap[status] || 'badge bg-secondary'
    }

    onMounted(() => {
      fetchCards()
    })

    return {
      searchFields,
      columns,
      loading,
      cards,
      total,
      page,
      pageSize,
      selectedRows,
      showBindMemberModal,
      memberSearchKey,
      searchedMember,
      showLossModal,
      lossReason,
      contactPhone,
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
      showBindModal,
      searchMember,
      confirmBind,
      handleReportLoss,
      confirmReportLoss,
      handleBatchEnable,
      handleBatchDisable,
      getStatusClass,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.card-list {
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

/* 表格樣式 */
.table-responsive {
  margin-bottom: 0;
}

/* 狀態標籤樣式 */
.badge {
  font-weight: 500;
}

.bg-success {
  background-color: #198754 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
}

.bg-secondary {
  background-color: #6c757d !important;
}

/* 按鈕組樣式 */
.btn-group {
  gap: 0.25rem;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

/* 搜尋區域樣式 */
.search-area {
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 會員資訊樣式 */
.member-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.member-info p {
  margin-bottom: 0.5rem;
}

/* 動畫效果 */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(1px);
}

.badge {
  transition: all 0.3s ease;
}

.badge:hover {
  opacity: 0.8;
}

/* 載入動畫 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .card-list {
    padding: 1rem;
  }

  .batch-actions {
    padding: 0.75rem;
  }

  .btn-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-group .btn {
    width: 100%;
  }

  .member-info {
    padding: 0.75rem;
  }
}

/* 列印樣式 */
@media print {
  .card-list {
    padding: 0;
  }

  .search-area,
  .batch-actions,
  .btn-group {
    display: none;
  }

  .table {
    border: 1px solid #dee2e6;
  }

  .badge {
    border: 1px solid #000;
    padding: 0.25em 0.5em;
  }
}
</style>