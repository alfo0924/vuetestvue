<template>
  <div class="member-list">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <!-- 搜尋區域 -->
      <BaseSearch
          :loading="loading"
          :advanced-fields="searchFields"
          @search="handleSearch"
          @reset="handleReset"
      />

      <!-- 數據表格 -->
      <div class="card mt-4">
        <div class="card-body">
          <BaseTable
              title="會員列表"
              :columns="columns"
              :data="members"
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
              <span
                  class="badge"
                  :class="row.isActive ? 'bg-success' : 'bg-danger'"
              >
                {{ row.isActive ? '啟用' : '停用' }}
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

    <!-- 批量操作工具列 -->
    <div v-if="selectedRows.length" class="batch-actions">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between">
          <span>已選擇 {{ selectedRows.length }} 項</span>
          <div class="btn-group">
            <BaseButton
                variant="primary"
                icon="check-circle"
                @click="handleBatchEnable"
            >
              批量啟用
            </BaseButton>
            <BaseButton
                variant="warning"
                icon="dash-circle"
                @click="handleBatchDisable"
            >
              批量停用
            </BaseButton>
            <BaseButton
                variant="danger"
                icon="trash"
                @click="handleBatchDelete"
            >
              批量刪除
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認刪除對話框 -->
    <BaseModal
        v-model="showDeleteConfirm"
        title="確認刪除"
        :loading="deleting"
        @confirm="confirmDelete"
    >
      <p>確定要刪除選中的會員嗎？此操作無法復原。</p>
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
import memberAPI from '@/api/members'
import { formatDate } from '@/utils/format'

export default {
  name: 'MemberList',
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
        name: 'role',
        label: '用戶角色',
        options: [
          { value: '普通用戶', label: '普通用戶' },
          { value: '管理員', label: '管理員' }
        ]
      },
      {
        type: 'select',
        name: 'status',
        label: '帳號狀態',
        options: [
          { value: 'active', label: '啟用' },
          { value: 'inactive', label: '停用' }
        ]
      },
      {
        type: 'daterange',
        name: 'registerDate',
        label: '註冊日期',
        startName: 'registerStartDate',
        endName: 'registerEndDate'
      }
    ]

    // 表格列定義
    const columns = [
      { prop: 'memberId', label: 'ID', width: '80px' },
      { prop: 'email', label: '電子郵件', sortable: true },
      { prop: 'phone', label: '手機號碼' },
      { prop: 'role', label: '角色' },
      {
        prop: 'registerDate',
        label: '註冊日期',
        sortable: true,
        formatter: formatDate
      },
      {
        prop: 'lastLoginTime',
        label: '最後登入',
        formatter: formatDate
      },
      { prop: 'status', label: '狀態' }
    ]

    // 數據狀態
    const loading = ref(false)
    const members = ref([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)
    const selectedRows = ref([])
    const showDeleteConfirm = ref(false)
    const deleting = ref(false)
    const pendingDelete = ref(null)

    // 載入會員列表
    const fetchMembers = async (params = {}) => {
      try {
        loading.value = true
        const response = await memberAPI.getMembers({
          page: page.value,
          pageSize: pageSize.value,
          ...params
        })
        members.value = response.data
        total.value = response.total
      } catch (error) {
        console.error('載入會員列表失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 處理搜尋
    const handleSearch = (params) => {
      page.value = 1
      fetchMembers(params)
    }

    // 處理重置
    const handleReset = () => {
      page.value = 1
      fetchMembers()
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchMembers()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchMembers()
    }

    // 處理排序
    const handleSort = ({ field, order }) => {
      fetchMembers({ sortField: field, sortOrder: order })
    }

    // 處理選擇變更
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    // 查看詳情
    const handleView = (row) => {
      router.push(`/members/${row.memberId}`)
    }

    // 新增會員
    const handleAdd = () => {
      router.push('/members/new')
    }

    // 編輯會員
    const handleEdit = (row) => {
      router.push(`/members/${row.memberId}/edit`)
    }

    // 刪除會員
    const handleDelete = (row) => {
      pendingDelete.value = [row]
      showDeleteConfirm.value = true
    }

    // 批量啟用
    const handleBatchEnable = async () => {
      try {
        const ids = selectedRows.value.map(row => row.memberId)
        await memberAPI.updateMemberStatus({ ids, isActive: true })
        fetchMembers()
        selectedRows.value = []
      } catch (error) {
        console.error('批量啟用失敗:', error)
      }
    }

    // 批量停用
    const handleBatchDisable = async () => {
      try {
        const ids = selectedRows.value.map(row => row.memberId)
        await memberAPI.updateMemberStatus({ ids, isActive: false })
        fetchMembers()
        selectedRows.value = []
      } catch (error) {
        console.error('批量停用失敗:', error)
      }
    }

    // 批量刪除
    const handleBatchDelete = () => {
      pendingDelete.value = selectedRows.value
      showDeleteConfirm.value = true
    }

    // 確認刪除
    const confirmDelete = async () => {
      if (!pendingDelete.value) return

      try {
        deleting.value = true
        const ids = pendingDelete.value.map(row => row.memberId)
        await memberAPI.deleteMember(ids)
        fetchMembers()
        selectedRows.value = []
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('刪除失敗:', error)
      } finally {
        deleting.value = false
        pendingDelete.value = null
      }
    }

    onMounted(() => {
      fetchMembers()
    })

    return {
      searchFields,
      columns,
      loading,
      members,
      total,
      page,
      pageSize,
      selectedRows,
      showDeleteConfirm,
      deleting,
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
      handleBatchEnable,
      handleBatchDisable,
      handleBatchDelete,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.member-list {
  padding: 1.5rem;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.batch-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 1rem;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.badge {
  padding: 0.5em 0.75em;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .member-list {
    padding: 1rem;
  }

  .batch-actions {
    padding: 0.75rem;
  }
}
</style>