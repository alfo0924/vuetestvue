<template>
  <div class="booking-edit">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">{{ isNewBooking ? '新增訂位' : '編輯訂位' }}</h5>
        </div>
        <div class="card-body">
          <!-- 訂位表單 -->
          <BaseForm
              :form-fields="formFields"
              :initial-data="formData"
              :validation-rules="validationRules"
              :loading="loading"
              @submit="handleSubmit"
              @cancel="handleCancel"
          >
            <!-- 座位選擇區域 -->
            <template #after-fields>
              <div class="mt-4">
                <h6>座位選擇</h6>
                <div class="seat-selection">
                  <div class="screen mb-4">螢幕</div>
                  <div class="seats-container">
                    <div
                        v-for="row in seatRows"
                        :key="row"
                        class="seat-row"
                    >
                      <div
                          v-for="col in seatCols"
                          :key="`${row}${col}`"
                          class="seat"
                          :class="{
                          'selected': isSelectedSeat(`${row}${col}`),
                          'occupied': isOccupiedSeat(`${row}${col}`),
                          'available': isAvailableSeat(`${row}${col}`)
                        }"
                          @click="handleSeatClick(`${row}${col}`)"
                      >
                        {{ `${row}${col}` }}
                      </div>
                    </div>
                  </div>
                  <div class="seat-legend mt-3">
                    <div class="legend-item">
                      <div class="seat available"></div>
                      <span>可選</span>
                    </div>
                    <div class="legend-item">
                      <div class="seat selected"></div>
                      <span>已選</span>
                    </div>
                    <div class="legend-item">
                      <div class="seat occupied"></div>
                      <span>已訂</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 價格資訊 -->
              <div class="mt-4">
                <h6>價格資訊</h6>
                <div class="price-info">
                  <div class="row">
                    <div class="col-md-6">
                      <p>票價：$ {{ ticketPrice }}</p>
                      <p>優惠折扣：$ {{ discount }}</p>
                      <p class="total-price">總計：$ {{ finalPrice }}</p>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label class="form-label">選擇優惠</label>
                        <select
                            class="form-select"
                            v-model="selectedDiscount"
                            :disabled="!availableDiscounts.length"
                        >
                          <option value="">不使用優惠</option>
                          <option
                              v-for="discount in availableDiscounts"
                              :key="discount.id"
                              :value="discount.id"
                          >
                            {{ discount.name }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BaseForm>
        </div>
      </div>
    </div>

    <!-- 確認對話框 -->
    <BaseModal
        v-model="showConfirmModal"
        title="確認訂位"
        @confirm="confirmBooking"
    >
      <div class="booking-summary">
        <h6>訂位資訊確認</h6>
        <p><strong>電影：</strong>{{ formData.movieName }}</p>
        <p><strong>場次：</strong>{{ formatDateTime(formData.showTime) }}</p>
        <p><strong>座位：</strong>{{ selectedSeats.join(', ') }}</p>
        <p><strong>總金額：</strong>$ {{ finalPrice }}</p>
      </div>
    </BaseModal>
  </div>
</template>
<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import bookingAPI from '@/api/bookings'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'BookingEdit',
  components: {
    Breadcrumb,
    BaseForm,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const bookingId = route.params.id

    // 判斷是否為新增訂位
    const isNewBooking = computed(() => !bookingId)

    // 載入狀態
    const loading = ref(false)
    const saving = ref(false)

    // 表單數據
    const formData = reactive({
      movieId: '',
      showingId: '',
      movieName: '',
      showTime: '',
      seatNumber: '',
      memberName: '',
      phone: '',
      email: ''
    })

    // 表單欄位定義
    const formFields = [
      {
        type: 'select',
        name: 'movieId',
        label: '電影',
        required: true,
        options: []
      },
      {
        type: 'select',
        name: 'showingId',
        label: '場次',
        required: true,
        options: []
      },
      {
        type: 'text',
        name: 'memberName',
        label: '訂位人姓名',
        required: true
      },
      {
        type: 'text',
        name: 'phone',
        label: '聯絡電話',
        required: true
      },
      {
        type: 'email',
        name: 'email',
        label: '電子郵件',
        required: true
      }
    ]

    // 驗證規則
    const validationRules = {
      movieId: { required: true },
      showingId: { required: true },
      memberName: { required: true },
      phone: {
        required: true,
        custom: (value) => {
          if (!/^09\d{8}$/.test(value)) {
            return '請輸入有效的手機號碼'
          }
        }
      },
      email: {
        required: true,
        email: true
      }
    }

    // 座位相關
    const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const seatCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const selectedSeats = ref([])
    const occupiedSeats = ref([])

    // 優惠相關
    const availableDiscounts = ref([])
    const selectedDiscount = ref('')
    const ticketPrice = ref(280)
    const discount = computed(() => {
      if (!selectedDiscount.value) return 0
      const discountItem = availableDiscounts.value.find(
          d => d.id === selectedDiscount.value
      )
      return discountItem ? discountItem.amount : 0
    })
    const finalPrice = computed(() => {
      return (ticketPrice.value - discount.value) * selectedSeats.value.length
    })

    // 確認對話框
    const showConfirmModal = ref(false)

    // 載入訂位資料
    const fetchBookingData = async () => {
      if (isNewBooking.value) return

      try {
        loading.value = true
        const response = await bookingAPI.getBookingById(bookingId)
        Object.assign(formData, response)
        selectedSeats.value = [response.seatNumber]
      } catch (error) {
        console.error('載入訂位資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入電影和場次資料
    const fetchMovieData = async () => {
      try {
        const [moviesRes, showingsRes] = await Promise.all([
          bookingAPI.getMovies(),
          formData.movieId ? bookingAPI.getShowings(formData.movieId) : []
        ])
        formFields[0].options = moviesRes.map(movie => ({
          value: movie.id,
          label: movie.name
        }))
        formFields[1].options = showingsRes.map(showing => ({
          value: showing.id,
          label: formatDateTime(showing.showTime)
        }))
      } catch (error) {
        console.error('載入電影資料失敗:', error)
      }
    }

    // 載入優惠資料
    const fetchDiscounts = async () => {
      try {
        const response = await bookingAPI.getAvailableDiscounts()
        availableDiscounts.value = response
      } catch (error) {
        console.error('載入優惠資料失敗:', error)
      }
    }

    // 座位相關方法
    const isSelectedSeat = (seatNumber) => {
      return selectedSeats.value.includes(seatNumber)
    }

    const isOccupiedSeat = (seatNumber) => {
      return occupiedSeats.value.includes(seatNumber)
    }

    const isAvailableSeat = (seatNumber) => {
      return !isOccupiedSeat(seatNumber)
    }

    const handleSeatClick = (seatNumber) => {
      if (isOccupiedSeat(seatNumber)) return

      const index = selectedSeats.value.indexOf(seatNumber)
      if (index === -1) {
        selectedSeats.value.push(seatNumber)
      } else {
        selectedSeats.value.splice(index, 1)
      }
      formData.seatNumber = selectedSeats.value.join(',')
    }

    // 處理表單提交
    const handleSubmit = async (data) => {
      if (!selectedSeats.value.length) {
        alert('請選擇座位')
        return
      }
      showConfirmModal.value = true
    }

    // 確認訂位
    const confirmBooking = async () => {
      try {
        saving.value = true
        const bookingData = {
          ...formData,
          discountId: selectedDiscount.value,
          finalPrice: finalPrice.value
        }
        if (isNewBooking.value) {
          await bookingAPI.createBooking(bookingData)
        } else {
          await bookingAPI.updateBooking(bookingId, bookingData)
        }
        router.push('/bookings')
      } catch (error) {
        console.error('儲存失敗:', error)
      } finally {
        saving.value = false
        showConfirmModal.value = false
      }
    }

    // 取消編輯
    const handleCancel = () => {
      router.back()
    }

    onMounted(() => {
      fetchBookingData()
      fetchMovieData()
      fetchDiscounts()
    })

    return {
      isNewBooking,
      loading,
      saving,
      formData,
      formFields,
      validationRules,
      seatRows,
      seatCols,
      selectedSeats,
      occupiedSeats,
      availableDiscounts,
      selectedDiscount,
      ticketPrice,
      discount,
      finalPrice,
      showConfirmModal,
      isSelectedSeat,
      isOccupiedSeat,
      isAvailableSeat,
      handleSeatClick,
      handleSubmit,
      confirmBooking,
      handleCancel,
      formatDateTime
    }
  }
}
</script>
<style scoped>
.booking-edit {
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

/* 座位選擇樣式 */
.seat-selection {
  max-width: 800px;
  margin: 0 auto;
}

.screen {
  background-color: #e9ecef;
  text-align: center;
  padding: 1rem;
  border-radius: 0.25rem;
}

.seats-container {
  margin-top: 2rem;
}

.seat-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.seat {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seat.available {
  background-color: #e9ecef;
}

.seat.selected {
  background-color: #0d6efd;
  color: #fff;
}

.seat.occupied {
  background-color: #dc3545;
  color: #fff;
  cursor: not-allowed;
}

.seat:hover:not(.occupied) {
  transform: scale(1.1);
}

/* 座位圖例樣式 */
.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-item .seat {
  width: 20px;
  height: 20px;
  cursor: default;
}

/* 價格資訊樣式 */
.price-info /* 價格資訊樣式 */
.price-info {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.price-info p {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.price-info .total-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0d6efd;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.price-info .form-group {
  margin-bottom: 0;
}

.price-info .form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.price-info .form-select {
  max-width: 300px;
}

/* 優惠選擇樣式 */
.discount-selection {
  margin-top: 1rem;
}

.discount-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.discount-item:hover {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.discount-item.selected {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.discount-item .discount-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.discount-item .discount-description {
  font-size: 0.875rem;
  color: #6c757d;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .price-info {
    padding: 1rem;
  }

  .price-info .form-select {
    max-width: 100%;
  }

  .total-price {
    text-align: center;
  }

  .discount-item {
    padding: 0.5rem;
  }
}

/* 動畫效果 */
.price-info .total-price {
  transition: color 0.3s ease;
}

.price-info .total-price:hover {
  color: #0a58ca;
}

.discount-item {
  position: relative;
  overflow: hidden;
}

.discount-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(13, 110, 253, 0.1);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.discount-item:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* 優惠標籤樣式 */
.discount-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background-color: #0d6efd;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.discount-badge.expired {
  background-color: #6c757d;
}

/* 價格變動動畫 */
@keyframes priceChange {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
    color: #dc3545;
  }
  100% {
    transform: scale(1);
  }
}

.price-changed {
  animation: priceChange 0.3s ease;
}
</style>