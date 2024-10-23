<template>
  <div class="wallet-list">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          keywordPlaceholder="搜尋會員姓名或電子郵件"
          :advanced-fields="searchFields"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 統計卡片 -->
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">總錢包數</div>
            <div class="stat-value">{{ totalWallets }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">總餘額</div>
            <div class="stat-value">$ {{ totalBalance }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">今日交易量</div>
            <div class="stat-value">{{ dailyTransactions }}</div>
          </div>
        </div>
      </div>

      <!-- 數據表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="電子錢包列表"
              :columns="columns"
              :data="wallets"
              :loading="loading"
              :total="total"
              :page="page"
              :pageSize="pageSize"
              selectable
              show-actions
              @selection-change="handleSelectionChange"
              @update:page="handlePageChange"
              @update:pageSize="handlePageSizeChange"
              @sort="handleSort"
          >
            <!-- 自定義餘額列渲染 -->
            <template #balance="{ row }">
              <span :class="getBalanceClass(row.balance)">
                $ {{ row.balance }}
              </span>
            </template>

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
                    v-if="row.status !== '凍結'"
                    icon="plus-circle"
                    variant="outline-success"
                    size="sm"
                    title="儲值"
                    @click="showDepositModal(row)"
                />
                <BaseButton
                    v-if="row.status === '正常'"
                    icon="dash-circle"
                    variant="outline-danger"
                    size="sm"
                    title="凍結"
                    @click="handleFreeze(row)"
                />
                <BaseButton
                    v-else-if="row.status === '凍結'"
                    icon="check-circle"
                    variant="outline-warning"
                    size="sm"
                    title="解凍"
                    @click="handleUnfreeze(row)"
                />
              </div>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>

    <!-- 儲值對話框 -->
    <BaseModal
        v-model="showDepositModal"
        title="錢包儲值"
        @confirm="confirmDeposit"
    >
      <form @submit.prevent>
        <div class="mb-3">
          <label class="form-label">儲值金額</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input
                type="number"
                class="form-control"
                v-model.number="depositAmount"
                min="1"
                :class="{ 'is-invalid': depositError }"
            >
          </div>
          <div class="invalid-feedback" v-if="depositError">
            {{ depositError }}
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">支付方式</label>
          <select class="form-select" v-model="paymentMethod">
            <option value="信用卡">信用卡</option>
            <option value="銀行轉帳">銀行轉帳</option>
            <option value="超商代碼">超商代碼</option>
          </select>
        </div>
      </form>
    </BaseModal>

    <!-- 凍結對話框 -->
    <BaseModal
        v-model="showFreezeModal"
        title="確認凍結錢包"
        @confirm="confirmFreeze"
    >
      <div class="mb-3">
        <label class="form-label">凍結原因</label>
        <textarea
            v-model="freezeReason"
            class="form-control"
            rows="3"
            placeholder="請輸入凍結原因"
        ></textarea>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseSearch from '@/components/common/BaseSearch.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import walletAPI from '@/api/wallets'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'WalletList',
  components: {
    Breadcrumb,
    BaseSearch,
    BaseTable,
    BaseButton,
    BaseModal
  },
  setup() {
    const router = useRouter()

    // 搜尋條件
    const searchFields = [
      {
        type: 'select',
        name: 'status',
        label: '錢包狀態',
        options: [
          { value: '正常', label: '正常' },
          { value: '凍結', label: '凍結' }
        ]
      },
      {
        type: 'select',
        name: 'balanceRange',
        label: '餘額範圍',
        options: [
          { value: '0-1000', label: '0-1000' },
          { value: '1001-5000', label: '1001-5000' },
          { value: '5001-10000', label: '5001-10000' },
          { value: '10001+', label: '10001以上' }
        ]
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'walletId', label: '錢包編號', width: '120px' },
      { prop: 'memberName', label: '會員姓名', sortable: true },
      { prop: 'balance', label: '餘額', sortable: true },
      { prop: 'lastTransactionTime', label: '最後交易時間', formatter: formatDateTime },
      { prop: 'status', label: '狀態' }
    ]

    // 數據狀態
    const loading = ref(false)
    const wallets = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const selectedRows = ref([])

    // 統計數據
    const totalWallets = ref(0)
    const totalBalance = ref(0)
    const dailyTransactions = ref(0)

    // 儲值相關
    const showDepositModal = ref(false)
    const pendingDepositWallet = ref(null)
    const depositAmount = ref(null)
    const depositError = ref('')
    const paymentMethod = ref('信用卡')

    // 凍結相關
    const showFreezeModal = ref(false)
    const pendingFreezeWallet = ref(null)
    const freezeReason = ref('')

    // 載入錢包列表
    const fetchWallets = async (params = {}) => {
      try {
        loading.value = true
        const response = await walletAPI.getWallets({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        wallets.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入錢包列表失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入統計數據
    const fetchStats = async () => {
      try {
        const response = await walletAPI.getWalletStats()
        totalWallets.value = response.totalWallets
        totalBalance.value = response.totalBalance
        dailyTransactions.value = response.dailyTransactions
      } catch (error) {
        console.error('載入統計數據失敗:', error)
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchWallets(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchWallets()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchWallets()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchWallets()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchWallets({ sortField: field, sortOrder: order })
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    // 查看詳情
    const handleView = (row) => {
      router.push(`/wallets/${row.walletId}`)
    }

    // 顯示儲值對話框
    const showDepositModal = (wallet) => {
      pendingDepositWallet.value = wallet
      depositAmount.value = null
      depositError.value = ''
      paymentMethod.value = '信用卡'
      showDepositModal.value = true
    }

    // 確認儲值
    const confirmDeposit = async () => {
      if (!depositAmount.value || depositAmount.value <= 0) {
        depositError.value = '請輸入有效的儲值金額'
        return
      }

      try {
        await walletAPI.deposit(pendingDepositWallet.value.walletId, {
          amount: depositAmount.value,
          paymentMethod: paymentMethod.value
        })
        await fetchWallets()
        showDepositModal.value = false
      } catch (error) {
        console.error('儲值失敗:', error)
        depositError.value = error.message
      }
    }

    // 處理凍結
    const handleFreeze = (wallet) => {
      pendingFreezeWallet.value = wallet
      freezeReason.value = ''
      showFreezeModal.value = true
    }

    // 確認凍結
    const confirmFreeze = async () => {
      try {
        await walletAPI.freezeWallet(pendingFreezeWallet.value.walletId, {
          reason: freezeReason.value
        })
        await fetchWallets()
        showFreezeModal.value = false
      } catch (error) {
        console.error('凍結錢包失敗:', error)
      }
    }

    // 處理解凍
    const handleUnfreeze = async (wallet) => {
      try {
        await walletAPI.unfreezeWallet(wallet.walletId)
        await fetchWallets()
      } catch (error) {
        console.error('解凍錢包失敗:', error)
      }
    }

    // 取得餘額樣式
    const getBalanceClass = (balance) => {
      return {
        'text-success': balance > 0,
        'text-danger': balance <= 0
      }
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '正常': 'badge bg-success',
        '凍結': 'badge bg-danger'
      }
      return classMap[status] || 'badge bg-secondary'
    }

    onMounted(() => {
      fetchWallets()
      fetchStats()
    })

    return {
      searchFields,
      columns,
      loading,
      wallets,
      total,
      page,
      pageSize,
      selectedRows,
      totalWallets,
      totalBalance,
      dailyTransactions,
      showDepositModal,
      depositAmount,
      depositError,
      paymentMethod,
      showFreezeModal,
      freezeReason,
      handleSearch,
      handleReset,
      handlePageChange,
      handlePageSizeChange,
      handleSort,
      handleSelectionChange,
      handleView,
      showDepositModal,
      confirmDeposit,
      handleFreeze,
      confirmFreeze,
      handleUnfreeze,
      getBalanceClass,
      getStatusClass,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.wallet-list {
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
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
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

/* 狀態樣式 */
.badge {
  padding: 0.5em 0.75em;
  font-weight: 500;
}

.text-success {
  color: