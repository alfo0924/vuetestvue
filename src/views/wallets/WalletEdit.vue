<template>
  <div class="wallet-edit">
    <!-- 麵包屑導航 -->
    <Breadcrumb />

    <div class="content-wrapper">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">電子錢包設定</h5>
        </div>
        <div class="card-body">
          <!-- 基本資訊 -->
          <div class="wallet-info mb-4">
            <div class="row">
              <div class="col-md-6">
                <h6>基本資訊</h6>
                <p><strong>錢包ID：</strong> {{ walletData.walletId }}</p>
                <p><strong>持有人：</strong> {{ walletData.memberName }}</p>
                <p><strong>目前餘額：</strong>
                  <span class="balance">$ {{ walletData.balance }}</span>
                </p>
              </div>
              <div class="col-md-6">
                <h6>交易限額設定</h6>
                <form @submit.prevent="handleLimitSubmit">
                  <div class="mb-3">
                    <label class="form-label">單筆交易限額</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input
                          type="number"
                          class="form-control"
                          v-model.number="limitForm.singleTransactionLimit"
                          :class="{ 'is-invalid': errors.singleTransactionLimit }"
                      >
                    </div>
                    <div class="invalid-feedback">{{ errors.singleTransactionLimit }}</div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">每日交易限額</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input
                          type="number"
                          class="form-control"
                          v-model.number="limitForm.dailyLimit"
                          :class="{ 'is-invalid': errors.dailyLimit }"
                      >
                    </div>
                    <div class="invalid-feedback">{{ errors.dailyLimit }}</div>
                  </div>
                  <div class="text-end">
                    <BaseButton
                        type="submit"
                        variant="primary"
                        :loading="saving"
                    >
                      儲存限額設定
                    </BaseButton>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- 安全設定 -->
          <div class="security-settings mb-4">
            <h6>安全設定</h6>
            <div class="row">
              <div class="col-md-6">
                <div class="form-check form-switch mb-3">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      id="requirePassword"
                      v-model="securityForm.requirePassword"
                  >
                  <label class="form-check-label" for="requirePassword">
                    支付時需要密碼驗證
                  </label>
                </div>
                <div class="form-check form-switch mb-3">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      id="enableNotification"
                      v-model="securityForm.enableNotification"
                  >
                  <label class="form-check-label" for="enableNotification">
                    開啟交易通知
                  </label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="text-end">
                  <BaseButton
                      variant="primary"
                      :loading="savingSecurity"
                      @click="handleSecuritySubmit"
                  >
                    儲存安全設定
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- 凍結設定（管理員） -->
          <div v-if="isAdmin" class="freeze-settings">
            <h6>帳戶狀態</h6>
            <div class="row">
              <div class="col-md-6">
                <div class="form-check">
                  <input
                      class="form-check-input"
                      type="radio"
                      id="statusNormal"
                      value="normal"
                      v-model="freezeForm.status"
                  >
                  <label class="form-check-label" for="statusNormal">
                    正常使用
                  </label>
                </div>
                <div class="form-check">
                  <input
                      class="form-check-input"
                      type="radio"
                      id="statusFrozen"
                      value="frozen"
                      v-model="freezeForm.status"
                  >
                  <label class="form-check-label" for="statusFrozen">
                    凍結帳戶
                  </label>
                </div>
              </div>
              <div class="col-md-6">
                <div v-if="freezeForm.status === 'frozen'" class="mb-3">
                  <label class="form-label">凍結原因</label>
                  <textarea
                      class="form-control"
                      v-model="freezeForm.reason"
                      rows="3"
                  ></textarea>
                </div>
                <div class="text-end">
                  <BaseButton
                      variant="primary"
                      :loading="savingFreeze"
                      @click="handleFreezeSubmit"
                  >
                    更新帳戶狀態
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認對話框 -->
    <BaseModal
        v-model="showConfirmModal"
        title="確認更新"
        @confirm="confirmUpdate"
    >
      <p>確定要更新這些設定嗎？</p>
    </BaseModal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import walletAPI from '@/api/wallets'

export default {
  name: 'WalletEdit',
  components: {
    Breadcrumb,
    BaseButton,
    BaseModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const walletId = route.params.id

    // 載入狀態
    const loading = ref(false)
    const saving = ref(false)
    const savingSecurity = ref(false)
    const savingFreeze = ref(false)

    // 錢包資料
    const walletData = ref({})

    // 交易限額表單
    const limitForm = reactive({
      singleTransactionLimit: 0,
      dailyLimit: 0
    })

    // 安全設定表單
    const securityForm = reactive({
      requirePassword: false,
      enableNotification: false
    })

    // 凍結設定表單
    const freezeForm = reactive({
      status: 'normal',
      reason: ''
    })

    // 錯誤訊息
    const errors = ref({})

    // 確認對話框
    const showConfirmModal = ref(false)
    const updateType = ref('')
    const pendingUpdate = ref(null)

    // 判斷是否為管理員
    const isAdmin = computed(() => store.state.auth.userRole === 'admin')

    // 載入錢包資料
    const fetchWalletData = async () => {
      try {
        loading.value = true
        const response = await walletAPI.getWallet(walletId)
        walletData.value = response
        // 初始化表單資料
        limitForm.singleTransactionLimit = response.singleTransactionLimit
        limitForm.dailyLimit = response.dailyLimit
        securityForm.requirePassword = response.requirePassword
        securityForm.enableNotification = response.enableNotification
        freezeForm.status = response.status
      } catch (error) {
        console.error('載入錢包資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 處理限額設定提交
    const handleLimitSubmit = () => {
      updateType.value = 'limit'
      pendingUpdate.value = { ...limitForm }
      showConfirmModal.value = true
    }

    // 處理安全設定提交
    const handleSecuritySubmit = () => {
      updateType.value = 'security'
      pendingUpdate.value = { ...securityForm }
      showConfirmModal.value = true
    }

    // 處理凍結設定提交
    const handleFreezeSubmit = () => {
      updateType.value = 'freeze'
      pendingUpdate.value = { ...freezeForm }
      showConfirmModal.value = true
    }

    // 確認更新
    const confirmUpdate = async () => {
      try {
        switch (updateType.value) {
          case 'limit':
            saving.value = true
            await walletAPI.setTransactionLimit(walletId, pendingUpdate.value)
            break
          case 'security':
            savingSecurity.value = true
            await walletAPI.updateSecuritySettings(walletId, pendingUpdate.value)
            break
          case 'freeze':
            savingFreeze.value = true
            if (pendingUpdate.value.status === 'frozen') {
              await walletAPI.freezeWallet(walletId, {
                reason: pendingUpdate.value.reason
              })
            } else {
              await walletAPI.unfreezeWallet(walletId)
            }
            break
        }
        await fetchWalletData()
        showConfirmModal.value = false
      } catch (error) {
        console.error('更新設定失敗:', error)
        errors.value = error.response?.data?.errors || {}
      } finally {
        saving.value = false
        savingSecurity.value = false
        savingFreeze.value = false
      }
    }

    onMounted(() => {
      fetchWalletData()
    })

    return {
      loading,
      saving,
      savingSecurity,
      savingFreeze,
      walletData,
      limitForm,
      securityForm,
      freezeForm,
      errors,
      showConfirmModal,
      isAdmin,
      handleLimitSubmit,
      handleSecuritySubmit,
      handleFreezeSubmit,
      confirmUpdate
    }
  }
}
</script>

<style scoped>
.wallet-edit {
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

.balance {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0d6efd;
}

.form-check-input {
  cursor: pointer;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .wallet-edit {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>