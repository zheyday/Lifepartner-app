<template>
	<view class="container">
		<view class="form-content">
			<!-- 分类名称 -->
			<view class="form-item">
				<view class="label">分类名称</view>
				<input class="input" v-model="categoryName" placeholder="请输入分类名称" maxlength="20" />
				<text class="char-count">{{ categoryName.length }}</text>
			</view>

			<!-- 分类图标 -->
			<IconSelector v-model="selectedIcon" label="分类图标" placeholder="请选择图标" />
		</view>

		<!-- 底部保存按钮 -->
		<view class="footer-btn" @click="handleSave">
			<text class="btn-text">保存</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import DBService from '@/common/dbService.js'
	import IconSelector from '@/components/IconSelector.vue'
	import {
		authUtils
	} from '@/common/utils.js'
	const dbService = new DBService()

	const categoryType = ref('expense')
	const firstLevelId = ref(0)
	const isFirstLevel = ref(false)
	const categoryName = ref('')
	const selectedIcon = ref('')
	const isEdit = ref(false)
	const categoryId = ref(0)

	onLoad((options) => {
		categoryType.value = options.type || 'expense'
		isFirstLevel.value = options.isFirstLevel === 'true'
		isEdit.value = !!options.id
		if (isEdit.value) {
			// 编辑模式
			categoryId.value = parseInt(options.id)
			categoryName.value = decodeURIComponent(options.name || '')
			selectedIcon.value = decodeURIComponent(options.icon || '')
			firstLevelId.value = parseInt(options.parentId)

			uni.setNavigationBarTitle({
				title: '编辑分类'
			})
		} else if (isFirstLevel.value) {
			// 一级分类的 parent_id 是对应的根分类 ID (1=收入, 2=支出)
			firstLevelId.value = categoryType.value === 'income' ? 1 : 2
			uni.setNavigationBarTitle({
				title: `新建一级分类`
			})
		} else {
			firstLevelId.value = parseInt(options.firstLevelId)
			uni.setNavigationBarTitle({
				title: `新建二级分类`
			})
		}
	})

	async function handleSave() {
		if (!categoryName.value.trim()) {
			uni.showToast({
				title: '请输入分类名称',
				icon: 'none'
			})
			return
		}

		if (!selectedIcon.value) {
			uni.showToast({
				title: '请选择分类图标',
				icon: 'none'
			})
			return
		}

		try {
			const directory = categoryType.value === 'income' ? 1 : -1
			const icon = selectedIcon.value

			if (isEdit.value) {
				// 编辑模式：更新分类
				await dbService.updateTallyCategory(
					categoryId.value,
					categoryName.value,
					icon,
					firstLevelId.value,
					directory
				)
			} else {
				// 新建模式：插入分类
				const user_id = authUtils.getCurrentUserId()
				await dbService.insertTallyCategory(
					categoryName.value,
					icon,
					firstLevelId.value,
					directory,
					user_id
				)
			}

			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})

			setTimeout(() => {
				uni.navigateBack()
			}, 500)
		} catch (error) {
			uni.showToast({
				title: '保存失败：' + error.message,
				icon: 'none'
			})
		}
	}
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f5f5f5;
	}

	.form-content {
		flex: 1;
	}

	.form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #fff;
		padding: 30rpx;
		margin-bottom: 2rpx;
	}

	.form-item.clickable {
		cursor: pointer;
	}

	.label {
		font-size: 28rpx;
		color: #333;
	}

	.input {
		flex: 1;
		text-align: right;
		font-size: 28rpx;
		color: #333;
		margin: 0 20rpx;
	}

	.char-count {
		font-size: 24rpx;
		color: #999;
	}

	.icon-display {
		display: flex;
		align-items: center;
	}

	.footer-btn {
		margin: 40rpx;
		height: 88rpx;
		background: linear-gradient(to right, #ffa726, #ff9800);
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-text {
		font-size: 32rpx;
		color: #fff;
		font-weight: 500;
	}

	.icon-picker-header {
		text-align: center;
		font-size: 32rpx;
		padding: 30rpx 0;
		border-bottom: 1px solid #eee;
	}

	.icon-picker-content {
		height: 400rpx;
		padding: 20rpx;
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 20rpx;
	}

	.icon-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100rpx;
		border-radius: 10rpx;
		background: #f5f5f5;
	}

	.icon-item.active {
		background: #fff4e6;
		border: 2px solid #ffa726;
	}
</style>