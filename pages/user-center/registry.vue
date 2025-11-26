<template>
	<view class="register-container">
		<view class="register-box">
			<view class="register-header">
				<text class="register-title">创建账户</text>
				<text class="register-subtitle">开始记账吧</text>
			</view>

			<view class="register-form">
				<view class="input-item">
					<uni-icons type="person" size="20" color="#999"></uni-icons>
					<input class="register-input" type="text" v-model="username" placeholder="请输入用户名" />
				</view>

				<view class="input-item">
					<uni-icons type="locked" size="20" color="#999"></uni-icons>
					<input class="register-input" type="password" v-model="password" placeholder="请输入密码" />
				</view>

				<view class="input-item">
					<uni-icons type="locked" size="20" color="#999"></uni-icons>
					<input class="register-input" type="password" v-model="confirmPassword" placeholder="请再次输入密码" />
				</view>

				<button class="register-btn" @click="handleRegister">注册</button>
				<view class="login-link" @click="goLogin">已有账号？去登录</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import DBService from '@/common/dbService.js'
	import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'

	const dbService = new DBService()

	const username = ref('')
	const password = ref('')
	const confirmPassword = ref('')

	// 页面加载时检查登录状态
	onLoad(() => {
		const user_id = uni.getStorageSync('user_id')
		if (user_id) {
			// 已登录，跳转到用户中心
			uni.switchTab({
				url: '/pages/user-center/user-center'
			})
		}
	})

	const handleRegister = async () => {
		// 表单验证
		if (!username.value.trim()) {
			return uni.showToast({
				title: '请输入用户名',
				icon: 'none'
			})
		}

		if (username.value.length < 3) {
			return uni.showToast({
				title: '用户名至少3个字符',
				icon: 'none'
			})
		}

		if (!password.value) {
			return uni.showToast({
				title: '请输入密码',
				icon: 'none'
			})
		}

		if (password.value.length < 3) {
			return uni.showToast({
				title: '密码至少3个字符',
				icon: 'none'
			})
		}

		if (password.value !== confirmPassword.value) {
			return uni.showToast({
				title: '两次密码输入不一致',
				icon: 'none'
			})
		}

		try {
			// 检查用户名是否已存在
			const exists = await dbService.getUser(username.value)
			if (exists[0]) {
				return uni.showToast({
					title: '用户名已存在',
					icon: 'none'
				})
			}

			// 注册用户，获取生成的雪花算法唯一ID
			await dbService.insertUser(username.value, password.value)

			uni.showToast({
				title: '注册成功',
				icon: 'success',
				duration: 700
			})

			// 延迟跳转到登录页
			setTimeout(() => {
				uni.navigateBack()
			}, 700)

		} catch (err) {
			console.error('注册失败:', err)
			uni.showToast({
				title: '注册失败，请稍后重试',
				icon: 'none',
				duration: 2000
			})
		}
	}

	function goLogin() {
		uni.navigateBack()
	}
</script>

<style>
	.register-container {
		background-color: #ffffff;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.register-box {
		width: 100%;
		height: 100%;
		/* background: linear-gradient(180deg, #aad8f8 0%, #d7e7f8 50%, #ffffff 100%); */
		background: #9bb9ff;
		border-radius: 20rpx;
		box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.1);
		padding: 60rpx 40rpx;
		animation: fadeIn 0.8s ease;
		display: flex;
		flex-direction: column;
		justify-content: center;
		backdrop-filter: blur(10rpx);
	}

	.register-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
	}

	.register-title {
		font-size: 42rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.register-subtitle {
		font-size: 28rpx;
		color: #666;
		opacity: 0.8;
	}

	.register-form {
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

	.register-input {
		flex: 1;
		height: 60rpx;
		padding-left: 20rpx;
		font-size: 28rpx;
		background-color: transparent;
	}

	.register-btn {
		height: 90rpx;
		line-height: 90rpx;
		background-color: #28a745;
		color: white;
		border-radius: 45rpx;
		font-size: 32rpx;
		margin-top: 60rpx;
		box-shadow: 0 8rpx 16rpx rgba(40, 167, 69, 0.3);
		transition: all 0.3s;
	}

	.register-btn:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 8rpx rgba(40, 167, 69, 0.3);
	}

	.login-link {
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