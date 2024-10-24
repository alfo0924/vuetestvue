import store from '@/store'

// 權限指令
export const permission = {
    mounted(el, binding) {
        const { value, modifiers } = binding
        const userRole = store.state.auth.userRole

        // 檢查是否有指定權限
        const hasPermission = (permission) => {
            return store.getters['auth/hasPermission'](permission)
        }

        // 檢查是否有多個權限中的任一個
        const hasAnyPermission = (permissions) => {
            return permissions.some(permission => hasPermission(permission))
        }

        // 檢查是否有所有指定權限
        const hasAllPermissions = (permissions) => {
            return permissions.every(permission => hasPermission(permission))
        }

        // 處理權限檢查
        const checkPermission = () => {
            // 如果沒有指定權限，直接返回
            if (!value) return true

            // 如果是管理員，直接通過
            if (userRole === 'admin') return true

            // 處理陣列形式的權限
            if (Array.isArray(value)) {
                // 根據修飾符決定檢查方式
                if (modifiers.some) {
                    return hasAnyPermission(value)
                }
                if (modifiers.every) {
                    return hasAllPermissions(value)
                }
                // 預設檢查任一權限
                return hasAnyPermission(value)
            }

            // 處理單一權限
            return hasPermission(value)
        }

        // 如果沒有權限，移除元素
        if (!checkPermission()) {
            el.parentNode && el.parentNode.removeChild(el)
        }
    }
}

// 註冊指令
export default {
    install(app) {
        app.directive('permission', permission)
    }
}

// 使用範例：
/*
// 在 main.js 中註冊
import permissionDirective from '@/directives/permission'
app.use(permissionDirective)

// 在組件中使用
<template>
  // 單一權限
  <button v-permission="'user:create'">新增用戶</button>

  // 多個權限（任一個）
  <button v-permission.some="['user:edit', 'user:delete']">編輯/刪除</button>

  // 多個權限（全部）
  <button v-permission.every="['user:edit', 'user:publish']">編輯並發布</button>
</template>
*/