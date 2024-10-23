<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- 側邊欄頭部 -->
    <div class="sidebar-header">
      <button class="btn btn-link sidebar-toggle" @click="toggleSidebar">
        <i class="bi" :class="isCollapsed ? 'bi-arrow-right-circle' : 'bi-arrow-left-circle'"></i>
      </button>
    </div>

    <!-- 主要導航選單 -->
    <nav class="sidebar-nav">
      <!-- 一般用戶選單 -->
      <div class="nav-section">
        <h6 class="sidebar-heading" v-if="!isCollapsed">一般功能</h6>
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" :title="isCollapsed ? '首頁' : ''">
              <i class="bi bi-house"></i>
              <span v-if="!isCollapsed">首頁</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/movies" class="nav-link" :title="isCollapsed ? '電影訂票' : ''">
              <i class="bi bi-film"></i>
              <span v-if="!isCollapsed">電影訂票</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/wallet" class="nav-link" :title="isCollapsed ? '電子錢包' : ''">
              <i class="bi bi-wallet2"></i>
              <span v-if="!isCollapsed">電子錢包</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/benefits" class="nav-link" :title="isCollapsed ? '優惠專區' : ''">
              <i class="bi bi-gift"></i>
              <span v-if="!isCollapsed">優惠專區</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- 會員中心選單 -->
      <div class="nav-section" v-if="isLoggedIn">
        <h6 class="sidebar-heading" v-if="!isCollapsed">會員中心</h6>
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link to="/profile" class="nav-link" :title="isCollapsed ? '個人資料' : ''">
              <i class="bi bi-person"></i>
              <span v-if="!isCollapsed">個人資料</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/bookings" class="nav-link" :title="isCollapsed ? '我的訂位' : ''">
              <i class="bi bi-calendar-check"></i>
              <span v-if="!isCollapsed">我的訂位</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/citizen-card" class="nav-link" :title="isCollapsed ? '市民卡資訊' : ''">
              <i class="bi bi-credit-card"></i>
              <span v-if="!isCollapsed">市民卡資訊</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- 管理員選單 -->
      <div class="nav-section" v-if="isAdmin">
        <h6 class="sidebar-heading" v-if="!isCollapsed">系統管理</h6>
        <ul class="nav flex-column">
          <li class="nav-item">
            <router-link to="/admin/members" class="nav-link" :title="isCollapsed ? '會員管理' : ''">
              <i class="bi bi-people"></i>
              <span v-if="!isCollapsed">會員管理</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/movies" class="nav-link" :title="isCollapsed ? '電影管理' : ''">
              <i class="bi bi-film"></i>
              <span v-if="!isCollapsed">電影管理</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/venues" class="nav-link" :title="isCollapsed ? '場地管理' : ''">
              <i class="bi bi-building"></i>
              <span v-if="!isCollapsed">場地管理</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/benefits" class="nav-link" :title="isCollapsed ? '優惠管理' : ''">
              <i class="bi bi-tags"></i>
              <span v-if="!isCollapsed">優惠管理</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Sidebar',
  setup() {
    const store = useStore()
    const isCollapsed = ref(false)

    // 計算屬性
    const isLoggedIn = computed(() => store.state.auth.isLoggedIn)
    const isAdmin = computed(() => store.state.auth.userRole === 'admin')

    // 切換側邊欄收合狀態
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value
    }

    return {
      isCollapsed,
      isLoggedIn,
      isAdmin,
      toggleSidebar
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  transition: all 0.3s ease;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.sidebar-toggle {
  width: 100%;
  padding: 0;
  color: #6c757d;
}

.sidebar-toggle:hover {
  color: #0d6efd;
}

.sidebar-nav {
  padding: 1rem 0;
}

.sidebar-heading {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6c757d;
}

.nav-section {
  margin-bottom: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #495057;
  text-decoration: none;
}

.nav-link:hover {
  background-color: #e9ecef;
}

.nav-link.active {
  color: #0d6efd;
  background-color: #e9ecef;
}

.nav-link i {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.sidebar-collapsed .nav-link span {
  display: none;
}

.sidebar-collapsed .nav-link i {
  margin-right: 0;
}

.sidebar-collapsed .sidebar-heading {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .sidebar:hover {
    width: 250px;
  }

  .sidebar:hover .nav-link span {
    display: inline;
  }

  .sidebar:hover .sidebar-heading {
    display: block;
  }
}
</style>