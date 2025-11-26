/**
 * 认证相关的组合函数
 * 提供统一的登录检测和用户信息管理
 */

import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { authUtils } from './utils.js'
import { checkCurrentPageAuth } from './authGuard.js'

/**
 * 使用认证功能的组合函数
 * @param {string} pagePath - 当前页面路径
 * @param {Object} options - 配置选项
 * @returns {Object} 认证相关的响应式数据和方法
 */
export function useAuth(pagePath, options = {}) {
	const {
		requireAuth = true,        // 是否需要登录
		checkOnLoad = true,        // 是否在 onLoad 时检查
		checkOnShow = true,        // 是否在 onShow 时检查
		showToast = true           // 未登录时是否显示提示
	} = options

	const isLoggedIn = ref(false)
	const currentUserId = ref(null)
	const userInfo = ref(null)

	// 更新登录状态
	function updateAuthStatus() {
		isLoggedIn.value = authUtils.isLoggedIn()
		currentUserId.value = authUtils.getCurrentUserId()
		
		if (!isLoggedIn.value) {
			userInfo.value = null
		}
	}

	// 检查页面访问权限
	function checkPageAccess() {
		if (!requireAuth) return true
		
		if (checkOnLoad && !checkCurrentPageAuth(pagePath)) {
			return false
		}
		
		if (!authUtils.isLoggedIn()) {
			if (showToast) {
				authUtils.requireLogin(showToast)
			}
			return false
		}
		
		updateAuthStatus()
		return true
	}

	// 页面加载时检查
	if (checkOnLoad && requireAuth) {
		onLoad(() => {
			checkPageAccess()
		})
	}

	// 页面显示时检查
	if (checkOnShow && requireAuth) {
		onShow(() => {
			if (!checkPageAccess()) {
				return
			}
		})
	}

	// 初始化时检查状态
	onMounted(() => {
		updateAuthStatus()
	})

	// 登出方法
	function logout() {
		authUtils.logout()
		updateAuthStatus()
	}

	// 强制刷新登录状态
	function refreshAuthStatus() {
		updateAuthStatus()
	}

	return {
		// 响应式状态
		isLoggedIn,
		currentUserId,
		userInfo,
		
		// 方法
		logout,
		refreshAuthStatus,
		checkPageAccess,
		updateAuthStatus
	}
}

/**
 * 简化版本的认证检查
 * 只检查登录状态，不提供响应式数据
 */
export function useSimpleAuth(pagePath) {
	onLoad(() => {
		checkCurrentPageAuth(pagePath)
	})
	
	onShow(() => {
		if (!authUtils.isLoggedIn()) {
			authUtils.requireLogin()
		}
	})
}

/**
 * 获取当前用户信息的组合函数
 */
export function useCurrentUser() {
	const userInfo = ref(null)
	const loading = ref(false)
	const error = ref(null)

	async function fetchUserInfo(dbService) {
		if (!authUtils.isLoggedIn()) {
			userInfo.value = null
			return
		}

		loading.value = true
		error.value = null

		try {
			const userId = authUtils.getCurrentUserId()
			const result = await dbService.getUserById(userId)
			
			if (result && result[0]) {
				userInfo.value = result[0]
			} else {
				error.value = '用户信息不存在'
			}
		} catch (err) {
			console.error('获取用户信息失败:', err)
			error.value = '获取用户信息失败'
		} finally {
			loading.value = false
		}
	}

	return {
		userInfo,
		loading,
		error,
		fetchUserInfo
	}
}
