<template>
	<wd-popup v-model="showPopup" custom-style="height: 700rpx;" position="bottom">
		<view class="popup-content">
			<view class="categoryList" v-for="firstLevel in displayList" :key="firstLevel.id">
				<text class="firstCategory">{{firstLevel.name}}</text>
				<wd-grid :column="5">
					<wd-grid-item v-for="secondLevel in firstLevel.iconGroup" :key="secondLevel.id"
						:icon="secondLevel.icon" :text="secondLevel.name"
						@click="selectCategory(firstLevel,secondLevel)">
					</wd-grid-item>
				</wd-grid>
			</view>
		</view>
		<view class="footer-btn" @click="goToCategory">
			<text class="btn-icon">+</text>
			<text class="btn-text">新建一级分类</text>
		</view>
	</wd-popup>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
		watch
	} from 'vue'
	import DBService from '@/common/dbService.js'
	const dbService = new DBService()

	const props = defineProps({
		type: {
			type: String,
			default: 'income' // 'income' 或 'expense'
		}
	})
	const showPopup = defineModel('showPopup')
	const expenseDisplayList = ref([])
	const incomeDisplayList = ref([])

	const displayList = computed(() => {
		return props.type === 'income' ? incomeDisplayList.value : expenseDisplayList.value
	})

	function selectCategory(firstLevel, secondLevel) {
		showPopup.value = false
		emit('select', {
			id: secondLevel.id,
			name: firstLevel.name + ' > ' + secondLevel.name,
			icon: secondLevel.icon
		})
	}

	function goToCategory() {
		showPopup.value = false
		uni.navigateTo({
			url: '/pages/category/category?type=' + props.type
		})
	}

	let categoryTreeCache = null
	async function getCategoryTree() {
		// 每次调用都清除缓存，确保获取最新数据
		categoryTreeCache = null
		
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
		categoryTreeCache = result
		return result
	}

	async function loadCategoryData() {
		const tree = await getCategoryTree()
		const expenseRoot = tree.find(item => item.name === '支出')
		expenseDisplayList.value = expenseRoot.children.map(sub => ({
			id: sub.id,
			name: sub.name,
			iconGroup: sub.children.map(child => ({
				id: child.id,
				name: child.name,
				icon: child.icon
			}))
		}))
		const incomeRoot = tree.find(item => item.name === '收入')
		incomeDisplayList.value = incomeRoot.children.map(sub => ({
			id: sub.id,
			name: sub.name,
			iconGroup: sub.children.map(child => ({
				id: child.id,
				name: child.name,
				icon: child.icon
			}))
		}))
	}

	onMounted(() => {
		loadCategoryData()
	})

	// 监听弹窗显示，每次打开时刷新数据
	watch(showPopup, (newVal) => {
		if (newVal) {
			loadCategoryData()
		}
	})

	const emit = defineEmits(['select'])
</script>

<style scoped>
	.popup-content {
		max-height: 580rpx;
		overflow-y: auto;
	}

	.categoryList {
		margin: 30rpx 0rpx;
	}

	.firstCategory {
		font-size: 12px;
		color: #606268;
		padding: 35rpx;
	}

	.footer-btn {
		position: absolute;
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