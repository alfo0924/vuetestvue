<template>
  <div class="card-detail">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <!-- 載入中狀態 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
    </div>

    <!-- 主要內容 -->
    <div v-else class="content-wrapper">
      <!-- 市民卡基本資訊 -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">市民卡資訊</h5>
          <BaseButton
              v-if="!isEditing"
              icon="pencil"
              variant="outline-primary"
              size="sm"
              @click="startEditing"
          >
            編輯
          </BaseButton>
        </div>
        <div class="card-body">
          <form v-if="isEditing" @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">卡號</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editForm.cardNumber"
                    :class="{ 'is-invalid': errors.cardNumber }"
                    disabled
                >
                <div class="invalid-feedback">{{ errors.cardNumber }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">持卡人姓名</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editForm.holderName"
                    :class="{ 'is-invalid': errors.holderName }"
                >
                <div class="invalid-feedback">{{ errors.holderName }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">卡片類型</label>
                <select
                    class="form-select"
                    v-model="editForm.cardType"
                    :class="{ 'is-invalid': errors.cardType }"
                >
                  <option value="一般卡">一般卡</option>
                  <option value="敬老卡">敬老卡</option>
                  <option value="愛心卡">愛心卡</option>
                  <option value="學生卡">學生卡</option>
                </select>
                <div class="invalid-feedback">{{ errors.cardType }}</div>
              </div>
              <div class="col-12">
                <div class="d-flex justify-content-end gap-2">
                  <BaseButton
                      variant="secondary"
                      @click="cancelEditing"
                      :disabled="saving"
                  >
                    取消
                  </BaseButton>
                  <BaseButton
                      type="submit"
                      variant="primary"
                      :loading="saving"
                  >
                    儲存
                  </BaseButton>
                </div>
              </div>
            </div>
          </form>
          <div v-else class="row">
            <div class="col-md-6">
              <p><strong>卡號：</strong> {{ cardData.cardNumber }}</p>
              <p><strong>持卡人姓名：</strong> {{ cardData.holderName }}</p>
              <p><strong>卡片類型：</strong> {{ cardData.cardType }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>綁定會員：</strong> {{ cardData.memberName }}</p>
              <p><strong>綁定時間：</strong> {{ formatDateTime(cardData.bindTime) }}</p>
              <p><strong>狀態：</strong>
                <span :class="getStatusClass(cardData.status)">
                  {{ cardData.status }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用記錄 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">使用記錄</h5>
        </div>
        <div class="card-body">
          <BaseTable
              :columns="usageColumns"
              :data="usageHistory"
              :loading="loadingUsage"
              :total="totalUsage"
              :page="page"
              :pageSize="pageSize"
              @update:page="handlePageChange"
              @update:pageSize="handlePageSizeChange"
          />
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-end gap-2">
            <BaseButton
                v-if="cardData.status === '正常'"
                variant="danger"
                icon="x-circle"
                @click="handleReportLoss"
            >
              掛失
            </BaseButton>
            <BaseButton
                v-if="cardData.status === '已掛失'"
                variant="primary"
                icon="arrow-repeat"
                @click="handleReplace"
            >
              補發
            </BaseButton>
            <BaseButton
                variant="secondary"
                icon="arrow-left"
                @click="$router.back()"
            >
              返回
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 掛失確認對話框 -->
    <BaseModal
        v-model="showLossModal"
        title="確認掛失"
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

    <!-- 補發對話框 -->
    <BaseModal
        v-model="showReplaceModal"
        title="市民卡補發"
        @confirm="confirmReplace"
    >
      <div class="mb-3">
        <label class="form-label">新卡號</label>
        <input
            type="text"
            class="form-control"
            v-model="newCardNumber"
            placeholder="請輸入新卡號"
        >
      </div>
      <div class="mb-3">
        <label class="form-label">補發原因</label>
        <textarea
            v-model="replaceReason"
            class="form-control"
            rows="3"
            placeholder="請輸入補發原因"
        ></textarea>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import citizenCardAPI from '@/api/citizenCards'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'CardDetail',
  components: {
    Breadcrumb,
    BaseButton,
    BaseTable,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const cardNumber = route.params.id

    // 載入狀態
    const loading = ref(false)
    const loadingUsage = ref(false)
    const saving = ref(false)

    // 市民卡資料
    const cardData = ref({})
    const usageHistory = ref([])
    const totalUsage = ref(0)
    const page = ref(1)
    const pageSize = ref(10)

    // 編輯表單
    const isEditing = ref(false)
    const editForm = reactive({
      cardNumber: '',
      holderName: '',
      cardType: ''
    })
    const errors = ref({})

    // 使用記錄表格列定義
    const usageColumns = [
      {
        prop: 'usageTime',
        label: '使用時間',
        formatter: formatDateTime
      },
      { prop: 'usageType', label: '使用類型' },
      { prop: 'description', label: '說明' }
    ]

    // 掛失相關
    const showLossModal = ref(false)
    const lossReason = ref('')
    const contactPhone = ref('')

    // 補發相關
    const showReplaceModal = ref(false)
    const newCardNumber = ref('')
    const replaceReason = ref('')

    // 載入市民卡資料
    const fetchCardData = async () => {
      try {
        loading.value = true
        const response = await citizenCardAPI.getCitizenCardByNumber(cardNumber)
        cardData.value = response
        // 初始化編輯表單
        Object.assign(editForm, {
          cardNumber: response.cardNumber,
          holderName: response.holderName,
          cardType: response.cardType
        })
      } catch (error) {
        console.error('載入市民卡資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入使用記錄
    const fetchUsageHistory = async () => {
      try {
        loadingUsage.value = true
        const response = await citizenCardAPI.getCardTransactions(cardNumber, {
          page: page.value,
          pageSize: pageSize.value
        })
        usageHistory.value = response.data
        totalUsage.value = response.total
      } catch (error) {
        console.error('載入使用記錄失敗:', error)
      } finally {
        loadingUsage.value = false
      }
    }

    // 開始編輯
    const startEditing = () => {
      isEditing.value = true
    }

    // 取消編輯
    const cancelEditing = () => {
      isEditing.value = false
      Object.assign(editForm, {
        cardNumber: cardData.value.cardNumber,
        holderName: cardData.value.holderName,
        cardType: cardData.value.cardType
      })
      errors.value = {}
    }

    // 提交編輯
    const handleSubmit = async () => {
      try {
        saving.value = true
        await citizenCardAPI.updateCard(cardNumber, editForm)
        await fetchCardData()
        isEditing.value = false
      } catch (error) {
        console.error('更新市民卡資料失敗:', error)
        errors.value = error.response?.data?.errors || {}
      } finally {
        saving.value = false
      }
    }

    // 處理掛失
    const handleReportLoss = () => {
      lossReason.value = ''
      contactPhone.value = ''
      showLossModal.value = true
    }

    // 確認掛失
    const confirmReportLoss = async () => {
      try {
        await citizenCardAPI.reportLoss(cardNumber, {
          reason: lossReason.value,
          contactPhone: contactPhone.value
        })
        await fetchCardData()
        showLossModal.value = false
      } catch (error) {
        console.error('掛失失敗:', error)
      }
    }

    // 處理補發
    const handleReplace = () => {
      newCardNumber.value = ''
      replaceReason.value = ''
      showReplaceModal.value = true
    }

    // 確認補發
    const confirmReplace = async () => {
      try {
        await citizenCardAPI.replaceCard(cardNumber, {
          newCardNumber: newCardNumber.value,
          reason: replaceReason.value
        })
        await fetchCardData()
        showReplaceModal.value = false
      } catch (error) {
        console.error('補發失敗:', error)
      }
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchUsageHistory()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchUsageHistory()
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '正常': 'text-success',
        '已掛失': 'text-danger',
        '已註銷': 'text-secondary'
      }
      return classMap[status] || 'text-secondary'
    }

    onMounted(() => {
      fetchCardData()
      fetchUsageHistory()
    })

    return {
      loading,
      loadingUsage,
      saving,
      cardData,
      usageHistory,
      totalUsage,
      page,
      pageSize,
      isEditing,
      editForm,
      errors,
      usageColumns,
      showLossModal,
      lossReason,
      contactPhone,
      showReplaceModal,
      newCardNumber,
      replaceReason,
      startEditing,
      cancelEditing,
      handleSubmit,
      handleReportLoss,
      confirmReportLoss,
      handleReplace,
      confirmReplace,
      handlePageChange,
      handlePageSizeChange,
      getStatusClass,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.card-detail {
  padding: 1.5rem;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.card {
  background-color: #fff;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
}

.card-body {
  padding: 1.5rem;
}

/* 狀態樣式 */
.text-success {
  color: #198754 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-secondary {
  color: #6c757d !important;
}

/* 使用記錄表格樣式 */
.usage-history {
  margin-top: 1rem;
}

.usage-type {
  font-weight: 500;
}

.usage-type.credit {
  color: #198754;
}

.usage-type.debit {
  color: #dc3545;
}

/* 表單樣式 */
.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* 動畫效果 */
.card {
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(1px);
}

/* 載入動畫 */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* 模態框樣式 */
.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .card-detail {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .btn-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-group .btn {
    width: 100%;
  }
}

/* 列印樣式 */
@media print {
  .card-detail {
    padding: 0;
  }

  .card {
    box-shadow: none;
    border: 1px solid #dee2e6;
  }

  .btn-group,
  .modal {
    display: none;
  }
}
</style>