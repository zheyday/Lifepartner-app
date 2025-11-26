<template>
	<view class="container">
		<!-- 顶部标签栏 -->
		<view class="tab-bar">
			<view v-for="(tab, index) in tabList" :key="index" class="tab-item"
				:class="{ active: currentTab === index }" @click="clickTab(index)">
				{{ tab }}
				<view class="tab-underline" v-if="currentTab === index"></view>
			</view>
		</view>

		<!-- 内容区域：用 v-if 切换展示 -->
		<view class="tab-content">
			<view v-if="currentTab === 0">
				<!-- 收入内容区域 -->
				<wd-form ref="form" :model="model" :rules="rules">
					<wd-input label="金额" prop="money" v-model="model.money" placeholder="0.00" type="number"></wd-input>
					<wd-input type="text" label="分类" v-model="categoryDisplay" prop="category" readonly
						@click="showPopup = true" />
					<wd-picker label="账户" :columns="accountPicker" v-model="model.account" prop="account"></wd-picker>
					<wd-datetime-picker v-model="model.billDate" label="时间" />
					<wd-input label="备注" v-model="model.comment" clearable />
					<view class="footer">
						<wd-button type="primary" size="large" @click="handleSubmit" block>保存</wd-button>
					</view>
				</wd-form>
			</view>
			<view v-else-if="currentTab === 1">
				<!-- 支出内容区域 -->
				<wd-form ref="form" :model="model" :rules="rules">
					<wd-input label="金额" prop="money" v-model="model.money" placeholder="0.00" type="number"></wd-input>
					<wd-input type="text" label="分类" v-model="categoryDisplay" prop="category" readonly
						@click="showPopup = true" />
					<wd-picker label="账户" :columns="accountPicker" v-model="model.account" prop="account"></wd-picker>
					<wd-datetime-picker v-model="model.billDate" label="时间" />
					<wd-input label="备注" v-model="model.comment" clearable />
					<view class="footer">
						<wd-button type="primary" size="large" @click="handleSubmit" block>保存</wd-button>
					</view>
				</wd-form>
			</view>
			<view v-else-if="currentTab === 2">
				<!-- 转账内容区域 -->
			</view>
			<view v-else-if="currentTab === 3">
				<!-- 余额内容区域 -->
				<wd-form ref="balanceForm" :model="balanceModel" :rules="balanceRules">
					<wd-input label="余额" prop="money" v-model="balanceModel.balance" clearable placeholder="0.00" type="number" />
					<wd-picker label="账户" :columns="accountPicker" v-model="balanceModel.account" prop="account" />
					<wd-datetime-picker v-model="balanceModel.billDate" label="时间" />
					<wd-input label="备注" v-model="balanceModel.comment" clearable />
					<view class="footer">
						<wd-button type="primary" size="large" @click="handleBalanceSubmit" block>保存</wd-button>
					</view>
				</wd-form>
			</view>
		</view>

		<!-- 分类选择弹窗 -->
		<CategorySelector v-model:showPopup="showPopup" :type="categoryType" @select="onCategorySelect" />
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted
	} from 'vue'
	import DBService from '@/common/dbService.js'
	import {
		authUtils
	} from '@/common/utils.js'
	import CategorySelector from '@/components/CategorySelector.vue'
	const dbService = new DBService()

	const tabList = ['收入', '支出', '转账', '余额']
	const currentTab = ref(0)

	const accountPicker = reactive([])
	const model = reactive({
		money: '',
		category: '',
		account: '',
		comment: '',
		billDate: new Date().getTime(),
	})

	const rules = {
		money: [{
			pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
			message: '请输入有效的金额'
		}],
		category: [{
			validator: (value) => value !== '',
			message: '请选择分类'
		}],
		account: [{
			validator: (value) => value !== '',
			message: '请选择账户'
		}],
	}

	const showPopup = ref(false)
	const categoryDisplay = ref('')
	const categoryType = computed(() => currentTab.value === 0 ? 'income' : 'expense')

	function clickTab(index) {
		currentTab.value = index
		// 切换tab时重置表单
		model.money = ''
		model.category = ''
		model.comment = ''
		categoryDisplay.value = ''
	}

	function onCategorySelect(category) {
		model.category = category.id
		categoryDisplay.value = category.name
		showPopup.value = false
	}

	onLoad(async (options) => {
		const user_id = authUtils.getCurrentUserId()
		const accountList = await dbService.getTallyAccount(user_id)
		accountList.forEach(item => {
			accountPicker.push({
				label: item.account_name,
				value: item.id
			})
		})

		model.account = options.account_id
		balanceModel.account = options.account_id
		balanceModel.oldBalance = options.balance
		balanceModel.balance = options.balance
	})

	const form = ref()

	function handleSubmit() {
		form.value.validate()
			.then(async ({
				valid,
				errors
			}) => {
				if (valid) {
					var categoryById = await dbService.getTallyCategoryById(model.category)
					const user_id = authUtils.getCurrentUserId()
					dbService.insertTallyBill(model.account, utils.yuanToFenNumber(model.money) * categoryById[0]
						.directory, model.billDate, model.category, model.comment, user_id)
					uni.navigateBack({
						delta: 1
					})
				}
			})
			.catch((error) => {
				console.log(error, 'error')
			})
	}

	// 余额调整表单
	const balanceModel = reactive({
		oldBalance: '', // 原余额
		balance: '',
		account: '',
		comment: '',
		billDate: new Date().getTime(),
	})
	const balanceRules = {
		balance: [{
			pattern: /^-?[0-9]+(\.[0-9]{1,2})?$/,
			message: '请输入有效的金额'
		}],
		account: [{
			validator: (value) => value !== '',
			message: '请选择账户'
		}],
	}
	const balanceForm = ref()

	function handleBalanceSubmit() {
		balanceForm.value.validate()
			.then(async ({
				valid
			}) => {
				if (valid) {
					const user_id = authUtils.getCurrentUserId()
					// 余额变更分类id：正数用1998，负数用1999
					const moneyFen = utils.yuanToFenNumber(balanceModel.balance) - utils.yuanToFenNumber(balanceModel.oldBalance)
					const isIncome = moneyFen >= 0
					const categoryId = isIncome ? 1998 : 1999
					dbService.insertTallyBill(
						balanceModel.account,
						moneyFen,
						balanceModel.billDate,
						categoryId,
						balanceModel.comment,
						user_id
					)
					uni.navigateBack({
						delta: 1
					})
				}
			})
			.catch((error) => {
				console.log(error, 'error')
			})
	}
</script>

<style scoped>
	.container {
		padding: 0px;
	}

	.tab-bar {
		display: flex;
		background: #fff;
		border-bottom: 1px solid #eee;
	}

	.tab-item {
		flex: 1;
		padding: 20rpx 30rpx;
		font-size: 28rpx;
		color: #666;
		position: relative;
		text-align: center;
	}

	.tab-item.active {
		color: #333;
		font-weight: bold;
	}

	.tab-underline {
		position: absolute;
		bottom: 10rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 32rpx;
		height: 6rpx;
		background-color: #f9ae3d;
		border-radius: 3rpx;
	}

	.tab-content {
		padding: 10rpx 0rpx;
	}

	.footer {
		padding: 20rpx 150rpx;
	}
</style>