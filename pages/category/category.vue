<template>
	<view class="container">
		<!-- 分类列表 -->
		<view class="category-content">
			<uni-collapse v-for="firstLevel in displayList" :key="firstLevel.id">
				<uni-collapse-item :title="firstLevel.name" :open="true">
					<template #title>
						<view class="first-category-header">
							<view class="category-info">
								<wd-icon :name="firstLevel.icon" size="20px" />
								<text class="first-category-name">{{ firstLevel.name }}</text>
							</view>
							<view class="category-actions">
								<view class="action-btn" @click.stop="editCategory(firstLevel)">
									<uni-icons type="compose" size="20" color="#999"></uni-icons>
								</view>
								<view class="action-btn" @click.stop="deleteCategory(firstLevel)">
									<uni-icons type="trash" size="20" color="#999"></uni-icons>
								</view>
							</view>
						</view>
					</template>
					<view class="second-category-list">
						<view v-for="secondLevel in firstLevel.iconGroup" :key="secondLevel.id"
							class="second-category-item">
							<view class="category-info">
								<wd-icon :name="secondLevel.icon" size="20px" />
								<text class="category-name">{{ secondLevel.name }}</text>
							</view>
							<view class="category-actions">
								<view class="action-btn" @click="editCategory(secondLevel)">
									<uni-icons type="compose" size="20" color="#999"></uni-icons>
								</view>
								<view class="action-btn" @click="deleteCategory(secondLevel)">
									<uni-icons type="trash" size="20" color="#999"></uni-icons>
								</view>
							</view>
						</view>
						<!-- 新建二级分类按钮 -->
						<view class="add-second-btn" @click="addSecondCategory(firstLevel)">
							<text class="add-icon">+</text>
							<text class="add-text">新建二级分类</text>
						</view>
					</view>
				</uni-collapse-item>
			</uni-collapse>
		</view>

		<!-- 底部新建一级分类按钮 -->
		<view class="footer-btn" @click="addFirstCategory">
			<text class="btn-icon">+</text>
			<text class="btn-text">新建一级分类</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'
	import DBService from '@/common/dbService.js'
	const dbService = new DBService()

	const categoryType = ref('expense')
	const displayList = ref([])

	onLoad((options) => {
		categoryType.value = options.type
		uni.setNavigationBarTitle({
			title: categoryType.value === 'income' ? '收入分类管理' : '支出分类管理'
		})
	})

	async function getCategoryTree() {
		const data = await dbService.queryTableName('tally_category')
		const map = {}
		const result = []
		data.forEach(item => map[item.id] = {
			...item,
			children: []
		})
		data.forEach(item => {
			if (item.parent_id === 0) {
				result.push(map[item.id])
			} else {
				if (map[item.parent_id]) {
					map[item.parent_id].children.push(map[item.id])
				}
			}
		})
		return result
	}

	async function loadCategoryData() {
		const tree = await getCategoryTree()
		const rootName = categoryType.value === 'income' ? '收入' : '支出'
		const root = tree.find(item => item.name === rootName)
		displayList.value = root.children.map(sub => ({
			id: sub.id,
			name: sub.name,
			parentId: sub.parent_id,
			icon: sub.icon,
			iconGroup: sub.children.map(child => ({
				id: child.id,
				name: child.name,
				icon: child.icon,
				parentId: child.parent_id
			}))
		}))
	}

	onMounted(() => {
		loadCategoryData()
	})

	onShow(() => {
		loadCategoryData()
	})

	function editCategory(category) {
		// 判断是一级还是二级分类
		const isFirstLevel = category.parent_id === 1 || category.parent_id === 2
		const params = {
			id: category.id,
			name: encodeURIComponent(category.name),
			type: categoryType.value
		}

		if (isFirstLevel) {
			// 一级分类，设置 isFirstLevel 标志
			params.isFirstLevel = 'true'
		}
		params.icon = encodeURIComponent(category.icon)
		params.parentId = category.parentId
		uni.navigateTo({
			url: `/pages/category/category-create?${Object.keys(params).map(k => `${k}=${params[k]}`).join('&')}`
		})
	}

	async function deleteCategory(category) {
		// 判断是否是一级分类
		const hasChildren = category.parent_id === 1 || category.parent_id === 2

		let content = '确定要删除 "' + category.name + '" 吗？'
		if (hasChildren) {
			content = `删除 "${category.name}" 将同时删除其下的 ${category.iconGroup.length} 个子分类，确定要删除吗？`
		}

		uni.showModal({
			title: '确认删除',
			content: content,
			success: async (res) => {
				if (res.confirm) {
					try {
						if (hasChildren) {
							// 一级分类：级联删除所有子分类
							await dbService.deleteTallyCategoryWithChildren(category.id)
						} else {
							// 二级分类：直接删除
							await dbService.deleteTallyCategory(category.id)
						}
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 重新加载数据
						await loadCategoryData()
					} catch (error) {
						uni.showToast({
							title: '删除失败：' + error.message,
							icon: 'none'
						})
					}
				}
			}
		})
	}

	function addSecondCategory(firstLevel) {
		uni.navigateTo({
			url: `/pages/category/category-create?type=${categoryType.value}&firstLevelId=${firstLevel.id}&firstLevelName=${firstLevel.name}`
		})
	}

	function addFirstCategory() {
		uni.navigateTo({
			url: `/pages/category/category-create?type=${categoryType.value}&isFirstLevel=true`
		})
	}
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f5f5f5;
	}

	.category-content {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 120rpx;
	}

	.second-category-list {
		background: #fff;
		padding: 0 30rpx;
	}

	.second-category-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0 20rpx 40rpx;
		border-bottom: 1px solid #f5f5f5;
	}

	.category-info {
		display: flex;
		align-items: center;
	}

	.category-info .wd-icon {
		margin-right: 20rpx;
	}

	.first-category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		width: 100%;
		padding-left: 30rpx;
	}

	.first-category-name {
		font-size: 26rpx;
		color: #6f6f6f;
	}

	.category-name {
		font-size: 28rpx;
		color: #333;
	}

	.category-actions {
		display: flex;
		gap: 30rpx;
		padding-right: 30rpx;
	}

	.action-btn {
		padding: 10rpx;
	}

	.add-second-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 30rpx 0;
		gap: 10rpx;
		color: #999;
	}

	.add-icon {
		font-size: 36rpx;
	}

	.add-text {
		font-size: 26rpx;
	}

	.footer-btn {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background: #fff;
		border-top: 1px solid #eee;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
	}

	.btn-icon {
		font-size: 40rpx;
		color: #333;
		font-weight: normal;
	}

	.btn-text {
		font-size: 28rpx;
		color: #333;
	}
</style>