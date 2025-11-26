<template>
	<view class="container">
		<!-- 已登录状态 -->
		<view v-if="isLoggedIn" class="logged-in-content">
			<view class="user-info">
				<image :src="avatarUrl" class="avatar-img" @click="chooseAvatar" mode="aspectFill" />
				<view class="nickname">{{ nickname }}</view>
			</view>


			<wd-cell-group>
				<wd-cell title="账户设置" is-link @click="goToAccountSettings">
					<template #icon>
						<wd-icon name="setting" style="margin-right: 10px;"></wd-icon>
					</template>
				</wd-cell>
				<wd-cell title="关于我们" is-link>
					<template #icon>
						<wd-icon name="info" style="margin-right: 10px;"></wd-icon>
					</template>
				</wd-cell>
			</wd-cell-group>

			<view class="logout-btn">
				<wd-button type="error" @click="logout">退出登录</wd-button>
			</view>
		</view>

		<!-- 未登录状态 - 引用登录组件 -->
		<LoginComponent v-else @loginSuccess="onLoginSuccess" />
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import DBService from '@/common/dbService.js'
	import {
		authUtils
	} from '@/common/utils.js'
	import LoginComponent from '@/components/LoginComponent.vue'

	const dbService = new DBService()
	const nickname = ref('')
	const avatarUrl = ref('/static/image/default-avatar.png')
	const isLoggedIn = ref(false)

	// 检查登录状态
	function checkLoginStatus() {
		isLoggedIn.value = authUtils.isLoggedIn()
		if (isLoggedIn.value) {
			loadUserInfo()
		}
	}

	// 加载用户信息
	async function loadUserInfo() {
		const user_id = authUtils.getCurrentUserId()
		if (user_id) {
			try {
				const userInfo = await dbService.getUserById(user_id)
				if (userInfo && userInfo[0]) {
					const user = userInfo[0]
					nickname.value = user.nickname
					if (user.avatar) {
						avatarUrl.value = user.avatar
					}
				}
			} catch (error) {
				console.error('获取用户信息失败:', error)
				uni.showToast({
					title: '获取用户信息失败',
					icon: 'none'
				})
			}
		}
	}

	// 页面加载时检查登录状态
	onLoad(() => {
		checkLoginStatus()
	})

	// 页面显示时检查登录状态
	onShow(() => {
		checkLoginStatus()
	})

	onMounted(() => {
		checkLoginStatus()
	})

	// 登录成功回调
	function onLoginSuccess(userInfo) {
		// 更新登录状态
		checkLoginStatus()
	}

	function goToAccountSettings() {
		uni.navigateTo({
			url: '/pages/user-center/account-settings'
		})
	}

	function logout() {
		uni.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			success: function(res) {
				if (res.confirm) {
					// 清除登录状态
					uni.removeStorageSync('user_id')
					// 更新登录状态（这会触发页面重新渲染为登录界面）
					checkLoginStatus()
				}
			}
		})
	}
</script>

<style>
	.container {
		background-color: #f5f5f5;
		height: 100vh;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
		padding: 40rpx 20rpx;
	}

	.avatar {
		width: 150rpx;
		height: 150rpx;
		border-radius: 75rpx;
		background-color: #f0f0f0;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.nickname {
		font-size: 36rpx;
		color: #000000;
		margin-top: 16rpx;
	}

	.logout-btn {
		margin-top: 60rpx;
		padding: 0 40rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.avatar-img {
		width: 160rpx;
		height: 160rpx;
		border-radius: 80rpx;
		background: #eee;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
</style>