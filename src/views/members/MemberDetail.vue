<template>
  <div class="member-detail">
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
      <!-- 會員基本資訊卡片 -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">基本資訊</h5>
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
                <label class="form-label">電子郵件</label>
                <input
                    type="email"
                    class="form-control"
                    v-model="editForm.email"
                    :class="{ 'is-invalid': errors.email }"
                >
                <div class="invalid-feedback">{{ errors.email }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">手機號碼</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editForm.phone"
                    :class="{ 'is-invalid': errors.phone }"
                >
                <div class="invalid-feedback">{{ errors.phone }}</div>
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
              <p><strong>會員ID：</strong> {{ memberData.memberId }}</p>
              <p><strong>電子郵件：</strong> {{ memberData.email }}</p>
              <p><strong>手機號碼：</strong> {{ memberData.phone }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>註冊日期：</strong> {{ formatDate(memberData.registerDate) }}</p>
              <p><strong>最後登入：</strong> {{ formatDate(memberData.lastLoginTime) }}</p>
              <p>
                <strong>帳號狀態：</strong>
                <span :class="getStatusClass(memberData.isActive)">
                  {{ memberData.isActive ? '啟用' : '停用' }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 市民卡資訊 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">市民卡資訊</h5>
        </div>
        <div class="card-body">
          <div v-if="memberData.citizenCard" class="row">
            <div class="col-md-6">
              <p><strong>卡號：</strong> {{ memberData.citizenCard.cardNumber }}</p>
              <p><strong>持卡人：</strong> {{ memberData.citizenCard.holderName }}</p>
              <p><strong>卡片類型：</strong> {{ memberData.citizenCard.cardType }}</p>
            </div>
          </div>
          <div v-else class="text-center py-3">
            <p class="text-muted">尚未綁定市民卡</p>
            <BaseButton
                icon="credit-card"
                variant="outline-primary"
                @click="showBindCardModal"
            >
              綁定市民卡
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- 電子錢包資訊 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">電子錢包</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>錢包餘額：</strong> $ {{ memberData.wallet?.balance || 0 }}</p>
            </div>
          </div>
          <div class="table-responsive">
            <h6>最近交易記錄</h6>
            <BaseTable
                :columns="transactionColumns"
                :data="transactions"
                :loading="loadingTransactions"
            />
          </div>
        </div>
      </div>

      <!-- 訂位記錄 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">訂位記錄</h5>
        </div>
        <div class="card-body">
          <BaseTable
              :columns="bookingColumns"
              :data="bookings"
              :loading="loadingBookings"
          />
        </div>
      </div>

      <!-- 優惠使用記錄 -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">優惠使用記錄</h5>
        </div>
        <div class="card-body">
          <BaseTable
              :columns="benefitColumns"
              :data="benefits"
              :loading="loadingBenefits"
          />
        </div>
      </div>
    </div>

    <!-- 綁定市民卡對話框 -->
    <BaseModal
        v-model="showBindCard"
        title="綁定市民卡"
        @confirm="handleBindCard"
    >
      <form @submit.prevent>
        <div class="mb-3">
          <label class="form-label">卡號</label>
          <input
              type="text"
              class="form-control"
              v-model="bindCardForm.cardNumber"
              :class="{ 'is-invalid': bindCardErrors.cardNumber }"
          >
          <div class="invalid-feedback">{{ bindCardErrors.cardNumber }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">持卡人姓名</label>
          <input
              type="text"
              class="form-control"
              v-model="bindCardForm.holderName"
              :class="{ 'is-invalid': bindCardErrors.holderName }"
          >
          <div class="invalid-feedback">{{ bindCardErrors.holderName }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">卡片類型</label>
          <select
              class="form-select"
              v-model="bindCardForm.cardType"
              :class="{ 'is-invalid': bindCardErrors.cardType }"
          >
            <option value="">請選擇</option>
            <option value="一般卡">一般卡</option>
            <option value="敬老卡">敬老卡</option>
            <option value="愛心卡">愛心卡</option>
            <option value="學生卡">學生卡</option>
          </select>
          <div class="invalid-feedback">{{ bindCardErrors.cardType }}</div>
        </div>
      </form>
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
import memberAPI from '@/api/members'
import { formatDate } from '@/utils/format'

export default {
  name: 'MemberDetail',
  components: {
    Breadcrumb,
    BaseButton,
    BaseTable,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const memberId = route.params.id

    // 載入狀態
    const loading = ref(true)
    const loadingTransactions = ref(false)
    const loadingBookings = ref(false)
    const loadingBenefits = ref(false)

    // 會員資料
    const memberData = ref({})
    const transactions = ref([])
    const bookings = ref([])
    const benefits = ref([])

    // 編輯表單
    const isEditing = ref(false)
    const saving = ref(false)
    const editForm = reactive({
      email: '',
      phone: ''
    })
    const errors = ref({})

    // 綁定市民卡
    const showBindCard = ref(false)
    const bindCardForm = reactive({
      cardNumber: '',
      holderName: '',
      cardType: ''
    })
    const bindCardErrors = ref({})

    // 表格列定義
    const transactionColumns = [
      { prop: 'transactionTime', label: '交易時間', formatter: formatDate },
      { prop: 'type', label: '類型' },
      { prop: 'amount', label: '金額' },
      { prop: 'description', label: '說明' }
    ]

    const bookingColumns = [
      { prop: 'bookingTime', label: '訂位時間', formatter: formatDate },
      { prop: 'movieName', label: '電影名稱' },
      { prop: 'seatNumber', label: '座位號碼' },
      { prop: 'status', label: '狀態' }
    ]

    const benefitColumns = [
      { prop: 'usageTime', label: '使用時間', formatter: formatDate },
      { prop: 'benefitName', label: '優惠名稱' },
      { prop: 'description', label: '說明' }
    ]

    // 載入會員資料
    const fetchMemberData = async () => {
      try {
        loading.value = true
        const response = await memberAPI.getMemberById(memberId)
        memberData.value = response
        // 初始化編輯表單
        editForm.email = response.email
        editForm.phone = response.phone
      } catch (error) {
        console.error('載入會員資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入交易記錄
    const fetchTransactions = async () => {
      try {
        loadingTransactions.value = true
        const response = await memberAPI.getMemberWallet(memberId)
        transactions.value = response.transactions
      } catch (error) {
        console.error('載入交易記錄失敗:', error)
      } finally {
        loadingTransactions.value = false
      }
    }

    // 載入訂位記錄
    const fetchBookings = async () => {
      try {
        loadingBookings.value = true
        const response = await memberAPI.getMemberBookings(memberId)
        bookings.value = response.bookings
      } catch (error) {
        console.error('載入訂位記錄失敗:', error)
      } finally {
        loadingBookings.value = false
      }
    }

    // 載入優惠使用記錄
    const fetchBenefits = async () => {
      try {
        loadingBenefits.value = true
        const response = await memberAPI.getMemberDiscounts(memberId)
        benefits.value = response.benefits
      } catch (error) {
        console.error('載入優惠記錄失敗:', error)
      } finally {
        loadingBenefits.value = false
      }
    }

    // 開始編輯
    const startEditing = () => {
      isEditing.value = true
    }

    // 取消編輯
    const cancelEditing = () => {
      isEditing.value = false
      editForm.email = memberData.value.email
      editForm.phone = memberData.value.phone
      errors.value = {}
    }

    // 提交編輯
    const handleSubmit = async () => {
      try {
        saving.value = true
        await memberAPI.updateMember(memberId, editForm)
        await fetchMemberData()
        isEditing.value = false
      } catch (error) {
        console.error('更新會員資料失敗:', error)
        errors.value = error.response?.data?.errors || {}
      } finally {
        saving.value = false
      }
    }

    // 顯示綁定市民卡對話框
    const showBindCardModal = () => {
      showBindCard.value = true
    }

    // 綁定市民卡
    const handleBindCard = async () => {
      try {
        await memberAPI.bindCitizenCard(memberId, bindCardForm)
        await fetchMemberData()
        showBindCard.value = false
      } catch (error) {
        console.error('綁定市民卡失敗:', error)
        bindCardErrors.value = error.response?.data?.errors || {}
      }
    }

    // 取得狀態樣式
    const getStatusClass = (isActive) => {
      return isActive ? 'text-success' : 'text-danger'
    }

    onMounted(() => {
      fetchMemberData()
      fetchTransactions()
      fetchBookings()
      fetchBenefits()
    })

    return {
      loading,
      loadingTransactions,
      loadingBookings,
      loadingBenefits,
      memberData,
      transactions,
      bookings,
      benefits,
      isEditing,
      saving,
      editForm,
      errors,
      showBindCard,
      bindCardForm,
      bindCardErrors,
      transactionColumns,
      bookingColumns,
      benefitColumns,
      startEditing,
      cancelEditing,
      handleSubmit,
      showBindCardModal,
      handleBindCard,
      getStatusClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.member-detail {
  padding: 1.5rem;