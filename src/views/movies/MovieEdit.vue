<template>
  <div class="movie-edit">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">{{ isNewMovie ? '新增電影' : '編輯電影' }}</h5>
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
            <!-- 自定義上傳區域 -->
            <template #after-fields>
              <div class="mb-3">
                <label class="form-label">電影海報</label>
                <BaseUpload
                    accept="image/*"
                    :max-size="5 * 1024 * 1024"
                    :hint="'支援 JPG、PNG 格式，檔案大小不超過 5MB'"
                    @upload="handlePosterUpload"
                />
              </div>

              <!-- 場次管理 -->
              <div v-if="!isNewMovie" class="mt-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0">場次管理</h6>
                  <BaseButton
                      icon="plus"
                      variant="outline-primary"
                      size="sm"
                      @click="showAddShowingModal"
                  >
                    新增場次
                  </BaseButton>
                </div>
                <BaseTable
                    :columns="showingColumns"
                    :data="showings"
                    :loading="loadingShowings"
                    @edit="editShowing"
                    @delete="deleteShowing"
                />
              </div>
            </template>
          </BaseForm>
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
            <option value="">請選擇場地</option>
            <option
                v-for="venue in venues"
                :key="venue.id"
                :value="venue.id"
            >
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseUpload from '@/components/common/BaseUpload.vue'
import movieAPI from '@/api/movies'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'MovieEdit',
  components: {
    Breadcrumb,
    BaseForm,
    BaseTable,
    BaseButton,
    BaseModal,
    BaseUpload
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const movieId = route.params.id

    // 判斷是否為新增電影
    const isNewMovie = computed(() => !movieId)

    // 載入狀態
    const loading = ref(false)
    const loadingShowings = ref(false)
    const saving = ref(false)

    // 表單數據
    const formData = reactive({
      movieName: '',
      categoryId: '',
      duration: '',
      description: '',
      posterUrl: ''
    })

    // 表單欄位定義
    const formFields = [
      {
        type: 'text',
        name: 'movieName',
        label: '電影名稱',
        required: true
      },
      {
        type: 'select',
        name: 'categoryId',
        label: '電影類別',
        required: true,
        options: []
      },
      {
        type: 'number',
        name: 'duration',
        label: '片長（分鐘）',
        required: true,
        min: 1
      },
      {
        type: 'textarea',
        name: 'description',
        label: '電影描述',
        required: true,
        rows: 3
      }
    ]

    // 驗證規則
    const validationRules = {
      movieName: {
        required: true,
        maxLength: 255
      },
      categoryId: {
        required: true
      },
      duration: {
        required: true,
        min: 1
      },
      description: {
        required: true
      }
    }

    // 場次相關
    const venues = ref([])
    const showings = ref([])
    const showingColumns = [
      {
        prop: 'showTime',
        label: '放映時間',
        formatter: formatDateTime
      },
      { prop: 'venueName', label: '場地' },
      {
        prop: 'availableSeats',
        label: '可用座位',
        formatter: (value, row) => `${value}/${row.totalSeats}`
      }
    ]

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

    // 載入電影資料
    const fetchMovieData = async () => {
      if (isNewMovie.value) return

      try {
        loading.value = true
        const response = await movieAPI.getMovieById(movieId)
        Object.assign(formData, response)
      } catch (error) {
        console.error('載入電影資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入場次資料
    const fetchShowings = async () => {
      if (isNewMovie.value) return

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

    // 載入基礎資料
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, venuesRes] = await Promise.all([
          movieAPI.getCategories(),
          movieAPI.getVenues()
        ])
        formFields[1].options = categoriesRes.map(category => ({
          value: category.id,
          label: category.name
        }))
        venues.value = venuesRes
      } catch (error) {
        console.error('載入基礎資料失敗:', error)
      }
    }

    // 處理海報上傳
    const handlePosterUpload = async (file, onProgress) => {
      try {
        const formData = new FormData()
        formData.append('poster', file)
        const response = await movieAPI.uploadPoster(formData, onProgress)
        formData.posterUrl = response.url
      } catch (error) {
        console.error('上傳海報失敗:', error)
        throw error
      }
    }

    // 處理表單提交
    const handleSubmit = async (data) => {
      try {
        saving.value = true
        if (isNewMovie.value) {
          await movieAPI.createMovie(data)
        } else {
          await movieAPI.updateMovie(movieId, data)
        }
        router.push('/movies')
      } catch (error) {
        console.error('儲存失敗:', error)
      } finally {
        saving.value = false
      }
    }

    // 取消編輯
    const handleCancel = () => {
      router.back()
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
      fetchMetadata()
    })

    return {
      isNewMovie,
      loading,
      loadingShowings,
      saving,
      formData,
      formFields,
      validationRules,
      venues,
      showings,
      showingColumns,
      showShowingModal,
      editingShowing,
      showingForm,
      showingErrors,
      showDeleteConfirm,
      handlePosterUpload,
      handleSubmit,
      handleCancel,
      showAddShowingModal,
      editShowing,
      deleteShowing,
      handleShowingSubmit,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.movie-edit {
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

/* 響應式設計 */
@media (max-width: 768px) {
  .movie-edit {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>