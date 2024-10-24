// 權限常量定義
export const PERMISSIONS = {
    // 會員管理權限
    MEMBER_VIEW: 'member:view',
    MEMBER_CREATE: 'member:create',
    MEMBER_EDIT: 'member:edit',
    MEMBER_DELETE: 'member:delete',

    // 電影管理權限
    MOVIE_VIEW: 'movie:view',
    MOVIE_CREATE: 'movie:create',
    MOVIE_EDIT: 'movie:edit',
    MOVIE_DELETE: 'movie:delete',

    // 場地管理權限
    VENUE_VIEW: 'venue:view',
    VENUE_CREATE: 'venue:create',
    VENUE_EDIT: 'venue:edit',
    VENUE_DELETE: 'venue:delete',

    // 訂位管理權限
    BOOKING_VIEW: 'booking:view',
    BOOKING_CREATE: 'booking:create',
    BOOKING_EDIT: 'booking:edit',
    BOOKING_DELETE: 'booking:delete',

    // 優惠管理權限
    BENEFIT_VIEW: 'benefit:view',
    BENEFIT_CREATE: 'benefit:create',
    BENEFIT_EDIT: 'benefit:edit',
    BENEFIT_DELETE: 'benefit:delete',

    // 市民卡管理權限
    CARD_VIEW: 'card:view',
    CARD_CREATE: 'card:create',
    CARD_EDIT: 'card:edit',
    CARD_DELETE: 'card:delete',

    // 電子錢包權限
    WALLET_VIEW: 'wallet:view',
    WALLET_DEPOSIT: 'wallet:deposit',
    WALLET_WITHDRAW: 'wallet:withdraw',
    WALLET_TRANSFER: 'wallet:transfer',

    // 系統管理權限
    SYSTEM_SETTINGS: 'system:settings',
    USER_MANAGEMENT: 'user:management',
    ROLE_MANAGEMENT: 'role:management',
    LOG_VIEW: 'log:view'
}

// 角色權限映射
export const ROLE_PERMISSIONS = {
    // 管理員角色擁有所有權限
    admin: Object.values(PERMISSIONS),

    // 一般會員權限
    user: [
        PERMISSIONS.MOVIE_VIEW,
        PERMISSIONS.BOOKING_CREATE,
        PERMISSIONS.BOOKING_VIEW,
        PERMISSIONS.BENEFIT_VIEW,
        PERMISSIONS.WALLET_VIEW,
        PERMISSIONS.WALLET_DEPOSIT,
        PERMISSIONS.WALLET_TRANSFER
    ]
}

// 檢查是否有權限
export function hasPermission(userRole, permission) {
    if (!userRole || !permission) return false
    const permissions = ROLE_PERMISSIONS[userRole]
    return permissions && permissions.includes(permission)
}

// 檢查是否有多個權限中的任意一個
export function hasAnyPermission(userRole, permissions) {
    if (!userRole || !permissions) return false
    return permissions.some(permission => hasPermission(userRole, permission))
}

// 檢查是否有所有指定權限
export function hasAllPermissions(userRole, permissions) {
    if (!userRole || !permissions) return false
    return permissions.every(permission => hasPermission(userRole, permission))
}

// 權限指令
export const permissionDirective = {
    mounted(el, binding) {
        const { value } = binding
        const userRole = localStorage.getItem('userRole') // 或從 Vuex store 獲取

        if (value && !hasPermission(userRole, value)) {
            el.parentNode && el.parentNode.removeChild(el)
        }
    }
}

// 權限守衛
export function createPermissionGuard(router, store) {
    router.beforeEach((to, from, next) => {
        const userRole = store.state.auth.userRole

        // 檢查路由是否需要權限
        if (to.meta.permission) {
            if (!hasPermission(userRole, to.meta.permission)) {
                next('/403')
                return
            }
        }

        // 檢查路由是否需要特定角色
        if (to.meta.roles && !to.meta.roles.includes(userRole)) {
            next('/403')
            return
        }

        next()
    })
}

// 權限檢查 Hook
export function usePermission() {
    const store = useStore()
    const userRole = computed(() => store.state.auth.userRole)

    return {
        hasPermission: (permission) => hasPermission(userRole.value, permission),
        hasAnyPermission: (permissions) => hasAnyPermission(userRole.value, permissions),
        hasAllPermissions: (permissions) => hasAllPermissions(userRole.value, permissions)
    }
}

// 權限工具函數
export const permissionUtils = {
    // 過濾選單項目
    filterMenuItems(menuItems, userRole) {
        return menuItems.filter(item => {
            if (item.permission) {
                return hasPermission(userRole, item.permission)
            }
            if (item.children) {
                item.children = this.filterMenuItems(item.children, userRole)
                return item.children.length > 0
            }
            return true
        })
    },

    // 過濾按鈕權限
    filterButtons(buttons, userRole) {
        return buttons.filter(button => {
            return !button.permission || hasPermission(userRole, button.permission)
        })
    },

    // 檢查 API 權限
    checkApiPermission(apiPermission, userRole) {
        return hasPermission(userRole, apiPermission)
    }
}

// 使用範例：
/*
// 在組件中使用
import { usePermission } from '@/utils/permission'

export default {
  setup() {
    const { hasPermission } = usePermission()

    return {
      canCreateUser: computed(() => hasPermission(PERMISSIONS.USER_CREATE)),
      canEditUser: computed(() => hasPermission(PERMISSIONS.USER_EDIT))
    }
  }
}

// 在模板中使用指令
<template>
  <button v-permission="PERMISSIONS.USER_CREATE">新增用戶</button>
</template>

// 在路由配置中使用
{
  path: '/users',
  component: UserList,
  meta: {
    permission: PERMISSIONS.USER_VIEW
  }
}

// 過濾選單項目
const menuItems = permissionUtils.filterMenuItems(rawMenuItems, userRole)
*/