<template>
  <div class="benefit-detail">
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
      <!-- 優惠基本資訊 -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">優惠資訊</h5>
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
                <label class="form-label">優惠名稱</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editForm.benefitName"
                    :class="{ 'is-invalid': errors.benefitName }"
                >
                <div class="invalid-feedback">{{ errors.benefitName }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">優惠類型</label>
                <select
                    class="form-select"
                    v-model="editForm.benefitType"
                    :class="{ 'is-invalid': errors.benefitType }"
                >
                  <option value="公車優惠">公車優惠</option>
                  <option value="特約商店折扣">特約商店折扣</option>
                  <option value="政府活動積點">政府活動積點</option>
                  <option value="抽獎參與">抽獎參與</option>
                </select>
                <div class="invalid-feedback">{{ errors.benefitType }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">有效期限</label>
                <input
                    type="date"
                    class="form-control"
                    v-model="editForm.validUntil"
                    :class="{ 'is-invalid': errors.validUntil }"
                >
                <div class="invalid-feedback">{{ errors.validUntil }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label">使用次數限制</label>
                <input
                    type="number"
                    class="form-control"
                    v-model.number="editForm.usageLimit"
                    :class="{ 'is-invalid': errors.usageLimit }"
                >
                <div class="invalid-feedback">{{ errors.usageLimit }}</div>
              </div>
              <div class="col-12">
                <label class="form-label">優惠描述</label>
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
              <p><strong>優惠名稱：</strong> {{ benefitData.benefitName }}</p>
              <p><strong>優惠類型：</strong> {{ benefitData.benefitType }}</p>
              <p><strong>有效期限：</strong> {{ formatDate(benefitData.validUntil) }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>使用次數限制：</strong> {{ benefitData.usageLimit || '無限制' }}</p>
              <p><strong>已使用次數：</strong> {{ benefitData.usageCount || 0 }}</p>
              <p><strong>狀態：</strong>
                <span :class="getStatusClass(benefitData.status)">
                  {{ benefitData.status }}
                </span>
              </p>
            </div>
            <div class="col-12 mt-3">
              <p><strong>優惠描述：</strong></p>
              <p class="benefit-description">{{ benefitData.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用記錄 -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">使用記錄</h5>
        </div>
        <div class="card-body">
          <BaseTable
              :columns="usageColumns"
              :data="usageHistory"
              :loading="loadingUsage"
              :total="totalUsage"
              :page="page"
              :pageSize="pageSize"
              @update:page="handlePageChange"
              @update:pageSize="handlePageSizeChange"
          >
            <!-- 自定義會員列渲染 -->
            <template #member="{ row }">
              <router-link :to="`/members/${row.memberId}`">
                {{ row.memberName }}
              </router-link>
            </template>
          </BaseTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import benefitAPI from '@/api/benefits'
import { formatDate, formatDateTime } from '@/utils/format'

export default {
  name: 'BenefitDetail',
  components: {
    Breadcrumb,
    BaseButton,
    BaseTable
  },
  setup() {
    const route = useRoute()
    const store = useStore()
    const benefitId = route.params.id

    // 載入狀態
    const loading = ref(false)
    const loadingUsage = ref(false)
    const saving = ref(false)

    // 優惠資料
    const benefitData = ref({})
    const usageHistory = ref([])
    const totalUsage = ref(0)
    const page = ref(1)
    const pageSize = ref(10)

    // 編輯表單
    const isEditing = ref(false)
    const editForm = reactive({
      benefitName: '',
      benefitType: '',
      validUntil: '',
      usageLimit: null,
      description: ''
    })
    const errors = ref({})

    // 判斷是否為管理員
    const isAdmin = computed(() => store.state.auth.userRole === 'admin')

    // 使用記錄表格列定義
    const usageColumns = [
      { prop: 'member', label: '使用會員' },
      {
        prop: 'usageTime',
        label: '使用時間',
        formatter: formatDateTime
      },
      { prop: 'usageAmount', label: '使用金額' },
      { prop: 'description', label: '說明' }
    ]

    // 載入優惠資料
    const fetchBenefitData = async () => {
      try {
        loading.value = true
        const response = await benefitAPI.getBenefitById(benefitId)
        benefitData.value = response
        // 初始化編輯表單
        Object.assign(editForm, {
          benefitName: response.benefitName,
          benefitType: response.benefitType,
          validUntil: response.validUntil,
          usageLimit: response.usageLimit,
          description: response.description
        })
      } catch (error) {
        console.error('載入優惠資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入使用記錄
    const fetchUsageHistory = async () => {
      try {
        loadingUsage.value = true
        const response = await benefitAPI.getBenefitUsageHistory(benefitId, {
          page: page.value,
          pageSize: pageSize.value
        })
        usageHistory.value = response.data
        totalUsage.value = response.total
      } catch (error) {
        console.error('載入使用記錄失敗:', error)
      } finally {
        loadingUsage.value = false
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
        benefitName: benefitData.value.benefitName,
        benefitType: benefitData.value.benefitType,
        validUntil: benefitData.value.validUntil,
        usageLimit: benefitData.value.usageLimit,
        description: benefitData.value.description
      })
      errors.value = {}
    }

    // 提交編輯
    const handleSubmit = async () => {
      try {
        saving.value = true
        await benefitAPI.updateBenefit(benefitId, editForm)
        await fetchBenefitData()
        isEditing.value = false
      } catch (error) {
        console.error('更新優惠資料失敗:', error)
        errors.value = error.response?.data?.errors || {}
      } finally {
        saving.value = false
      }
    }

    // 處理分頁變更
    const handlePageChange = (newPage) => {
      page.value = newPage
      fetchUsageHistory()
    }

    // 處理每頁筆數變更
    const handlePageSizeChange = (newSize) => {
      pageSize.value = newSize
      page.value = 1
      fetchUsageHistory()
    }

    // 取得狀態樣式
    const getStatusClass = (status) => {
      const classMap = {
        '使用中': 'text-success',
        '已過期': 'text-danger',
        '已達使用上限': 'text-warning'
      }
      return classMap[status] || 'text-secondary'
    }

    onMounted(() => {
      fetchBenefitData()
      fetchUsageHistory()
    })

    return {
      loading,
      loadingUsage,
      saving,
      benefitData,
      usageHistory,
      totalUsage,
      page,
      pageSize,
      isEditing,
      editForm,
      errors,
      isAdmin,
      usageColumns,
      startEditing,
      cancelEditing,
      handleSubmit,
      handlePageChange,
      handlePageSizeChange,
      getStatusClass,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.benefit-detail {
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

.benefit-description {
  white-space: pre-line;
}

/* 狀態樣式 */
.text-success {
  color: #198754 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .benefit-detail {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>