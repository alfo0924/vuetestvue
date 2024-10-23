<template>
  <div class="movie-list">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          keywordPlaceholder="搜尋電影名稱"
          :advanced-fields="searchFields"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 數據表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="電影列表"
              :columns="columns"
              :data="movies"
              :loading="loading"
              :total="total"
              :page="page"
              :pageSize="pageSize"
              selectable
              show-actions
              @selection-change="handleSelectionChange"
              @update:page="handlePageChange"
              @update:pageSize="handlePageSizeChange"
              @add="handleAdd"
              @edit="handleEdit"
              @delete="handleDelete"
              @sort="handleSort"
          >
            <!-- 自定義狀態列渲染 -->
            <template #status="{ row }">
              <span class="badge" :class="getStatusClass(row.status)">
                {{ getStatusText(row.status) }}
              </span>
            </template>

            <!-- 自定義場次列渲染 -->
            <template #showings="{ row }">
              <div class="showing-times">
                {{ formatShowingTimes(row.showings) }}
              </div>
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
                    icon="calendar-plus"
                    variant="outline-success"
                    size="sm"
                    title="新增場次"
                    @click="showAddShowingModal(row)"
                />
                <BaseButton
                    icon="pencil"
                    variant="outline-secondary"
                    size="sm"
                    title="編輯"
                    @click="handleEdit(row)"
                />
                <BaseButton
                    icon="trash"
                    variant="outline-danger"
                    size="sm"
                    title="刪除"
                    @click="handleDelete(row)"
                />
              </div>
            </template>
          </BaseTable>
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
      <p>確定要刪除此電影嗎？相關的場次和訂位記錄也會一併刪除。</p>
    </BaseModal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseSearch from '@/components/common/BaseSearch.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import movieAPI from '@/api/movies'
import { formatDate, formatDateTime } from '@/utils/format'

export default {
  name: 'MovieList',
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
        name: 'categoryId',
        label: '電影類別',
        options: []
      },
      {
        type: 'daterange',
        name: 'showTime',
        label: '放映時間',
        startName: 'startTime',
        endName: 'endTime'
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'movieId', label: 'ID', width: '80px' },
      { prop: 'movieName', label: '電影名稱', sortable: true },
      { prop: 'categoryName', label: '類別' },
      { prop: 'duration', label: '片長(分鐘)' },
      { prop: 'showings', label: '場次' },
      { prop: 'status', label: '狀態' }
    ]

    // 數據狀態
    const loading = ref(false)
    const movies = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const selectedRows = ref([])
    const venues = ref([])

    // 場次表單
    const showShowingModal = ref(false)
    const selectedMovie = ref(null)
    const showingForm = reactive({
      showTime: '',
      venueId: ''
    })
    const showingErrors = ref({})

    // 確認刪除
    const showDeleteConfirm = ref(false)
    const pendingDelete = ref(null)

    // 載入電影列表
    const fetchMovies = async (params = {}) => {
      try {
        loading.value = true
        const response = await movieAPI.getMovies({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        movies.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入電影列表失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入基礎資料
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, venuesRes] = await Promise.all([
          movieAPI.getCategories(),
          movieAPI.getVenues()
        ])
        searchFields[0].options = categoriesRes.map(category => ({
          value: category.id,
          label: category.name
        }))
        venues.value = venuesRes
      } catch (error) {
        console.error('載入基礎資料失敗:', error)
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchMovies(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchMovies()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchMovies()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchMovies()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchMovies({ sortField: field, sortOrder: order })
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    // 查看詳情
    const handleView = (row) => {
      router.push(`/movies/${row.movieId}`)
    }

    // 新增電影
    const handleAdd = () => {
      router.push('/movies/new')
    }

    // 編輯電影
    const handleEdit = (row) => {
      router.push(`/movies/${row.movieId}/edit`)
    }

    // 刪除電影
    const handleDelete = (row) => {
      pendingDelete.value = row
      showDeleteConfirm.value = true
    }

    // 確認刪除
    const confirmDelete = async () => {
      if (!pendingDelete.value) return

      try {
        await movieAPI.deleteMovie(pendingDelete.value.movieId)
        fetchMovies()
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('刪除電影失敗:', error)
      } finally {
        pendingDelete.value = null
      }
    }

    // 顯示新增場次對話框
    const showAddShowingModal = (movie) => {
      selectedMovie.value = movie
      showingForm.showTime = ''
      showingForm.venueId = ''
      showShowingModal.value = true
    }

    // 提交場次表單
    const handleShowingSubmit = async () => {
      try {
        await movieAPI.createShowing(selectedMovie.value.movieId, showingForm)
        fetchMovies()
        showShowingModal.value = false
      } catch (error) {
        console.error('新增場次失敗:', error)
        showingErrors.value = error.response?.data?.errors || {}
      }
    }

    // 格式化場次時間
    const formatShowingTimes = (showings) => {
      if (!showings?.length) return '暫無場次'
      return showings
          .slice(0, 3)
          .map(s => formatDateTime(s.showTime))
          .join('、') + (showings.length > 3 ? '...' : '')
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        'upcoming': 'bg-info',
        'showing': 'bg-success',
        'ended': 'bg-secondary'
      }
      return classMap[status] || 'bg-secondary'
    }

    // 取得狀態文字
    const getStatusText = (status) => {
      const textMap = {
        'upcoming': '即將上映',
        'showing': '上映中',
        'ended': '已下檔'
      }
      return textMap[status] || '未知'
    }

    onMounted(() => {
      fetchMovies()
      fetchMetadata()
    })

    return {
      searchFields,
      columns,
      loading,
      movies,
      total,
      page,
      pageSize,
      selectedRows,
      venues,
      showShowingModal,
      showingForm,
      showingErrors,
      showDeleteConfirm,
      handleSearch,
      handleReset,
      handlePageChange,
      handlePageSizeChange,
      handleSort,
      handleSelectionChange,
      handleView,
      handleAdd,
      handleEdit,
      handleDelete,
      confirmDelete,
      showAddShowingModal,
      handleShowingSubmit,
      formatShowingTimes,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.movie-list {
  padding: 1.5rem;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.showing-times {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  padding: 0.5em 0.75em;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .movie-list {
    padding: 1rem;
  }
}
</style>