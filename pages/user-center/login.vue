<template>
	<view class="login-container">
		<view class="login-box">
			<view class="login-header">
				<text class="login-title">GO GO GO</text>
				<text class="login-title">开始记账咯</text>
			</view>

			<view class="login-form">
				<view class="input-item">
					<uni-icons type="person" size="20" color="#999"></uni-icons>
					<input class="login-input" type="text" v-model="username" placeholder="请输入用户名" />
				</view>

				<view class="input-item">
					<uni-icons type="locked" size="20" color="#999"></uni-icons>
					<input class="login-input" type="password" v-model="password" placeholder="请输入密码" />
				</view>

				<button class="login-btn" @click="login">登录</button>
				<view class="register-link" @click="goRegister">还没有账号？去注册</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onMounted,
		ref
	} from 'vue'
	import DBService from '@/common/dbService.js'
	import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import {
		authUtils
	} from '@/common/utils.js'

	const dbService = new DBService()
	const username = ref('')
	const password = ref('')

	onMounted(() => {
		if (authUtils.isLoggedIn()) {
			uni.reLaunch({
				url: '/pages/settle-account/account'
			})
		}
	})

	function login() {
		if (!username.value || !password.value) {
			return uni.showToast({
				title: '请输入用户名和密码',
				icon: 'none'
			})
		}

		dbService.login(username.value, password.value).then(result => {
			if (result[0]) {
				uni.setStorageSync('user_id', result[0].id)

				uni.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 600
				})

				setTimeout(() => {
					uni.switchTab({
						url: '/pages/settle-account/account'
					})
				}, 600)


			} else {
				uni.showToast({
					title: '用户名或密码错误',
					icon: 'none',
					duration: 2000
				})
			}
		}).catch(err => {
			console.error(err)
			uni.showToast({
				title: '登录失败，请稍后重试',
				icon: 'none',
				duration: 2000
			})
		})
	}

	function goRegister() {
		uni.navigateTo({
			url: '/pages/user-center/registry'
		})
	}
</script>

<style scoped>
	.login-container {
		/* background: #9bb9ff; */
		background: linear-gradient(135deg, #86b7ff 0%, #b3caff 50%, #dce9ff 100%);
		min-height: 100vh;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		overflow: hidden;
	}

	.login-box {
		width: 100%;
		max-width: 750rpx;
		padding: 40rpx 40rpx;
		animation: fadeIn 0.8s ease;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow-y: auto;
	}

	.login-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
	}

	.login-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.login-form {
		width: 100%;
	}

	.input-item {
		display: flex;
		align-items: center;
		background-color: rgba(248, 248, 248, 0.9);
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 40rpx;
		backdrop-filter: blur(5rpx);
	}

	.login-input {
		flex: 1;
		height: 60rpx;
		padding-left: 20rpx;
		font-size: 28rpx;
		background-color: transparent;
	}

	.login-btn {
		height: 90rpx;
		line-height: 90rpx;
		background-color: #007AFF;
		color: white;
		border-radius: 45rpx;
		font-size: 32rpx;
		margin-top: 60rpx;
		box-shadow: 0 8rpx 16rpx rgba(0, 122, 255, 0.3);
		transition: all 0.3s;
	}

	.login-btn:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 8rpx rgba(118, 75, 162, 0.3);
	}

	.register-link {
		text-align: center;
		color: #007AFF;
		font-size: 28rpx;
		margin-top: 40rpx;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>