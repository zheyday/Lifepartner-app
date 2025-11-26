# 登录检测系统使用说明

## 概述

本系统提供了完整的登录状态检测和路由拦截功能，确保所有需要登录的操作都会先检查用户登录状态。

## 功能特性

✅ **全局路由拦截** - 自动拦截所有页面跳转  
✅ **页面级检测** - 在页面加载和显示时检查登录状态  
✅ **统一的用户体验** - 一致的登录提示和跳转逻辑  
✅ **灵活配置** - 可自定义需要登录的页面列表  
✅ **Vue 3 组合式API** - 提供现代化的使用方式  

## 使用方式

### 1. 自动拦截（推荐）

系统已自动拦截以下页面跳转方法：
- `uni.navigateTo()`
- `uni.redirectTo()`
- `uni.switchTab()`
- `uni.reLaunch()`

**需要登录的页面列表**（在 `authGuard.js` 中配置）：
```javascript
const authRequiredPages = [
    '/pages/user-center/user-center',
    '/pages/settle-account/settle-account',
    '/pages/settle-account/create-account',
    '/pages/settle-account/create-flow',
    '/pages/settle-account/settle-account-flow',
    '/pages/reports/reports',
    '/pages/reports/income-outcome'
]
```

### 2. 页面内使用组合函数

#### 方式一：完整的认证功能
```javascript
<script setup>
import { useAuth } from '@/common/useAuth.js'

// 基本用法
const { isLoggedIn, currentUserId, logout } = useAuth('/pages/your-page/your-page')

// 高级配置
const { isLoggedIn, currentUserId } = useAuth('/pages/your-page/your-page', {
    requireAuth: true,      // 是否需要登录（默认true）
    checkOnLoad: true,      // 是否在onLoad时检查（默认true）
    checkOnShow: true,      // 是否在onShow时检查（默认true）
    showToast: true         // 未登录时是否显示提示（默认true）
})
</script>
```

#### 方式二：简化版本
```javascript
<script setup>
import { useSimpleAuth } from '@/common/useAuth.js'

// 只做登录检测，不提供响应式数据
useSimpleAuth('/pages/your-page/your-page')
</script>
```

#### 方式三：获取用户信息
```javascript
<script setup>
import { useCurrentUser } from '@/common/useAuth.js'
import DBService from '@/common/dbService.js'

const dbService = new DBService()
const { userInfo, loading, error, fetchUserInfo } = useCurrentUser()

onMounted(() => {
    fetchUserInfo(dbService)
})
</script>
```

### 3. 手动检测

```javascript
import { authUtils } from '@/common/utils.js'

// 检查是否登录
if (authUtils.isLoggedIn()) {
    // 已登录的逻辑
}

// 获取当前用户ID
const userId = authUtils.getCurrentUserId()

// 要求登录（如果未登录会跳转到登录页）
if (authUtils.requireLogin()) {
    // 已登录的逻辑
}

// 登出
authUtils.logout()
```

## 实际使用示例

### 用户中心页面
```javascript
<script setup>
import { useAuth, useCurrentUser } from '@/common/useAuth.js'
import DBService from '@/common/dbService.js'

const dbService = new DBService()

// 认证检测
const { logout } = useAuth('/pages/user-center/user-center')

// 获取用户信息
const { userInfo, fetchUserInfo } = useCurrentUser()

onMounted(() => {
    fetchUserInfo(dbService)
})

// 登出处理
function handleLogout() {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                logout()
            }
        }
    })
}
</script>
```

### 报表页面
```javascript
<script setup>
import { useSimpleAuth } from '@/common/useAuth.js'

// 简单的登录检测
useSimpleAuth('/pages/reports/reports')

// 页面逻辑
async function loadData() {
    // 数据加载逻辑
}
</script>
```

## 配置说明

### 添加新的需要登录的页面

在 `common/authGuard.js` 中修改 `authRequiredPages` 数组：

```javascript
const authRequiredPages = [
    '/pages/user-center/user-center',
    '/pages/settle-account/settle-account',
    // 添加新页面
    '/pages/new-page/new-page'
]
```

### 添加公开页面（不需要登录）

在 `common/authGuard.js` 中修改 `publicPages` 数组：

```javascript
const publicPages = [
    '/pages/login/registry',
    // 添加新的公开页面
    '/pages/public-page/public-page'
]
```

## 注意事项

1. **自动引入**：系统已在 `main.js` 中自动引入，无需手动导入拦截器
2. **页面路径**：确保页面路径与 `pages.json` 中的配置一致
3. **登录状态**：系统使用 `uni.getStorageSync('user_id')` 检查登录状态
4. **错误处理**：所有网络请求都包含了错误处理和用户提示
5. **性能优化**：使用了响应式数据，避免不必要的重复检查

## 故障排除

### 常见问题

1. **页面没有被拦截**
   - 检查页面路径是否在 `authRequiredPages` 中
   - 确认 `main.js` 已正确引入拦截器

2. **登录后仍然跳转到登录页**
   - 检查 `user_id` 是否正确存储在本地存储中
   - 确认登录逻辑是否正确设置了用户ID

3. **页面加载时闪现未登录状态**
   - 使用 `useAuth` 组合函数的响应式状态
   - 在模板中使用 `v-if="isLoggedIn"` 条件渲染

### 调试方法

```javascript
// 在控制台查看当前登录状态
console.log('登录状态:', authUtils.isLoggedIn())
console.log('用户ID:', authUtils.getCurrentUserId())
console.log('存储的用户ID:', uni.getStorageSync('user_id'))
```
