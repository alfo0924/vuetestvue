<template>
  <div class="movie-detail">
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
      <!-- 電影基本資訊 -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">電影資訊</h5>
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
                <label class="form-label">電影名稱</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editForm.movieName"
                    :class="{ 'is-invalid': errors.movieName }"
                >
                <div class="invalid-feedback">{{ errors.movieName }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">類別</label>
                <select
                    class="form-select"
                    v-model="editForm.categoryId"
                    :class="{ 'is-invalid': errors.categoryId }"
                >
                  <option v-for="category in categories"
                          :key="category.id"
                          :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <div class="invalid-feedback">{{ errors.categoryId }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">片長（分鐘）</label>
                <input
                    type="number"
                    class="form-control"
                    v-model.number="editForm.duration"
                    :class="{ 'is-invalid': errors.duration }"
                >
                <div class="invalid-feedback">{{ errors.duration }}</div>
              </div>
              <div class="col-12">
                <label class="form-label">電影描述</label>
                <textarea
                    class="form-control"
                    v-model="editForm.description"
                    rows="3"
                    :class="{ 'is-invalid': errors.description }"
                ></textarea>
                <div class="invalid-feedback">{{ errors.description }}</div>
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
              <p><strong>電影名稱：</strong> {{ movieData.movieName }}</p>
              <p><strong>類別：</strong> {{ movieData.categoryName }}</p>
              <p><strong>片長：</strong> {{ movieData.duration }} 分鐘</p>
            </div>
            <div class="col-md-6">
              <p><strong>描述：</strong></p>
              <p class="movie-description">{{ movieData.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 場次管理 -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">場次管理</h5>
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

      <!-- 訂位記錄 -->
      <div class="card">
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
    </div>

    <!-- 新增/編輯場次對話框 -->
    <BaseModal
        v-model="showShowingModal"
        :title="editingShowing ? '編輯場次' : '新增場次'"
        @confirm="handleShowingSubmit"
    >
      <form @submit.prevent>
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
        <div class="mb-3">
          <label class="form-label">場地</label>
          <select
              class="form-select"
              v-model="showingForm.venueId"
              :class="{ 'is-invalid': showingErrors.venueId }"
          >
            <option v-for="venue in venues"
                    :key="venue.id"
                    :value="venue.id">
              {{ venue.name }}
            </option>
          </select>
          <div class="invalid-feedback">{{ showingErrors.venueId }}</div>
        </div>
      </form>
    </BaseModal>

    <!-- 確認刪除對話框 -->
    <BaseModal
        v-model="showDeleteConfirm"
        title="確認刪除"
        @confirm="confirmDelete"
    >
      <p>確定要刪除此場次嗎？此操作無法復原。</p>
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
import movieAPI from '@/api/movies'
import { formatDate, formatDateTime } from '@/utils/format'

export default {
  name: 'MovieDetail',
  components: {
    Breadcrumb,
    BaseButton,
    BaseTable,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const movieId = route.params.id

    // 載入狀態
    const loading = ref(false)
    const loadingShowings = ref(false)
    const loadingBookings = ref(false)
    const saving = ref(false)

    // 電影資料
    const movieData = ref({})
    const categories = ref([])
    const venues = ref([])
    const showings = ref([])
    const bookings = ref([])

    // 編輯表單
    const isEditing = ref(false)
    const editForm = reactive({
      movieName: '',
      categoryId: '',
      duration: 0,
      description: ''
    })
    const errors = ref({})

    // 場次表單
    const showShowingModal = ref(false)
    const editingShowing = ref(null)
    const showingForm = reactive({
      showTime: '',
      venueId: ''
    })
    const showingErrors = ref({})

    // 確認刪除
    const showDeleteConfirm = ref(false)
    const pendingDeleteShowing = ref(null)

    // 表格列定義
    const showingColumns = [
      {
        prop: 'showTime',
        label: '放映時間',
        formatter: formatDateTime
      },
      { prop: 'venueName', label: '場地' },
      { prop: 'seats', label: '座位狀態' }
    ]

    const bookingColumns = [
      {
        prop: 'bookingTime',
        label: '訂位時間',
        formatter: formatDateTime
      },
      { prop: 'memberName', label: '訂位人' },
      { prop: 'seatNumber', label: '座位號碼' },
      { prop: 'status', label: '狀態' }
    ]

    // 載入電影資料
    const fetchMovieData = async () => {
      try {
        loading.value = true
        const response = await movieAPI.getMovieById(movieId)
        movieData.value = response
        // 初始化編輯表單
        Object.assign(editForm, {
          movieName: response.movieName,
          categoryId: response.categoryId,
          duration: response.duration,
          description: response.description
        })
      } catch (error) {
        console.error('載入電影資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入場次資料
    const fetchShowings = async () => {
      try {
        loadingShowings.value = true
        const response = await movieAPI.getShowings(movieId)
        showings.value = response
      } catch (error) {
        console.error('載入場次資料失敗:', error)
      } finally {
        loadingShowings.value = false
      }
    }

    // 載入訂位記錄
    const fetchBookings = async () => {
      try {
        loadingBookings.value = true
        const response = await movieAPI.getMovieBookings(movieId)
        bookings.value = response
      } catch (error) {
        console.error('載入訂位記錄失敗:', error)
      } finally {
        loadingBookings.value = false
      }
    }

    // 載入類別和場地資料
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, venuesRes] = await Promise.all([
          movieAPI.getCategories(),
          movieAPI.getVenues()
        ])
        categories.value = categoriesRes
        venues.value = venuesRes
      } catch (error) {
        console.error('載入基礎資料失敗:', error)
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
        movieName: movieData.value.movieName,
        categoryId: movieData.value.categoryId,
        duration: movieData.value.duration,
        description: movieData.value.description
      })
      errors.value = {}
    }

    // 提交編輯
    const handleSubmit = async () => {
      try {
        saving.value = true
        await movieAPI.updateMovie(movieId, editForm)
        await fetchMovieData()
        isEditing.value = false
      } catch (error) {
        console.error('更新電影資料失敗:', error)
        errors.value = error.response?.data?.errors || {}
      } finally {
        saving.value = false
      }
    }

    // 顯示新增場次對話框
    const showAddShowingModal = () => {
      editingShowing.value = null
      showingForm.showTime = ''
      showingForm.venueId = ''
      showShowingModal.value = true
    }

    // 編輯場次
    const editShowing = (showing) => {
      editingShowing.value = showing
      showingForm.showTime = showing.showTime
      showingForm.venueId = showing.venueId
      showShowingModal.value = true
    }

    // 提交場次表單
    const handleShowingSubmit = async () => {
      try {
        if (editingShowing.value) {
          await movieAPI.updateShowing(movieId, editingShowing.value.id, showingForm)
        } else {
          await movieAPI.createShowing(movieId, showingForm)
        }
        await fetchShowings()
        showShowingModal.value = false
      } catch (error) {
        console.error('儲存場次失敗:', error)
        showingErrors.value = error.response?.data?.errors || {}
      }
    }

    // 刪除場次
    const deleteShowing = (showing) => {
      pendingDeleteShowing.value = showing
      showDeleteConfirm.value = true
    }

    // 確認刪除場次
    const confirmDelete = async () => {
      if (!pendingDeleteShowing.value) return

      try {
        await movieAPI.deleteShowing(movieId, pendingDeleteShowing.value.id)
        await fetchShowings()
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('刪除場次失敗:', error)
      } finally {
        pendingDeleteShowing.value = null
      }
    }

    onMounted(() => {
      fetchMovieData()
      fetchShowings()
      fetchBookings()
      fetchMetadata()
    })

    return {
      loading,
      loadingShowings,
      loadingBookings,
      saving,
      movieData,
      categories,
      venues,
      showings,
      bookings,
      isEditing,
      editForm,
      errors,
      showShowingModal,
      editingShowing,
      showingForm,
      showingErrors,
      showDeleteConfirm,
      showing