<template>
  <div class="booking-detail">
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
      <!-- 訂位基本資訊 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">訂位資訊</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>訂位編號：</strong> {{ bookingData.bookingId }}</p>
              <p><strong>訂位時間：</strong> {{ formatDateTime(bookingData.bookingTime) }}</p>
              <p><strong>訂位狀態：</strong>
                <span :class="getStatusClass(bookingData.status)">
                  {{ bookingData.status }}
                </span>
              </p>
            </div>
            <div class="col-md-6">
              <p><strong>會員姓名：</strong> {{ bookingData.memberName }}</p>
              <p><strong>聯絡電話：</strong> {{ bookingData.phone }}</p>
              <p><strong>電子郵件：</strong> {{ bookingData.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 電影資訊 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">電影資訊</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>電影名稱：</strong> {{ bookingData.movieName }}</p>
              <p><strong>放映時間：</strong> {{ formatDateTime(bookingData.showTime) }}</p>
              <p><strong>片長：</strong> {{ bookingData.duration }} 分鐘</p>
            </div>
            <div class="col-md-6">
              <p><strong>場地：</strong> {{ bookingData.venueName }}</p>
              <p><strong>座位號碼：</strong> {{ bookingData.seatNumber }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 付款資訊 -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">付款資訊</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>票價：</strong> $ {{ bookingData.price }}</p>
              <p><strong>優惠折扣：</strong> $ {{ bookingData.discount || 0 }}</p>
              <p><strong>實付金額：</strong> $ {{ bookingData.finalPrice }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>付款方式：</strong> {{ bookingData.paymentMethod }}</p>
              <p><strong>付款狀態：</strong>
                <span :class="getPaymentStatusClass(bookingData.paymentStatus)">
                  {{ bookingData.paymentStatus }}
                </span>
              </p>
              <p><strong>交易時間：</strong> {{ formatDateTime(bookingData.paymentTime) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-end gap-2">
            <BaseButton
                v-if="canCancel"
                variant="danger"
                icon="x-circle"
                :loading="cancelling"
                @click="showCancelModal = true"
            >
              取消訂位
            </BaseButton>
            <BaseButton
                variant="primary"
                icon="printer"
                @click="handlePrint"
            >
              列印訂位單
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

    <!-- 取消訂位確認對話框 -->
    <BaseModal
        v-model="showCancelModal"
        title="確認取消訂位"
        :loading="cancelling"
        @confirm="handleCancel"
    >
      <p>確定要取消此訂位嗎？取消後可能無法恢復。</p>
      <div class="mb-3">
        <label class="form-label">取消原因</label>
        <textarea
            v-model="cancelReason"
            class="form-control"
            rows="3"
            placeholder="請輸入取消原因"
        ></textarea>
      </div>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import bookingAPI from '@/api/bookings'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'BookingDetail',
  components: {
    Breadcrumb,
    BaseButton,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const bookingId = route.params.id

    // 載入狀態
    const loading = ref(false)
    const cancelling = ref(false)

    // 訂位資料
    const bookingData = ref({})

    // 取消訂位
    const showCancelModal = ref(false)
    const cancelReason = ref('')

    // 判斷是否可以取消訂位
    const canCancel = computed(() => {
      if (!bookingData.value) return false
      return bookingData.value.status === '已預訂' &&
          new Date(bookingData.value.showTime) > new Date()
    })

    // 載入訂位資料
    const fetchBookingData = async () => {
      try {
        loading.value = true
        const response = await bookingAPI.getBookingById(bookingId)
        bookingData.value = response
      } catch (error) {
        console.error('載入訂位資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 取消訂位
    const handleCancel = async () => {
      try {
        cancelling.value = true
        await bookingAPI.cancelBooking(bookingId, { reason: cancelReason.value })
        showCancelModal.value = false
        await fetchBookingData()
      } catch (error) {
        console.error('取消訂位失敗:', error)
      } finally {
        cancelling.value = false
      }
    }

    // 列印訂位單
    const handlePrint = async () => {
      try {
        const response = await bookingAPI.getBookingReceipt(bookingId)
        // 處理列印邏輯
        window.print()
      } catch (error) {
        console.error('獲取訂位單失敗:', error)
      }
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '已預訂': 'text-primary',
        '已取消': 'text-danger',
        '已完成': 'text-success'
      }
      return classMap[status] || 'text-secondary'
    }

    // 取得付款狀態樣式
    const getPaymentStatusClass = (status) => {
      const classMap = {
        '已付款': 'text-success',
        '未付款': 'text-warning',
        '已退款': 'text-info'
      }
      return classMap[status] || 'text-secondary'
    }

    onMounted(() => {
      fetchBookingData()
    })

    return {
      loading,
      cancelling,
      bookingData,
      showCancelModal,
      cancelReason,
      canCancel,
      handleCancel,
      handlePrint,
      getStatusClass,
      getPaymentStatusClass,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.booking-detail {
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
.text-primary {
  color: #0d6efd !important;
}

.text-success {
  color: #198754 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #0dcaf0 !important;
}

/* 列印樣式 */
@media print {
  .booking-detail {
    padding: 0;
  }

  .card {
    box-shadow: none;
    border: 1px solid #dee2e6;
  }

  .btn-group {
    display: none;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .booking-detail {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>