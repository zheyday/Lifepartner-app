<template>
	<wd-form ref="form" :model="model" :rules="rules">
		<wd-cell-group>
			<wd-input label="账户名" prop="accountName" v-model="model.accountName" clearable placeholder="请输入账户名称"
				:maxlength="20" show-word-limit></wd-input>
			<wd-input label="余额" prop="balance" v-model="model.balance" @blur="onAmountBlur"
				placeholder="请输入金额"></wd-input>
			<wd-picker label="账户类型" prop="accountType" v-model="model.accountType" placeholder="请选择账户类型"
				:columns="columns" />
			<IconSelector v-model="model.icon" />
		</wd-cell-group>
		<view class="footer">
			<wd-button type="primary" size="large" @click="handleSubmit" block>保存</wd-button>
		</view>
	</wd-form>
</template>

<script setup>
	import DBService from '@/common/dbService.js'
	import IconSelector from '@/components/IconSelector.vue'
	import {
		ref,
		reactive,
		nextTick
	} from 'vue'
	import * as utils from '@/common/utils.js'

	const dbService = new DBService()

	const columns = ref(['储蓄卡', '信用卡', '股票账户', '基金账户', '虚拟账户', '现金', '负债账户'])
	const accountId = ref('')
	const oldBalance = ref(0)
	const model = reactive({
		accountName: '',
		balance: '',
		accountType: columns.value[0],
		icon: ''
	})

	// 接收页面参数
	onLoad((options) => {
		if (options.id) {
			accountId.value = options.id
			model.accountName = decodeURIComponent(options.accountName || '')
			oldBalance.value = options.balance
			model.balance = oldBalance.value
			model.accountType = decodeURIComponent(options.accountType || columns.value[0])
			model.icon = decodeURIComponent(options.icon || '')
		}
	})

	const rules = {
		accountName: [{
			required: true,
			pattern: /^.{1,20}$/,
			message: '请输入1-20位字符'
		}],
		balance: [{
			required: true,
			message: '请输入金额'
		}]
	}

	const onAmountBlur = (event) => {
		// 只允许数字、负号和最多一个小数点
		let cleanVal = event.value.replace(/[^\d.-]/g, '');

		// 确保负号只能在开头
		const hasNegative = cleanVal.startsWith('-');
		cleanVal = cleanVal.replace(/-/g, '');
		if (hasNegative) {
			cleanVal = '-' + cleanVal;
		}

		// 只保留第一个小数点
		const parts = cleanVal.replace('-', '').split('.');
		if (parts.length > 2) {
			cleanVal = (hasNegative ? '-' : '') + parts[0] + '.' + parts[1];
		}

		// 限制小数点后最多两位
		if (cleanVal.includes('.')) {
			const negative = cleanVal.startsWith('-') ? '-' : '';
			const absolute = cleanVal.replace('-', '');
			const [intPart, decimalPart] = absolute.split('.');
			cleanVal = negative + intPart + '.' + decimalPart.slice(0, 2);
		}

		model.balance = cleanVal
	};

	const form = ref()

	function handleSubmit() {
		// 手动检查图标是否选择
		if (!model.icon || model.icon.trim() === '') {
			uni.showToast({
				title: '请选择图标',
				icon: 'none'
			})
			return
		}

		form.value.validate()
			.then(async ({
				valid,
			}) => {
				if (valid) {
					const user_id = uni.getStorageSync('user_id')

					if (accountId.value) {
						// 编辑模式：更新账户
						await dbService.updateTallyAccount(accountId.value, model.accountName, model.accountType,
							model.icon)
					} else {
						// 新建模式：插入账户
						await dbService.insertTallyAccount(model.accountName, 0, 1, user_id, model.accountType,
							model.icon)
						await dbService.getLastInsertRowid().then(result => {
							accountId.value = result[0].id
						})
					}

					const offset = utils.yuanToFenNumber(model.balance) - utils.yuanToFenNumber(oldBalance.value)
					if (offset > 0) {
						dbService.insertTallyBill(accountId.value, offset,
							new Date().getTime(), 1998, '', user_id)
					} else if (offset < 0) {
						dbService.insertTallyBill(accountId.value, offset,
							new Date().getTime(), 1999, '', user_id)
					}
					uni.switchTab({
						url: `/pages/settle-account/account`
					})
				}
			})
			.catch((error) => {
				console.log(error, 'error')
			})
	}
</script>

<style scoped>
	.footer {
		padding: 20rpx 150rpx;
	}
</style>