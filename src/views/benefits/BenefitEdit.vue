<template>
  <div class="benefit-edit">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">{{ isNewBenefit ? '新增優惠' : '編輯優惠' }}</h5>
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
            <!-- 使用限制設定 -->
            <template #after-fields>
              <div class="mt-4">
                <h6>使用限制設定</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-check form-switch">
                      <input
                          class="form-check-input"
                          type="checkbox"
                          id="hasUsageLimit"
                          v-model="hasUsageLimit"
                      >
                      <label class="form-check-label" for="hasUsageLimit">
                        設定使用次數限制
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6" v-if="hasUsageLimit">
                    <label class="form-label">使用次數上限</label>
                    <input
                        type="number"
                        class="form-control"
                        v-model.number="formData.usageLimit"
                        min="1"
                        :class="{ 'is-invalid': errors.usageLimit }"
                    >
                    <div class="invalid-feedback">{{ errors.usageLimit }}</div>
                  </div>
                </div>
              </div>

              <!-- 使用統計 -->
              <div v-if="!isNewBenefit" class="mt-4">
                <h6>使用統計</h6>
                <div class="usage-stats">
                  <div class="row">
                    <div class="col-md-4">
                      <div class="stat-card">
                        <div class="stat-title">總使用次數</div>
                        <div class="stat-value">{{ usageStats.totalUsage || 0 }}</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="stat-card">
                        <div class="stat-title">本月使用次數</div>
                        <div class="stat-value">{{ usageStats.monthlyUsage || 0 }}</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="stat-card">
                        <div class="stat-title">使用率</div>
                        <div class="stat-value">{{ usageStats.usageRate || '0%' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BaseForm>
        </div>
      </div>

      <!-- 使用記錄 -->
      <div v-if="!isNewBenefit" class="card mt-4">
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
          />
        </div>
      </div>
    </div>

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
import BaseModal from '@/components/common/BaseModal.vue'
import benefitAPI from '@/api/benefits'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'BenefitEdit',
  components: {
    Breadcrumb,
    BaseForm,
    BaseTable,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const benefitId = route.params.id

    // 判斷是否為新增優惠
    const isNewBenefit = computed(() => !benefitId)

    // 載入狀態
    const loading = ref(false)
    const loadingUsage = ref(false)
    const saving = ref(false)

    // 表單數據
    const formData = reactive({
      benefitName: '',
      benefitType: '',
      description: '',
      validUntil: '',
      usageLimit: null
    })

    // 表單欄位定義
    const formFields = [
      {
        type: 'text',
        name: 'benefitName',
        label: '優惠名稱',
        required: true
      },
      {
        type: 'select',
        name: 'benefitType',
        label: '優惠類型',
        required: true,
        options: [
          { value: '公車優惠', label: '公車優惠' },
          { value: '特約商店折扣', label: '特約商店折扣' },
          { value: '政府活動積點', label: '政府活動積點' },
          { value: '抽獎參與', label: '抽獎參與' }
        ]
      },
      {
        type: 'textarea',
        name: 'description',
        label: '優惠描述',
        required: true,
        rows: 3
      },
      {
        type: 'date',
        name: 'validUntil',
        label: '有效期限',
        required: true
      }
    ]

    // 驗證規則
    const validationRules = {
      benefitName: {
        required: true,
        maxLength: 100
      },
      benefitType: {
        required: true
      },
      description: {
        required: true
      },
      validUntil: {
        required: true,
        custom: (value) => {
          if (new Date(value) < new Date()) {
            return '有效期限不能早於今天'
          }
        }
      },
      usageLimit: {
        custom: (value) => {
          if (hasUsageLimit.value && (!value || value < 1)) {
            return '請輸入有效的使用次數限制'
          }
        }
      }
    }

    // 使用限制
    const hasUsageLimit = ref(false)

    // 使用統計
    const usageStats = ref({})

    // 使用記錄
    const usageHistory = ref([])
    const totalUsage = ref(0)
    const page = ref(1)
    const pageSize = ref(10)

    // 使用記錄表格列定義
    const usageColumns = [
      { prop: 'memberName', label: '使用會員' },
      {
        prop: 'usageTime',
        label: '使用時間',
        formatter: formatDateTime
      },
      { prop: 'description', label: '使用說明' }
    ]

    // 確認對話框
    const showConfirmModal = ref(false)
    const errors = ref({})

    // 載入優惠資料
    const fetchBenefitData = async () => {
      if (isNewBenefit.value) return

      try {
        loading.value = true
        const response = await benefitAPI.getBenefitById(benefitId)
        Object.assign(formData, response)
        hasUsageLimit.value = !!response.usageLimit
      } catch (error) {
        console.error('載入優惠資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入使用統計
    const fetchUsageStats = async () => {
      if (isNewBenefit.value) return

      try {
        const response = await benefitAPI.getBenefitStats(benefitId)
        usageStats.value = response
      } catch (error) {
        console.error('載入使用統計失敗:', error)
      }
    }

    // 載入使用記錄
    const fetchUsageHistory = async () => {
      if (isNewBenefit.value) return

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

    // 處理表單提交
    const handleSubmit = (data) => {
      if (!hasUsageLimit.value) {
        data.usageLimit = null
      }
      showConfirmModal.value = true
    }

    // 確認提交
    const confirmSubmit = async () => {
      try {
        saving.value = true
        if (isNewBenefit.value) {
          await benefitAPI.createBenefit(formData)
        } else {
          await benefitAPI.updateBenefit(benefitId, formData)
        }
        router.push('/benefits')
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

    onMounted(() => {
      fetchBenefitData()
      fetchUsageStats()
      fetchUsageHistory()
    })

    return {
      isNewBenefit,
      loading,
      loadingUsage,
      saving,
      formData,
      formFields,
      validationRules,
      hasUsageLimit,
      usageStats,
      usageHistory,
      totalUsage,
      page,
      pageSize,
      usageColumns,
      showConfirmModal,
      errors,
      handleSubmit,
      confirmSubmit,
      handleCancel,
      handlePageChange,
      handlePageSizeChange
    }
  }
}
</script>

<style scoped>
.benefit-edit {
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

.usage-stats {
  margin-top: 1rem;
}

.stat-card {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  text-align: center;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .benefit-edit {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .stat-card {
    margin-bottom: 1rem;
  }
}
</style>