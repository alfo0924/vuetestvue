<template>
  <div class="transaction">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          keywordPlaceholder="搜尋交易描述"
          :advanced-fields="searchFields"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 交易統計卡片 -->
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">目前餘額</div>
            <div class="stat-value">$ {{ currentBalance }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">本月支出</div>
            <div class="stat-value text-danger">$ {{ monthlyExpense }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">本月儲值</div>
            <div class="stat-value text-success">$ {{ monthlyDeposit }}</div>
          </div>
        </div>
      </div>

      <!-- 交易記錄表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="交易記錄"
              :columns="columns"
              :data="transactions"
              :loading="loading"
              :total="total"
              :page="page"
              :pageSize="pageSize"
              @update:page="handlePageChange"
              @update:pageSize="handlePageSizeChange"
              @sort="handleSort"
          >
            <!-- 自定義金額列渲染 -->
            <template #amount="{ row }">
              <span :class="getAmountClass(row)">
                {{ formatAmount(row.amount, row.transactionType) }}
              </span>
            </template>

            <!-- 自定義交易類型列渲染 -->
            <template #transactionType="{ row }">
              <span :class="getTypeClass(row.transactionType)">
                {{ row.transactionType }}
              </span>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>

    <!-- 交易詳情對話框 -->
    <BaseModal
        v-model="showDetailModal"
        title="交易詳情"
        hideFooter
    >
      <div v-if="selectedTransaction" class="transaction-detail">
        <p><strong>交易編號：</strong> {{ selectedTransaction.transactionId }}</p>
        <p><strong>交易時間：</strong> {{ formatDateTime(selectedTransaction.transactionTime) }}</p>
        <p><strong>交易類型：</strong>
          <span :class="getTypeClass(selectedTransaction.transactionType)">
            {{ selectedTransaction.transactionType }}
          </span>
        </p>
        <p><strong>交易金額：</strong>
          <span :class="getAmountClass(selectedTransaction)">
            {{ formatAmount(selectedTransaction.amount, selectedTransaction.transactionType) }}
          </span>
        </p>
        <p><strong>交易說明：</strong> {{ selectedTransaction.description }}</p>
        <p><strong>交易後餘額：</strong> $ {{ selectedTransaction.balanceAfter }}</p>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseSearch from '@/components/common/BaseSearch.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import walletAPI from '@/api/wallets'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'Transaction',
  components: {
    Breadcrumb,
    BaseSearch,
    BaseTable,
    BaseModal
  },
  setup() {
    // 搜尋條件
    const searchFields = [
      {
        type: 'select',
        name: 'transactionType',
        label: '交易類型',
        options: [
          { value: '充值', label: '充值' },
          { value: '支付', label: '支付' },
          { value: '退款', label: '退款' }
        ]
      },
      {
        type: 'daterange',
        name: 'transactionTime',
        label: '交易時間',
        startName: 'startTime',
        endName: 'endTime'
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'transactionId', label: '交易編號', width: '120px' },
      {
        prop: 'transactionTime',
        label: '交易時間',
        sortable: true,
        formatter: formatDateTime
      },
      { prop: 'transactionType', label: '交易類型' },
      { prop: 'amount', label: '交易金額', sortable: true },
      { prop: 'description', label: '交易說明' }
    ]

    // 數據狀態
    const loading = ref(false)
    const transactions = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const currentBalance = ref(0)
    const monthlyExpense = ref(0)
    const monthlyDeposit = ref(0)

    // 交易詳情
    const showDetailModal = ref(false)
    const selectedTransaction = ref(null)

    // 載入交易記錄
    const fetchTransactions = async (params = {}) => {
      try {
        loading.value = true
        const response = await walletAPI.getTransactions({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        transactions.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入交易記錄失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入錢包統計
    const fetchWalletStats = async () => {
      try {
        const response = await walletAPI.getWalletStats()
        currentBalance.value = response.balance
        monthlyExpense.value = response.monthlyExpense
        monthlyDeposit.value = response.monthlyDeposit
      } catch (error) {
        console.error('載入錢包統計失敗:', error)
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchTransactions(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchTransactions()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchTransactions()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchTransactions()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchTransactions({ sortField: field, sortOrder: order })
    }

    // 格式化金額
    const formatAmount = (amount, type) => {
      const prefix = type === '支付' ? '- ' : '+ '
      return `${prefix}$ ${Math.abs(amount).toFixed(2)}`
    }

    // 取得金額樣式
    const getAmountClass = (transaction) => {
      return {
        'text-danger': transaction.transactionType === '支付',
        'text-success': transaction.transactionType === '充值' ||
            transaction.transactionType === '退款'
      }
    }

    // 取得交易類型樣式
    const getTypeClass = (type) => {
      const classMap = {
        '充值': 'badge bg-success',
        '支付': 'badge bg-danger',
        '退款': 'badge bg-info'
      }
      return classMap[type] || 'badge bg-secondary'
    }

    onMounted(() => {
      fetchTransactions()
      fetchWalletStats()
    })

    return {
      searchFields,
      columns,
      loading,
      transactions,
      total,
      page,
      pageSize,
      currentBalance,
      monthlyExpense,
      monthlyDeposit,
      showDetailModal,
      selectedTransaction,
      handleSearch,
      handleReset,
      handlePageChange,
      handlePageSizeChange,
      handleSort,
      formatAmount,
      getAmountClass,
      getTypeClass,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.transaction {
  padding: 1.5rem;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 統計卡片樣式 */
.stat-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  text-align: center;
}

.stat-title {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

/* 交易金額樣式 */
.text-success {
  color: #198754 !important;
}

.text-danger {
  color: #dc3545 !important;
}

/* 交易類型標籤樣式 */
.badge {
  padding: 0.5em 0.75em;
  font-weight: 500;
}

/* 交易詳情樣式 */
.transaction-detail p {
  margin-bottom: 0.75rem;
}

/* 動畫效果 */
.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .transaction {
    padding: 1rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }
}
</style>