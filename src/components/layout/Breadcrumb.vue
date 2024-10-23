<template>
  <nav aria-label="breadcrumb" class="breadcrumb-wrapper">
    <ol class="breadcrumb">
      <!-- 首頁連結 -->
      <li class="breadcrumb-item">
        <router-link to="/">
          <i class="bi bi-house-door"></i> 首頁
        </router-link>
      </li>

      <!-- 動態麵包屑 -->
      <li v-for="(item, index) in breadcrumbList"
          :key="index"
          class="breadcrumb-item"
          :class="{ 'active': index === breadcrumbList.length - 1 }">
        <!-- 非最後一項可點擊 -->
        <template v-if="index !== breadcrumbList.length - 1">
          <router-link :to="item.path">
            <i v-if="item.icon" :class="'bi bi-' + item.icon"></i>
            {{ item.name }}
          </router-link>
        </template>
        <!-- 最後一項不可點擊 -->
        <template v-else>
          <i v-if="item.icon" :class="'bi bi-' + item.icon"></i>
          {{ item.name }}
        </template>
      </li>
    </ol>
  </nav>
</template>

<script>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()
    const breadcrumbList = ref([])

    // 路由映射表
    const routeMap = {
      movies: { name: '電影', icon: 'film' },
      'movie-detail': { name: '電影詳情', icon: 'film' },
      benefits: { name: '優惠', icon: 'gift' },
      'benefit-detail': { name: '優惠詳情', icon: 'gift' },
      wallet: { name: '電子錢包', icon: 'wallet2' },
      bookings: { name: '訂位管理', icon: 'calendar-check' },
      'booking-detail': { name: '訂位詳情', icon: 'calendar-check' },
      profile: { name: '個人資料', icon: 'person' },
      'citizen-card': { name: '市民卡', icon: 'credit-card' },
      venues: { name: '場地', icon: 'building' },
      'venue-detail': { name: '場地詳情', icon: 'building' },
      // 管理員路由
      'admin-members': { name: '會員管理', icon: 'people' },
      'admin-movies': { name: '電影管理', icon: 'film' },
      'admin-benefits': { name: '優惠管理', icon: 'gift' },
      'admin-venues': { name: '場地管理', icon: 'building' }
    }

    // 生成麵包屑
    const generateBreadcrumb = (route) => {
      const { matched, params } = route
      const list = []

      matched.forEach(item => {
        // 如果路由有名稱且在映射表中存在
        if (item.name && routeMap[item.name]) {
          const breadcrumbItem = {
            name: routeMap[item.name].name,
            path: item.path,
            icon: routeMap[item.name].icon
          }

          // 處理動態路由參數
          if (Object.keys(params).length > 0) {
            Object.keys(params).forEach(key => {
              breadcrumbItem.path = breadcrumbItem.path.replace(`:${key}`, params[key])
            })
          }

          list.push(breadcrumbItem)
        }
      })

      return list
    }

    // 監聽路由變化
    watch(
        () => route.fullPath,
        () => {
          breadcrumbList.value = generateBreadcrumb(route)
        },
        { immediate: true }
    )

    return {
      breadcrumbList
    }
  }
}
</script>

<style scoped>
.breadcrumb-wrapper {
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.breadcrumb {
  margin-bottom: 0;
  padding: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item a {
  color: #0d6efd;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-item a:hover {
  color: #0a58ca;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "/";
  padding: 0 0.5rem;
  color: #6c757d;
}

.bi {
  margin-right: 0.25rem;
}

/* 動畫效果 */
.breadcrumb-item {
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 依序顯示動畫 */
.breadcrumb-item:nth-child(1) { animation-delay: 0.1s; }
.breadcrumb-item:nth-child(2) { animation-delay: 0.2s; }
.breadcrumb-item:nth-child(3) { animation-delay: 0.3s; }
.breadcrumb-item:nth-child(4) { animation-delay: 0.4s; }
</style>