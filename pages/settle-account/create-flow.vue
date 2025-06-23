<template>
	<wd-form ref="form" :model="model" :rules="rules">
		<wd-input label="金额" prop="balance" v-model="model.money" placeholder="0.00" type="number"></wd-input>
		<wd-picker label="类别" :columns="categoryColumns" v-model="model.category"
			:column-change="onChangeDistrict"></wd-picker>
		<wd-picker label="账户" :columns="accountPicker" v-model="model.account"></wd-picker>
		<wd-datetime-picker v-model="model.billDate" label="时间" />
		<view class="footer">
			<wd-button type="primary" size="large" @click="handleSubmit" block>保存</wd-button>
		</view>
	</wd-form>
</template>

<script setup lang="ts">
	import { onMounted, reactive } from 'vue'
	import DBService from '@/common/dbService.js'
	import {
		keep2Digits
	} from '@/common/util.js'

	const dbService = new DBService()
	const categoryList = reactive([])

	const categoryColumns = ref([])

	const accountPicker = reactive([])
	const model = reactive({
		money: '',
		category: '',
		account: '',
		comment: '',
		billDate: new Date().getTime()
	})

	const rules : FormRules = {
		money: [{
			required: true
		}],
		category: [{
			required: true
		}],
		account: [{
			required: true
		}],
	}

	const form = ref<FormInstance>()

	const account_id = ref(0);

	onLoad((options) => {
		account_id.value = options.account_id
	})

	onMounted(async () => {
		Object.assign(categoryList, await getCategoryPicker())
		categoryColumns.value = [categoryList[0], categoryList[categoryList[0][0].value], categoryList[categoryList[categoryList[0][0].value][0].value]]
		model.category = ref([1, 4, 5])
		model.account = account_id

		const accountList = await dbService.getTallyAccount()
		accountList.forEach(item => {
			accountPicker.push({
				label: item.account_name,
				value: item.id
			})
		})
	})

	function handleSubmit() {
		form
			.value!.validate()
			.then(async ({ valid, errors }) => {
				if (valid) {
					var categoryById = await dbService.getTallyCategoryById(model.category[2])
					dbService.insertTallyBill(model.account, keep2Digits(model.money) * categoryById[0].directory, model.billDate, model.category[2], '')
					uni.navigateBack({
						delta: 1
					})
				}
			})
			.catch((error) => {
				console.log(error, 'error')
			})
	}

	const onChangeDistrict = (pickerView, value, columnIndex, resolve) => {
		const item = value[columnIndex]
		if (columnIndex === 0) {
			pickerView.setColumnData(1, categoryList[item.value])
			pickerView.setColumnData(2, categoryList[categoryList[item.value][0].value])
		} else if (columnIndex === 1) {
			pickerView.setColumnData(2, categoryList[item.value])
		}
		resolve()
	}

	async function getCategoryPicker() {
		const result = await dbService.queryTableName('tally_category')
		return result.reduce((acc, item) => {
			if (!acc[item.parent_id])
				acc[item.parent_id] = []
			acc[item.parent_id].push({
				label: item.name,
				value: item.id
			})
			return acc
		}, {})
	}
</script>

<style>
	.footer {
		padding: 20rpx 150rpx;
	}
</style>