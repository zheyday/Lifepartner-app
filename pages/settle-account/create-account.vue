<template>
	<wd-form ref="form" :model="model" :rules="rules">
		<wd-cell-group>
			<wd-input label="账户名" prop="accountName" v-model="model.accountName" clearable placeholder="请输入账户名称"
				:maxlength="20" show-word-limit></wd-input>
			<wd-input label="余额" prop="balance" v-model="model.balance" @blur="onAmountBlur"
				placeholder="请输入金额"></wd-input>
			<wd-picker label="账户类型" prop="accountType" v-model="model.accountType" placeholder="请选择账户类型"
				:columns="columns" />
		</wd-cell-group>

		<view class="footer">
			<wd-button type="primary" size="large" @click="handleSubmit" block>保存</wd-button>
		</view>
	</wd-form>
</template>

<script setup lang="ts">
	import { BigNumber } from 'bignumber.js';
	import DBService from '@/common/dbService.js'
	import { ref, nextTick } from 'vue';

	const dbService = new DBService()

	const columns = ref(['储蓄卡', '信用卡', '股票账户', '基金账户', '现金', '虚拟账户'])
	const model = reactive<{
		accountName : string,
		balance : number,
		accountType : string
	}>({
		accountName: '',
		accountType: columns.value[0]
	})

	const rules : FormRules = {
		accountName: [{
			required: true,
			pattern: /^.{1,20}$/,
			message: '请输入1-20位字符'
		}]
	}

	const onAmountBlur = (event) => {
		// 只允许数字和最多一个小数点
		let cleanVal = event.value.replace(/[^\d.]/g, '');
		// 只保留第一个小数点
		const parts = cleanVal.split('.');
		if (parts.length > 2) {
			cleanVal = parts[0] + '.' + parts[1];
		}
		// 限制小数点后最多两位
		if (cleanVal.includes('.')) {
			const [intPart, decimalPart] = cleanVal.split('.');
			cleanVal = intPart + '.' + decimalPart.slice(0, 2);
		}

		model.balance = cleanVal
	};

	const form = ref<FormInstance>()

	function handleSubmit() {
		form
			.value!.validate()
			.then(({ valid, errors }) => {
				if (valid) {
					dbService.insertTallyAccount(model.accountName, model.balance, 1, 1, model.accountType)
					uni.switchTab({
						url: `/pages/settle-account/settle-account`
					})
				}
			})
			.catch((error) => {
				console.log(error, 'error')
			})
	}
</script>

<style>
	.footer {
		padding: 20rpx 150rpx;
	}
</style>