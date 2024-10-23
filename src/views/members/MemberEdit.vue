<template>
  <div class="member-edit">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">{{ isNewMember ? '新增會員' : '編輯會員' }}</h5>
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
            <!-- 自定義表單內容 -->
            <template #after-fields>
              <!-- 市民卡資訊 -->
              <div v-if="!isNewMember" class="mt-4">
                <h6>市民卡資訊</h6>
                <div v-if="formData.citizenCard" class="citizen-card-info">
                  <div class="row">
                    <div class="col-md-4">
                      <label class="form-label">卡號</label>
                      <p>{{ formData.citizenCard.cardNumber }}</p>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">持卡人</label>
                      <p>{{ formData.citizenCard.holderName }}</p>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">卡片類型</label>
                      <p>{{ formData.citizenCard.cardType }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">
                  尚未綁定市民卡
                </div>
              </div>

              <!-- 帳號狀態設定 -->
              <div v-if="!isNewMember" class="mt-4">
                <h6>帳號狀態</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-check form-switch">
                      <input
                          class="form-check-input"
                          type="checkbox"
                          id="isActive"
                          v-model="formData.isActive"
                      >
                      <label class="form-check-label" for="isActive">
                        帳號啟用
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-check form-switch">
                      <input
                          class="form-check-input"
                          type="checkbox"
                          id="isVerified"
                          v-model="formData.isVerified"
                      >
                      <label class="form-check-label" for="isVerified">
                        信箱已驗證
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BaseForm>
        </div>
      </div>

      <!-- 操作記錄 -->
      <div v-if="!isNewMember" class="card mt-4">
        <div class="card-header">
          <h5 class="mb-0">操作記錄</h5>
        </div>
        <div class="card-body">
          <BaseTable
              :columns="logColumns"
              :data="logs"
              :loading="loadingLogs"
          />
        </div>
      </div>
    </div>

    <!-- 確認對話框 -->
    <BaseModal
        v-model="showConfirmModal"
        title="確認更改"
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
import memberAPI from '@/api/members'
import { formatDate } from '@/utils/format'

export default {
  name: 'MemberEdit',
  components: {
    Breadcrumb,
    BaseForm,
    BaseTable,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const memberId = route.params.id

    // 判斷是否為新增會員
    const isNewMember = computed(() => !memberId)

    // 載入狀態
    const loading = ref(false)
    const loadingLogs = ref(false)
    const saving = ref(false)

    // 表單數據
    const formData = reactive({
      email: '',
      phone: '',
      role: '普通用戶',
      isActive: true,
      isVerified: false,
      citizenCard: null
    })

    // 表單欄位定義
    const formFields = [
      {
        type: 'email',
        name: 'email',
        label: '電子郵件',
        required: true
      },
      {
        type: 'text',
        name: 'phone',
        label: '手機號碼',
        required: true
      },
      {
        type: 'select',
        name: 'role',
        label: '用戶角色',
        options: [
          { value: '普通用戶', label: '普通用戶' },
          { value: '管理員', label: '管理員' }
        ]
      }
    ]

    // 驗證規則
    const validationRules = {
      email: {
        required: true,
        email: true
      },
      phone: {
        required: true,
        custom: (value) => {
          if (!/^09\d{8}$/.test(value)) {
            return '請輸入有效的手機號碼'
          }
        }
      }
    }

    // 操作記錄列定義
    const logColumns = [
      { prop: 'logTime', label: '時間', formatter: formatDate },
      { prop: 'logType', label: '類型' },
      { prop: 'description', label: '描述' }
    ]

    // 操作記錄數據
    const logs = ref([])

    // 確認對話框
    const showConfirmModal = ref(false)
    const pendingData = ref(null)

    // 載入會員資料
    const fetchMemberData = async () => {
      if (isNewMember.value) return

      try {
        loading.value = true
        const response = await memberAPI.getMemberById(memberId)
        Object.assign(formData, response)
      } catch (error) {
        console.error('載入會員資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入操作記錄
    const fetchLogs = async () => {
      if (isNewMember.value) return

      try {
        loadingLogs.value = true
        const response = await memberAPI.getMemberLogs(memberId)
        logs.value = response
      } catch (error) {
        console.error('載入操作記錄失敗:', error)
      } finally {
        loadingLogs.value = false
      }
    }

    // 處理表單提交
    const handleSubmit = (data) => {
      pendingData.value = data
      showConfirmModal.value = true
    }

    // 確認提交
    const confirmSubmit = async () => {
      if (!pendingData.value) return

      try {
        saving.value = true
        if (isNewMember.value) {
          await memberAPI.createMember(pendingData.value)
        } else {
          await memberAPI.updateMember(memberId, pendingData.value)
        }
        router.push('/members')
      } catch (error) {
        console.error('儲存失敗:', error)
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
      fetchMemberData()
      fetchLogs()
    })

    return {
      isNewMember,
      loading,
      loadingLogs,
      saving,
      formData,
      formFields,
      validationRules,
      logColumns,
      logs,
      showConfirmModal,
      handleSubmit,
      confirmSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.member-edit {
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

.citizen-card-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.form-check-input {
  cursor: pointer;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .member-edit {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>