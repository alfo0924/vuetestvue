<template>
  <div class="booking-list">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          keywordPlaceholder="搜尋訂位編號或會員姓名"
          :advanced-fields="searchFields"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 數據表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="訂位列表"
              :columns="columns"
              :data="bookings"
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
              <span :class="getStatusClass(row.status)">
                {{ row.status }}
              </span>
            </template>

            <!-- 自定義支付狀態列渲染 -->
            <template #paymentStatus="{ row }">
              <span :class="getPaymentStatusClass(row.paymentStatus)">
                {{ row.paymentStatus }}
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
                    v-if="canCancel(row)"
                    icon="x-circle"
                    variant="outline-danger"
                    size="sm"
                    title="取消訂位"
                    @click="handleCancel(row)"
                />
                <BaseButton
                    icon="printer"
                    variant="outline-secondary"
                    size="sm"
                    title="列印訂位單"
                    @click="handlePrint(row)"
                />
              </div>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>

    <!-- 取消訂位確認對話框 -->
    <BaseModal
        v-model="showCancelModal"
        title="確認取消訂位"
        :loading="cancelling"
        @confirm="confirmCancel"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseSearch from '@/components/common/BaseSearch.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import bookingAPI from '@/api/bookings'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'BookingList',
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
        label: '訂位狀態',
        options: [
          { value: '已預訂', label: '已預訂' },
          { value: '已取消', label: '已取消' },
          { value: '已完成', label: '已完成' }
        ]
      },
      {
        type: 'select',
        name: 'paymentStatus',
        label: '付款狀態',
        options: [
          { value: '已付款', label: '已付款' },
          { value: '未付款', label: '未付款' },
          { value: '已退款', label: '已退款' }
        ]
      },
      {
        type: 'daterange',
        name: 'bookingTime',
        label: '訂位時間',
        startName: 'startTime',
        endName: 'endTime'
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'bookingId', label: '訂位編號', width: '120px' },
      { prop: 'memberName', label: '訂位人', sortable: true },
      { prop: 'movieName', label: '電影名稱' },
      {
        prop: 'showTime',
        label: '放映時間',
        sortable: true,
        formatter: formatDateTime
      },
      { prop: 'seatNumber', label: '座位號碼' },
      { prop: 'status', label: '訂位狀態' },
      { prop: 'paymentStatus', label: '付款狀態' },
      {
        prop: 'bookingTime',
        label: '訂位時間',
        sortable: true,
        formatter: formatDateTime
      }
    ]

    // 數據狀態
    const loading = ref(false)
    const bookings = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const selectedRows = ref([])

    // 取消訂位
    const showCancelModal = ref(false)
    const cancelling = ref(false)
    const cancelReason = ref('')
    const pendingCancelBooking = ref(null)

    // 載入訂位列表
    const fetchBookings = async (params = {}) => {
      try {
        loading.value = true
        const response = await bookingAPI.getBookings({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        bookings.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入訂位列表失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchBookings(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchBookings()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchBookings()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchBookings()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchBookings({ sortField: field, sortOrder: order })
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    // 查看詳情
    const handleView = (row) => {
      router.push(`/bookings/${row.bookingId}`)
    }

    // 新增訂位
    const handleAdd = () => {
      router.push('/bookings/new')
    }

    // 編輯訂位
    const handleEdit = (row) => {
      router.push(`/bookings/${row.bookingId}/edit`)
    }

    // 判斷是否可以取消訂位
    const canCancel = (booking) => {
      return booking.status === '已預訂' &&
          new Date(booking.showTime) > new Date()
    }

    // 取消訂位
    const handleCancel = (booking) => {
      pendingCancelBooking.value = booking
      cancelReason.value = ''
      showCancelModal.value = true
    }

    // 確認取消訂位
    const confirmCancel = async () => {
      if (!pendingCancelBooking.value) return

      try {
        cancelling.value = true
        await bookingAPI.cancelBooking(
            pendingCancelBooking.value.bookingId,
            { reason: cancelReason.value }
        )
        await fetchBookings()
        showCancelModal.value = false
      } catch (error) {
        console.error('取消訂位失敗:', error)
      } finally {
        cancelling.value = false
        pendingCancelBooking.value = null
      }
    }

    // 列印訂位單
    const handlePrint = async (booking) => {
      try {
        const response = await bookingAPI.getBookingReceipt(booking.bookingId)
        // 處理列印邏輯
        window.print()
      } catch (error) {
        console.error('獲取訂位單失敗:', error)
      }
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '已預訂': 'badge bg-primary',
        '已取消': 'badge bg-danger',
        '已完成': 'badge bg-success'
      }
      return classMap[status] || 'badge bg-secondary'
    }

    // 取得付款狀態樣式
    const getPaymentStatusClass = (status) => {
      const classMap = {
        '已付款': 'badge bg-success',
        '未付款': 'badge bg-warning',
        '已退款': 'badge bg-info'
      }
      return classMap[status] || 'badge bg-secondary'
    }

    onMounted(() => {
      fetchBookings()
    })

    return {
      searchFields,
      columns,
      loading,
      bookings,
      total,
      page,
      pageSize,
      selectedRows,
      showCancelModal,
      cancelling,
      cancelReason,
      handleSearch,
      handleReset,
      handlePageChange,
      handlePageSizeChange,
      handleSort,
      handleSelectionChange,
      handleView,
      handleAdd,
      handleEdit,
      canCancel,
      handleCancel,
      confirmCancel,
      handlePrint,
      getStatusClass,
      getPaymentStatusClass
    }
  }
}
</script>

<style scoped>
.booking-list {
  padding: 1.5rem;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.badge {
  padding: 0.5em 0.75em;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .booking-list {
    padding: 1rem;
  }
}

/* 列印樣式 */
@media print {
  .booking-list {
    padding: 0;
  }

  .search-area,
  .btn-group {
    display: none;
  }
}
</style>