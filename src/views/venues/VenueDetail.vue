<template>
  <div class="venue-detail">
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
      <!-- 場地基本資訊 -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">場地資訊</h5>
          <BaseButton
              v-if="!isEditing && isAdmin"
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
                <label class="form-label">場地名稱</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editForm.venueName"
                    :class="{ 'is-invalid': errors.venueName }"
                >
                <div class="invalid-feedback">{{ errors.venueName }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">座位數量</label>
                <input
                    type="number"
                    class="form-control"
                    v-model.number="editForm.seatCount"
                    :class="{ 'is-invalid': errors.seatCount }"
                >
                <div class="invalid-feedback">{{ errors.seatCount }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">容納人數</label>
                <input
                    type="number"
                    class="form-control"
                    v-model.number="editForm.capacity"
                    :class="{ 'is-invalid': errors.capacity }"
                >
                <div class="invalid-feedback">{{ errors.capacity }}</div>
              </div>
              <div class="col-12">
                <label class="form-label">地址</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editForm.address"
                    :class="{ 'is-invalid': errors.address }"
                >
                <div class="invalid-feedback">{{ errors.address }}</div>
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
              <p><strong>場地名稱：</strong> {{ venueData.venueName }}</p>
              <p><strong>座位數量：</strong> {{ venueData.seatCount }}</p>
              <p><strong>容納人數：</strong> {{ venueData.capacity }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>地址：</strong> {{ venueData.address }}</p>
              <p><strong>使用率：</strong> {{ usageRate }}%</p>
              <p><strong>狀態：</strong>
                <span :class="getStatusClass(venueData.status)">
                  {{ venueData.status }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 場次列表 -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">場次列表</h5>
          <BaseButton
              v-if="isAdmin"
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
              :total="totalShowings"
              :page="page"
              :pageSize="pageSize"
              @update:page="handlePageChange"
              @update:pageSize="handlePageSizeChange"
          >
            <!-- 自定義座位狀態列 -->
            <template #seats="{ row }">
              <div class="seats-status">
                <span class="available">{{ row.availableSeats }}</span>
                /
                <span class="total">{{ row.totalSeats }}</span>
              </div>
            </template>
          </BaseTable>
        </div>
      </div>

      <!-- 維護記錄 -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">維護記錄</h5>
        </div>
        <div class="card-body">
          <BaseTable
              :columns="maintenanceColumns"
              :data="maintenanceRecords"
              :loading="loadingMaintenance"
          />
        </div>
      </div>
    </div>

    <!-- 新增場次對話框 -->
    <BaseModal
        v-model="showShowingModal"
        title="新增場次"
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
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import venueAPI from '@/api/venues'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'VenueDetail',
  components: {
    Breadcrumb,
    BaseButton,
    BaseTable,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const store = useStore()
    const venueId = route.params.id

    // 載入狀態
    const loading = ref(false)
    const loadingShowings = ref(false)
    const loadingMaintenance = ref(false)
    const saving = ref(false)

    // 場地資料
    const venueData = ref({})
    const showings = ref([])
    const totalShowings = ref(0)
    const maintenanceRecords = ref([])
    const movies = ref([])
    const page = ref(1)
    const pageSize = ref(10)

    // 編輯表單
    const isEditing = ref(false)
    const editForm = reactive({
      venueName: '',
      seatCount: 0,
      capacity: 0,
      address: ''
    })
    const errors = ref({})

    // 場次表單
    const showShowingModal = ref(false)
    const showingForm = reactive({
      movieId: '',
      showTime: ''
    })
    const showingErrors = ref({})

    // 判斷是否為管理員
    const isAdmin = computed(() => store.state.auth.userRole === 'admin')

    // 計算使用率
    const usageRate = computed(() => {
      if (!venueData.value.totalShowings) return 0
      return Math.round(
          (venueData.value.usedShowings / venueData.value.totalShowings) * 100
      )
    })

    // 表格列定義
    const showingColumns = [
      { prop: 'movieName', label: '電影名稱' },
      {
        prop: 'showTime',
        label: '放映時間',
        formatter: formatDateTime
      },
      { prop: 'seats', label: '座位狀態' }
    ]

    const maintenanceColumns = [
      {
        prop: 'maintenanceTime',
        label: '維護時間',
        formatter: formatDateTime
      },
      { prop: 'maintenanceType', label: '維護類型' },
      { prop: 'description', label: '說明' }
    ]

    // 載入場地資料
    const fetchVenueData = async () => {
      try {
        loading.value = true
        const response = await venueAPI.getVenueById(venueId)
        venueData.value = response
        // 初始化編輯表單
        Object.assign(editForm, {
          venueName: response.venueName,
          seatCount: response.seatCount,
          capacity: response.capacity,
          address: response.address
        })
      } catch (error) {
        console.error('載入場地資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入場次資料
    const fetchShowings = async () => {
      try {
        loadingShowings.value = true
        const response = await venueAPI.getVenueSchedule(venueId, {
          page: page.value,
          pageSize: pageSize.value
        })
        showings.value = response.data
        totalShowings.value = response.total
      } catch (error) {
        console.error('載入場次資料失敗:', error)
      } finally {
        loadingShowings.value = false
      }
    }

    // 載入維護記錄
    const fetchMaintenance = async () => {
      try {
        loadingMaintenance.value = true
        const response = await venueAPI.getVenueMaintenance(venueId)
        maintenanceRecords.value = response
      } catch (error) {
        console.error('載入維護記錄失敗:', error)
      } finally {
        loadingMaintenance.value = false
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

    // 開始編輯
    const startEditing = () => {
      isEditing.value = true
    }

    // 取消編輯
    const cancelEditing = () => {
      isEditing.value = false
      Object.assign(editForm, {
        venueName: venueData.value.venueName,
        seatCount: venueData.value.seatCount,
        capacity: venueData.value.capacity,
        address: venueData.value.address
      })
      errors.value = {}
    }

    // 提交編輯
    const handleSubmit = async () => {
      try {
        saving.value = true
        await venueAPI.updateVenue(venueId, editForm)
        await fetchVenueData()
        isEditing.value = false
      } catch (error) {
        console.error('更新場地資料失敗:', error)
        errors.value = error.response?.data?.errors || {}
      } finally {
        saving.value = false
      }
    }

    // 顯示新增場次對話框
    const showAddShowingModal = () => {
      showingForm.movieId = ''
      showingForm.showTime = ''
      showingErrors.value = {}
      showShowingModal.value = true
    }

    // 提交場次表單
    const handleShowingSubmit = async () => {
      try {
        await venueAPI.createShowing(venueId, showingForm)
        await fetchShowings()
        showShowingModal.value = false
      } catch (error) {
        console.error('新增場次失敗:', error)
        showingErrors.value = error.response?.data?.errors || {}
      }
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchShowings()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchShowings()
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '正常': 'text-success',
        '維護中': 'text-warning',
        '停用': 'text-danger'
      }
      return classMap[status] || 'text-secondary'
    }

    onMounted(() => {
      fetchVenueData()
      fetchShowings()
      fetchMaintenance()
      fetchMovies()
    })

    return {
      loading,
      loadingShowings,
      loadingMaintenance,
      saving,
      venueData,
      showings,
      totalShowings,
      maintenanceRecords,
      movies,
      page,
      pageSize,
      isEditing,
      editForm,
      errors,
      showShowingModal,
      showingForm,
      showingErrors,
      showingColumns,
      maintenanceColumns,
      isAdmin,
      usageRate,
      startEditing,
      cancelEditing,
      handleSubmit,
      showAddShowingModal,
      handleShowingSubmit,
      handlePageChange,
      handlePageSizeChange,
      getStatusClass,
      formatDateTime
    }
  }
}
</script>
<style scoped>
.venue-detail {
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

.text-warning {
  color: #ffc107 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-secondary {
  color: #6c757d !important;
}

/* 座位狀態樣式 */
.seats-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.seats-status .available {
  color: #198754;
  font-weight: 600;
}

.seats-status .total {
  color: #6c757d;
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
  .venue-detail {
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
  .venue-detail {
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