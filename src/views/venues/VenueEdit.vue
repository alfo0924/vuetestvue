<template>
  <div class="venue-edit">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">{{ isNewVenue ? '新增場地' : '編輯場地' }}</h5>
        </div>
        <div class="card-body">
          <!-- 編輯表單 -->
          <BaseForm
              :form-fields="formFields"
              :initial-data="formData"
              :validation-rules="validationRules"
              :loading="loading"
              @submit="handleSubmit"
              @cancel="handleCancel"
          >
            <!-- 座位配置區域 -->
            <template #after-fields>
              <div class="mt-4">
                <h6>座位配置</h6>
                <div class="seat-configuration">
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
                          'disabled': isDisabledSeat(`${row}${col}`),
                          'enabled': !isDisabledSeat(`${row}${col}`)
                        }"
                          @click="toggleSeat(`${row}${col}`)"
                      >
                        {{ `${row}${col}` }}
                      </div>
                    </div>
                  </div>
                  <div class="seat-legend mt-3">
                    <div class="legend-item">
                      <div class="seat enabled"></div>
                      <span>可用座位</span>
                    </div>
                    <div class="legend-item">
                      <div class="seat disabled"></div>
                      <span>停用座位</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 場地使用統計 -->
              <div v-if="!isNewVenue" class="mt-4">
                <h6>使用統計</h6>
                <div class="usage-stats">
                  <div class="row">
                    <div class="col-md-4">
                      <div class="stat-card">
                        <div class="stat-title">本月使用場次</div>
                        <div class="stat-value">{{ usageStats.monthlyUsage || 0 }}</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="stat-card">
                        <div class="stat-title">平均上座率</div>
                        <div class="stat-value">{{ usageStats.averageOccupancy || '0%' }}</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="stat-card">
                        <div class="stat-title">未來預約場次</div>
                        <div class="stat-value">{{ usageStats.futureBookings || 0 }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BaseForm>
        </div>
      </div>

      <!-- 場次列表 -->
      <div v-if="!isNewVenue" class="card mt-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">場次列表</h5>
          <BaseButton
              icon="plus"
              variant="primary"
              size="sm"
              @click="showAddShowingModal"
          >
            新增場次
          </BaseButton>
        </div>
        <div class="card-body">
          <BaseTable
              :columns="showingColumns"
              :data="showings"
              :loading="loadingShowings"
              @edit="editShowing"
              @delete="deleteShowing"
          />
        </div>
      </div>
    </div>

    <!-- 場次編輯對話框 -->
    <BaseModal
        v-model="showShowingModal"
        :title="editingShowing ? '編輯場次' : '新增場次'"
        @confirm="handleShowingSubmit"
    >
      <form @submit.prevent>
        <div class="mb-3">
          <label class="form-label">電影</label>
          <select
              class="form-select"
              v-model="showingForm.movieId"
              :class="{ 'is-invalid': showingErrors.movieId }"
          >
            <option value="">請選擇電影</option>
            <option
                v-for="movie in movies"
                :key="movie.id"
                :value="movie.id"
            >
              {{ movie.name }}
            </option>
          </select>
          <div class="invalid-feedback">{{ showingErrors.movieId }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">放映時間</label>
          <input
              type="datetime-local"
              class="form-control"
              v-model="showingForm.showTime"
              :class="{ 'is-invalid': showingErrors.showTime }"
          >
          <div class="invalid-feedback">{{ showingErrors.showTime }}</div>
        </div>
      </form>
    </BaseModal>

    <!-- 確認對話框 -->
    <BaseModal
        v-model="showConfirmModal"
        title="確認儲存"
        @confirm="confirmSubmit"
    >
      <p>確定要儲存這些更改嗎？</p>
    </BaseModal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import venueAPI from '@/api/venues'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'VenueEdit',
  components: {
    Breadcrumb,
    BaseForm,
    BaseTable,
    BaseButton,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const venueId = route.params.id

    // 判斷是否為新增場地
    const isNewVenue = computed(() => !venueId)

    // 載入狀態
    const loading = ref(false)
    const loadingShowings = ref(false)
    const saving = ref(false)

    // 表單數據
    const formData = reactive({
      venueName: '',
      seatCount: '',
      address: '',
      capacity: ''
    })

    // 表單欄位定義
    const formFields = [
      {
        type: 'text',
        name: 'venueName',
        label: '場地名稱',
        required: true
      },
      {
        type: 'number',
        name: 'capacity',
        label: '容納人數',
        required: true,
        min: 1
      },
      {
        type: 'text',
        name: 'address',
        label: '場地地址',
        required: true
      }
    ]

    // 驗證規則
    const validationRules = {
      venueName: {
        required: true,
        maxLength: 100
      },
      capacity: {
        required: true,
        min: 1
      },
      address: {
        required: true
      }
    }

    // 座位相關
    const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const seatCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const disabledSeats = ref([])

    // 使用統計
    const usageStats = ref({})

    // 場次相關
    const showings = ref([])
    const movies = ref([])
    const showShowingModal = ref(false)
    const editingShowing = ref(null)
    const showingForm = reactive({
      movieId: '',
      showTime: ''
    })
    const showingErrors = ref({})

    // 場次表格列定義
    const showingColumns = [
      { prop: 'movieName', label: '電影名稱' },
      {
        prop: 'showTime',
        label: '放映時間',
        formatter: formatDateTime
      },
      { prop: 'availableSeats', label: '可用座位數' }
    ]

    // 確認對話框
    const showConfirmModal = ref(false)
    const errors = ref({})

    // 載入場地資料
    const fetchVenueData = async () => {
      if (isNewVenue.value) return

      try {
        loading.value = true
        const response = await venueAPI.getVenueById(venueId)
        Object.assign(formData, response)
        disabledSeats.value = response.disabledSeats || []
      } catch (error) {
        console.error('載入場地資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入使用統計
    const fetchUsageStats = async () => {
      if (isNewVenue.value) return

      try {
        const response = await venueAPI.getVenueStats(venueId)
        usageStats.value = response
      } catch (error) {
        console.error('載入使用統計失敗:', error)
      }
    }

    // 載入場次資料
    const fetchShowings = async () => {
      if (isNewVenue.value) return

      try {
        loadingShowings.value = true
        const response = await venueAPI.getVenueSchedule(venueId)
        showings.value = response
      } catch (error) {
        console.error('載入場次資料失敗:', error)
      } finally {
        loadingShowings.value = false
      }
    }

    // 載入電影列表
    const fetchMovies = async () => {
      try {
        const response = await venueAPI.getMovies()
        movies.value = response
      } catch (error) {
        console.error('載入電影列表失敗:', error)
      }
    }

    // 處理座位切換
    const toggleSeat = (seatNumber) => {
      const index = disabledSeats.value.indexOf(seatNumber)
      if (index === -1) {
        disabledSeats.value.push(seatNumber)
      } else {
        disabledSeats.value.splice(index, 1)
      }
    }

    // 判斷座位是否停用
    const isDisabledSeat = (seatNumber) => {
      return disabledSeats.value.includes(seatNumber)
    }

    // 顯示新增場次對話框
    const showAddShowingModal = () => {
      editingShowing.value = null
      showingForm.movieId = ''
      showingForm.showTime = ''
      showShowingModal.value = true
    }

    // 編輯場次
    const editShowing = (showing) => {
      editingShowing.value = showing
      showingForm.movieId = showing.movieId
      showingForm.showTime = showing.showTime
      showShowingModal.value = true
    }

    // 刪除場次
    const deleteShowing = async (showing) => {
      try {
        await venueAPI.deleteShowing(venueId, showing.id)
        await fetchShowings()
      } catch (error) {
        console.error('刪除場次失敗:', error)
      }
    }

    // 處理場次提交
    const handleShowingSubmit = async () => {
      try {
        if (editingShowing.value) {
          await venueAPI.updateShowing(
              venueId,
              editingShowing.value.id,
              showingForm
          )
        } else {
          await venueAPI.createShowing(venueId, showingForm)
        }
        await fetchShowings()
        showShowingModal.value = false
      } catch (error) {
        console.error('儲存場次失敗:', error)
        showingErrors.value = error.response?.data?.errors || {}
      }
    }

    // 處理表單提交
    const handleSubmit = () => {
      showConfirmModal.value = true
    }

    // 確認提交
    const confirmSubmit = async () => {
      try {
        saving.value = true
        const data = {
          ...formData,
          disabledSeats: disabledSeats.value
        }
        if (isNewVenue.value) {
          await venueAPI.createVenue(data)
        } else {
          await venueAPI.updateVenue(venueId, data)
        }
        router.push('/venues')
      } catch (error) {
        console.error('儲存失敗:', error)
        errors.value = error.response?.data?.errors || {}
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
      fetchVenueData()
      fetchUsageStats()
      fetchShowings()
      fetchMovies()
    })

    return {
      isNewVenue,
      loading,
      loadingShowings,
      saving,
      formData,
      formFields,
      validationRules,
      seatRows,
      seatCols,
      usageStats,
      showings,
      movies,
      showShowingModal,
      showingForm,
      showingErrors,
      showingColumns,
      showConfirmModal,
      errors,
      toggleSeat,
      isDisabledSeat,
      showAddShowingModal,
      editShowing,
      deleteShowing,
      handleShowingSubmit,
      handleSubmit,
      confirmSubmit,
      handleCancel,
      formatDateTime
    }
  }
}
</script>
<style scoped>
.venue-edit {
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

/* 座位配置樣式 */
.seat-configuration {
  max-width: 800px;
  margin: 0 auto;
}

.screen {
  background-color: #e9ecef;
  text-align: center;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 2rem;
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

.seat.enabled {
  background-color: #e9ecef;
}

.seat.disabled {
  background-color: #dc3545;
  color: #fff;
}

.seat:hover {
  transform: scale(1.1);
}

/* 座位圖例樣式 */
.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
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

/* 使用統計樣式 */
.usage-stats {
  margin-top: 1rem;
}

.stat-card {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
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
  color: #0d6efd;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .venue-edit {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .seat {
    width: 30px;
    height: 30px;
    font-size: 0.875rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }
}

/* 列印樣式 */
@media print {
  .venue-edit {
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