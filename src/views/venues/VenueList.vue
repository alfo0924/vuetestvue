<template>
  <div class="venue-list">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          keywordPlaceholder="搜尋場地名稱"
          :advanced-fields="searchFields"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 統計卡片 -->
      <div class="row mt-4">
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">總場地數</div>
            <div class="stat-value">{{ totalVenues }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">總座位數</div>
            <div class="stat-value">{{ totalSeats }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="stat-card">
            <div class="stat-title">今日使用率</div>
            <div class="stat-value">{{ usageRate }}%</div>
          </div>
        </div>
      </div>

      <!-- 數據表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="場地列表"
              :columns="columns"
              :data="venues"
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
            <!-- 自定義使用率列渲染 -->
            <template #usage="{ row }">
              <div class="progress" style="height: 20px;">
                <div
                    class="progress-bar"
                    :class="getUsageClass(row.usageRate)"
                    :style="{ width: `${row.usageRate}%` }"
                >
                  {{ row.usageRate }}%
                </div>
              </div>
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
                    icon="calendar-week"
                    variant="outline-success"
                    size="sm"
                    title="查看排程"
                    @click="handleSchedule(row)"
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

    <!-- 確認刪除對話框 -->
    <BaseModal
        v-model="showDeleteConfirm"
        title="確認刪除"
        @confirm="confirmDelete"
    >
      <p>確定要刪除此場地嗎？此操作無法復原。</p>
    </BaseModal>

    <!-- 排程對話框 -->
    <BaseModal
        v-model="showScheduleModal"
        title="場地排程"
        size="lg"
        hideFooter
    >
      <div v-if="selectedVenue" class="schedule-calendar">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6>{{ selectedVenue.venueName }} - 排程表</h6>
          <div class="btn-group">
            <button
                class="btn btn-outline-secondary btn-sm"
                @click="previousWeek"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
                class="btn btn-outline-secondary btn-sm"
                @click="nextWeek"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="schedule-grid">
          <!-- 時間軸 -->
          <div class="time-axis">
            <div v-for="hour in hours" :key="hour" class="hour-cell">
              {{ hour }}:00
            </div>
          </div>
          <!-- 排程內容 -->
          <div class="schedule-content">
            <div
                v-for="showing in venueSchedule"
                :key="showing.id"
                class="schedule-item"
                :style="getScheduleItemStyle(showing)"
                :title="getScheduleItemTitle(showing)"
            >
              {{ showing.movieName }}
            </div>
          </div>
        </div>
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
import venueAPI from '@/api/venues'

export default {
  name: 'VenueList',
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
        label: '場地狀態',
        options: [
          { value: '使用中', label: '使用中' },
          { value: '空閒', label: '空閒' },
          { value: '維護中', label: '維護中' }
        ]
      },
      {
        type: 'select',
        name: 'capacity',
        label: '座位數範圍',
        options: [
          { value: '0-100', label: '0-100座' },
          { value: '101-200', label: '101-200座' },
          { value: '201-300', label: '201-300座' },
          { value: '301+', label: '301座以上' }
        ]
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'venueId', label: '場地編號', width: '100px' },
      { prop: 'venueName', label: '場地名稱', sortable: true },
      { prop: 'seatCount', label: '座位數', sortable: true },
      { prop: 'usage', label: '使用率' },
      { prop: 'status', label: '狀態' }
    ]

    // 數據狀態
    const loading = ref(false)
    const venues = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const selectedRows = ref([])

    // 統計數據
    const totalVenues = ref(0)
    const totalSeats = ref(0)
    const usageRate = ref(0)

    // 確認刪除
    const showDeleteConfirm = ref(false)
    const pendingDelete = ref(null)

    // 排程相關
    const showScheduleModal = ref(false)
    const selectedVenue = ref(null)
    const venueSchedule = ref([])
    const currentWeek = ref(new Date())
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // 載入場地列表
    const fetchVenues = async (params = {}) => {
      try {
        loading.value = true
        const response = await venueAPI.getVenues({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        venues.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入場地列表失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入統計數據
    const fetchStats = async () => {
      try {
        const response = await venueAPI.getVenueStats()
        totalVenues.value = response.totalVenues
        totalSeats.value = response.totalSeats
        usageRate.value = response.usageRate
      } catch (error) {
        console.error('載入統計數據失敗:', error)
      }
    }

    // 載入場地排程
    const fetchVenueSchedule = async (venueId, startDate) => {
      try {
        const response = await venueAPI.getVenueSchedule(venueId, {
          startDate: startDate
        })
        venueSchedule.value = response
      } catch (error) {
        console.error('載入場地排程失敗:', error)
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchVenues(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchVenues()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchVenues()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchVenues()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchVenues({ sortField: field, sortOrder: order })
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    // 查看詳情
    const handleView = (row) => {
      router.push(`/venues/${row.venueId}`)
    }

    // 新增場地
    const handleAdd = () => {
      router.push('/venues/new')
    }

    // 編輯場地
    const handleEdit = (row) => {
      router.push(`/venues/${row.venueId}/edit`)
    }

    // 刪除場地
    const handleDelete = (row) => {
      pendingDelete.value = row
      showDeleteConfirm.value = true
    }

    // 確認刪除
    const confirmDelete = async () => {
      try {
        await venueAPI.deleteVenue(pendingDelete.value.venueId)
        await fetchVenues()
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('刪除場地失敗:', error)
      } finally {
        pendingDelete.value = null
      }
    }

    // 查看排程
    const handleSchedule = (row) => {
      selectedVenue.value = row
      fetchVenueSchedule(row.venueId, currentWeek.value)
      showScheduleModal.value = true
    }

    // 上一週
    const previousWeek = () => {
      currentWeek.value = new Date(currentWeek.value.getTime() - 7 * 24 * 60 * 60 * 1000)
      fetchVenueSchedule(selectedVenue.value.venueId, currentWeek.value)
    }

    // 下一週
    const nextWeek = () => {
      currentWeek.value = new Date(currentWeek.value.getTime() + 7 * 24 * 60 * 60 * 1000)
      fetchVenueSchedule(selectedVenue.value.venueId, currentWeek.value)
    }

    // 取得排程項目樣式
    const getScheduleItemStyle = (showing) => {
      const startTime = new Date(showing.startTime)
      const endTime = new Date(showing.endTime)
      const top = startTime.getHours() * 60 + startTime.getMinutes()
      const height = (endTime - startTime) / (1000 * 60)

      return {
        top: `${top}px`,
        height: `${height}px`
      }
    }

    // 取得排程項目提示
    const getScheduleItemTitle = (showing) => {
      return `${showing.movieName}\n${showing.startTime} - ${showing.endTime}`
    }

    // 取得使用率樣式
    const getUsageClass = (rate) => {
      if (rate >= 80) return 'bg-danger'
      if (rate >= 50) return 'bg-warning'
      return 'bg-success'
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '使用中': 'badge bg-success',
        '空閒': 'badge bg-secondary',
        '維護中': 'badge bg-warning'
      }
      return classMap[status] || 'badge bg-secondary'
    }

    onMounted(() => {
      fetchVenues()
      fetchStats()
    })

    return {
      searchFields,
      columns,
      loading,
      venues,
      total,
      page,
      pageSize,
      selectedRows,
      totalVenues,
      totalSeats,
      usageRate,
      showDeleteConfirm,
      showScheduleModal,
      selectedVenue,
      venueSchedule,
      hours,
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
      handleSchedule,
      previousWeek,
      nextWeek,
      getScheduleItemStyle,
      getScheduleItemTitle,
      getUsageClass,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.venue-list {
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

/* 進度條樣式 */
.progress {
  height: 20px;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  transition: width 0.6s ease;
}

/* 狀態標籤樣式 */
.badge {
  padding: 0.5em 0.75em;
  font-weight: 500;
}

.bg-success {
  background-color: #198754 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}

/* 排程日曆樣式 */
.schedule-calendar {
  padding: 1rem;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 1px;
  background-color: #dee2e6;
  border: 1px solid #dee2e6;
}

.time-axis {
  background-color: #f8f9fa;
}

.hour-cell {
  height: 60px;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #6c757d;
  border-bottom: 1px solid #dee2e6;
}

.schedule-content {
  position: relative;
  background-color: #fff;
  min-height: 1440px; /* 24小時 * 60px */
}

.schedule-item {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0.25rem;
  background-color: #e7f1ff;
  border-left: 4px solid #0d6efd;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.schedule-item:hover {
  background-color: #cfe2ff;
  transform: translateX(2px);
}

/* 按鈕組樣式 */
.btn-group {
  gap: 0.25rem;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .venue-list {
    padding: 1rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }

  .btn-group {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-group .btn {
    width: 100%;
  }

  .schedule-calendar {
    padding: 0.5rem;
  }

  .hour-cell {
    height: 40px;
    font-size: 0.75rem;
  }

  .schedule-content {
    min-height: 960px; /* 24小時 * 40px */
  }
}
</style>