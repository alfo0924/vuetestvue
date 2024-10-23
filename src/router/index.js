import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/Home.vue'),
        meta: {
            title: '首頁'
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/auth/Login.vue'),
        meta: {
            title: '登入'
        }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/auth/Register.vue'),
        meta: {
            title: '註冊'
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/auth/Profile.vue'),
        meta: {
            requiresAuth: true,
            title: '個人資料'
        }
    },
    // 會員管理
    {
        path: '/members',
        name: 'members',
        component: () => import('@/views/members/MemberList.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '會員管理'
        }
    },
    {
        path: '/members/new',
        name: 'member-create',
        component: () => import('@/views/members/MemberEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '新增會員'
        }
    },
    {
        path: '/members/:id',
        name: 'member-detail',
        component: () => import('@/views/members/MemberDetail.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '會員詳情'
        }
    },
    {
        path: '/members/:id/edit',
        name: 'member-edit',
        component: () => import('@/views/members/MemberEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '編輯會員'
        }
    },
    // 電影管理
    {
        path: '/movies',
        name: 'movies',
        component: () => import('@/views/movies/MovieList.vue'),
        meta: {
            title: '電影列表'
        }
    },
    {
        path: '/movies/new',
        name: 'movie-create',
        component: () => import('@/views/movies/MovieEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '新增電影'
        }
    },
    {
        path: '/movies/:id',
        name: 'movie-detail',
        component: () => import('@/views/movies/MovieDetail.vue'),
        meta: {
            title: '電影詳情'
        }
    },
    {
        path: '/movies/:id/edit',
        name: 'movie-edit',
        component: () => import('@/views/movies/MovieEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '編輯電影'
        }
    },
    // 訂位管理
    {
        path: '/bookings',
        name: 'bookings',
        component: () => import('@/views/bookings/BookingList.vue'),
        meta: {
            requiresAuth: true,
            title: '訂位管理'
        }
    },
    {
        path: '/bookings/new',
        name: 'booking-create',
        component: () => import('@/views/bookings/BookingEdit.vue'),
        meta: {
            requiresAuth: true,
            title: '新增訂位'
        }
    },
    {
        path: '/bookings/:id',
        name: 'booking-detail',
        component: () => import('@/views/bookings/BookingDetail.vue'),
        meta: {
            requiresAuth: true,
            title: '訂位詳情'
        }
    },
    {
        path: '/bookings/:id/edit',
        name: 'booking-edit',
        component: () => import('@/views/bookings/BookingEdit.vue'),
        meta: {
            requiresAuth: true,
            title: '編輯訂位'
        }
    },
    // 優惠管理
    {
        path: '/benefits',
        name: 'benefits',
        component: () => import('@/views/benefits/BenefitList.vue'),
        meta: {
            title: '優惠列表'
        }
    },
    {
        path: '/benefits/new',
        name: 'benefit-create',
        component: () => import('@/views/benefits/BenefitEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '新增優惠'
        }
    },
    {
        path: '/benefits/:id',
        name: 'benefit-detail',
        component: () => import('@/views/benefits/BenefitDetail.vue'),
        meta: {
            title: '優惠詳情'
        }
    },
    {
        path: '/benefits/:id/edit',
        name: 'benefit-edit',
        component: () => import('@/views/benefits/BenefitEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '編輯優惠'
        }
    },
    // 市民卡管理
    {
        path: '/citizen-cards',
        name: 'citizen-cards',
        component: () => import('@/views/citizenCards/CardList.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '市民卡管理'
        }
    },
    {
        path: '/citizen-cards/new',
        name: 'card-create',
        component: () => import('@/views/citizenCards/CardEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '新增市民卡'
        }
    },
    {
        path: '/citizen-cards/:id',
        name: 'card-detail',
        component: () => import('@/views/citizenCards/CardDetail.vue'),
        meta: {
            requiresAuth: true,
            title: '市民卡詳情'
        }
    },
    {
        path: '/citizen-cards/:id/edit',
        name: 'card-edit',
        component: () => import('@/views/citizenCards/CardEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '編輯市民卡'
        }
    },
    // 場地管理
    {
        path: '/venues',
        name: 'venues',
        component: () => import('@/views/venues/VenueList.vue'),
        meta: {
            title: '場地列表'
        }
    },
    {
        path: '/venues/new',
        name: 'venue-create',
        component: () => import('@/views/venues/VenueEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '新增場地'
        }
    },
    {
        path: '/venues/:id',
        name: 'venue-detail',
        component: () => import('@/views/venues/VenueDetail.vue'),
        meta: {
            title: '場地詳情'
        }
    },
    {
        path: '/venues/:id/edit',
        name: 'venue-edit',
        component: () => import('@/views/venues/VenueEdit.vue'),
        meta: {
            requiresAuth: true,
            role: 'admin',
            title: '編輯場地'
        }
    },
    // 電子錢包
    {
        path: '/wallet',
        name: 'wallet',
        component: () => import('@/views/wallets/Transaction.vue'),
        meta: {
            requiresAuth: true,
            title: '電子錢包'
        }
    },
    // 錯誤頁面
    {
        path: '/403',
        name: '403',
        component: () => import('@/views/error/403.vue'),
        meta: {
            title: '無權限訪問'
        }
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/error/404.vue'),
        meta: {
            title: '頁面不存在'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
    // 設置頁面標題
    document.title = to.meta.title ? `${to.meta.title} - 市民卡系統` : '市民卡系統'

    // 檢查是否需要登入
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.state.auth.isLoggedIn) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }
    }

    // 檢查角色權限
    if (to.meta.role && store.state.auth.userRole !== to.meta.role) {
        next('/403')
        return
    }

    next()
})

export default router