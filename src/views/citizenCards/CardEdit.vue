<template>
  <div class="card-edit">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">{{ isNewCard ? '新增市民卡' : '編輯市民卡' }}</h5>
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
            <!-- 身份驗證區域 -->
            <template #after-fields>
              <div v-if="isNewCard" class="mt-4">
                <h6>身份驗證</h6>
                <div class="identity-verification">
                  <div class="mb-3">
                    <label class="form-label">驗證類型</label>
                    <select
                        class="form-select"
                        v-model="verificationType"
                        :class="{ 'is-invalid': verificationErrors.type }"
                    >
                      <option value="">請選擇驗證方式</option>
                      <option value="數位身份證明">數位身份證明</option>
                      <option value="圖書館借書">圖書館借書</option>
                      <option value="學生身份驗證">學生身份驗證</option>
                      <option value="員工身份驗證">員工身份驗證</option>
                    </select>
                    <div class="invalid-feedback">{{ verificationErrors.type }}</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">驗證資料</label>
                    <BaseUpload
                        accept=".jpg,.png,.pdf"
                        :max-size="5 * 1024 * 1024"
                        :hint="'支援 JPG、PNG、PDF 格式，檔案大小不超過 5MB'"
                        @upload="handleVerificationUpload"
                    />
                  </div>
                </div>
              </div>

              <!-- 綁定會員資訊 -->
              <div v-if="!isNewCard" class="mt-4">
                <h6>綁定會員資訊</h6>
                <div class="member-info">
                  <div v-if="formData.memberId" class="row">
                    <div class="col-md-6">
                      <p><strong>會員姓名：</strong> {{ memberInfo.name }}</p>
                      <p><strong>電子郵件：</strong> {{ memberInfo.email }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>手機號碼：</strong> {{ memberInfo.phone }}</p>
                      <p><strong>綁定時間：</strong> {{ formatDateTime(memberInfo.bindTime) }}</p>
                    </div>
                  </div>
                  <div v-else class="text-muted">
                    尚未綁定會員
                  </div>
                </div>
              </div>
            </template>
          </BaseForm>
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
import BaseUpload from '@/components/common/BaseUpload.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import citizenCardAPI from '@/api/citizenCards'
import { formatDateTime } from '@/utils/format'

export default {
  name: 'CardEdit',
  components: {
    Breadcrumb,
    BaseForm,
    BaseUpload,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const cardNumber = route.params.id

    // 判斷是否為新增市民卡
    const isNewCard = computed(() => !cardNumber)

    // 載入狀態
    const loading = ref(false)
    const saving = ref(false)

    // 表單數據
    const formData = reactive({
      cardNumber: '',
      holderName: '',
      cardType: '',
      memberId: null
    })

    // 表單欄位定義
    const formFields = [
      {
        type: 'text',
        name: 'cardNumber',
        label: '卡號',
        required: true,
        disabled: !isNewCard.value
      },
      {
        type: 'text',
        name: 'holderName',
        label: '持卡人姓名',
        required: true
      },
      {
        type: 'select',
        name: 'cardType',
        label: '卡片類型',
        required: true,
        options: [
          { value: '一般卡', label: '一般卡' },
          { value: '敬老卡', label: '敬老卡' },
          { value: '愛心卡', label: '愛心卡' },
          { value: '學生卡', label: '學生卡' }
        ]
      }
    ]

    // 驗證規則
    const validationRules = {
      cardNumber: {
        required: true,
        custom: (value) => {
          if (!/^[A-Z]\d{9}$/.test(value)) {
            return '請輸入有效的市民卡號（1個大寫字母加9位數字）'
          }
        }
      },
      holderName: {
        required: true,
        maxLength: 100
      },
      cardType: {
        required: true
      }
    }

    // 身份驗證相關
    const verificationType = ref('')
    const verificationErrors = ref({})
    const verificationData = ref(null)

    // 會員資訊
    const memberInfo = ref({})

    // 確認對話框
    const showConfirmModal = ref(false)
    const errors = ref({})

    // 載入市民卡資料
    const fetchCardData = async () => {
      if (isNewCard.value) return

      try {
        loading.value = true
        const response = await citizenCardAPI.getCitizenCardByNumber(cardNumber)
        Object.assign(formData, response)
        if (response.memberId) {
          await fetchMemberInfo(response.memberId)
        }
      } catch (error) {
        console.error('載入市民卡資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 載入會員資訊
    const fetchMemberInfo = async (memberId) => {
      try {
        const response = await citizenCardAPI.getMemberInfo(memberId)
        memberInfo.value = response
      } catch (error) {
        console.error('載入會員資訊失敗:', error)
      }
    }

    // 處理身份驗證文件上傳
    const handleVerificationUpload = async (file) => {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', verificationType.value)
        const response = await citizenCardAPI.uploadVerification(formData)
        verificationData.value = response
      } catch (error) {
        console.error('上傳驗證文件失敗:', error)
      }
    }

    // 處理表單提交
    const handleSubmit = (data) => {
      if (isNewCard.value && !verificationData.value) {
        verificationErrors.value = { type: '請完成身份驗證' }
        return
      }
      showConfirmModal.value = true
    }

    // 確認提交
    const confirmSubmit = async () => {
      try {
        saving.value = true
        if (isNewCard.value) {
          await citizenCardAPI.createCard({
            ...formData,
            verificationData: verificationData.value
          })
        } else {
          await citizenCardAPI.updateCard(cardNumber, formData)
        }
        router.push('/citizen-cards')
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

    onMounted(() => {
      fetchCardData()
    })

    return {
      isNewCard,
      loading,
      saving,
      formData,
      formFields,
      validationRules,
      verificationType,
      verificationErrors,
      memberInfo,
      showConfirmModal,
      errors,
      handleVerificationUpload,
      handleSubmit,
      confirmSubmit,
      handleCancel,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.card-edit {
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

.identity-verification {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.member-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .card-edit {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>