*** End Patch
<template>
	<view class="account-settings-container">
		<view class="avatar-section">
			<image :src="avatarUrl" class="avatar-img" @click="chooseAvatar" mode="aspectFill" />
			<view class="avatar-tip">点击更换头像</view>
		</view>

		<!-- 基本信息 -->
		<view class="section-title">基本信息</view>
		<view class="form-section">
			<wd-cell-group>
				<wd-cell title="用户名" title-width="120rpx">
					<view class="readonly-text">{{ username }}</view>
				</wd-cell>
				<wd-cell title="昵称" title-width="120rpx" center>
					<wd-input v-model="nickname" placeholder="请输入昵称" clearable show-word-limit :maxlength="20" />
				</wd-cell>
				<wd-cell title="邮箱" title-width="120rpx" center>
					<wd-input v-model="email" placeholder="请输入邮箱" clearable type="email" />
				</wd-cell>
			</wd-cell-group>
		</view>

		<!-- 修改密码 -->
		<view class="section-title">安全设置</view>
		<view class="form-section">
			<wd-cell-group>
				<wd-cell title="原密码" title-width="120rpx" center>
					<wd-input v-model="oldPassword" placeholder="请输入原密码" type="password" clearable />
				</wd-cell>
				<wd-cell title="新密码" title-width="120rpx" center>
					<wd-input v-model="newPassword" placeholder="请输入新密码" type="password" clearable />
				</wd-cell>
				<wd-cell title="确认密码" title-width="120rpx" center>
					<wd-input v-model="confirmPassword" placeholder="请再次输入新密码" type="password" clearable />
				</wd-cell>
			</wd-cell-group>
		</view>

		<view class="save-btn">
			<wd-button type="primary" @click="saveSettings" block>保存设置</wd-button>
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
	import bcrypt from 'bcryptjs'
	import {
		authUtils
	} from '@/common/utils.js'

	const dbService = new DBService()
	const userId = ref('')
	const username = ref('')
	const avatarUrl = ref('/static/image/default-avatar.png')
	const nickname = ref('')
	const email = ref('')
	const oldPassword = ref('')
	const newPassword = ref('')
	const confirmPassword = ref('')
	const avatarChanged = ref(false)

	// 加载用户信息
	async function loadUserInfo() {
		const currentUserId = authUtils.getCurrentUserId()
		if (!currentUserId) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			setTimeout(() => {
				uni.switchTab({
					url: '/pages/user-center/user-center'
				})
			}, 1000)
			return
		}

		userId.value = currentUserId

		try {
			const result = await dbService.getUserById(currentUserId)
			if (result && result.length > 0) {
				const user = result[0]
				username.value = user.username
				nickname.value = user.nickname
				email.value = user.email
				if (user.avatar) {
					avatarUrl.value = user.avatar
				}
			}
		} catch (error) {
			console.error('加载用户信息失败:', error)
			uni.showToast({
				title: '加载失败',
				icon: 'none'
			})
		}
	}

	// 选择头像
	function chooseAvatar() {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				if (res.tempFilePaths && res.tempFilePaths.length > 0) {
					avatarUrl.value = res.tempFilePaths[0]
					avatarChanged.value = true
				}
			}
		})
	}

	// 验证邮箱格式
	function validateEmail(email) {
		if (!email) return true // 邮箱可选
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	// 保存头像到本地
	function saveAvatar() {
		return new Promise((resolve, reject) => {
			if (!avatarChanged.value) {
				resolve(avatarUrl.value)
				return
			}

			const timestamp = Date.now()
			const savedPath = `_doc/avatar_${userId.value}_${timestamp}.jpg`

			plus.io.resolveLocalFileSystemURL(avatarUrl.value, (entry) => {
				plus.io.resolveLocalFileSystemURL('_doc', (dirEntry) => {
					entry.copyTo(dirEntry, `avatar_${userId.value}_${timestamp}.jpg`,
						(newEntry) => {
							resolve(newEntry.toLocalURL())
						},
						(error) => {
							console.error('保存头像失败:', error)
							reject(error)
						}
					)
				})
			}, (error) => {
				console.error('读取头像失败:', error)
				reject(error)
			})
		})
	}

	// 保存设置
	async function saveSettings() {
		// 验证邮箱格式
		if (email.value && !validateEmail(email.value)) {
			uni.showToast({
				title: '邮箱格式不正确',
				icon: 'none'
			})
			return
		}

		// 验证密码修改
		if (oldPassword.value || newPassword.value || confirmPassword.value) {
			if (!oldPassword.value) {
				uni.showToast({
					title: '请输入原密码',
					icon: 'none'
				})
				return
			}

			if (!newPassword.value) {
				uni.showToast({
					title: '请输入新密码',
					icon: 'none'
				})
				return
			}

			if (newPassword.value.length < 6) {
				uni.showToast({
					title: '新密码至少6位',
					icon: 'none'
				})
				return
			}

			if (newPassword.value !== confirmPassword.value) {
				uni.showToast({
					title: '两次密码不一致',
					icon: 'none'
				})
				return
			}

			// 验证原密码
			try {
				const result = await dbService.login(username.value, oldPassword.value)
				if (!result || result.length === 0) {
					uni.showToast({
						title: '原密码错误',
						icon: 'none'
					})
					return
				}
			} catch (error) {
				console.error('验证密码失败:', error)
				uni.showToast({
					title: '验证失败',
					icon: 'none'
				})
				return
			}
		}
		try {
			// 保存头像
			let savedAvatarPath = avatarUrl.value
			if (avatarChanged.value) {
				savedAvatarPath = await saveAvatar()
			}

			// 构建更新数据
			const updates = {
				nickname: nickname.value || '',
				email: email.value || '',
				avatar: savedAvatarPath
			}

			// 如果修改了密码
			if (newPassword.value) {
				// 密码加密
				const salt = bcrypt.genSaltSync(10)
				const hash = bcrypt.hashSync(newPassword.value, salt)
				updates.password = hash
			}

			// 保存到数据库
			await dbService.updateUser(userId.value, updates)

			uni.hideLoading()
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})

			// 清空密码输入框
			oldPassword.value = ''
			newPassword.value = ''
			confirmPassword.value = ''
			avatarChanged.value = false

			// 延迟返回
			setTimeout(() => {
				uni.navigateBack()
			}, 1000)

		} catch (error) {
			console.error('保存失败:', error)
			uni.hideLoading()
			uni.showToast({
				title: '保存失败',
				icon: 'none'
			})
		}
	}

	onLoad(() => {
		loadUserInfo()
	})
</script>

<style scoped>
	.account-settings-container {
		padding: 40rpx 20rpx;
		background: #f5f5f5;
		min-height: 100vh;
	}

	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.avatar-img {
		width: 160rpx;
		height: 160rpx;
		border-radius: 80rpx;
		background: #eee;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.avatar-tip {
		font-size: 24rpx;
		color: #888;
		margin-top: 16rpx;
	}

	.section-title {
		font-size: 28rpx;
		color: #666;
		margin: 30rpx 20rpx 20rpx;
		font-weight: 500;
	}

	.form-section {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
	}

	.readonly-text {
		font-size: 28rpx;
		color: #767676;
		text-align: left;
		flex: 1;
	}

	.save-btn {
		padding: 40rpx 20rpx;
	}
</style>