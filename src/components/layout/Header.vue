<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <!-- Logo 和網站名稱 -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="@/assets/logo.svg" alt="Logo" width="30" height="30" class="me-2">
        市民卡系統
      </router-link>

      <!-- 手機版摺疊按鈕 -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarContent" aria-controls="navbarContent"
              aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 導航內容 -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <!-- 主要導航選項 -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/movies">
              <i class="bi bi-film"></i> 電影
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/benefits">
              <i class="bi bi-gift"></i> 優惠
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/venues">
              <i class="bi bi-building"></i> 場地
            </router-link>
          </li>
        </ul>

        <!-- 用戶相關選項 -->
        <ul class="navbar-nav" v-if="!isLoggedIn">
          <li class="nav-item">
            <router-link class="nav-link" to="/login">
              <i class="bi bi-box-arrow-in-right"></i> 登入
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/register">
              <i class="bi bi-person-plus"></i> 註冊
            </router-link>
          </li>
        </ul>

        <!-- 已登入用戶選項 -->
        <ul class="navbar-nav" v-else>
          <!-- 通知 -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="notificationDropdown"
               role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-bell"></i>
              <span class="badge bg-danger" v-if="unreadNotifications > 0">
                {{ unreadNotifications }}
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationDropdown">
              <li v-if="notifications.length === 0">
                <span class="dropdown-item text-muted">無新通知</span>
              </li>
              <li v-for="notification in notifications" :key="notification.id">
                <a class="dropdown-item" href="#" @click="readNotification(notification.id)">
                  {{ notification.content }}
                </a>
              </li>
            </ul>
          </li>

          <!-- 電子錢包 -->
          <li class="nav-item">
            <router-link class="nav-link" to="/wallet">
              <i class="bi bi-wallet2"></i>
              <span v-if="walletBalance !== null">
                $ {{ walletBalance }}
              </span>
            </router-link>
          </li>

          <!-- 用戶選單 -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown"
               role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle"></i> {{ userName }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li>
                <router-link class="dropdown-item" to="/profile">
                  <i class="bi bi-person"></i> 個人資料
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/bookings">
                  <i class="bi bi-calendar-check"></i> 我的訂位
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/citizen-card">
                  <i class="bi bi-credit-card"></i> 市民卡資訊
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click="handleLogout">
                  <i class="bi bi-box-arrow-right"></i> 登出
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const store = useStore()

    // 狀態管理
    const isLoggedIn = ref(false)
    const userName = ref('')
    const walletBalance = ref(null)
    const notifications = ref([])
    const unreadNotifications = ref(0)

    // 初始化數據
    onMounted(async () => {
      await checkLoginStatus()
      if (isLoggedIn.value) {
        await Promise.all([
          fetchWalletBalance(),
          fetchNotifications()
        ])
      }
    })

    // 檢查登入狀態
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        isLoggedIn.value = true
        userName.value = localStorage.getItem('userName') || '用戶'
      }
    }

    // 獲取錢包餘額
    const fetchWalletBalance = async () => {
      try {
        const response = await store.dispatch('wallet/getBalance')
        walletBalance.value = response.balance
      } catch (error) {
        console.error('獲取錢包餘額失敗:', error)
      }
    }

    // 獲取通知
    const fetchNotifications = async () => {
      try {
        const response = await store.dispatch('notifications/getNotifications')
        notifications.value = response.notifications
        unreadNotifications.value = response.notifications.filter(n => !n.isRead).length
      } catch (error) {
        console.error('獲取通知失敗:', error)
      }
    }

    // 標記通知為已讀
    const readNotification = async (notificationId) => {
      try {
        await store.dispatch('notifications/markAsRead', notificationId)
        await fetchNotifications()
      } catch (error) {
        console.error('標記通知失敗:', error)
      }
    }

    // 處理登出
    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        isLoggedIn.value = false
        router.push('/login')
      } catch (error) {
        console.error('登出失敗:', error)
      }
    }

    return {
      isLoggedIn,
      userName,
      walletBalance,
      notifications,
      unreadNotifications,
      readNotification,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand img {
  transition: transform 0.3s ease;
}

.navbar-brand:hover img {
  transform: scale(1.1);
}

.nav-link {
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #fff !important;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}

.dropdown-menu {
  min-width: 200px;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.3s ease;
}

.dropdown-item i {
  margin-right: 0.5rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}
</style>