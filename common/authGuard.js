/**
 * 全局登录拦截器
 * 用于在页面跳转前检查登录状态
 */

import {
	authUtils
} from './utils.js'

// 需要登录才能访问的页面列表
const authRequiredPages = [
	'/pages/settle-account/settle-account',
	'/pages/settle-account/account',
	'/pages/settle-account/flow',
	'/pages/settle-account/account-create',
	'/pages/settle-account/flow-create',
	'/pages/settle-account/flow-edit',
	'/pages/user-center/user-center',
	'/pages/user-center/account-setting',
	'/pages/reports/reports'
]

// 不需要登录的页面（白名单）
const publicPages = [
	'/pages/user-center/registry',
	'/pages/user-center/login'
]

/**
 * 页面跳转拦截器
 * @param {string} url - 要跳转的页面路径
 * @param {boolean} showToast - 是否显示登录提示
 * @returns {boolean} - 是否允许跳转
 */
function checkPageAuth(url, showToast = true) {
	// 提取页面路径（去掉参数）
	const pagePath = url.split('?')[0]

	// 如果是公开页面，直接允许访问
	if (publicPages.includes(pagePath)) {
		return true
	}

	// 如果是需要登录的页面，检查登录状态
	if (authRequiredPages.includes(pagePath)) {
		return authUtils.requireLogin(showToast)
	}

	// 默认不需要登录
	return true
}

/**
 * 拦截 uni.navigateTo
 */
const originalNavigateTo = uni.navigateTo
uni.navigateTo = function(options) {
	if (checkPageAuth(options.url)) {
		return originalNavigateTo.call(this, options)
	}
	// 如果检查失败，不执行跳转
	return Promise.reject(new Error('需要登录'))
}

/**
 * 拦截 uni.redirectTo
 */
const originalRedirectTo = uni.redirectTo
uni.redirectTo = function(options) {
	if (checkPageAuth(options.url)) {
		return originalRedirectTo.call(this, options)
	}
	return Promise.reject(new Error('需要登录'))
}

/**
 * 拦截 uni.switchTab (tabBar页面)
 */
const originalSwitchTab = uni.switchTab
uni.switchTab = function(options) {
	if (checkPageAuth(options.url)) {
		return originalSwitchTab.call(this, options)
	}
	return Promise.reject(new Error('需要登录'))
}

/**
 * 拦截 uni.reLaunch
 */
const originalReLaunch = uni.reLaunch
uni.reLaunch = function(options) {
	if (checkPageAuth(options.url)) {
		return originalReLaunch.call(this, options)
	}
	return Promise.reject(new Error('需要登录'))
}

/**
 * 页面 onLoad 时的登录检测
 * 在页面的 onLoad 生命周期中调用
 * @param {string} pagePath - 当前页面路径
 */
function checkCurrentPageAuth(pagePath) {
	// 如果当前页面需要登录，但用户未登录
	if (authRequiredPages.includes(pagePath) && !authUtils.isLoggedIn()) {
		authUtils.requireLogin(true)
		return false
	}
	return true
}

export {
	checkPageAuth,
	checkCurrentPageAuth,
	authRequiredPages,
	publicPages
}